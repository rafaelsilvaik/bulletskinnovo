"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, MessageSquare, User } from "lucide-react"

const navItems = [
  {
    name: "Início",
    href: "/",
    icon: Home,
  },
  {
    name: "Heróis",
    href: "/heroes",
    icon: Users,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Perfil",
    href: "/profile",
    icon: User,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <Button key={item.href} variant={pathname === item.href ? "default" : "ghost"} asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors",
                pathname === item.href ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          </Button>
        )
      })}
    </nav>
  )
}

