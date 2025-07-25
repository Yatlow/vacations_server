const jwt = require("jsonwebtoken");
const dal = require("../data-access-layer/dal");
const crypto = require("crypto");
const uuid = require("uuid");
const util = require("util");
require('dotenv').config();
const verifyAsync = util.promisify(jwt.verify);

async function loginAsync(credentials) {
    credentials.password = hash(credentials.password);
    const userResult  = await dal.executeQueryAsync(
        `SELECT * FROM users 
     WHERE email = $1 AND password = $2
        `, [credentials.email, credentials.password]
    );
    if (!userResult || userResult.rowCount < 1) return null;
    const user = userResult.rows[0];
    delete user.password;

    user.token = jwt.sign({ user }, process.env.AUTH_SALT, { expiresIn: process.env.AUTH_EXP });
    user.refreshToken = jwt.sign({ user}, process.env.REFRESH_SALT, { expiresIn: process.env.REFRESH_EXP });
    return user;
}

async function registerAsync(user) {
    user.password = hash(user.credentials.password);
    user.uuid = uuid.v4();

    const sql = `INSERT INTO users (uuid, first_name, family_name, email, password, role)
  VALUES ($1, $2, $3, $4, $5, $6)`;
    const params = [user.uuid, user.firstName, user.familyName, user.credentials.email, user.password, user.role]
    await dal.executeQueryAsync(sql, params);
    
    
     const userPayload = {
        uuid: user.uuid,
        firstName: user.firstName,
        familyName: user.familyName,
        email: user.credentials.email,
        role: user.role
    };

    user.token = jwt.sign({ user: userPayload }, process.env.AUTH_SALT, { expiresIn: process.env.AUTH_EXP });
    user.refreshToken = jwt.sign({ user: userPayload }, process.env.REFRESH_SALT, { expiresIn: process.env.REFRESH_EXP });
    return user;
}

async function refreshTokenAsync(refreshToken) {
    try {
        const decoded = await verifyAsync(refreshToken, process.env.REFRESH_SALT.refreshSalt);
        const freshToken = jwt.sign({ user: decoded.user }, process.env.AUTH_SALT, { expiresIn: process.env.AUTH_EXP });
        return freshToken;
    } catch (error) {
        if (error.message === "jwt expired") {
            throw { err: "Your refresh token has expired" }
        } else {
            throw { err: "Unverified token" }
        }
    }
};

async function getAllEmailsAsync() {
    return await dal.executeQueryAsync(`
        select email from users
        `, [])

};

async function getAllUsersAsync() {
    return await dal.executeQueryAsync(`
        select email,uuid from users
        `)
};

async function getUserAsync(uuid){
    return await dal.executeQueryAsync(`
        SELECT uuid, first_name, family_name, email, role FROM users WHERE uuid = $1
        `,[uuid])
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function getRandomOtp() {
    const letters = "abcdefghijklmnopqrstuv".split("");
    const numbers = "123456789".split("");
    const otp = [];

    for (let i = 0; i < 5; i++) {
        const chance = Math.random();
        if (chance < 0.25) {
            otp.push(numbers[getRandom(0, numbers.length - 1)]);
        } else{
            otp.push(letters[getRandom(0, letters.length - 1)].toUpperCase());
        }
    }

    return otp.join("");
};

async function insertOtpAsync(email, otp, uuid) {
    await dal.executeQueryAsync(`
    DELETE FROM otps WHERE email = $1;
    `, [email]);

    const deleteRes = await dal.executeQueryAsync(`
        DELETE FROM otps WHERE expires_at <= NOW()
    `);
    const insertRes = await dal.executeQueryAsync(`
        INSERT INTO otps (email, code,uuid, expires_at)
        VALUES ($1, $2, $3, NOW()+ INTERVAL '1 minute')
    `, [email, otp, uuid]);

    return { insertRes, deleteRes }
};

function getOtpAsync(email) {
    return dal.executeQueryAsync(`
    select * from otps
    where email=$1  
    `, [email]);
};

async function resetPasswordAsync(user) {
    user.password = hash(user.credentials.password);
    const res = await dal.executeQueryAsync(`
        UPDATE users SET password=$1
        where uuid=$2`, [user.password,user.uuid]);
    const del= await dal.executeQueryAsync(`
        DELETE FROM otps WHERE uuid = $1;
        `,[user.uuid])
    delete user.credentials;
    delete user.password;
    return {res,del};
}

function hash(plainText) {
    if (!plainText) return null;
    return crypto.createHmac("sha512", process.env.HASH_SALT).update(plainText).digest("hex");

};

module.exports = {
    registerAsync,
    loginAsync,
    getAllEmailsAsync,
    refreshTokenAsync,
    getUserAsync,
    getRandomOtp,
    insertOtpAsync,
    getOtpAsync,
    getAllUsersAsync,
    resetPasswordAsync
};