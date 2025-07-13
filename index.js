const express = require("express");
const cors = require("cors");

const vacationController = require("./controllers-layer/vacation-controller");
const authController = require("./controllers-layer/auth-controller");
const pingController = require("./controllers-layer/ping");


const server = express();
server.use(cors());
server.use(express.json());

server.use("/vacations", vacationController);
server.use("/auth", authController);
server.use("/ping", pingController)


server.use("*", (req, res) => {
    res.status(404).send(`Route not found ${req.originalUrl}`);
});


server.listen(6500, () => {
    console.log(`Listening on ${6500}`);
}).on("error", (err) => {
    console.log(err);
    if (err.code === "EADDRINUSE")
        console.log("Error: Address in use");
    else
        console.log("Error: Unknown error");
});