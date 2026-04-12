'use client'

import dynamic from 'next/dynamic'
import Loading from './Loading'
import KeypadOverlay from './KeypadOverlay'
import IntroHint from './IntroHint'
import WriteForm from './WriteForm'

const Scene = dynamic(() => import('@/components/3d/Scene'), { ssr: false })

export default function ClientRoot() {
  return (
    <>
      <Scene />
      <IntroHint />
      <KeypadOverlay />
      <WriteForm />
      <Loading />
    </>
  )
}
