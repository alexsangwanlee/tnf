'use client'

import dynamic from 'next/dynamic'

const Scene        = dynamic(() => import('@/components/3d/Scene'),          { ssr: false })
const IntroHint    = dynamic(() => import('@/components/ui/IntroHint'),      { ssr: false })
const WriteForm    = dynamic(() => import('@/components/ui/WriteForm'),      { ssr: false })
const Loading      = dynamic(() => import('@/components/ui/Loading'),        { ssr: false })

export default function ClientRoot() {
  return (
    <>
      <Scene />
      <IntroHint />
      <WriteForm />
      <Loading />
    </>
  )
}
