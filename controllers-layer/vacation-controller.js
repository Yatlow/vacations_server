const express = require("express");
const vacationLogic = require("../business-logic-layer/vacation-logic");
const verifyLoggedIn = require("../middleware/verify-logged-in");
const verifyAdmin = require("../middleware/verify-admin");
const path = require("path");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "vacations" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

const router = express.Router();
router.use(fileUpload());

router.get("/", verifyLoggedIn, async (request, response) => {
    try {
        const result = await vacationLogic.getAllVacationsAsync();
        response.send(result);
    }
    catch (error) {
        console.log(error);
        response.status(500).send({ message: "Server error" });
    }
});

router.get("/image", verifyLoggedIn, (request, response) => {
    const ImgPath = "../assets/images";
    const image = request.query.image;
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
});

router.get("/track", verifyLoggedIn, async (request, response) => {
    try {
        const result = await vacationLogic.getAllTrackingsAsync();
        response.send(result);
    } catch (error) {
        response.status(500).send("Could not get tracks");
    }
});

router.post("/track", verifyLoggedIn, async (request, response) => {
    const action = request.body.action;
    const uuid = request.body.uuid;
    const vacationId = request.body.vacationId;
    if (!action) {
        return response.status(400).response("must send an action (delete/add)");
    }
    if (!uuid) {
        return response.status(400).response("must send user Id");
    }
    if (!vacationId) {
        return response.status(400).response("must send vacation Id");
    }
    try {
        if (action === "delete") {
            const result = await vacationLogic.deleteTrackingAsync(uuid, vacationId);
            response.send(result);
        }
        if (action === "add") {
            const result = await vacationLogic.addTrackingAsync(uuid, vacationId);
            response.send(result);
        }
    } catch (error) {
        response.status(500).send("Could not change tracking");
        console.log(error)
    }
});

router.delete("/delete", verifyLoggedIn, verifyAdmin, async (request, response) => {
    try {
        const result = await vacationLogic.deleteVacationAsync(request.body.id);
        response.send(result);
    }
    catch (error) {
        console.log(error);
        response.status(500).send({ message: "Server error" });
    }
});

function verifyVacationIsValid(vacation, action) {
    const errors = {};
    if (!vacation.id && action === "put" || isNaN(+vacation.id) && action === "put") {
        errors.id = "cannot edit without an id";
    } else if (action === "post") { vacation.id = null };
    if (!vacation.destination) {
        errors.destination = "cannot edit or add without a valid destination";
    }
    if (!vacation.description) {
        errors.description = "cannot edit or add without a valid description";
    }
    if (!vacation.start || isNaN(new Date(vacation.start).getTime())) {
        errors.start = "cannot edit or add without a valid start time";
    }
    if (!vacation.end || isNaN(new Date(vacation.end).getTime())) {
        errors.end = "cannot edit or add without a valid end time";
    }
    if (action === "post" && new Date(vacation.start).getDate() < new Date().getDate()) {
        errors.start = "Start date cannot be before today"
    }
    if (new Date(vacation.end).getTime() < new Date(vacation.start).getTime()) {
        errors.time = "end date cannot be before or at start date";
    }
    if (!vacation.price || isNaN(+vacation.price) || vacation.price < 0 || vacation.price > 10000) {
        errors.price = "cannot edit or add without a valid price"
    }
    return [errors, vacation]
};

router.put("/update", verifyLoggedIn, verifyAdmin, async (request, response) => {
    const [errors, validVacation] = verifyVacationIsValid(request.body, "put");
    try {
        if (request.files && request.files.image) {
            const image = request.files.image;
            // const absolutePath = path.join(__dirname, request.body.path, request.body.pictureUrl);
            // await image.mv(absolutePath);
            const result = await uploadToCloudinary(image.data); 
            validVacation.pictureUrl = result.secure_url;
        }
        if (Object.keys(errors).length > 0) {
            return response.status(400).send({ message: "Server error", errors });
        }
        else {
            const result = await vacationLogic.editVacationAsync(validVacation);
            response.send(result);
        }
    } catch (error) {
        console.log(error);
        response.status(500).send({ message: "Server error", errors });
    }
});

router.post("/add", verifyLoggedIn, verifyAdmin, async (request, response) => {
    const [errors, validVacation] = verifyVacationIsValid(request.body, "post");
    try {
        if (request.files && request.files.image) {
            const image = request.files.image;
            // const absolutePath = path.join(__dirname, request.body.path, request.body.pictureUrl);
            // await image.mv(absolutePath);
            const result = await  await uploadToCloudinary(image.data); 
            validVacation.pictureUrl = result.secure_url;
        } else { validVacation.pictureUrl = "unknown" }
        if (Object.keys(errors).length > 0) {
            return response.status(400).send({ message: "Server error", errors });
        }
        else {
            const result = await vacationLogic.addVacationAsync(validVacation);
            response.send(result);
        }
    } catch (error) {
        console.log(error);
        response.status(500).send({ message: "Server error", errors });
    }
});



module.exports = router;