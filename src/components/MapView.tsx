'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  lat?: number | null;
  lng?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
}

interface MapViewProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onPropertyClick?: (property: Property) => void;
}

export default function MapView({ 
  properties, 
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 10,
  height = '400px',
  onPropertyClick 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const centerRef = useRef(center);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure center is valid
  const validCenter: [number, number] = (center && center[0] != null && center[1] != null) 
    ? [center[0], center[1]]
    : [40.7128, -74.0060];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapRef.current) return;

    // Clean up existing map if it exists
    if (mapRefInstance.current) {
      mapRefInstance.current.remove();
      mapRefInstance.current = null;
    }

    // Initialize map with valid center
    const map = L.map(mapRef.current).setView(validCenter, zoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRefInstance.current = map;

    return () => {
      if (mapRefInstance.current) {
        mapRefInstance.current.remove();
        mapRefInstance.current = null;
      }
    };
  }, [isMounted]);

  // Update center when it changes
  useEffect(() => {
    if (!mapRefInstance.current || !isMounted) return;
    const newCenter: [number, number] = (center && center[0] != null && center[1] != null) 
      ? [center[0], center[1]]
      : [40.7128, -74.0060];
    centerRef.current = newCenter;
    mapRefInstance.current.setView(newCenter, zoom);
  }, [center, zoom, isMounted]);

  useEffect(() => {
    if (!isMounted || !mapRefInstance.current) return;
    if (!properties || properties.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRefInstance.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for properties with coordinates
    const validProperties = properties.filter(p => p.lat && p.lng);
    
    if (validProperties.length === 0) return;

    const bounds = L.latLngBounds(
      validProperties.map(p => [p.lat!, p.lng!] as [number, number])
    );

    validProperties.forEach(property => {
      const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
      
      // Create custom icon
      const customIcon = L.divIcon({
        html: `
          <div style="
            background: white;
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            width: 120px;
            font-size: 12px;
          ">
            <div style="font-weight: bold; color: #1f2937;">$${(property.price / 1000).toFixed(0)}k</div>
            <div style="color: #6b7280;">{property.beds || 0}bd, {Math.floor(property.baths || 0)}ba</div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [120, 40],
        iconAnchor: [60, 20],
      });

      const marker = L.marker([property.lat!, property.lng!], { icon: customIcon })
        .addTo(mapRefInstance.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            ${primaryImage ? `<img src="${primaryImage.url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />` : ''}
            <h3 style="margin: 8px 0; font-size: 14px; font-weight: bold;">${property.title}</h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">${property.address}</p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">${property.city}, ${property.state}</p>
            <p style="margin: 8px 0; font-weight: bold; color: #2563eb;">$${property.price.toLocaleString()}</p>
            <button 
              onclick="window.open('/property/${property.id}', '_blank')"
              style="
                background: #2563eb;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 12px;
              "
            >
              View Details
            </button>
          </div>
        `);

      marker.on('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (validProperties.length > 0) {
      mapRefInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, onPropertyClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%', borderRadius: '8px', zIndex: 1 }}
        className="border border-gray-200"
      />
      {properties.filter(p => p.lat && p.lng).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>No properties with location data available</p>
          </div>
        </div>
      )}
    </div>
  );
}