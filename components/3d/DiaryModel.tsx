'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { MathUtils, MeshStandardMaterial, SRGBColorSpace, TextureLoader } from 'three'
import * as THREE from 'three'
import { DIARY_TEXTURES } from '@/lib/assetPreload'
import { useGameStore } from '@/store/useGameStore'
import PadlockModel from './PadlockModel'

const W = 2.2
const H = 3.0
const D = 0.28
const COVER_D = 0.04

const chromeSilver = new MeshStandardMaterial({ color: '#c4cad4', metalness: 0.92, roughness: 0.18 })
const chromeDark = new MeshStandardMaterial({ color: '#8a9098', metalness: 0.92, roughness: 0.22 })
const chromeMid = new MeshStandardMaterial({ color: '#adb4be', metalness: 0.92, roughness: 0.2 })
const pageCream = new MeshStandardMaterial({ color: '#f4efe3', roughness: 1, metalness: 0 })
const pageEdge = new MeshStandardMaterial({ color: '#e8e1d4', roughness: 1, metalness: 0 })
const pageMats = [pageCream, pageEdge, pageCream, pageCream, pageCream, pageCream]

useLoader.preload(TextureLoader, DIARY_TEXTURES)

export default function DiaryModel() {
  const gameState = useGameStore((s) => s.gameState)
  const setLoaded = useGameStore((s) => s.setLoaded)
  const finishUnlocking = useGameStore((s) => s.finishUnlocking)

  const { camera, size } = useThree()
  const groupRef = useRef<THREE.Group>(null!)
  const coverRef = useRef<THREE.Group>(null!)
  const floatTime = useRef(0)
  const coverAngle = useRef(0)
  const unlockTime = useRef(0)
  const isOpening = useRef(false)
  const isMobileViewport = size.width < 768
  const introCameraY = isMobileViewport ? 0.12 : 0
  const introCameraZ = isMobileViewport ? 7.2 : 6
  const introFov = isMobileViewport ? 48 : 42

  const [colorTex, normalTex, specularTex, aoTex, dispTex] = useLoader(TextureLoader, DIARY_TEXTURES)

  const coverMats = useMemo(() => {
    colorTex.colorSpace = SRGBColorSpace
    colorTex.anisotropy = 16
    colorTex.generateMipmaps = true
    colorTex.minFilter = THREE.LinearMipmapLinearFilter
    colorTex.magFilter = THREE.LinearFilter

    normalTex.anisotropy = 16
    normalTex.generateMipmaps = true
    normalTex.minFilter = THREE.LinearMipmapLinearFilter
    normalTex.magFilter = THREE.LinearFilter

    specularTex.anisotropy = 16
    specularTex.generateMipmaps = true
    specularTex.minFilter = THREE.LinearMipmapLinearFilter
    specularTex.magFilter = THREE.LinearFilter

    aoTex.anisotropy = 16
    aoTex.generateMipmaps = true
    aoTex.minFilter = THREE.LinearMipmapLinearFilter
    aoTex.magFilter = THREE.LinearFilter

    dispTex.anisotropy = 16
    dispTex.generateMipmaps = true
    dispTex.minFilter = THREE.LinearMipmapLinearFilter
    dispTex.magFilter = THREE.LinearFilter

    const frontMat = new MeshStandardMaterial({
      map: colorTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(0.08, 0.08),
      roughnessMap: specularTex,
      roughness: 0.6,
      metalness: 0.1,
      aoMap: aoTex,
      aoMapIntensity: 1,
      envMapIntensity: 0.8,
    })

    const backFaceMat = new MeshStandardMaterial({
      color: '#b8bdc5',
      metalness: 0.1,
      roughness: 0.7,
    })

    return [chromeMid, chromeDark, chromeSilver, chromeSilver, frontMat, backFaceMat]
  }, [aoTex, colorTex, dispTex, normalTex, specularTex])

  useEffect(() => {
    setLoaded()
  }, [setLoaded])

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
    }

    if (gameState === 'INTRO' || gameState === 'KEYPAD') {
      isOpening.current = false
      unlockTime.current = 0
    }
  }, [gameState])

  useFrame((_, delta) => {
    if (!groupRef.current || !coverRef.current) return

    if (gameState === 'INTRO' || gameState === 'KEYPAD') {
      floatTime.current += delta * 0.55
      groupRef.current.position.y = Math.sin(floatTime.current) * 0.08
      groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, 0, delta * 3)
      groupRef.current.rotation.y = Math.sin(floatTime.current * 0.35) * 0.05

      coverAngle.current = MathUtils.lerp(coverAngle.current, 0, delta * 3)
      coverRef.current.rotation.y = coverAngle.current

      camera.position.x = MathUtils.lerp(camera.position.x, 0, delta * 3)
      camera.position.y = MathUtils.lerp(camera.position.y, introCameraY, delta * 3)
      camera.position.z = MathUtils.lerp(camera.position.z, introCameraZ, delta * 2)
    }

    if (gameState === 'UNLOCKING') {
      const duration = 0.7
      if (isOpening.current) {
        unlockTime.current = Math.min(unlockTime.current + delta / duration, 1)
      }

      const t = unlockTime.current
      const eased = 1 - Math.pow(1 - t, 3)
      const target = -Math.PI + 0.08

      coverAngle.current = target * eased
      coverRef.current.rotation.y = coverAngle.current
      groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, -0.25, delta * 3)
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, delta * 4)

      if (t >= 1 && isOpening.current) {
        isOpening.current = false
        finishUnlocking()
      }
    }

    if (gameState === 'OPENED') {
      coverRef.current.rotation.y = MathUtils.lerp(coverRef.current.rotation.y, -Math.PI + 0.08, delta * 3)
      groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, -0.25, delta * 2)
      groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, delta * 3)
    }

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
      <mesh position={[0, 0, -(D / 2 - COVER_D / 2)]} castShadow receiveShadow>
        <boxGeometry args={[W, H, COVER_D]} />
        <primitive object={chromeDark} attach="material" />
      </mesh>

      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[pagesW, pagesH, pagesD]} />
        {pageMats.map((material, index) => (
          <primitive key={index} object={material} attach={`material-${index}`} />
        ))}
      </mesh>

      <group ref={coverRef} position={[-W / 2, 0, D / 2 - COVER_D / 2]}>
        <mesh position={[W / 2, 0, 0]} castShadow>
          <boxGeometry args={[W, H, COVER_D]} />
          {coverMats.map((material, index) => (
            <primitive key={index} object={material} attach={`material-${index}`} />
          ))}
        </mesh>
      </group>

      <PadlockModel position={[W / 2 + 0.05, 0, 0.04]} />

      <mesh position={[-W / 2 + 0.018, 0, 0]} castShadow>
        <boxGeometry args={[0.036, H + 0.01, D + 0.01]} />
        <meshStandardMaterial color="#d0d6e0" metalness={0.99} roughness={0.02} />
      </mesh>
    </group>
  )
}
