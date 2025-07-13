const express = require("express");
const vacationLogic = require("../business-logic-layer/vacation-logic");

const router = express.Router();

router.get('/',async (req,res)=>{
    try {
            const result = await vacationLogic.getAllVacationsAsync();
            res.send(result);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ message: "Server error" });
        }
})
router.get('/hello',(req,res)=>{
    res.send("hello!")
})

module.exports=router;