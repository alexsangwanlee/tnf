'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'

interface PadlockModelProps {
  position: [number, number, number]
}

// 4 sparkle positions around the lock
const SPARKLE_OFFSETS: [number, number, number][] = [
  [-0.16,  0.14, 0.06],
  [ 0.16,  0.14, 0.06],
  [-0.13, -0.10, 0.06],
  [ 0.13, -0.10, 0.06],
]

export default function PadlockModel({ position }: PadlockModelProps) {
  const gameState = useGameStore((s) => s.gameState)
  const unlock = useGameStore((s) => s.unlock)
  const [hovered, setHovered] = useState(false)

  const shackleRef = useRef<THREE.Group>(null!)
  const shackleAngle = useRef(0)
  const targetShackleAngle = useRef(0)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const outerRingRef = useRef<THREE.Mesh>(null!)
  const innerRingRef = useRef<THREE.Mesh>(null!)
  const sparkleRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null])
  const clock = useRef(0)

  const isUnlocked = gameState === 'UNLOCKING' || gameState === 'OPENED'
  const isInteractive = gameState === 'INTRO'

  // Shackle opens when unlocking
  if (isUnlocked && targetShackleAngle.current === 0) {
    targetShackleAngle.current = Math.PI * 0.6
  }
  if (!isUnlocked) {
    targetShackleAngle.current = 0
  }

  useFrame((_, delta) => {
    clock.current += delta

    // Shackle rotation animation
    if (shackleRef.current) {
      shackleAngle.current = MathUtils.lerp(
        shackleAngle.current,
        targetShackleAngle.current,
        delta * 3
      )
      shackleRef.current.rotation.z = shackleAngle.current
    }

    if (!isInteractive) return

    // Idle bounce: gentle Y oscillation
    if (groupRef.current) {
      const bounce = Math.sin(clock.current * 2.4) * 0.006
      groupRef.current.position.y = bounce
    }

    // Body scale: pulse idle + hover boost
    if (bodyRef.current) {
      const idlePulse = 1.0 + Math.sin(clock.current * 2.4) * 0.025
      const target = hovered ? 1.08 : idlePulse
      bodyRef.current.scale.setScalar(
        MathUtils.lerp(bodyRef.current.scale.x, target, delta * 8)
      )
    }

    // Outer glow ring: slow pulse
    if (outerRingRef.current) {
      const mat = outerRingRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.7 + Math.sin(clock.current * 1.8) * 0.2
      const scale = 1.0 + Math.sin(clock.current * 1.8) * 0.1
      outerRingRef.current.scale.setScalar(scale)
    }

    // Inner glow ring: faster pulse, inverse phase
    if (innerRingRef.current) {
      const mat = innerRingRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = hovered
        ? 1.0
        : 0.75 + Math.sin(clock.current * 3.5 + Math.PI) * 0.2
    }

    // Sparkles: each rotates and pulses with offset phase
    sparkleRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const phase = (i / 4) * Math.PI * 2
      const t = clock.current * 2.5 + phase
      mesh.rotation.z = t
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.5 + Math.sin(t) * 0.45
      const s = 0.8 + Math.sin(t) * 0.2
      mesh.scale.setScalar(s)
    })
  })

  const bodyColor = isUnlocked ? '#c8a96e' : hovered ? '#d4b896' : '#8a7a68'
  const metalness = 0.7
  const roughness = 0.3

  return (
    <group position={position}>
      {/* Inner group for bounce animation */}
      <group ref={groupRef}>
        {/* Outer chrome ring */}
        {isInteractive && (
          <mesh ref={outerRingRef} position={[0, 0.02, -0.02]}>
            <ringGeometry args={[0.26, 0.30, 64]} />
            <meshStandardMaterial
              color="#d0d8e0"
              emissive="#c0ccd8"
              emissiveIntensity={2.0}
              metalness={0.95}
              roughness={0.05}
              transparent
              opacity={1.0}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Inner chrome ring */}
        {isInteractive && (
          <mesh ref={innerRingRef} position={[0, 0.02, -0.005]}>
            <ringGeometry args={[0.17, 0.20, 64]} />
            <meshStandardMaterial
              color="#e8eef4"
              emissive="#d0dce8"
              emissiveIntensity={2.5}
              metalness={0.95}
              roughness={0.05}
              transparent
              opacity={1.0}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Sparkles around lock */}
        {isInteractive && SPARKLE_OFFSETS.map((offset, i) => (
          <mesh
            key={i}
            ref={(el) => { sparkleRefs.current[i] = el }}
            position={offset}
          >
            <planeGeometry args={[0.03, 0.03]} />
            <meshStandardMaterial
              color="#e0e8f0"
              emissive="#c8d8e8"
              emissiveIntensity={3.0}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Lock body */}
        <mesh
          ref={bodyRef}
          onPointerEnter={(e) => {
            if (!isInteractive) return
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerLeave={() => {
            setHovered(false)
            document.body.style.cursor = 'default'
          }}
          onClick={(e) => {
            if (!isInteractive) return
            e.stopPropagation()
            unlock()
          }}
          castShadow
        >
          <boxGeometry args={[0.18, 0.15, 0.1]} />
          <meshStandardMaterial
            color={bodyColor}
            metalness={metalness}
            roughness={roughness}
            emissive={hovered ? '#7a5a20' : '#3a2a00'}
            emissiveIntensity={hovered ? 0.5 : 0.15}
          />
        </mesh>

        {/* Shackle (U-shaped arch) — pivot at center of body top */}
        <group ref={shackleRef} position={[0, 0.075, 0]}>
          {/* Left arm */}
          <mesh position={[-0.05, 0.065, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.13, 12]} />
            <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Right arm */}
          <mesh position={[0.05, 0.065, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.13, 12]} />
            <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Top arch */}
          <mesh position={[0, 0.13, 0]} castShadow>
            <torusGeometry args={[0.05, 0.018, 12, 24, Math.PI]} />
            <meshStandardMaterial color={bodyColor} metalness={metalness} roughness={roughness} />
          </mesh>
        </group>

        {/* Keyhole dot */}
        <mesh position={[0, -0.01, 0.051]}>
          <cylinderGeometry args={[0.012, 0.012, 0.005, 16]} />
          <meshStandardMaterial color="#2a2015" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}
