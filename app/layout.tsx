import type { Metadata } from 'next'
import { Geist, Geist_Mono, Figtree } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'
import { cn } from '@/lib/utils'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Tracksy',
    template: '%s · Tracksy',
  },
  description:
    'A focused job application tracker with deadline reminders, status pipelines, and response analytics.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          'h-full antialiased',
          geistSans.variable,
          geistMono.variable,
          figtree.variable,
        )}
      >
        <body className="min-h-full flex flex-col font-sans">
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
