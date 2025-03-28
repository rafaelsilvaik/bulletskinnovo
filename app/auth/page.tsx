import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { UserAuthForm } from "@/components/user-auth-form"

export default async function AuthPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo ao Skins do Bullet Echo</h1>
          <p className="text-sm text-muted-foreground">
            Entre para acompanhar sua coleção de skins e conversar com outros jogadores
          </p>
        </div>
        <UserAuthForm />
      </div>
    </div>
  )
}

