require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const LocationRequest = require("./models/LocationRequest");
const locationRoutes = require("./routes/locationRoutes");

const app = express();

connectDB();

// app.use(
//     cors({
//         origin: "http://localhost:5173"
//     })
// );


app.use(cors({
    origin: process.env.FRONTEND_URL
}));


app.use(express.json());

app.use("/location", locationRoutes);

app.get("/", (req, res) => {

    res.json({
        message: "Location Finder API is running"
    });

});


const server = http.createServer(app);


// const io = new Server(server, {

//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"]
//     }

// });



const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});




io.on("connection", (socket) => {

    console.log(
        "Socket connected:",
        socket.id
    );


    // Join location request room
    socket.on("join-location", (requestId) => {

        const room = `location:${requestId}`;

        socket.join(room);

        console.log(
            `Socket ${socket.id} joined ${room}`
        );

    });


    // Receive GPS location
    socket.on("location-update", async (data) => {

        try {

            const {
                requestId,
                latitude,
                longitude,
                accuracy
            } = data;


            if (
                !requestId ||
                latitude === undefined ||
                longitude === undefined
            ) {

                console.log(
                    "Invalid location data"
                );

                return;
            }


            const locationReq =
                await LocationRequest.findOne({
                    requestId
                });


            if (!locationReq) {

                console.log(
                    "Location request not found:",
                    requestId
                );

                return;
            }


            // Check expiration
            if (
                locationReq.expiresAt &&
                locationReq.expiresAt < new Date()
            ) {

                locationReq.status = "expired";

                await locationReq.save();

                socket.emit(
                    "location-error",
                    {
                        message:
                            "Location request has expired"
                    }
                );

                return;
            }


            // Save location
            locationReq.latitude = latitude;

            locationReq.longitude = longitude;

            locationReq.accuracy =
                accuracy ?? null;

            locationReq.status =
                "location_received";

            locationReq.locationUpdatedAt =
                new Date();


            await locationReq.save();


            console.log(
                "Location saved:",
                latitude,
                longitude
            );


            // Broadcast to requester
            const room =
                `location:${requestId}`;

            socket.to(room).emit(
                "location-updated",
                {
                    requestId,
                    latitude,
                    longitude,
                    accuracy
                }
            );


        } catch (error) {

            console.error(
                "Socket location update error:",
                error
            );

        }

    });


    socket.on("disconnect", () => {

        console.log(
            "Socket disconnected:",
            socket.id
        );

    });

});


const port =
    process.env.PORT || 5000;


server.listen(port, () => {

    console.log(
        `Server is running on port : http://localhost:${port}`
    );

});