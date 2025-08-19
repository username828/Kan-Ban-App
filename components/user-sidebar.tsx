"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "offline"
  currentActivity?: string
  lastSeen?: string
}

interface UserSidebarProps {
  users: User[]
  isOpen: boolean
  onClose: () => void
}

export function UserSidebar({ users, isOpen, onClose }: UserSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return ""
    const now = new Date()
    const time = new Date(lastSeen)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    return `${Math.floor(diffInMinutes / 60)}h ago`
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-sidebar border-l border-sidebar-border transform transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sidebar-foreground">Team Members</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-sidebar-accent/10 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-sidebar",
                      getStatusColor(user.status),
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs capitalize mb-1",
                      user.status === "online" && "bg-green-100 text-green-800",
                      user.status === "away" && "bg-yellow-100 text-yellow-800",
                      user.status === "offline" && "bg-gray-100 text-gray-800",
                    )}
                  >
                    {user.status}
                  </Badge>

                  {user.status === "online" && user.currentActivity && (
                    <p className="text-xs text-muted-foreground truncate">{user.currentActivity}</p>
                  )}

                  {user.status === "away" && user.lastSeen && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastSeen(user.lastSeen)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
