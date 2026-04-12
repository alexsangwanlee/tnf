import type { Metadata } from 'next'
import { Cinzel, Gowun_Dodum, Nanum_Pen_Script } from 'next/font/google'
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
  title: 'TNF Kids x Beomjeop Secret Diary',
  description: '잠금 코드를 풀고 입장하는 비밀 다이어리 RSVP 페이지',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${cinzel.variable} ${gowunDodum.variable} ${nanumPen.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
