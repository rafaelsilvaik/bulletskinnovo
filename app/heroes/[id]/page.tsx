import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"

export default async function HeroDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const heroId = Number.parseInt(params.id)

  // Fetch hero details
  const { data: hero } = await supabase.from("heroes").select("*").eq("id", heroId).single()

  if (!hero) {
    redirect("/heroes")
  }

  // Fetch hero skins
  const { data: skins } = await supabase.from("skins").select("*").eq("hero_id", heroId).order("name")

  // Fetch user's collected skins
  const { data: userSkins } = await supabase.from("user_skins").select("skin_id").eq("user_id", session.user.id)

  // Create a set of collected skin IDs for easy lookup
  const collectedSkinIds = new Set(userSkins?.map((us) => us.skin_id) || [])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="mb-8">
          <Link href="/heroes" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
            ← Voltar para Heróis
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{hero.name}</h1>
            <Badge variant="outline">
              {collectedSkinIds.size} / {skins?.length || 0} skins coletadas
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{hero.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skins?.map((skin) => {
            const isCollected = collectedSkinIds.has(skin.id)

            return (
              <Card key={skin.id} className={`overflow-hidden ${isCollected ? "border-primary" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{skin.name}</CardTitle>
                    <Badge>{skin.rarity || "Comum"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
                    {skin.image_url ? (
                      <img
                        src={skin.image_url || "/placeholder.svg"}
                        alt={skin.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">Imagem não disponível</div>
                    )}
                  </div>
                  <SkinCollectionToggle skinId={skin.id} isCollected={isCollected} userId={session.user.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
;("use client")

function SkinCollectionToggle({
  skinId,
  isCollected,
  userId,
}: {
  skinId: number
  isCollected: boolean
  userId: string
}) {
  const [checked, setChecked] = useState(isCollected)
  const { supabase } = useSupabase()

  const toggleCollection = async (value: boolean) => {
    try {
      if (value) {
        // Add skin to collection
        const { error } = await supabase.from("user_skins").insert({ user_id: userId, skin_id: skinId })

        if (error) throw error
        toast({ title: "Skin adicionada à sua coleção" })
      } else {
        // Remove skin from collection
        const { error } = await supabase.from("user_skins").delete().eq("user_id", userId).eq("skin_id", skinId)

        if (error) throw error
        toast({ title: "Skin removida da sua coleção" })
      }

      setChecked(value)
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar coleção",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={`skin-${skinId}`} checked={checked} onCheckedChange={toggleCollection} />
      <label
        htmlFor={`skin-${skinId}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {checked ? "Coletada" : "Adicionar à coleção"}
      </label>
    </div>
  )
}

