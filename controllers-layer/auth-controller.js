const express = require("express");
const jwt =require("jsonwebtoken");
const axios = require('axios');

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

router.post("/reset_password", async (request, response) => {
    try {
        const otp = authLogic.getRandomOtp();        
        const email = request.body.email;
        const UNresults = await authLogic.getAllUsersAsync();
        const results = UNresults.rows;
        let uuid = "";
        for (const result of results) {
            if (result.email === email) {
                uuid = result.uuid;
                break;
            }
        }
        if (!uuid) return response.status(401).send("this email does not exist");

        const res = await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: 'Vacations App', email: 'yisrael@atlow.co.il' },
            to: [{ email }],
            subject: 'your verification code for Vacations',
            htmlContent: `<p>your verification code for Vacations App is: <strong>${otp}</strong></p>`
        }, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        const tokenOtp = jwt.sign( {otp} , process.env.OTP_SALT, { expiresIn: process.env.OTP_EXP });
        
        const inserts= await authLogic.insertOtpAsync(email, tokenOtp, uuid);
        if (res.data) {            
            return response.send({ data: res.data ,inserts})
        } else return response.status(400).send({ data: "Error sending email" })
    } catch (err) {
        console.log(err);
        
        return ({ err: err.response?.data || err.message })
    }
});

router.post("/validate_otp",async (request,response)=>{
    const otp = String(request.body.otp);
    const email = String(request.body.email);
    
    if (!otp) return response.status(400).send("no OTP sent");
    try {
        const res = await authLogic.getOtpAsync(email)

        const code = res.rows[0]?.code;
        jwt.verify(code, process.env.OTP_SALT, (err, decoded) => {
            if (err) {
                console.log(err);
                return response.status(403).send("Invalid or expired OTP");
            }
            if (decoded.otp !== otp) {
                return response.status(401).send("Incorrect OTP");
            }
            else {
                return response.send(res[0].uuid)
            }
        });
    } catch (error) {
        response.send(error)
    }
});

router.post("/set_new_password", async (request, response) => {
    try {
        const credentials = new Credentials(request.body);
        const errors = credentials.validate();
        if (errors) return response.status(400).send(errors);

        const updatedUser={
            credentials,
            uuid:request.body.uid
        }

        const resetPass = await authLogic.resetPasswordAsync(updatedUser);
        
        response.send(resetPass);
    }
    catch (err) {
        console.log(err)
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
        const { refreshToken } = request.body;
        if (!refreshToken) return response.status(400).send("Missing refresh token");

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SALT);
        const res= await authLogic.getUserAsync(decoded.user.uuid);
        const user= (res.rows[0])
        if (!user) return response.status(401).send("User not found");

        const accessPayload = { user };
        const token = jwt.sign(accessPayload,  process.env.AUTH_SALT,
            { expiresIn: process.env.AUTH_EXP });
        const newRefresh = jwt.sign({ user: { uuid: user.uuid }},
            process.env.REFRESH_SALT,
            { expiresIn: process.env.REFRESH_EXP });
        return response.send({ token, refreshToken: newRefresh ,res});
    }
    catch (error) {
        if (error.name === "TokenExpiredError")
            return response.status(403).send("Refresh token expired");
        return response.status(500).send(error.message);
    }
});

module.exports = router;