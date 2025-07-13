const express = require("express");
const vacationLogic = require("../business-logic-layer/vacation-logic");

const router = express.Router();

router.get('/',async (req,res)=>{
    try {
            const result = await vacationLogic.getAllVacationsAsync();
            response.send(result);
        }
        catch (error) {
            console.log(error);
            response.status(500).send({ message: "Server error" });
        }
})

module.exports=router;