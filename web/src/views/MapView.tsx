import React, { useEffect, useRef } from 'react'
import Map from '../components/map';
import { events } from '../data/events.tsx';
import './MapView.css';

export default function MapView() {
    return (
        <div>
            <h1>Explore Events</h1>
            <div className="map-container">
                <Map events={events} />
            </div>
        </div>
    );
}