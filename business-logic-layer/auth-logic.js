const jwt = require("jsonwebtoken");
const dal = require("../data-access-layer/dal");
const crypto = require("crypto");
const uuid = require("uuid");
const config = require("../../config/config.json");
const util = require("util");
const verifyAsync = util.promisify(jwt.verify);

async function loginAsync(credentials) {
    credentials.password = hash(credentials.password);
    const user = await dal.executeQueryAsync(
        `select * from users 
        where email=?
        and password=?
        `, [credentials.email, credentials.password]
    );
    if (!user || user.length < 1) return null;
    delete user[0].password;

    user[0].token = jwt.sign({ user: user[0] }, config.authSecrets.salt, { expiresIn: config.server.tokenExpiration });
    user[0].refreshToken = jwt.sign({ user: user[0] }, config.authSecrets.refreshSalt, { expiresIn: config.server.refreshExpiration });
    return user[0];
}

async function registerAsync(user) {
    user.password = hash(user.credentials.password);
    user.uuid = uuid.v4();

    const sql = `INSERT INTO users (uuid, firstName, familyName, email, password, role)
    VALUES(?,?,?,?,?,?)`;
    const params = [user.uuid, user.firstName, user.familyName, user.credentials.email, user.password, user.role]
    await dal.executeQueryAsync(sql, params);
    delete user.credentials;
    delete user.password;
    user.token = jwt.sign({ user: user }, config.authSecrets.salt, { expiresIn: config.server.tokenExpiration });
    user.refreshToken = jwt.sign({ user: user }, config.authSecrets.refreshSalt, { expiresIn: config.server.refreshExpiration });
    return user;
}

async function refreshTokenAsync(refreshToken) {
    try {
        const decoded = await verifyAsync(refreshToken, config.authSecrets.refreshSalt);
        const freshToken = jwt.sign({ user: decoded }, config.authSecrets.salt, { expiresIn: config.server.tokenExpiration });
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
    return crypto.createHmac("sha512", config.authSecrets.hashSalt).update(plainText).digest("hex");

}

module.exports = {
    registerAsync,
    loginAsync,
    getAllEmailsAsync,
    refreshTokenAsync
};