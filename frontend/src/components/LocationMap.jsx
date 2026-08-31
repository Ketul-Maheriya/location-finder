import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


const MapUpdater = ({ position }) => {

    const map = useMap();

    map.setView(position);

    return null;
};


const LocationMap = ({
    latitude,
    longitude,
    accuracy
}) => {

    if (
        latitude == null ||
        longitude == null
    ) {
        return (
            <div>
                Location is not available yet.
            </div>
        );
    }


    const position = [
        Number(latitude),
        Number(longitude)
    ];


    return (
        <MapContainer
            center={position}
            zoom={15}
            style={{
                height: "500px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapUpdater
                position={position}
            />


            <Marker
                position={position}
                icon={defaultIcon}
            >

                <Popup>

                    <strong>
                        Person's Location
                    </strong>

                    <br />

                    Latitude: {latitude}

                    <br />

                    Longitude: {longitude}

                    <br />

                    Accuracy: {accuracy} meters

                </Popup>

            </Marker>

        </MapContainer>
    );
};


export default LocationMap;