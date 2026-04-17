import type { Metadata } from 'next'
import { Cinzel, Nanum_Pen_Script } from 'next/font/google'
import Script from 'next/script'
import { PRELOAD_IMAGE_ASSETS } from '@/lib/assetPreload'
import './globals.css'

const cinzel = Cinzel({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
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
    <html lang="ko" className={`${cinzel.variable} ${nanumPen.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        {PRELOAD_IMAGE_ASSETS.map((href) => (
          <link key={href} rel="preload" as="image" href={href} />
        ))}
      </head>
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        {children}
        <Script id="chatbase-widget" strategy="lazyOnload">{`
(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="${process.env.NEXT_PUBLIC_CHATBASE_HOST}embed.min.js";script.id="${process.env.NEXT_PUBLIC_CHATBOT_ID}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
        `}</Script>
      </body>
    </html>
  )
}
