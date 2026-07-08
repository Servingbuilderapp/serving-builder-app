
'use client'

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { ReactNode } from "react"

export function PayPalProvider({ children }: { children: ReactNode }) {
  // Nota: En producción, este ID vendrá de tu .env.local
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", // "test" habilita botones genéricos para desarrollo
    currency: "USD",
    intent: "capture",
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  )
}
