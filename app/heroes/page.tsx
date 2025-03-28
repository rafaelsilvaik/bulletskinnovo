import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HeroesPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Fetch heroes with skin counts
  const { data: heroes } = await supabase
    .from("heroes")
    .select(`
      *,
      skins:skins(count)
    `)
    .order("name")

  // Fetch user's collected skins for each hero
  const { data: userSkins } = await supabase
    .from("user_skins")
    .select(`
      skin_id,
      skins:skins(
        hero_id
      )
    `)
    .eq("user_id", session.user.id)

  // Create a map of hero_id to collected skin count
  const heroCollectionMap = new Map()
  userSkins?.forEach((userSkin) => {
    const heroId = userSkin.skins?.hero_id
    if (heroId) {
      heroCollectionMap.set(heroId, (heroCollectionMap.get(heroId) || 0) + 1)
    }
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Heróis</h1>
          <p className="text-muted-foreground">Total de Heróis: {heroes?.length || 0}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {heroes?.map((hero) => {
            const totalSkins = hero.skins?.[0]?.count || 5
            const collectedSkins = heroCollectionMap.get(hero.id) || 0
            const progressPercentage = (collectedSkins / totalSkins) * 100

            return (
              <Card key={hero.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{hero.name}</CardTitle>
                  <CardDescription>{hero.description || "Um herói do Bullet Echo"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-40 bg-muted rounded-md mb-4 flex items-center justify-center">
                    {hero.icon_url ? (
                      <img
                        src={hero.icon_url || "/placeholder.svg"}
                        alt={hero.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">Imagem não disponível</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Coleção de Skins</span>
                    <Badge variant="outline">
                      {collectedSkins}/{totalSkins}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/heroes/${hero.id}`}>Ver Skins</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

