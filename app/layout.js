import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeRegistry } from '@/components/ThemeRegistry'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'VoteSecure — Anonymous Online Voting',
  description: 'Run secure, anonymous elections with real-time results and QR code sharing.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
