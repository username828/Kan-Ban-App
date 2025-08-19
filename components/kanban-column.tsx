"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useKanbanStore } from "@/lib/store"

interface Task {
  id: string
  title: string
  description: string
  tags: string[]
  assignee: {
    id: string
    name: string
    avatar: string
  }
  dueDate: string
  priority: "low" | "medium" | "high"
}

interface Column {
  id: string
  title: string
  color: string
}

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  onDrop: () => void
  onEditTask: (task: Task) => void
  isDraggedOver: boolean
}

export function KanbanColumn({
  column,
  tasks,
  onDragStart,
  onDragEnd,
  onDrop,
  onEditTask,
  isDraggedOver,
}: KanbanColumnProps) {
  const [localIsDragOver, setIsDragOver] = useState(false)
  const { deleteTask } = useKanbanStore()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop()
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId)
    }
  }

  return (
    <div className="w-80 flex-shrink-0" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Column Header */}
      <div
        className={cn(
          "rounded-lg p-4 mb-4 transition-all duration-200",
          column.color,
          localIsDragOver && "ring-2 ring-primary ring-opacity-50 bg-primary/5",
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Task Cards */}
      <div
        className={cn(
          "space-y-3 min-h-[200px] transition-all duration-200",
          localIsDragOver && "bg-primary/5 rounded-lg p-2",
        )}
      >
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            draggable
            onDragStart={(e) => {
              onDragStart(task)
              e.currentTarget.style.opacity = "0.5"
            }}
            onDragEnd={(e) => {
              onDragEnd()
              e.currentTarget.style.opacity = "1"
            }}
          >
            <CardContent className="p-4">
              {/* Task Header with Actions */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground leading-tight flex-1 mr-2">{task.title}</h4>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Task Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Task Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{task.assignee.name.split(" ")[0]}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Task Placeholder */}
      <Card
        className={cn(
          "mt-3 border-dashed border-2 border-muted hover:border-primary/50 transition-colors cursor-pointer",
          localIsDragOver && "border-primary bg-primary/5",
        )}
      >
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{localIsDragOver ? "Drop task here" : "+ Add a task"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
