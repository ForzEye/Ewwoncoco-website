import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface OrderTrackingMapProps {
    orderId: number;
    storeLocation: { lat: number; lng: number };
    deliveryLocation?: { lat: number; lng: number };
    driverLocation?: { lat: number; lng: number } | null;
}

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
};

export default function OrderTrackingMap({ storeLocation, deliveryLocation, driverLocation }: OrderTrackingMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(storeLocation);
        if (deliveryLocation) bounds.extend(deliveryLocation);
        if (driverLocation) bounds.extend(driverLocation);
        map.fitBounds(bounds);
        setMap(map);
    }, [storeLocation, deliveryLocation, driverLocation]);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (isLoaded && deliveryLocation) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: storeLocation,
                    destination: deliveryLocation,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    }
                }
            );
        }
    }, [isLoaded, storeLocation, deliveryLocation]);

    if (!isLoaded) return <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={driverLocation || storeLocation}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                styles: [
                    {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [{ "visibility": "off" }]
                    }
                ],
                disableDefaultUI: true,
                zoomControl: true,
            }}
        >
            {/* Store Marker */}
            <Marker 
                position={storeLocation} 
                label="Store"
                icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
            />

            {/* Delivery Marker */}
            {deliveryLocation && (
                <Marker 
                    position={deliveryLocation} 
                    label="You"
                    icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                />
            )}

            {/* Driver Marker */}
            {driverLocation && (
                <Marker 
                    position={driverLocation} 
                    icon={{
                        url: "https://cdn-icons-png.flaticon.com/512/2830/2830305.png", // Motor icon
                        scaledSize: new google.maps.Size(40, 40)
                    }}
                />
            )}

            {directions && (
                <DirectionsRenderer 
                    directions={directions} 
                    options={{
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: "#00C48C",
                            strokeWeight: 5,
                            strokeOpacity: 0.7
                        }
                    }} 
                />
            )}
        </GoogleMap>
    );
}
