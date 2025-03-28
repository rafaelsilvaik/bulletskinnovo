import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, MessageSquare, Users } from "lucide-react"

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user stats
  const { data: userSkinsCount } = await supabase
    .from("user_skins")
    .select("*", { count: "exact" })
    .eq("user_id", session.user.id)

  const { data: totalSkins } = await supabase.from("skins").select("*", { count: "exact" })

  const { data: chatRooms } = await supabase
    .from("chat_rooms")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Bem-vindo ao Rastreador de Skins do Bullet Echo
            </h1>
            <p className="text-lg text-muted-foreground">
              Acompanhe sua coleção de skins, converse com outros jogadores e desbloqueie conquistas.
            </p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coleção de Skins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userSkinsCount?.count || 0} / {totalSkins?.count || 150}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(((userSkinsCount?.count || 0) / (totalSkins?.count || 150)) * 100)}% do total de skins
                coletadas
              </p>
              <Button asChild className="w-full mt-4">
                <Link href="/heroes">Ver Coleção</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas de Chat</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chatRooms?.map((room) => (
                  <div key={room.id} className="flex items-center justify-between">
                    <span>{room.name}</span>
                    <span className="text-xs text-muted-foreground">{room.type}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/chat">Entrar no Chat</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heróis</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30</div>
              <p className="text-xs text-muted-foreground">Cada herói tem 5 skins únicas para coletar</p>
              <Button asChild className="w-full mt-4">
                <Link href="/heroes">Explorar Heróis</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

