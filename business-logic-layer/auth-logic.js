const jwt = require("jsonwebtoken");
const dal = require("../data-access-layer/dal");
const crypto = require("crypto");
const uuid = require("uuid");
const util = require("util");
require('dotenv').config();
const verifyAsync = util.promisify(jwt.verify);

async function loginAsync(credentials) {
    credentials.password = hash(credentials.password);
    const user = await dal.executeQueryAsync(
        `SELECT * FROM users 
     WHERE email = $1 AND password = $2
        `, [credentials.email, credentials.password]
    );
    console.log(user)
    if (!user || user.rowCount < 1) return null;
    delete user[0].password;

    user[0].token = jwt.sign({ user: user[0] }, process.env.AUTH_SALT, { expiresIn: process.env.REFRESH_EXP });
    user[0].refreshToken = jwt.sign({ user: user[0] }, process.env.REFRESH_SALT, { expiresIn: process.env.REFRESH_EXP });
    return user[0];
}

async function registerAsync(user) {
    user.password = hash(user.credentials.password);
    user.uuid = uuid.v4();

    const sql = `INSERT INTO users (uuid, firstName, familyName, email, password, role)
  VALUES ($1, $2, $3, $4, $5, $6)`;
    const params = [user.uuid, user.firstName, user.familyName, user.credentials.email, user.password, user.role]
    await dal.executeQueryAsync(sql, params);
    delete user.credentials;
    delete user.password;
    user.token = jwt.sign({ user: user }, process.env.AUTH_SALT, { expiresIn: process.env.AUTH_EXP });
    user.refreshToken = jwt.sign({ user: user }, process.env.REFRESH_SALT, { expiresIn: process.env.REFRESH_EXP });
    return user;
}

async function refreshTokenAsync(refreshToken) {
    try {
        const decoded = await verifyAsync(refreshToken, process.env.AUTH_SALT.refreshSalt);
        const freshToken = jwt.sign({ user: decoded }, process.env.REFRESH_SALT, { expiresIn: process.env.AUTH_EXP });
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

}


function hash(plainText) {
    if (!plainText) return null;
    return crypto.createHmac("sha512", process.env.HASH_SALT).update(plainText).digest("hex");

}

module.exports = {
    registerAsync,
    loginAsync,
    getAllEmailsAsync,
    refreshTokenAsync
};