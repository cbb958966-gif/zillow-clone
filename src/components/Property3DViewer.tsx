'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Box, ChevronLeft, ChevronRight, Expand, Maximize2, Pause, Play,
  RotateCw, X, ZoomIn, ZoomOut
} from 'lucide-react'

interface TourImage {
  id: string
  url: string
  alt?: string
  description?: string
}

interface Property3DViewerProps {
  images: TourImage[]
  title: string
  onClose: () => void
}

export default function Property3DViewer({ images, title, onClose }: Property3DViewerProps) {
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [autoRotate, setAutoRotate] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [panelWidth, setPanelWidth] = useState(720)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dragState = useRef<{ startX: number; startRotation: number } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const imageCount = Math.max(images.length, 1)
  const step = 360 / imageCount
  const panelHeight = Math.round(panelWidth * 0.62)
  const radius = images.length > 2 ? Math.round((panelWidth / 2) / Math.tan(Math.PI / images.length)) : 0
  const normalizedRotation = ((-rotation % 360) + 360) % 360
  const activeIndex = Math.round(normalizedRotation / step) % imageCount

  const goNext = useCallback(() => setRotation((current) => current - step), [step])
  const goPrev = useCallback(() => setRotation((current) => current + step), [step])

  useEffect(() => {
    const updateWidth = () => setPanelWidth(Math.min(window.innerWidth * 0.78, 720))
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  useEffect(() => {
    if (!autoRotate || dragging) return
    const timer = window.setInterval(() => setRotation((current) => current - 0.18), 24)
    return () => window.clearInterval(timer)
  }, [autoRotate, dragging])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { startX: event.clientX, startRotation: rotation }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return
    setRotation(dragState.current.startRotation + (event.clientX - dragState.current.startX) * 0.35)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    setZoom((current) => Math.max(0.7, Math.min(1.35, current - event.deltaY * 0.0008)))
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await modalRef.current?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      setIsFullscreen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#03060d]/90 p-3 backdrop-blur-xl sm:p-6"
      onClick={onClose} role="presentation">
      <div ref={modalRef} onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#0b1020]/95 p-4 text-white shadow-2xl sm:p-6">

        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
              <Box className="h-5 w-5" />
            </span>
            <div>
              <h2 className="display-title text-xl sm:text-2xl">3D Property Tour</h2>
              <p className="max-w-xl truncate text-xs text-white/60 sm:text-sm">{title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close 3D tour"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative mx-auto flex max-h-[62vh] w-full cursor-grab select-none items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-white/5 to-black/30 active:cursor-grabbing"
          style={{ height: panelHeight + 48, perspective: 1400 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `scale(${zoom}) rotateY(${rotation}deg)`,
              transition: dragging ? 'none' : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}>
            {images.map((image, index) => (
              <div key={image.id}
                className="absolute overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
                style={{
                  width: panelWidth,
                  height: panelHeight,
                  marginLeft: -panelWidth / 2,
                  marginTop: -panelHeight / 2,
                  transform: `rotateY(${index * step}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                }}>
                <Image src={image.url} alt={image.alt || `Property view ${index + 1}`} fill
                  sizes="(max-width: 768px) 78vw, 720px" className="object-cover" draggable={false} unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">View {index + 1}</p>
                    <p className="mt-1 truncate text-sm font-medium text-white">{image.description || image.alt || title}</p>
                  </div>
                  {index === activeIndex && (
                    <span className="pill border-transparent bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                      In view
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="button" aria-label="Previous view" onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:left-5">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next view" onClick={goNext}
            className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:right-5">
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-4 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-md">
            Drag to rotate · Scroll to zoom · Arrow keys to navigate
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button key={image.id} type="button" onClick={() => setRotation(-index * step)}
                aria-label={`Show view ${index + 1}`}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${index === activeIndex ? 'border-white opacity-100' : 'border-white/15 opacity-60 hover:opacity-100'}`}>
                <Image src={image.url} alt="" fill sizes="64px" className="object-cover" draggable={false} unoptimized />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom((current) => Math.max(0.7, current - 0.1))} aria-label="Zoom out"
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom"
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20">
              <RotateCw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setZoom((current) => Math.min(1.35, current + 0.1))} aria-label="Zoom in"
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setAutoRotate((current) => !current)} aria-label={autoRotate ? 'Pause auto rotate' : 'Start auto rotate'}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20">
              {autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20">
              {isFullscreen ? <Maximize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
