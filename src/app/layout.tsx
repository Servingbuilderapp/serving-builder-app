import type { Metadata } from "next"
import { Outfit, Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/context/LanguageContext"
import { ToastProvider } from "@/components/ui/ToastProvider"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SERVING BUILDER APP",
  description: "Advanced AI solutions for building and serving applications with SERVING BUILDER APP.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
