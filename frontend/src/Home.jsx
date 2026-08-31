import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "./api/axios"

import {
    MapPin,
    Phone,
    Copy,
    Check,
    Navigation,
    Radio,
    ShieldCheck,
    RefreshCw,
    Link as LinkIcon
} from "lucide-react";


import LocationMap from "./components/LocationMap";
import "./components/Home.css"

const Home = () => {
    const [phone, setPhone] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [requestId, setRequestId] = useState("");
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [copied, setCopied] = useState(false);

    const socketRef = useRef(null);

    useEffect(() => {

        if (!requestId) {
            return;
        }

        // socketRef.current = io("http://localhost:3000");
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

        socketRef.current.on("connect", () => {

            console.log(
                "Requester socket connected:",
                socketRef.current.id
            );

            socketRef.current.emit(
                "join-location",
                requestId
            );

            console.log(
                "Requester joined room:",
                requestId
            );
        });


        socketRef.current.on(
            "location-updated",
            (data) => {

                console.log(
                    "Real-time location received:",
                    data
                );

                setLocation((previous) => ({
                    ...previous,
                    ...data,
                    status: "location_received"
                }));

            }
        );


        socketRef.current.on("disconnect", () => {

            console.log(
                "Requester socket disconnected"
            );

        });


        return () => {

            if (socketRef.current) {

                socketRef.current.disconnect();

                socketRef.current = null;
            }

        };

    }, [requestId]);


   const createLocationRequest = async () => {

        if (!phone.trim()) {

            setMessage("Please enter a phone number");

            return;
        }

        try {

            setLoading(true);
            setMessage("");
            setLocation(null);
            setCopied(false);

            const res = await api.post(
                "/request",
                { phone }
            );

            setRequestId(
                res.data.requestId
            );

            setShareUrl(
                res.data.shareUrl
            );

            getLocation(
                res.data.requestId
            );

            setMessage(
                "Location request created successfully"
            );

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };

    const getLocation = async (id) => {
        try {
            const response = await api.get(
                `/${id}`
            );

            setLocation(response.data.data);

        } catch (error) {
            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to get location"
            );
        }
    };


    const copyLink = async () => {

        try {

            await navigator.clipboard.writeText(
                shareUrl
            );

            setCopied(true);

            setMessage("Link copied!");

            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (error) {

            console.error(error);

            setMessage(
                "Failed to copy link"
            );
        }
    };

    // return (
    //     <>
    //         <div className="main">
    //             <h1>Find My Person</h1>

    //             <p>
    //                 Enter the person's phone number
    //             </p>

    //             <input type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
    //             <button onClick={createLocationRequest} disabled={loading}>
    //                 {loading ? "Creating..." : "Generate Location Link"}
    //             </button>

    //             {message && (<p>{message}</p>)}

    //             {shareUrl && (
    //                 <div>
    //                     <h3>Location request created</h3>
    //                     <input type="text" value={shareUrl} readOnly />
    //                     <button onClick={copyLink}>Copy Link</button>
    //                 </div>

    //             )}



    //             {location && (
    //                 <div>

    //                     <h2>
    //                         {location.status === "location_received"
    //                             ? "Location Found ✓"
    //                             : "Waiting for Location"}
    //                     </h2>

    //                     {location.latitude !== null &&
    //                         location.longitude !== null ? (
    //                         <>
    //                             <LocationMap
    //                                 latitude={location.latitude}
    //                                 longitude={location.longitude}
    //                                 accuracy={location.accuracy}
    //                             />

    //                             <p>
    //                                 Latitude: {location.latitude}
    //                             </p>

    //                             <p>
    //                                 Longitude: {location.longitude}
    //                             </p>

    //                             <p>
    //                                 Accuracy: {location.accuracy} meters
    //                             </p>
    //                         </>
    //                     ) : (
    //                         <p>
    //                             Waiting for the person to share their location...
    //                         </p>
    //                     )}



    //                 </div>
    //             )}


    //         </div>

    //     </>
    // )












return (

        <main className="home-page">

            {/* Background effects */}

            <div className="home-glow home-glow-one"></div>
            <div className="home-glow home-glow-two"></div>


            {/* ================================
                HEADER
            ================================= */}

            <header className="home-header">

                <div className="brand">

                    <div className="brand-icon">

                        <MapPin
                            size={22}
                            strokeWidth={2.5}
                        />

                    </div>

                    <span>
                        Find My Person
                    </span>

                </div>


                <div className="header-status">

                    <span className="status-dot"></span>

                    Secure & Private

                </div>

            </header>


            {/* ================================
                HERO
            ================================= */}

            <section className="home-hero">

                <div className="hero-badge">

                    <Radio size={15} />

                    REAL-TIME LOCATION

                </div>


                <h1 style={{color:"black"}}>
                    Find someone<br />

                    <span>
                        when it matters.
                    </span>
                </h1>


                <p>
                    Create a simple location request and
                    receive their current location securely.
                </p>

            </section>


            {/* ================================
                REQUEST CARD
            ================================= */}

            <section className="request-card">

                <div className="card-heading">

                    <div className="heading-icon">

                        <Navigation
                            size={20}
                        />

                    </div>

                    <div>

                        <h2 style={{color:"black"}}>
                            Request a location
                        </h2>

                        <p>
                            Enter the person's phone number
                        </p>

                    </div>

                </div>


                {/* Phone input */}

                <label>
                    Phone number
                </label>

                <div className="phone-input">

                    <Phone size={19} />

                    <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                    />

                </div>


                {/* Generate button */}

                <button
                    className="generate-button"
                    onClick={createLocationRequest}
                    disabled={loading}
                >

                    {loading ? (

                        <>
                            <RefreshCw
                                size={20}
                                className="loading-icon"
                            />

                            Creating request...

                        </>

                    ) : (

                        <>
                            <MapPin size={20} />

                            Generate Location Link

                        </>
                    )}

                </button>


                {/* Security */}

                <div className="request-security">

                    <ShieldCheck size={16} />

                    <span>
                        Your request is private and expires
                        automatically.
                    </span>

                </div>

            </section>


            {/* ================================
                MESSAGE
            ================================= */}

            {message && (

                <div className="home-message">

                    <Check size={17} />

                    {message}

                </div>

            )}


            {/* ================================
                GENERATED LINK
            ================================= */}

            {shareUrl && (

                <section className="link-card">

                    <div className="link-card-header">

                        <div className="success-circle">

                            <Check size={20} />

                        </div>

                        <div>

                            <h2>
                                Location request created
                            </h2>

                            <p>
                                Send this link to the person
                                whose location you want to receive.
                            </p>

                        </div>

                    </div>


                    <div className="share-link-row">

                        <div className="share-link-input">

                            <LinkIcon size={17} />

                            <input
                                value={shareUrl}
                                readOnly
                            />

                        </div>


                        <button
                            className="copy-button"
                            onClick={copyLink}
                        >

                            {copied ? (
                                <>
                                    <Check size={18} />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    Copy
                                </>
                            )}

                        </button>

                    </div>


                    <div className="link-instruction">

                        <span>1</span>

                        <p>
                            Copy the link and send it through
                            WhatsApp, SMS or any messaging app.
                        </p>

                    </div>

                    <div className="link-instruction">

                        <span>2</span>

                        <p>
                            The person opens the link and taps
                            <strong> Share My Location</strong>.
                        </p>

                    </div>

                    <div className="link-instruction">

                        <span>3</span>

                        <p>
                            Their location will appear here
                            automatically.
                        </p>

                    </div>

                </section>

            )}


            {/* ================================
                LOCATION
            ================================= */}

            {location && (

                <section className="live-location-card">

                    <div className="live-header">

                        <div>

                            <div className="live-label">

                                <span className="live-dot"></span>

                                LIVE LOCATION

                            </div>

                            <h2>
                                Location received
                            </h2>

                        </div>


                        <button
                            className="refresh-button"
                            onClick={() =>
                                getLocation(requestId)
                            }
                        >

                            <RefreshCw size={17} />

                            Refresh

                        </button>

                    </div>


                    {location.latitude !== null &&
                        location.longitude !== null ? (

                        <>

                            <div className="map-container">

                                <LocationMap
                                    latitude={
                                        location.latitude
                                    }
                                    longitude={
                                        location.longitude
                                    }
                                    accuracy={
                                        location.accuracy
                                    }
                                />

                            </div>


                            <div className="coordinates">

                                <div>

                                    <span>
                                        LATITUDE
                                    </span>

                                    <strong>
                                        {location.latitude.toFixed(6)}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        LONGITUDE
                                    </span>

                                    <strong>
                                        {location.longitude.toFixed(6)}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        ACCURACY
                                    </span>

                                    <strong>
                                        {Math.round(
                                            location.accuracy
                                        )} m
                                    </strong>

                                </div>

                            </div>

                        </>

                    ) : (

                        <div className="waiting-location">

                            <Radio size={30} />

                            <h3>
                                Waiting for location
                            </h3>

                            <p>
                                Ask the person to open the
                                link and share their location.
                            </p>

                        </div>

                    )}

                </section>

            )}


            {/* Footer */}

            <footer className="home-footer">

                <ShieldCheck size={15} />

                Location data is shared only with the
                person who requested it.

            </footer>

        </main>
    );

}

export default Home;