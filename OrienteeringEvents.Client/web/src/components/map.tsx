import React, { useRef, useEffect } from 'react';
import DateSlider from './slider.tsx';
import * as maptilersdk from '@maptiler/sdk';
import "@maptiler/sdk/dist/maptiler-sdk.css";
import './map.css';

export default function Map({ events }: { events: any[] }) {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const edinburgh = { lng: -3.1883, lat: 55.9533 };
    const zoom = 10;
    maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    const [dateRange, setDateRange] = React.useState<[Date, Date]>([new Date(), new Date(new Date().setDate(new Date().getDate() + 28))]);

    const sliderChange = (event: [Date, Date]) => {
        setDateRange(event);
    }

    const applyFilter = (loadedMap: maptilersdk.Map) => {
        // const filter: maptilersdk.FilterSpecification = [
        //     'all',
        //     ['>=', 'timestamp', dateRange[0].getTime()],
        //     ['<=', 'timestamp', dateRange[1].getTime()]
        // ];
        // // Apply the filter to the layer without reloading the map
        // loadedMap.setFilter('unclustered-point', filter);
        const filteredEvents = events.filter(event => {
            return event.timestamp >= dateRange[0].getTime() && event.timestamp <= dateRange[1].getTime();
        });
        if (loadedMap.getSource('events'))
            unloadMap(loadedMap);
        loadMap(loadedMap, filteredEvents);
    }

    function unloadMap(loadedMap: maptilersdk.Map) {
        if (loadedMap.getLayer('clusters')) loadedMap.removeLayer('clusters');
        if (loadedMap.getLayer('cluster-count')) loadedMap.removeLayer('cluster-count');
        if (loadedMap.getLayer('unclustered-point')) loadedMap.removeLayer('unclustered-point');
        if (loadedMap.getSource('events')) loadedMap.removeSource('events');
    }
    function loadMap(loadedMap: maptilersdk.Map, filteredEvents: any[]) {
        // Add event markers with clustering
        const eventFeatures = filteredEvents.map(event => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [event.lng, event.lat]
            },
            properties: {
                name: event.name,
                timestamp: event.timestamp,
                date: event.date
            }
        }));

        loadedMap.addSource('events', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: eventFeatures
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 20
        });

        // Add cluster circles
        loadedMap.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'events',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6', // 0-9 events
                    10,
                    '#f1f075', // 10-99 events
                    100,
                    '#f28cb1'  // 100+ events
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20, // 0-9
                    10,
                    30, // 10-99
                    100,
                    40  // 100+
                ]
            }
        });

        // Add cluster count labels
        loadedMap.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'events',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        // Add unclustered point layer
        loadedMap.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#ff0000',
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        // Add click handler for clusters
        loadedMap.on('click', 'clusters', async (e) => {
            const features = loadedMap.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties!.cluster_id;
            const clusterSource = loadedMap.getSource('events') as any;

            // Get all leaves (individual events) in this cluster
            const leaves = await clusterSource.getClusterLeaves(clusterId, Infinity, 0);

            // Create popup content with list of events
            let popupContent = '<div style="max-height: 200px; overflow-y: auto;"><h3>Events in this area:</h3><ul style="margin: 0; padding-left: 20px;">';
            leaves.forEach((leaf: any) => {
                const { name, date } = leaf.properties;
                popupContent += `<li><strong>${name}</strong><br><small>${date}</small></li>`;
            });
            popupContent += '</ul></div>';

            // Show popup at cluster location
            new maptilersdk.Popup()
                .setLngLat((features[0].geometry as any).coordinates)
                .setHTML(popupContent)
                .addTo(map.current!);
        });

        // Add click handler for individual events
        loadedMap.on('click', 'unclustered-point', (e) => {
            const coordinates = (e.features![0].geometry as any).coordinates.slice();
            const { name, date } = e.features![0].properties!;

            new maptilersdk.Popup()
                .setLngLat(coordinates)
                .setHTML(`<h3>${name}</h3><p>${date}</p>`)
                .addTo(loadedMap);
        });

        // Change cursor on hover
        loadedMap.on('mouseenter', 'clusters', () => {
            loadedMap.getCanvas().style.cursor = 'pointer';
        });
        loadedMap.on('mouseleave', 'clusters', () => {
            loadedMap.getCanvas().style.cursor = '';
        });
        loadedMap.on('mouseenter', 'unclustered-point', () => {
            loadedMap.getCanvas().style.cursor = 'pointer';
        });
        loadedMap.on('mouseleave', 'unclustered-point', () => {
            loadedMap.getCanvas().style.cursor = '';
        });
    }

    useEffect(() => {
        if (map.current) return; // initialize map only once

        if (!mapContainer.current) return;

        map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: "outdoor-v4",
            center: [edinburgh.lng, edinburgh.lat],
            zoom: zoom,
            projection: 'globe',
            terrainControl: true
        });

        // Wait for map to load before adding sources and layers
        map.current.on('load', () => {
            applyFilter(map.current!); // Apply initial filter based on default date range
        });

    }, []);

    // Apply date filter directly whenever dateRange is updated
    useEffect(() => {
        if (map.current?.loaded()) {
            applyFilter(map.current!);
        }
    }, [dateRange, events]);

    return (
        <div className="map-wrap">
            <div ref={mapContainer} className="map" />
            <div className='slider-container'>
                <DateSlider onSliderChange={sliderChange} />
            </div>
        </div>
    );
}