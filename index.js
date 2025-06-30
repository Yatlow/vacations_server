const express = require("express");
const cors = require("cors");
const dal = require("../data-access-layer/dal");

const vacationController = require("./controllers-layer/vacation-controller");
const authController = require("./controllers-layer/auth-controller");


const server = express();
server.use(cors());
server.use(express.json());

server.use("/vacations", vacationController);
server.use("/auth", authController);
server.get("/ping", async (req, res) => {
    const resaul= await dal.executeQueryAsync(
            `select * from users 
            `, []
        );
    res.send(resaul)
    // res.send("hello!")
})

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