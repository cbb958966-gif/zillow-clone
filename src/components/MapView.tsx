'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '@/context/ThemeContext'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  lat?: number | null
  lng?: number | null
  beds?: number | null
  baths?: number | null
  sqft?: number | null
  images: Array<{ id: string; url: string; isPrimary: boolean }>
}

interface MapViewProps {
  properties: Property[]
  center?: [number, number]
  zoom?: number
  height?: string
  onPropertyClick?: (property: Property) => void
}

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
}

function formatPrice(price: number) {
  if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `$${(price / 1000).toFixed(0)}k`
  return `$${price.toLocaleString()}`
}

function markerHtml(property: Property) {
  const image = property.images?.find(i => i.isPrimary) || property.images?.[0]
  return `
    <div class="map-marker">
      <div class="map-marker-inner">
        ${image ? `<img src="${image.url}" alt="" class="map-marker-img" />` : `<div class="map-marker-img map-marker-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`}
        <div class="map-marker-price">${formatPrice(property.price)}</div>
      </div>
      ${property.beds ? `<div class="map-marker-details">${property.beds}bd · ${Math.floor(property.baths || 0)}ba</div>` : ''}
    </div>
  `
}

function popupHtml(property: Property) {
  const image = property.images?.find(i => i.isPrimary) || property.images?.[0]
  return `
    <div class="map-popup">
      ${image ? `<div class="map-popup-img"><img src="${image.url}" alt="${property.title}" /></div>` : `<div class="map-popup-img map-popup-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`}
      <div class="map-popup-body">
        <div class="map-popup-price">$${property.price.toLocaleString()}</div>
        <h3 class="map-popup-title">${property.title}</h3>
        <p class="map-popup-address">${property.address}, ${property.city}, ${property.state}</p>
        <div class="map-popup-details">
          ${property.beds ? `<span class="map-popup-detail">${property.beds} Beds</span>` : ''}
          ${property.baths ? `<span class="map-popup-detail">${Math.floor(property.baths)} Baths</span>` : ''}
          ${property.sqft ? `<span class="map-popup-detail">${property.sqft.toLocaleString()} sqft</span>` : ''}
        </div>
        <a href="/property/${property.id}" class="map-popup-cta">View Details</a>
      </div>
    </div>
  `
}

export default function MapView({ properties, center = [40.7128, -74.006], zoom = 10, height = '400px', onPropertyClick }: MapViewProps) {
  const { theme } = useTheme()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const [mounted, setMounted] = useState(false)

  const validCenter: [number, number] = center[0] != null && center[1] != null ? center : [40.7128, -74.006]
  const validProperties = properties.filter(p => p.lat && p.lng)
  const hasLocations = validProperties.length > 0

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapRef.current) return
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(validCenter, zoom)

    tileLayerRef.current = L.tileLayer(theme === 'dark' ? TILES.dark : TILES.light, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(map)

    mapInstance.current = map
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [mounted])

  useEffect(() => {
    if (!mapInstance.current || !mounted) return
    const newCenter: [number, number] = center[0] != null && center[1] != null ? center : [40.7128, -74.006]
    mapInstance.current.setView(newCenter, zoom)
  }, [center[0], center[1], zoom, mounted])

  useEffect(() => {
    if (!mapInstance.current || !mounted) return
    if (tileLayerRef.current) { tileLayerRef.current.remove() }
    tileLayerRef.current = L.tileLayer(theme === 'dark' ? TILES.dark : TILES.light, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
    }).addTo(mapInstance.current)
  }, [theme, mounted])

  useEffect(() => {
    if (!mapInstance.current || !mounted) return

    markersRef.current.forEach(m => mapInstance.current?.removeLayer(m))
    markersRef.current = []

    if (validProperties.length === 0) return

    const bounds = L.latLngBounds(validProperties.map(p => [p.lat!, p.lng!] as [number, number]))

    validProperties.forEach((property, idx) => {
      const icon = L.divIcon({
        html: markerHtml(property),
        className: 'map-marker-wrapper',
        iconSize: [140, 56],
        iconAnchor: [70, 56],
      })

      const marker = L.marker([property.lat!, property.lng!], { icon })
        .addTo(mapInstance.current!)
        .bindPopup(popupHtml(property), {
          maxWidth: 320,
          className: 'map-popup-wrapper',
          closeButton: false,
          offset: [0, -8],
        })

      marker.on('mouseover', () => {
        const el = marker.getElement()
        if (el) { el.style.zIndex = '1000'; el.style.transform = 'scale(1.1)'; el.style.transition = 'transform 0.2s' }
      })
      marker.on('mouseout', () => {
        const el = marker.getElement()
        if (el) { el.style.zIndex = ''; el.style.transform = '' }
      })
      marker.on('click', () => {
        if (onPropertyClick) onPropertyClick(property)
      })

      markersRef.current.push(marker)

      setTimeout(() => {
        const el = marker.getElement()
        if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(-10px)' }
        requestAnimationFrame(() => {
          if (el) { el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; el.style.opacity = '1'; el.style.transform = '' }
        })
      }, idx * 80)
    })

    if (validProperties.length === 1) {
      mapInstance.current.setView([validProperties[0].lat!, validProperties[0].lng!], zoom || 15)
    } else if (validProperties.length > 1) {
      mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [properties, onPropertyClick, mounted])

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      {!hasLocations && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <p className="text-muted-foreground text-sm font-medium">No location data available</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .map-marker-wrapper { background: none !important; border: none !important; }
        .map-marker { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .map-marker-inner { display: flex; align-items: center; gap: 6px; background: var(--card-bg, #fff); border: 2px solid #06c; border-radius: 12px; padding: 4px 10px 4px 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; transition: box-shadow 0.2s; }
        .map-marker:hover .map-marker-inner { box-shadow: 0 6px 20px rgba(0,102,204,0.3); border-color: #0052a3; }
        .map-marker-img { width: 28px; height: 28px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f4f4f5; }
        .map-marker-img-placeholder { display: flex; align-items: center; justify-content: center; }
        .map-marker-img-placeholder svg { width: 16px; height: 16px; color: #a1a1aa; }
        .map-marker-price { font-size: 13px; font-weight: 700; color: #18181b; line-height: 1; }
        .map-marker-details { margin-top: 4px; padding: 2px 10px; background: rgba(0,102,204,0.1); border-radius: 8px; font-size: 11px; font-weight: 600; color: #06c; white-space: nowrap; backdrop-filter: blur(4px); }
        [data-theme="dark"] .map-marker-inner { background: #1e293b; border-color: #3b82f6; }
        [data-theme="dark"] .map-marker:hover .map-marker-inner { border-color: #60a5fa; box-shadow: 0 6px 20px rgba(59,130,246,0.3); }
        [data-theme="dark"] .map-marker-price { color: #f1f5f9; }
        [data-theme="dark"] .map-marker-details { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .leaflet-popup-content-wrapper { border-radius: 16px !important; padding: 0 !important; overflow: hidden !important; box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important; }
        .leaflet-popup-content { margin: 0 !important; min-width: 280px; }
        .leaflet-popup-tip { box-shadow: none !important; }
        [data-theme="dark"] .leaflet-popup-content-wrapper { background: #1e293b !important; color: #f1f5f9 !important; }
        [data-theme="dark"] .leaflet-popup-tip { background: #1e293b !important; }
        .map-popup-img { width: 100%; height: 160px; overflow: hidden; }
        .map-popup-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .map-popup-img-placeholder { display: flex; align-items: center; justify-content: center; background: #f4f4f5; }
        .map-popup-img-placeholder svg { width: 48px; height: 48px; color: #a1a1aa; }
        [data-theme="dark"] .map-popup-img-placeholder { background: #334155; }
        [data-theme="dark"] .map-popup-img-placeholder svg { color: #64748b; }
        .map-popup-body { padding: 16px; }
        .map-popup-price { font-size: 20px; font-weight: 800; color: #06c; margin-bottom: 4px; }
        [data-theme="dark"] .map-popup-price { color: #60a5fa; }
        .map-popup-title { font-size: 15px; font-weight: 600; color: #18181b; margin: 0 0 4px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        [data-theme="dark"] .map-popup-title { color: #f1f5f9; }
        .map-popup-address { font-size: 13px; color: #71717a; margin: 0 0 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        [data-theme="dark"] .map-popup-address { color: #94a3b8; }
        .map-popup-details { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .map-popup-detail { font-size: 12px; font-weight: 500; color: #52525b; background: #f4f4f5; padding: 4px 10px; border-radius: 8px; }
        [data-theme="dark"] .map-popup-detail { color: #cbd5e1; background: #334155; }
        .map-popup-cta { display: block; text-align: center; padding: 10px 16px; background: #06c; color: #fff; font-size: 13px; font-weight: 600; border-radius: 10px; text-decoration: none; transition: background 0.2s; }
        .map-popup-cta:hover { background: #0052a3; }
        [data-theme="dark"] .map-popup-cta { background: #3b82f6; color: #fff; }
        [data-theme="dark"] .map-popup-cta:hover { background: #2563eb; }
        .leaflet-control-zoom a { border-radius: 8px !important; border: 1px solid var(--border, #e4e4e7) !important; background: var(--card-bg, #fff) !important; color: var(--foreground, #18181b) !important; }
        [data-theme="dark"] .leaflet-control-zoom a { background: #1e293b !important; border-color: #334155 !important; color: #f1f5f9 !important; }
      `}</style>
    </div>
  )
}
