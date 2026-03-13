
const router = require("express").Router();

router.post("/", (req,res)=>{
    const booking = req.body;
    res.json({
        message:"Appointment booked successfully",
        booking
    });
});

module.exports = router;
