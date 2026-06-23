'use client';

import { useEffect, useRef, useState } from 'react';
import type { MotherProfile } from '@/lib/types';
import { formatCategoryLabel, formatRiskLabel } from '@/lib/utils';

type MapCardProps = {
  mothers?: MotherProfile[];
};

type GoogleMapsApi = typeof google.maps;

declare global {
  interface Window {
    google?: typeof google;
    initSnazzyMap?: () => void;
  }
}

const TEGALWARU_CENTER = { lat: -6.6716735, lng: 107.3568055 };

const TEGALWARU_BOUNDARY = [
  { lat: -6.5488, lng: 107.4155 },
  { lat: -6.5530, lng: 107.4120 },
  { lat: -6.5558, lng: 107.4082 },
  { lat: -6.5590, lng: 107.4100 },
  { lat: -6.5635, lng: 107.4118 },
  { lat: -6.5670, lng: 107.4125 },
  { lat: -6.5710, lng: 107.4118 },
  { lat: -6.5770, lng: 107.4105 },
  { lat: -6.5820, lng: 107.4095 },
  { lat: -6.5870, lng: 107.4088 },
  { lat: -6.5930, lng: 107.4085 },
  { lat: -6.6080, lng: 107.4078 },
  { lat: -6.6200, lng: 107.4072 },
  { lat: -6.6350, lng: 107.4068 },
  { lat: -6.6480, lng: 107.4055 },
  { lat: -6.6580, lng: 107.4038 },
  { lat: -6.6650, lng: 107.4010 },
  { lat: -6.6800, lng: 107.3950 },
  { lat: -6.6950, lng: 107.3870 },
  { lat: -6.7080, lng: 107.3780 },
  { lat: -6.7200, lng: 107.3680 },
  { lat: -6.7330, lng: 107.3580 },
  { lat: -6.7430, lng: 107.3460 },
  { lat: -6.7490, lng: 107.3340 },
  { lat: -6.7510, lng: 107.3220 },
  { lat: -6.7470, lng: 107.3115 },
  { lat: -6.7390, lng: 107.3050 },
  { lat: -6.7300, lng: 107.3008 },
  { lat: -6.7200, lng: 107.2978 },
  { lat: -6.7080, lng: 107.2945 },
  { lat: -6.6960, lng: 107.2900 },
  { lat: -6.6880, lng: 107.2865 },
  { lat: -6.6810, lng: 107.2842 },
  { lat: -6.6730, lng: 107.2850 },
  { lat: -6.6650, lng: 107.2838 },
  { lat: -6.6590, lng: 107.2872 },
  { lat: -6.6510, lng: 107.2865 },
  { lat: -6.6430, lng: 107.2898 },
  { lat: -6.6390, lng: 107.2935 },
  { lat: -6.6330, lng: 107.2960 },
  { lat: -6.6250, lng: 107.2990 },
  { lat: -6.6170, lng: 107.3025 },
  { lat: -6.6080, lng: 107.3058 },
  { lat: -6.5990, lng: 107.3082 },
  { lat: -6.5930, lng: 107.3090 },
  { lat: -6.5870, lng: 107.3075 },
  { lat: -6.5820, lng: 107.3088 },
  { lat: -6.5780, lng: 107.3125 },
  { lat: -6.5740, lng: 107.3170 },
  { lat: -6.5700, lng: 107.3235 },
  { lat: -6.5650, lng: 107.3310 },
  { lat: -6.5600, lng: 107.3400 },
  { lat: -6.5560, lng: 107.3500 },
  { lat: -6.5525, lng: 107.3620 },
  { lat: -6.5500, lng: 107.3760 },
  { lat: -6.5490, lng: 107.3900 },
  { lat: -6.5488, lng: 107.4040 },
  { lat: -6.5488, lng: 107.4155 },
];

const SNAZZY_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f1f5e8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dbe7c9' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#b8d8a8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d7decf' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a7d7df' }] },
];

let googleMapsLoader: Promise<GoogleMapsApi> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsLoader) return googleMapsLoader;

  googleMapsLoader = new Promise((resolve, reject) => {
    window.initSnazzyMap = () => resolve(window.google!.maps);

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initSnazzyMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Gagal memuat Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsLoader;
}

function svgUrl(svg: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function motherMarkerIcon(color: string, accentColor: string) {
  return {
    url: svgUrl(`
      <svg width="54" height="66" viewBox="0 0 54 66" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="0" y="0" width="54" height="66" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.28"/>
        </filter>
        <g filter="url(#shadow)">
          <path d="M27 61C27 61 46 41.8 46 24C46 13.5 37.5 5 27 5C16.5 5 8 13.5 8 24C8 41.8 27 61 27 61Z" fill="${color}"/>
          <path d="M27 61C27 61 46 41.8 46 24C46 13.5 37.5 5 27 5C16.5 5 8 13.5 8 24C8 41.8 27 61 27 61Z" stroke="white" stroke-width="4"/>
          <circle cx="27" cy="24" r="13" fill="white"/>
          <circle cx="27" cy="24" r="9" fill="${accentColor}" fill-opacity="0.18"/>
          <path d="M27 15.7C24.8 15.7 23 17.5 23 19.7C23 21.9 24.8 23.7 27 23.7C29.2 23.7 31 21.9 31 19.7C31 17.5 29.2 15.7 27 15.7ZM20.8 33.2C20.8 28.7 23.6 25.2 27 25.2C30.4 25.2 33.2 28.7 33.2 33.2C33.2 34 32.6 34.6 31.8 34.6H22.2C21.4 34.6 20.8 34 20.8 33.2Z" fill="${color}"/>
        </g>
      </svg>
    `),
    scaledSize: new google.maps.Size(43, 53),
    anchor: new google.maps.Point(21.5, 53),
  };
}

function riskColors(riskLevel: MotherProfile['riskLevel']) {
  if (riskLevel === 'tinggi') return { marker: '#e11d48', accent: '#ffe4e6' };
  if (riskLevel === 'sedang') return { marker: '#f59e0b', accent: '#fef3c7' };
  return { marker: '#059669', accent: '#dcfce7' };
}

export default function MapCard({ mothers = [] }: MapCardProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing-key' | 'error'>(
    apiKey ? 'loading' : 'missing-key',
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (!apiKey) {
      return;
    }

    let isMounted = true;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!isMounted || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: TEGALWARU_CENTER,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          styles: SNAZZY_MAP_STYLE,
        });
        mapInstanceRef.current = map;

        const infoWindow = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();

        const boundaryGlow = new maps.Polygon({
          paths: TEGALWARU_BOUNDARY,
          strokeColor: '#ffffff',
          strokeOpacity: 0.95,
          strokeWeight: 9,
          fillColor: '#f97316',
          fillOpacity: 0.05,
          map,
        });

        const boundary = new maps.Polyline({
          path: TEGALWARU_BOUNDARY,
          strokeColor: '#dc2626',
          strokeOpacity: 0,
          strokeWeight: 4,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1', strokeColor: '#dc2626', strokeOpacity: 1, strokeWeight: 4, scale: 2 },
              offset: '0',
              repeat: '18px',
            },
          ],
          map,
        });

        TEGALWARU_BOUNDARY.forEach((point) => bounds.extend(point));
        boundaryGlow.addListener('click', (event: google.maps.MapMouseEvent) => {
          infoWindow.setContent('<strong>Kecamatan Tegalwaru</strong><br/>Kabupaten Purwakarta, Jawa Barat');
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
        });
        boundary.addListener('click', (event: google.maps.MapMouseEvent) => {
          infoWindow.setContent('<strong>Kecamatan Tegalwaru</strong><br/>Kabupaten Purwakarta, Jawa Barat');
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
        });

        mothers.forEach((mother) => {
          if (!Number.isFinite(mother.latitude) || !Number.isFinite(mother.longitude)) return;

          const markerColor = riskColors(mother.riskLevel);
          const position = { lat: mother.latitude, lng: mother.longitude };
          const marker = new maps.Marker({
            position,
            map,
            title: mother.fullName,
            icon: motherMarkerIcon(markerColor.marker, markerColor.accent),
            label: { text: 'I', color: '#ffffff', fontSize: '0px' },
            optimized: false,
          });

          bounds.extend(position);
          marker.addListener('click', () => {
            infoWindow.setContent(`<div style="min-width:180px"><strong style="font-size:14px;color:#0f172a">${mother.fullName}</strong><br/><span style="color:#475569">${formatCategoryLabel(mother.category)}</span><br/><span style="color:#64748b">RT ${mother.rt}/RW ${mother.rw}, ${mother.village}</span><br/><span style="display:inline-block;margin-top:6px;border-radius:999px;background:${markerColor.accent};color:${markerColor.marker};font-weight:700;padding:3px 8px;font-size:12px">${formatRiskLabel(mother.riskLevel)}</span></div>`);
            infoWindow.open(map, marker);
          });
        });

        map.fitBounds(bounds, 24);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Error initializing map:', error);
        if (isMounted) setStatus('error');
      });

    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
    };
  }, [apiKey, mothers]);

  const showOverlay = status !== 'ready';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      {showOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100 px-6 text-center">
          {status === 'loading' ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
              <p className="text-sm text-slate-500">Memuat peta Snazzy Maps...</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800">Peta belum bisa dimuat</p>
              <p className="max-w-sm text-xs text-slate-500">
                {status === 'missing-key'
                  ? 'Tambahkan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY agar Google Maps dengan style Snazzy Maps aktif.'
                  : 'Google Maps gagal dimuat. Periksa koneksi, API key, dan pembatasan domain di Google Cloud.'}
              </p>
            </>
          )}
        </div>
      )}
      <div
        ref={mapRef}
        aria-label="Peta wilayah Kecamatan Tegalwaru, Kabupaten Purwakarta"
        className="h-[22rem] w-full bg-slate-200 sm:h-[26rem] lg:h-[30rem]"
      />
      <div className="absolute bottom-8 right-2 z-[5] flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
        <span className="h-2 w-6 rounded-full border-2 border-dashed border-red-500 bg-red-500/10" />
        Batas & titik ibu
      </div>
    </div>
  );
}
