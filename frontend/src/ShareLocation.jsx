// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client"
// import api from "./api/axios";
// import { useParams } from "react-router-dom";

// const ShareLocation = () => {

//     const [location, setLocation] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const { requestId } = useParams();
//     const watchIdRef = useRef(null);
//     const socketRef = useRef(null);


//     useEffect(() => {

//         socketRef.current = io("http://localhost:3000");

//         socketRef.current.on("connect", () => {

//             console.log(
//                 "Socket connected:",
//                 socketRef.current.id
//             );

//             socketRef.current.emit(
//                 "join-location",
//                 requestId
//             );

//             console.log(
//                 "Joined location room:",
//                 requestId
//             );
//         });


//         socketRef.current.on("disconnect", () => {

//             console.log(
//                 "Socket disconnected"
//             );

//         });


//         return () => {

//             if (socketRef.current) {

//                 socketRef.current.disconnect();

//             }

//         };

//     }, [requestId]);


//     const handleShareLocation = () => {

//         setLoading(true);
//         setError("");

//         if (!navigator.geolocation) {

//             setError(
//                 "Geolocation is not supported by your browser."
//             );

//             setLoading(false);

//             return;
//         }

//         watchIdRef.current =
//             navigator.geolocation.watchPosition(

//                 async (position) => {

//                     const {
//                         latitude,
//                         longitude,
//                         accuracy
//                     } = position.coords;

//                     console.log(
//                         "New location:",
//                         latitude,
//                         longitude
//                     );

//                     setLocation({
//                         latitude,
//                         longitude,
//                         accuracy
//                     });

//                     if (socketRef.current) {

//                         socketRef.current.emit(
//                             "location-update",
//                             {
//                                 requestId,
//                                 latitude,
//                                 longitude,
//                                 accuracy
//                             }
//                         );

//                         console.log(
//                             "Location sent through Socket.IO"
//                         );

//                     } else {

//                         setError(
//                             "Connection to server is not available."
//                         );

//                     }




//                     setLoading(false);
//                 },

//                 (error) => {

//                     console.error(error);

//                     setError(
//                         "Unable to get your location. Please allow location permission."
//                     );

//                     setLoading(false);
//                 },

//                 {
//                     enableHighAccuracy: true,
//                     timeout: 10000,
//                     maximumAge: 0
//                 }
//             );

//         console.log(
//             "GPS watch started:",

//         );
//     };



//     return (
//         <>
//             <div className="main">
//                 <h1>Location Request</h1>

//                 <p>Someone is requesting your current location</p>
//                 <p>Your location will only be shared after you give permission </p>

//                 <button onClick={handleShareLocation} disabled={loading}>
//                     {loading ? "Getting Location..." : "Share My Location"}
//                 </button>

//                 {error && (<p>{error}</p>)}

//                 {location && (
//                     <div>
//                         <h2>Location Found</h2>
//                         <p>
//                             Latitude: {location.latitude}
//                         </p>

//                         <p>
//                             Longitude: {location.longitude}
//                         </p>

//                         <p>
//                             Accuracy: {location.accuracy} meters
//                         </p>
//                     </div>
//                 )}
//             </div>

//         </>
//     )
// }


// export default ShareLocation;



















































import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

import {
    MapPin,
    ShieldCheck,
    CheckCircle2,
    Navigation,
    LoaderCircle
} from "lucide-react";

import "./components/ShareLocation.css"

const ShareLocation = () => {

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sharing, setSharing] = useState(false);

    const { requestId } = useParams();

    const socketRef = useRef(null);
    const watchIdRef = useRef(null);


    // ================================
    // SOCKET.IO
    // ================================

    useEffect(() => {

        // socketRef.current = io("http://localhost:3000");
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on("connect", () => {

            console.log(
                "Socket connected:",
                socketRef.current.id
            );

            socketRef.current.emit(
                "join-location",
                requestId
            );

            console.log(
                "Joined location room:",
                requestId
            );

        });


        socketRef.current.on("disconnect", () => {

            console.log(
                "Socket disconnected"
            );

        });


        return () => {

            if (socketRef.current) {

                socketRef.current.disconnect();

                socketRef.current = null;

            }

        };

    }, [requestId]);


    // ================================
    // CLEANUP GPS
    // ================================

    useEffect(() => {

        return () => {

            if (watchIdRef.current !== null) {

                navigator.geolocation.clearWatch(
                    watchIdRef.current
                );

            }

        };

    }, []);


    // ================================
    // START LOCATION SHARING
    // ================================

    const handleShareLocation = () => {

        setLoading(true);
        setError("");

        if (!navigator.geolocation) {

            setError(
                "Location services are not supported by your browser."
            );

            setLoading(false);

            return;
        }


        const watchId =
            navigator.geolocation.watchPosition(

                (position) => {

                    const {
                        latitude,
                        longitude,
                        accuracy
                    } = position.coords;


                    console.log(
                        "New location:",
                        latitude,
                        longitude
                    );


                    setLocation({
                        latitude,
                        longitude,
                        accuracy
                    });


                    setSharing(true);
                    setLoading(false);


                    // Send through Socket.IO
                    if (socketRef.current) {

                        socketRef.current.emit(
                            "location-update",
                            {
                                requestId,
                                latitude,
                                longitude,
                                accuracy
                            }
                        );


                        console.log(
                            "Location sent through Socket.IO"
                        );

                    }

                },

                (error) => {

                    console.log(error);

                    setError(
                        "We couldn't get your location. Please allow location access and try again."
                    );

                    setLoading(false);

                    setSharing(false);

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }

            );


        watchIdRef.current = watchId;

        console.log(
            "GPS watch started:",
            watchId
        );

    };


    // ================================
    // STOP LOCATION SHARING
    // ================================

    const handleStopSharing = () => {

        if (watchIdRef.current !== null) {

            navigator.geolocation.clearWatch(
                watchIdRef.current
            );

            watchIdRef.current = null;

        }

        setSharing(false);

        setLocation(null);

        console.log(
            "GPS sharing stopped"
        );

    };


    // return (

    //     <div className="share-page">

    //         <div className="share-card">


    //             {/* ICON */}

    //             <div
    //                 className={`location-icon ${sharing ? "success" : ""
    //                     }`}
    //             >

    //                 {sharing ? "✓" : "📍"}

    //             </div>


    //             {/* TITLE */}

    //             <h1>

    //                 {sharing
    //                     ? "Location Shared"
    //                     : "Share Your Location"}

    //             </h1>


    //             {/* DESCRIPTION */}

    //             {!sharing && (

    //                 <>

    //                     <p className="description">

    //                         Someone you trust is asking
    //                         for your current location.

    //                     </p>

    //                     <p className="permission-text">

    //                         Your location will only be
    //                         shared after you give permission.

    //                     </p>


    //                 </>

    //             )}


    //             {/* ERROR */}

    //             {error && (

    //                 <div className="error-box">

    //                     <span>⚠️</span>

    //                     <p>{error}</p>

    //                 </div>

    //             )}


    //             {/* SHARE BUTTON */}

    //             {!sharing && (

    //                 <button
    //                     className="share-button"
    //                     onClick={handleShareLocation}
    //                     disabled={loading}
    //                 >

    //                     {loading ? (

    //                         <>
    //                             <span className="spinner"></span>

    //                             Getting Location...

    //                         </>

    //                     ) : (

    //                         <>
    //                             📍 Share My Location
    //                         </>

    //                     )}

    //                 </button>

    //             )}


    //             {/* SHARING STATE */}

    //             {sharing && location && (

    //                 <div className="success-section">

    //                     <div className="live-status">

    //                         <span className="live-dot"></span>

    //                         Location is being shared

    //                     </div>


    //                     <p className="success-message">

    //                         Your current location has been
    //                         shared successfully.

    //                     </p>


    //                     <div className="update-time">

    //                         Your location will continue
    //                         updating while this page is open.

    //                     </div>


    //                     <button
    //                         className="stop-button"
    //                         onClick={handleStopSharing}
    //                     >

    //                         Stop Sharing

    //                     </button>

    //                 </div>

    //             )}


    //             <p className="help-text">
    //                 When your phone asks for permission, tap
    //                 <strong> Allow </strong>
    //                 to share your location.
    //             </p>

    //             {/* FOOTER */}

    //             <p className="privacy-text">

    //                 🔒 Your location is shared only with
    //                 the person who requested it.

    //             </p>


    //         </div>

    //     </div>

    // );









        return (

        <main className="share-page">

            {/* Background decoration */}

            <div className="share-glow share-glow-one"></div>
            <div className="share-glow share-glow-two"></div>


            <section className="share-card">

                {/* Location icon */}

                <div className="location-icon-wrapper">

                    <div className="location-pulse pulse-one"></div>
                    <div className="location-pulse pulse-two"></div>

                    <div className="location-icon">

                        <MapPin size={38} strokeWidth={2.2} />

                    </div>

                </div>


                {/* Header */}

                <div className="share-header">

                    <div className="small-brand">
                        FIND MY PERSON
                    </div>

                    <h1>
                        Share your location
                    </h1>

                    <p>
                        Someone you trust is asking for your
                        current location.
                    </p>

                </div>


                {/* Privacy message */}

                <div className="privacy-box">

                    <ShieldCheck
                        size={20}
                        strokeWidth={2}
                    />

                    <div>

                        <strong>
                            Your location stays private
                        </strong>

                        <span>
                            It will only be shared after you give
                            permission.
                        </span>

                    </div>

                </div>


                {/* Main action */}

                {!location && (

                    <div className="share-action">

                        <button
                            className="share-location-button"
                            onClick={handleShareLocation}
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <LoaderCircle
                                        size={22}
                                        className="loading-icon"
                                    />

                                    Getting your location...
                                </>
                            ) : (
                                <>
                                    <Navigation
                                        size={22}
                                        fill="currentColor"
                                    />

                                    Share My Location
                                </>
                            )}

                        </button>


                        {!loading && (
                            <p className="permission-hint">
                                When your phone asks for permission,
                                tap <strong>Allow</strong>.
                            </p>
                        )}

                    </div>

                )}


                {/* Error */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {/* Location successfully shared */}

                {location && (

                    <div className="location-success">

                        <div className="success-icon">

                            <CheckCircle2
                                size={30}
                                strokeWidth={2}
                            />

                        </div>


                        <h2>
                            Location shared
                        </h2>

                        <p>
                            Your current location has been
                            successfully sent.
                        </p>


                        <div className="location-details">

                            <div>
                                <span>Latitude</span>
                                <strong>
                                    {location.latitude.toFixed(6)}
                                </strong>
                            </div>

                            <div>
                                <span>Longitude</span>
                                <strong>
                                    {location.longitude.toFixed(6)}
                                </strong>
                            </div>

                            <div>
                                <span>Accuracy</span>
                                <strong>
                                    {Math.round(location.accuracy)} m
                                </strong>
                            </div>

                        </div>

                    </div>

                )}


                {/* Bottom security message */}

                <div className="secure-footer">

                    <ShieldCheck size={16} />

                    <span>
                        Location sharing is completely optional
                    </span>

                </div>




                           {sharing && location && (

                    <div className="success-section">

                      


                       


                        <div className="update-time">

                            Your location will continue
                            updating while this page is open.

                        </div>


                        <button
                            className="stop-button"
                            onClick={handleStopSharing}
                        >

                            Stop Sharing

                        </button>

                    </div>

                )}



            </section>

        </main>
    );
};

export default ShareLocation;
