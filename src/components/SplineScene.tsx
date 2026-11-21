'use client'

import dynamic from 'next/dynamic'

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false })

interface SplineSceneProps {
  className?: string
}

export default function SplineScene({ className }: SplineSceneProps) {
  const scene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL

  if (!scene) return null

  return (
    <div className={className} aria-hidden="true">
      <Spline scene={scene} />
    </div>
  )
}
