const express = require("express");

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
        if (!request.body.firstName || !request.body.familyName) {
            return response.status(400).send("cannot register without a valid name!")
        }
        const credentials = new Credentials(request.body);
        const results = await authLogic.getAllEmailsAsync();
        console.log(results)
        const emails=results.rows[0];
        for (const email of emails) {
            if (email.email === credentials.email) {
                return response.status(400).send("this email is already used");
            }
        }
        const errors = credentials.validate();
        if (errors) return response.status(400).send(errors);

        const newUser = {
            credentials,
            firstName: request.body.firstName,
            familyName: request.body.familyName,
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
        const refreshToken = request.body.refreshToken;
        if (!refreshToken) {
            return response.status(403).send("No refresh token provided");
        }        
        const newToken = await authLogic.refreshTokenAsync(refreshToken);
        response.send(newToken);
    }
    catch (error) {
        if (error.err){
            response.status(500).send(error.err);
        }else response.status(500).send(err.message)
    }
});

module.exports = router;