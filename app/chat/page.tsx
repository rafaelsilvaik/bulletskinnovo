"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ChatRoom = {
  id: number
  name: string
  type: string
  hero_id: number | null
}

type ChatMessage = {
  id: number
  room_id: number
  user_id: string
  content: string
  image_url: string | null
  created_at: string
  profiles?: {
    username: string | null
    avatar_url: string | null
  } | null
}

type UserProfile = {
  id: string
  username: string | null
  avatar_url: string | null
}

export default function ChatPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth")
        return
      }

      // Get user profile
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

      if (profile) {
        setUser(profile)
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error } = await supabase
          .from("user_profiles")
          .insert({
            id: session.user.id,
            username: session.user.email?.split("@")[0] || `user_${Math.floor(Math.random() * 10000)}`,
          })
          .select()
          .single()

        if (!error && newProfile) {
          setUser(newProfile)
        }
      }

      // Get chat rooms
      const { data: chatRooms } = await supabase.from("chat_rooms").select("*").order("type").order("name")

      if (chatRooms && chatRooms.length > 0) {
        setRooms(chatRooms)
        setActiveRoom(chatRooms[0].id)
      } else {
        // Create default chat room if none exist
        const { data: newRoom } = await supabase
          .from("chat_rooms")
          .insert({
            name: "Geral",
            type: "geral",
          })
          .select()
          .single()

        if (newRoom) {
          setRooms([newRoom])
          setActiveRoom(newRoom.id)
        }
      }

      setLoading(false)
    }

    checkSession()
  }, [supabase, router])

  useEffect(() => {
    if (!activeRoom) return

    // Fetch messages for active room
    const fetchMessages = async () => {
      try {
        // Primeiro, busque apenas as mensagens
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", activeRoom)
          .order("created_at", { ascending: true })
          .limit(50)

        if (error) {
          throw error
        }

        // Depois, para cada mensagem, busque o perfil do usuário
        const messagesWithProfiles = await Promise.all(
          (data || []).map(async (message) => {
            const { data: profileData } = await supabase
              .from("user_profiles")
              .select("username, avatar_url")
              .eq("id", message.user_id)
              .single()

            return {
              ...message,
              profiles: profileData,
            }
          }),
        )

        setMessages(messagesWithProfiles)
      } catch (error: any) {
        toast({
          title: "Erro ao buscar mensagens",
          description: error.message,
          variant: "destructive",
        })
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${activeRoom}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${activeRoom}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage

          // Fetch user profile for the new message
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("username, avatar_url")
            .eq("id", newMessage.user_id)
            .single()

          setMessages((prev) => [...prev, { ...newMessage, profiles: profileData }])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeRoom, supabase, toast])

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return

    try {
      const { error } = await supabase.from("chat_messages").insert({
        room_id: activeRoom,
        user_id: user.id,
        content: newMessage,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 container py-10">
          <div className="flex items-center justify-center h-full">
            <p>Carregando chat...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Salas de Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={activeRoom === room.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveRoom(room.id)}
                  >
                    {room.name}
                    <Badge variant="outline" className="ml-auto">
                      {room.type}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>{rooms.find((r) => r.id === activeRoom)?.name || "Chat"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.user_id === user?.id ? "justify-end" : ""}`}
                  >
                    {message.user_id !== user?.id && (
                      <Avatar>
                        <AvatarImage src={message.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{message.profiles?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        message.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.user_id !== user?.id && (
                        <p className="text-xs font-medium mb-1">
                          {message.profiles?.username || "Usuário Desconhecido"}
                        </p>
                      )}
                      <p>{message.content}</p>
                      {message.image_url && (
                        <img
                          src={message.image_url || "/placeholder.svg"}
                          alt="Imagem compartilhada"
                          className="mt-2 rounded-md max-h-60 object-contain"
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">{new Date(message.created_at).toLocaleTimeString()}</p>
                    </div>
                    {message.user_id === user?.id && (
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button size="icon" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

