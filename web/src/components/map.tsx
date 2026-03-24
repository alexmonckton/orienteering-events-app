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
        const filter: maptilersdk.FilterSpecification = [
            'all',
            ['>=', 'timestamp', dateRange[0].getTime()],
            ['<=', 'timestamp', dateRange[1].getTime()]
        ];
        // Apply the filter to the layer without reloading the map
        loadedMap.setFilter('unclustered-point', filter);
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

            // Add event markers with clustering
            const eventFeatures = events.map(event => ({
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

            map.current!.addSource('events', {
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
            map.current!.addLayer({
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
            map.current!.addLayer({
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
            map.current!.addLayer({
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
            map.current!.on('click', 'clusters', async (e) => {
                const features = map.current!.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties!.cluster_id;
                const clusterSource = map.current!.getSource('events') as any;

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
            map.current!.on('click', 'unclustered-point', (e) => {
                const coordinates = (e.features![0].geometry as any).coordinates.slice();
                const { name, date } = e.features![0].properties!;

                new maptilersdk.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<h3>${name}</h3><p>${date}</p>`)
                    .addTo(map.current!);
            });

            // Change cursor on hover
            map.current!.on('mouseenter', 'clusters', () => {
                map.current!.getCanvas().style.cursor = 'pointer';
            });
            map.current!.on('mouseleave', 'clusters', () => {
                map.current!.getCanvas().style.cursor = '';
            });
            map.current!.on('mouseenter', 'unclustered-point', () => {
                map.current!.getCanvas().style.cursor = 'pointer';
            });
            map.current!.on('mouseleave', 'unclustered-point', () => {
                map.current!.getCanvas().style.cursor = '';
            });

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