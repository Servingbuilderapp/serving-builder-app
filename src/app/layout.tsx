import type { Metadata } from "next"
import Script from "next/script"
import localFont from "next/font/local"
import "./globals.css"
import { LanguageProvider } from "@/context/LanguageContext"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { PayPalProvider } from "@/components/providers/PayPalProvider"
import { WhatsAppButton } from "@/components/ui/WhatsAppButton"

// Las fuentes viven DENTRO del proyecto (src/app/fonts). Antes se descargaban de Google en cada
// compilación y, a veces, esa descarga fallaba en Vercel y el despliegue quedaba en Error.
// Son las mismas tres fuentes, en su versión variable (cubre todos los pesos que ya se usaban).
const outfit = localFont({
  variable: "--font-outfit",
  src: "./fonts/outfit.woff2",
  weight: "100 900",
  display: "swap",
})

const inter = localFont({
  variable: "--font-inter",
  src: "./fonts/inter.woff2",
  weight: "100 900",
  display: "swap",
})

// Dirección 5 (9 sep 2026): serif de títulos, vino/dorado sobre fondo oscuro.
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "./fonts/cormorant-garamond.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic.woff2", weight: "300 700", style: "italic" },
  ],
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Arquitectura Digital | Estructuración de Proyectos & Fondos",
    description: "Plataforma inteligente de diagnóstico, formalización y estructuración de proyectos para Fondo Emprender, APC Colombia y convocatorias de financiamiento.",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Librería del botón de pagos de Bold — una sola vez para todo el
            sitio, como pide su documentación. Los datos de cada compra
            (monto, firma, etc.) se agregan aparte, solo en la pantalla de
            pago (ver BotonPagoBold.tsx), no aquí. */}
        <Script src="https://checkout.bold.co/library/boldPaymentButton.js" strategy="afterInteractive" />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} ${cormorant.variable} font-sans antialiased`}
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
