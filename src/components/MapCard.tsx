'use client';

import { useEffect, useRef, useState } from 'react';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

// Center of Kecamatan Tegalwaru, Purwakarta (from Google Maps)
const TEGALWARU_CENTER: LatLngExpression = [-6.6716735, 107.3568055];

// Approximate boundary polygon of Kecamatan Tegalwaru, Purwakarta
// Traced from Google Maps satellite imagery (red dashed boundary line)
// Landmarks: Curug Suhada (NE), Badega Gunung Parang (NW),
// Wisata Alam Gunung Bongkok (center), Pasar Citeko (E), Keraja (SW)
const TEGALWARU_BOUNDARY: [number, number][] = [
  // Top area - near Curug Suhada (NE)
  [-6.5488, 107.4155],
  [-6.5530, 107.4120],
  [-6.5558, 107.4082],
  [-6.5590, 107.4100],
  [-6.5635, 107.4118],
  [-6.5670, 107.4125],
  // East side going south
  [-6.5710, 107.4118],
  [-6.5770, 107.4105],
  [-6.5820, 107.4095],
  [-6.5870, 107.4088],
  [-6.5930, 107.4085],
  // Near Pasar Citeko (E)
  [-6.6080, 107.4078],
  [-6.6200, 107.4072],
  [-6.6350, 107.4068],
  [-6.6480, 107.4055],
  [-6.6580, 107.4038],
  [-6.6650, 107.4010],
  // Southeast curve
  [-6.6800, 107.3950],
  [-6.6950, 107.3870],
  [-6.7080, 107.3780],
  [-6.7200, 107.3680],
  [-6.7330, 107.3580],
  [-6.7430, 107.3460],
  [-6.7490, 107.3340],
  [-6.7510, 107.3220],
  // South-southwest (near Keraja)
  [-6.7470, 107.3115],
  [-6.7390, 107.3050],
  [-6.7300, 107.3008],
  [-6.7200, 107.2978],
  [-6.7080, 107.2945],
  // West - jagged border (distinctive feature from image)
  [-6.6960, 107.2900],
  [-6.6880, 107.2865],
  [-6.6810, 107.2842],
  [-6.6730, 107.2850],
  [-6.6650, 107.2838],
  [-6.6590, 107.2872],  // Far west indent
  [-6.6510, 107.2865],
  [-6.6430, 107.2898],
  [-6.6390, 107.2935],
  [-6.6330, 107.2960],
  [-6.6250, 107.2990],
  [-6.6170, 107.3025],
  [-6.6080, 107.3058],
  [-6.5990, 107.3082],
  [-6.5930, 107.3090],
  // Upper-west - near Badega Gunung Parang
  [-6.5870, 107.3075],
  [-6.5820, 107.3088],
  [-6.5780, 107.3125],
  [-6.5740, 107.3170],
  [-6.5700, 107.3235],
  [-6.5650, 107.3310],
  [-6.5600, 107.3400],
  [-6.5560, 107.3500],
  [-6.5525, 107.3620],
  [-6.5500, 107.3760],
  [-6.5490, 107.3900],
  [-6.5488, 107.4040],
  // Close back to start
  [-6.5488, 107.4155],
];

export default function MapCard() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');

        if (!isMounted || !mapRef.current) return;

        // Remove existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map centered on Kecamatan Tegalwaru
        const map = L.map(mapRef.current, {
          center: TEGALWARU_CENTER,
          zoom: 12,
          zoomSnap: 0.5,
          zoomDelta: 1,
          scrollWheelZoom: true,
          attributionControl: true,
          preferCanvas: true,
        });

        mapInstanceRef.current = map;

        // Satellite imagery layer (Esri World Imagery)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
            maxNativeZoom: 18,
          },
        ).addTo(map);

        // Boundary polygon - red dashed style matching Google Maps reference
        const boundaryPolygon = L.polygon(TEGALWARU_BOUNDARY, {
          color: '#ef4444',          // red border
          weight: 3,
          opacity: 0.9,
          dashArray: '10, 7',        // dashed line like in the reference image
          fillColor: '#ef4444',
          fillOpacity: 0.08,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Bind popup to polygon
        boundaryPolygon.bindPopup(
          '<strong>Kecamatan Tegalwaru</strong><br/>Kabupaten Purwakarta, Jawa Barat',
        );

        // Fit map bounds to the polygon with padding
        map.fitBounds(boundaryPolygon.getBounds(), { padding: [24, 24] });

        // Landmark markers
        const landmarks: { coords: [number, number]; name: string; emoji: string }[] = [
          { coords: [-6.5540, 107.4118], name: 'Curug Suhada Purwakarta', emoji: '🏞️' },
          { coords: [-6.5850, 107.3320], name: 'Badega Gunung Parang', emoji: '⛰️' },
          { coords: [-6.6390, 107.3530], name: 'Wisata Alam Gunung Bongkok', emoji: '🌿' },
          { coords: [-6.6610, 107.4010], name: 'Pasar Citeko', emoji: '🛒' },
          { coords: [-6.7320, 107.3120], name: 'Keraja', emoji: '📍' },
          { coords: [-6.6716735, 107.3568055], name: 'Pusat Kec. Tegalwaru', emoji: '🏛️' },
        ];

        landmarks.forEach(({ coords, name, emoji }) => {
          const icon = L.divIcon({
            html: `<div style="
              background:white;
              border:2px solid #334155;
              border-radius:50%;
              width:28px;
              height:28px;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:14px;
              box-shadow:0 2px 6px rgba(0,0,0,0.35);
              cursor:pointer;
            ">${emoji}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            className: '',
          });

          L.marker(coords, { icon, title: name })
            .bindPopup(`<strong>${emoji} ${name}</strong><br/><span style="color:#64748b;font-size:12px">Kec. Tegalwaru, Purwakarta</span>`)
            .addTo(map);
        });

        // Label overlay (place names)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; CARTO',
            maxZoom: 19,
            pane: 'overlayPane',
            opacity: 0.75,
          },
        ).addTo(map);

        // Scale control
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

        // Resize handler
        window.addEventListener('resize', () => map.invalidateSize());

        setTimeout(() => {
          map.invalidateSize();
          map.fitBounds(boundaryPolygon.getBounds(), { padding: [24, 24] });
        }, 300);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-sm text-slate-500">Memuat peta satelit…</p>
        </div>
      )}
      <div
        ref={mapRef}
        aria-label="Peta wilayah Kecamatan Tegalwaru, Kabupaten Purwakarta"
        className="h-[22rem] w-full bg-slate-200 sm:h-[26rem] lg:h-[30rem]"
      />
      {/* Legend */}
      <div className="absolute bottom-8 right-2 z-[1000] flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        <span className="h-2 w-6 rounded-full border-2 border-dashed border-red-500 bg-red-500/10" />
        Batas Kec. Tegalwaru
      </div>
    </div>
  );
}
