"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, ArrowRight } from "lucide-react"
import { useKanbanStore } from "@/lib/store"

export function ActivityFeed() {
  const { activities } = useKanbanStore()

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800"
      case "updated":
        return "bg-blue-100 text-blue-800"
      case "moved":
        return "bg-purple-100 text-purple-800"
      case "deleted":
        return "bg-red-100 text-red-800"
      case "commented":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const renderActivityContent = (activity: any) => {
    switch (activity.action) {
      case "moved":
        return (
          <div className="flex items-center gap-2 text-sm">
            <span>moved</span>
            <Badge variant="outline" className="text-xs">
              {activity.taskTitle}
            </Badge>
            <span>from</span>
            <Badge variant="secondary" className="text-xs">
              {activity.fromColumn}
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant="secondary" className="text-xs">
              {activity.toColumn}
            </Badge>
          </div>
        )
      case "created":
        return (
          <div className="flex items-center gap-2 text-sm">
            <span>created</span>
            <Badge variant="outline" className="text-xs">
              {activity.taskTitle}
            </Badge>
          </div>
        )
      case "updated":
        return (
          <div className="flex items-center gap-2 text-sm">
            <span>updated</span>
            <Badge variant="outline" className="text-xs">
              {activity.taskTitle}
            </Badge>
          </div>
        )
      case "deleted":
        return (
          <div className="flex items-center gap-2 text-sm">
            <span>deleted</span>
            <Badge variant="outline" className="text-xs">
              {activity.taskTitle}
            </Badge>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 text-sm">
            <span>{activity.action}</span>
            <Badge variant="outline" className="text-xs">
              {activity.taskTitle}
            </Badge>
          </div>
        )
    }
  }

  return (
    <Card className="w-80 h-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-4">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
                    <AvatarFallback className="text-xs">
                      {activity.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{activity.userName}</span>
                      <Badge className={`text-xs ${getActionColor(activity.action)}`}>{activity.action}</Badge>
                    </div>

                    {renderActivityContent(activity)}

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
