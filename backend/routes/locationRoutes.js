const express = require("express")
const {createLocationReq,updateLocation,getLocation} = require("../controllers/locationController")
const router = express.Router()

router.post("/request", createLocationReq);
router.post("/:requestId/location",updateLocation);
router.get("/:requestId",getLocation);
module.exports = router;