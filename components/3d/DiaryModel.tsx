'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import { MathUtils, MeshStandardMaterial, TextureLoader, SRGBColorSpace } from 'three'
import * as THREE from 'three'
import { useGameStore } from '@/store/useGameStore'
import PadlockModel from './PadlockModel'

// Book dimensions
const W = 2.2
const H = 3.0
const D = 0.28
const COVER_D = 0.04

// Chrome materials — defined once outside component (stable references)
const chromeSilver = new MeshStandardMaterial({ color: '#c4cad4', metalness: 0.92, roughness: 0.18 })
const chromeDark   = new MeshStandardMaterial({ color: '#8a9098', metalness: 0.92, roughness: 0.22 })
const chromeMid    = new MeshStandardMaterial({ color: '#adb4be', metalness: 0.92, roughness: 0.20 })
const pageCream    = new MeshStandardMaterial({ color: '#f4efe3', roughness: 1, metalness: 0 })
const pageEdge     = new MeshStandardMaterial({ color: '#e8e1d4', roughness: 1, metalness: 0 })
const pageMats     = [pageCream, pageEdge, pageCream, pageCream, pageCream, pageCream]

export default function DiaryModel() {
  const gameState  = useGameStore((s) => s.gameState)
  const setLoaded  = useGameStore((s) => s.setLoaded)
  const finishUnlocking = useGameStore((s) => s.finishUnlocking)

  const { camera, size } = useThree()
  const groupRef    = useRef<THREE.Group>(null!)
  const coverRef    = useRef<THREE.Group>(null!)
  const floatTime   = useRef(0)
  const coverAngle  = useRef(0)
  const unlockTime  = useRef(0)   // 0→1 progress for open animation
  const isOpening   = useRef(false)
  const isMobileViewport = size.width < 768
  const introCameraY = isMobileViewport ? 0.12 : 0
  const introCameraZ = isMobileViewport ? 7.2 : 6
  const introFov = isMobileViewport ? 48 : 42

  // Load full PBR texture set
  const [colorTex, normalTex, specularTex, aoTex, dispTex] = useLoader(TextureLoader, [
    '/textures/diary.png',
    '/textures/diary_normal.png',
    '/textures/diary_specular.png',
    '/textures/diary_ambient.png',
    '/textures/diary_displacement.png',
  ])

  // Create cover materials with full PBR front face
  const coverMats = useMemo(() => {
    // Color map — sRGB
    colorTex.colorSpace      = SRGBColorSpace
    colorTex.anisotropy      = 16
    colorTex.generateMipmaps = true
    colorTex.minFilter       = THREE.LinearMipmapLinearFilter

    // Normal map — linear (tangent-space)
    normalTex.anisotropy      = 16
    normalTex.generateMipmaps = true
    normalTex.minFilter       = THREE.LinearMipmapLinearFilter

    // Specular / AO / Displacement — linear
    specularTex.anisotropy   = 16
    aoTex.anisotropy         = 16
    dispTex.anisotropy       = 16

    // Front face — full PBR
    const frontMat = new MeshStandardMaterial({
      map:             colorTex,
      normalMap:       normalTex,
      normalScale:     new THREE.Vector2(0.15, 0.15),
      roughnessMap:    specularTex,
      roughness:       0.6,
      metalness:       0.1,
      aoMap:           aoTex,
      aoMapIntensity:  1.0,
      envMapIntensity: 0.8,
    })

    // Back face of front cover (inside, faces pages when open)
    const backFaceMat = new MeshStandardMaterial({
      color:    '#b8bdc5',
      metalness: 0.1,
      roughness: 0.7,
    })

    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
    return [chromeMid, chromeDark, chromeSilver, chromeSilver, frontMat, backFaceMat]
  }, [colorTex, normalTex, specularTex, aoTex, dispTex])

  useEffect(() => { setLoaded() }, [setLoaded])

  useEffect(() => {
    camera.position.set(0, introCameraY, introCameraZ)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = introFov
      camera.updateProjectionMatrix()
    }
  }, [camera, introCameraY, introCameraZ, introFov])

  useEffect(() => {
    if (gameState === 'UNLOCKING') {
      unlockTime.current = 0
      isOpening.current = true
      // finishUnlocking는 애니메이션 완료 시점에 useFrame에서 호출
    }
    if (gameState === 'INTRO' || gameState === 'KEYPAD') {
      isOpening.current = false
      unlockTime.current = 0
    }
  }, [gameState])

  useFrame((_, delta) => {
    if (!groupRef.current || !coverRef.current) return

    // ── 유휴 부유 (INTRO / KEYPAD) + 상태 리셋
    if (gameState === 'INTRO' || gameState === 'KEYPAD') {
      floatTime.current += delta * 0.55
      groupRef.current.position.y = Math.sin(floatTime.current) * 0.08
      groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, 0, delta * 3)
      groupRef.current.rotation.y = Math.sin(floatTime.current * 0.35) * 0.05

      // 커버 닫기 (열려 있었다면 복귀)
      coverAngle.current = MathUtils.lerp(coverAngle.current, 0, delta * 3)
      coverRef.current.rotation.y = coverAngle.current

      // 카메라도 원위치
      camera.position.x = MathUtils.lerp(camera.position.x, 0, delta * 3)
      camera.position.y = MathUtils.lerp(camera.position.y, introCameraY, delta * 3)
      camera.position.z = MathUtils.lerp(camera.position.z, introCameraZ, delta * 2)
    }

    // ── 열리는 애니메이션 (UNLOCKING)
    if (gameState === 'UNLOCKING') {
      const DURATION = 0.7
      if (isOpening.current) {
        unlockTime.current = Math.min(unlockTime.current + delta / DURATION, 1)
      }
      const t = unlockTime.current
      // cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3)

      const TARGET = -Math.PI + 0.08
      coverAngle.current = TARGET * eased
      coverRef.current.rotation.y = coverAngle.current

      // 열리는 동안 살짝 기울여 페이지가 보이게
      groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, -0.25, delta * 3)
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, delta * 4)

      if (t >= 1 && isOpening.current) {
        isOpening.current = false
        finishUnlocking()
      }
    }

    // ── OPENED: 커버 열린 상태 유지
    if (gameState === 'OPENED') {
      coverRef.current.rotation.y = MathUtils.lerp(coverRef.current.rotation.y, -Math.PI + 0.08, delta * 3)
      groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, -0.25, delta * 2)
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, delta * 3)
    }

    // ── 카메라: 줌인 없이 고정
    if (gameState === 'UNLOCKING') {
      camera.position.x = MathUtils.lerp(camera.position.x, 0, delta * 3)
      camera.position.y = MathUtils.lerp(camera.position.y, 0, delta * 3)
      camera.lookAt(0, 0, 0)
    }
  })

  const pagesW = W - 0.06
  const pagesH = H - 0.04
  const pagesD = D - COVER_D * 2

  return (
    <group ref={groupRef}>
      {/* Back cover */}
      <mesh position={[0, 0, -(D / 2 - COVER_D / 2)]} castShadow receiveShadow>
        <boxGeometry args={[W, H, COVER_D]} />
        <primitive object={chromeDark} attach="material" />
      </mesh>

      {/* Pages stack */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[pagesW, pagesH, pagesD]} />
        {pageMats.map((m, i) => (
          <primitive key={i} object={m} attach={`material-${i}`} />
        ))}
      </mesh>

      {/* Front cover — hinge at spine (x = -W/2) */}
      <group ref={coverRef} position={[-W / 2, 0, D / 2 - COVER_D / 2]}>
        <mesh position={[W / 2, 0, 0]} castShadow>
          <boxGeometry args={[W, H, COVER_D]} />
          {coverMats.map((m, i) => (
            <primitive key={i} object={m} attach={`material-${i}`} />
          ))}
        </mesh>
      </group>

      {/* Padlock */}
      <PadlockModel position={[W / 2 + 0.05, 0, 0.04]} />

      {/* Polished chrome spine strip */}
      <mesh position={[-W / 2 + 0.018, 0, 0]} castShadow>
        <boxGeometry args={[0.036, H + 0.01, D + 0.01]} />
        <meshStandardMaterial color="#d0d6e0" metalness={0.99} roughness={0.02} />
      </mesh>
    </group>
  )
}
