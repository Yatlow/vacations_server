const express = require("express");
const jwt =require("jsonwebtoken")

const authLogic = require("../business-logic-layer/auth-logic");
const Credentials = require("../model/credentials");

const router = express.Router();

router.post("/login", async (request, response) => {
    try {
        const credentials = new Credentials(request.body);
        const errors = credentials.validate();
        if (errors) return response.status(400).send(errors);

        const loggedInUser = await authLogic.loginAsync(credentials);
        if (!loggedInUser) return response.status(401).send("Incorrect username or password.");

        response.send(loggedInUser);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

router.post("/register", async (request, response) => {
    try {
        if (!request.body.first_name || !request.body.family_name) {
            return response.status(400).send("cannot register without a valid name!")
        }
        const credentials = new Credentials(request.body);
        const results = await authLogic.getAllEmailsAsync();
        const emails=results.rows;
        for (const email of emails) {
            if (email.email === credentials.email) {
                return response.status(400).send("this email is already used");
            }
        }
        const errors = credentials.validate();
        if (errors) return response.status(400).send(errors);

        const newUser = {
            credentials,
            first_name: request.body.first_name,
            family_name: request.body.family_name,
            role: request.body.role || "user",
        }

        const registeredAndLoggedInUser = await authLogic.registerAsync(newUser);
        response.status(201).send(registeredAndLoggedInUser);
    }
    catch (err) {
        response.status(500).send(err.message);
    }
});

router.post("/refresh", async (request, response) => {
    try {
        const { refreshToken } = request.body;
        if (!refreshToken) return response.status(400).send("Missing refresh token");

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SALT);
        const [user] = await authLogic.getUserAsync([decoded.user.uuid]);
        if (!user) return response.status(401).send("User not found");

        const accessPayload = { user };
        const token = jwt.sign(accessPayload,  process.env.AUTH_SALT,
            { expiresIn: process.env.REFRESH_EXP });
        const newRefresh = jwt.sign({ user: { uuid: user.uuid }},
            process.env.REFRESH_SALT,
            { expiresIn: process.env.REFRESH_EXP });
        return response.send({ token, refreshToken: newRefresh });
    }
    catch (error) {
        if (error.name === "TokenExpiredError")
            return response.status(403).send("Refresh token expired");
        return response.status(500).send(error.message);
    }
});

module.exports = router;