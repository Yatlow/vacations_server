const express = require("express");
const cors = require("cors");
const config = require("../config/config.json");

const vacationController = require("./controllers-layer/vacation-controller");
const authController = require("./controllers-layer/auth-controller");


const server = express();
server.use(cors());
server.use(express.json());

server.use("/vacations", vacationController);
server.use("/auth", authController);
server.get("/ping", async (req, res) => {
    res.send("hello!")
})

server.use("*", (req, res) => {
    res.status(404).send(`Route not found ${req.originalUrl}`);
});


server.listen(config.server.port, () => {
    console.log(`Listening on ${config.server.port}`);
}).on("error", (err) => {
    console.log(err);
    if (err.code === "EADDRINUSE")
        console.log("Error: Address in use");
    else
        console.log("Error: Unknown error");
});