"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type UserProfile = {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
}

type UserStats = {
  totalSkins: number
  collectedSkins: number
  achievements: {
    id: number
    name: string
    description: string | null
    icon_url: string | null
    unlocked_at: string
  }[]
}

export default function ProfilePage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      // Get user profile
      const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

      if (userProfile) {
        setProfile(userProfile)
        setUsername(userProfile.username || "")
        setBio(userProfile.bio || "")
      }

      // Get user stats
      const { data: totalSkinsCount } = await supabase.from("skins").select("*", { count: "exact" })

      const { data: userSkinsCount } = await supabase
        .from("user_skins")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)

      // Get user achievements
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select(`
          achievement_id,
          unlocked_at,
          achievements(id, name, description, icon_url)
        `)
        .eq("user_id", session.user.id)

      setStats({
        totalSkins: totalSkinsCount?.length || 0,
        collectedSkins: userSkinsCount?.length || 0,
        achievements:
          achievements?.map((a) => ({
            id: a.achievements?.id || 0,
            name: a.achievements?.name || "",
            description: a.achievements?.description || null,
            icon_url: a.achievements?.icon_url || null,
            unlocked_at: a.unlocked_at,
          })) || [],
      })

      setLoading(false)
    }

    fetchProfile()
  }, [supabase, router])

  const updateProfile = async () => {
    if (!profile) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          username,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setProfile({
        ...profile,
        username,
        bio,
      })

      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-10">
          <div className="flex items-center justify-center h-full">
            <p>Carregando perfil...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-bold mb-8">Seu Perfil</h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="edit">Editar Perfil</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Perfil</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{profile?.username || "Usuário"}</h2>
                  <p className="text-muted-foreground mt-2 text-center">
                    {profile?.bio || "Nenhuma biografia fornecida"}
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Coleção de Skins</CardTitle>
                  <CardDescription>Seu progresso na coleta de skins do Bullet Echo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Progresso Total</span>
                        <span className="font-medium">
                          {stats?.collectedSkins || 0} / {stats?.totalSkins || 0}
                        </span>
                      </div>
                      <Progress
                        value={((stats?.collectedSkins || 0) / (stats?.totalSkins || 1)) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <span className="text-3xl font-bold block">{stats?.collectedSkins || 0}</span>
                        <span className="text-sm text-muted-foreground">Skins Coletadas</span>
                      </div>
                      <div className="bg-muted rounded-lg p-4 text-center">
                        <span className="text-3xl font-bold block">
                          {Math.round(((stats?.collectedSkins || 0) / (stats?.totalSkins || 1)) * 100)}%
                        </span>
                        <span className="text-sm text-muted-foreground">Conclusão</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Conquistas Recentes</h3>
                      {stats?.achievements && stats.achievements.length > 0 ? (
                        <div className="space-y-2">
                          {stats.achievements.slice(0, 3).map((achievement) => (
                            <div key={achievement.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                                {achievement.icon_url ? (
                                  <img src={achievement.icon_url || "/placeholder.svg"} alt="" className="h-6 w-6" />
                                ) : (
                                  <Badge className="h-6 w-6 flex items-center justify-center">
                                    {achievement.name[0]}
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{achievement.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhuma conquista ainda</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Editar Perfil</CardTitle>
                <CardDescription>Atualize suas informações de perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
                  </div>
                  <Button onClick={updateProfile} disabled={updating}>
                    {updating ? "Atualizando..." : "Atualizar Perfil"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Conquistas</CardTitle>
                <CardDescription>Suas conquistas desbloqueadas</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.achievements && stats.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.achievements.map((achievement) => (
                      <Card key={achievement.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                              {achievement.icon_url ? (
                                <img src={achievement.icon_url || "/placeholder.svg"} alt="" className="h-6 w-6" />
                              ) : (
                                <Badge className="h-6 w-6 flex items-center justify-center">
                                  {achievement.name[0]}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description || "Nenhuma descrição disponível"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Desbloqueada em {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma conquista desbloqueada ainda</p>
                    <p className="text-sm mt-2">Colete skins e interaja com o aplicativo para desbloquear conquistas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

