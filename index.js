const express = require("express");
const cors = require("cors");
const dal = require("./data-access-layer/dal");

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
server.get("/img", async (req, res) => {
    const ImgPath = request.query.path || "../assets/images";
        const image = "barcelona_1750800545315.jpg";
        if (!image) {
            return response.status(400).send({ message: "Missing image parameter" });
        }
        const imagesFolder = path.join(__dirname, ImgPath);
        const filePath = path.join(imagesFolder, image);
    
        response.sendFile(filePath, (err) => {
            if (err) {
                response.status(500).send("Could not send file.");
            }
        });
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