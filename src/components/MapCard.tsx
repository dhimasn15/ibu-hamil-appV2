'use client';

import { useEffect, useRef, useState } from 'react';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';

const TEGALSARI_CENTER: LatLngExpression = [-6.6325065, 107.3346229];

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

        // Jika map sudah ada, hapus terlebih dahulu
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Buat instance map baru
        const map = L.map(mapRef.current, {
          center: TEGALSARI_CENTER,
          zoom: 16,
          zoomSnap: 0.5,
          zoomDelta: 1,
          scrollWheelZoom: true,
          attributionControl: true,
          preferCanvas: true,
        });

        mapInstanceRef.current = map;

        // Layer tile utama (Satellite imagery)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: '&copy; Esri',
            maxZoom: 19,
            maxNativeZoom: 18,
          },
        ).addTo(map);

        // Tambahkan scale control
        L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

        // Marker untuk lokasi utama
        L.marker(TEGALSARI_CENTER, {
          title: 'Tegalsari, Tegalwaru, Purwakarta',
          alt: 'Lokasi Tegalsari',
        })
          .bindPopup('<strong>Tegalsari</strong><br/>Tegalwaru, Purwakarta')
          .addTo(map);

        // Layer labels opsional (ringan)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; CARTO',
            maxZoom: 19,
            pane: 'overlayPane',
            opacity: 0.85,
          },
        ).addTo(map);

        // Handle window resize
        window.addEventListener('resize', () => {
          map.invalidateSize();
        });

        // Invalidate size setelah delay kecil untuk memastikan rendering
        setTimeout(() => {
          map.invalidateSize();
          map.setView(TEGALSARI_CENTER, 16);
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <div className="text-sm text-slate-500">Memuat peta...</div>
        </div>
      )}
      <div
        ref={mapRef}
        aria-label="Peta wilayah Tegalsari, Tegalwaru, Purwakarta"
        className="h-[22rem] w-full bg-slate-200 sm:h-[26rem] lg:h-[30rem]"
      />
    </div>
  );
}
