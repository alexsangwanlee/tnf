import type { Metadata } from 'next'
import { Cinzel, Gowun_Dodum, Nanum_Pen_Script } from 'next/font/google'
import { PRELOAD_IMAGE_ASSETS } from '@/lib/assetPreload'
import './globals.css'

const cinzel = Cinzel({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const gowunDodum = Gowun_Dodum({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400'],
})

const nanumPen = Nanum_Pen_Script({
  variable: '--font-handwriting',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'THE NORTH FACE DANCECLASS',
  description: 'BUMSUP과 함께하는 K-POP 댄스 클래스 | 노스페이스 키즈 특별 이벤트',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'THE NORTH FACE DANCECLASS',
    description: 'BUMSUP과 함께하는 K-POP 댄스 클래스에 초대합니다.',
    images: ['/textures/tnf.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE NORTH FACE DANCECLASS',
    description: 'BUMSUP과 함께하는 K-POP 댄스 클래스에 초대합니다.',
    images: ['/textures/tnf.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${cinzel.variable} ${gowunDodum.variable} ${nanumPen.variable} h-full`}>
      <head>
        {PRELOAD_IMAGE_ASSETS.map((href) => (
          <link key={href} rel="preload" as="image" href={href} />
        ))}
      </head>
      <body className="h-full overflow-hidden" suppressHydrationWarning>{children}</body>
    </html>
  )
}
