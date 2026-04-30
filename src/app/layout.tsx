import type { Metadata } from "next"
import { Outfit, Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/context/LanguageContext"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { PayPalProvider } from "@/components/providers/PayPalProvider"
import { WhatsAppButton } from "@/components/ui/WhatsAppButton"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isEcoServing = host.toLowerCase().includes('ecoserving') || host.toLowerCase().includes('localhost')

  return {
    title: isEcoServing ? "ECOSERVING" : "SERVING BUILDER APP",
    description: isEcoServing 
      ? "Advanced AI solutions for building and serving environmental applications."
      : "Plataforma de más de 200 aplicaciones de Inteligencia Artificial para emprendedores.",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <ToastProvider>
            <PayPalProvider>
              {children}
              <WhatsAppButton />
            </PayPalProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
