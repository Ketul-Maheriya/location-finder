const crypto = require("crypto")
const LocationRequest  =  require("../models/LocationRequest")

const createLocationReq = async (req,res) =>{

    try{
        const {phone} = req.body;

        if(!phone) {
            return res.status(400).json({message: "Phone number is required"})
        }

        const requestId = crypto.randomBytes(16).toString("hex")

        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        )

        const locationReq = await LocationRequest.create({
            requestId,phone,expiresAt
        })


        res.status(201).json({
            message: "Location request created",
            requestId: locationReq.requestId,
            // shareUrl: `http://localhost:5173/share/${requestId}`
            shareUrl: `${process.env.FRONTEND_URL}/share/${requestId}`
        })


    }catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create location request"
        });
    }
}



const updateLocation = async (req,res) =>{

    try{

        const {requestId} = req.params;
        const {latitude,longitude,accuracy} = req.body;

        if(latitude === undefined || longitude === undefined){
            return res.status(400).json({message: "Latitude and longitude are required"});
        }

        const locationreq = await LocationRequest.findOne({requestId})

        if (!locationreq) {
            return res.status(404).json({message: "Location request not found"});
        }


        if(locationreq.expiresAt && locationreq.expiresAt < new Date()){
            locationreq.status = "expired";
            await locationreq.save();

            return res.status(410).json({message: "Location request has expired"});

        }

        locationreq.latitude = latitude;
        locationreq.longitude = longitude;
        locationreq.accuracy = accuracy || null;
        locationreq.status = "location_received"

        locationreq.locationUpdatedAt = new Date();

        await locationreq.save();
        res.json({
            message: "Location received successfully"
        });


    }catch(error){

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update location"
        });
    
    }
}



const getLocation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const locationreq = await LocationRequest.findOne({ requestId }); // <-- added await

    if (!locationreq) {
      return res.status(404).json({ message: "Location request not found" });
    }

    if (locationreq.expiresAt && locationreq.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: "Location request has expired"
      });
    }

    res.json({
      success: true,
      data: {
        requestId: locationreq.requestId,
        phone: locationreq.phone,
        status: locationreq.status,
        latitude: locationreq.latitude,
        longitude: locationreq.longitude,
        accuracy: locationreq.accuracy,
        locationUpdatedAt: locationreq.locationUpdatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get location"
    });
  }
};


module.exports = {createLocationReq,updateLocation,getLocation}