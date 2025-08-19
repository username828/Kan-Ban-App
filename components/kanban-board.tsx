"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Users, Search, Filter, Activity, Wifi, WifiOff } from "lucide-react"
import { KanbanColumn } from "./kanban-column"
import { UserSidebar } from "./user-sidebar"
import { TaskModal } from "./task-modal"
import { ActivityFeed } from "./activity-feed"
import { CollaborationNotifications } from "./collaboration-notifications"
import { useKanbanStore } from "@/lib/store"

export function KanbanBoard() {
  const { tasks, users, draggedTask, moveTask, setDraggedTask, isConnected, simulateCollaboration } = useKanbanStore()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  useEffect(() => {
    simulateCollaboration()
  }, [simulateCollaboration])

  const columns = [
    { id: "todo", title: "To Do", color: "bg-slate-100" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50" },
    { id: "done", title: "Done", color: "bg-green-50" },
  ]

  const handleDragStart = (task: any, sourceColumn: string) => {
    setDraggedTask({ ...task, sourceColumn })
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleDrop = (targetColumn: string) => {
    if (!draggedTask || draggedTask.sourceColumn === targetColumn) {
      return
    }

    moveTask(draggedTask.id, draggedTask.sourceColumn, targetColumn)
    setDraggedTask(null)
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  // Filter tasks based on search and priority
  const getFilteredTasks = (columnTasks: any[]) => {
    return columnTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesPriority = filterPriority === "all" || task.priority === filterPriority

      return matchesSearch && matchesPriority
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Board Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Project Board</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your team's tasks and workflow</p>
              </div>

              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Disconnected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsActivityOpen(!isActivityOpen)}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Activity
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Team ({users.filter((u) => u.status === "online").length})
              </Button>
              <Button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Search and filter controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </header>

        {/* Board Content */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 min-w-max">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getFilteredTasks(tasks[column.id as keyof typeof tasks] || [])}
                onDragStart={(task) => handleDragStart(task, column.id)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(column.id)}
                onEditTask={handleEditTask}
                isDraggedOver={draggedTask?.sourceColumn !== column.id && !!draggedTask}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed Sidebar */}
      {isActivityOpen && (
        <div className="border-l border-border p-4">
          <ActivityFeed />
        </div>
      )}

      {/* User Sidebar */}
      <UserSidebar users={users} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Task Creation/Edit Modal */}
      <TaskModal isOpen={isTaskModalOpen} onClose={handleCloseModal} editingTask={editingTask} users={users} />

      <CollaborationNotifications />
    </div>
  )
}
