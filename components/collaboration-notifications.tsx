"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useKanbanStore } from "@/lib/store"

export function CollaborationNotifications() {
  const { notifications, clearNotifications } = useKanbanStore()

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]

      // Show toast notification
      toast(latestNotification.message, {
        description: `${new Date(latestNotification.timestamp).toLocaleTimeString()}`,
        duration: 4000,
      })

      // Clear notifications after showing
      setTimeout(() => {
        clearNotifications()
      }, 1000)
    }
  }, [notifications, clearNotifications])

  return null // This component only handles side effects
}
