import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-color-base-100 p-4">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-color-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-color-accent-pink/20 blur-[100px]" />
      <div className="absolute top-[20%] right-[10%] h-[20rem] w-[20rem] rounded-full bg-color-accent-blue/20 blur-[100px]" />

      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
