import { create } from "zustand"

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
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "offline"
  lastSeen?: string
  currentActivity?: string
}

interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: "created" | "updated" | "moved" | "deleted" | "commented"
  taskId?: string
  taskTitle?: string
  fromColumn?: string
  toColumn?: string
  timestamp: string
  details?: string
}

interface Notification {
  id: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: string
  userId?: string
  taskId?: string
}

interface KanbanStore {
  tasks: Record<string, Task[]>
  users: User[]
  draggedTask: (Task & { sourceColumn: string }) | null
  activities: Activity[]
  notifications: Notification[]
  currentUserId: string
  isConnected: boolean
  activeUsers: string[]

  // Actions
  setTasks: (tasks: Record<string, Task[]>) => void
  addTask: (columnId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, fromColumn: string, toColumn: string) => void
  setDraggedTask: (task: (Task & { sourceColumn: string }) | null) => void

  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  updateUserStatus: (userId: string, status: User["status"], activity?: string) => void
  setCurrentUser: (userId: string) => void
  simulateCollaboration: () => void
  clearNotifications: () => void

  // Utility functions
  findTaskById: (taskId: string) => { task: Task; columnId: string } | null
  getTasksByColumn: (columnId: string) => Task[]
  getRecentActivities: (limit?: number) => Activity[]
}

// Initial mock data
const initialTasks = {
  todo: [
    {
      id: "1",
      title: "Design new landing page",
      description: "Create wireframes and mockups for the new product landing page",
      tags: ["Design", "UI/UX"],
      assignee: { id: "1", name: "Alice Johnson", avatar: "/diverse-woman-portrait.png" },
      dueDate: "2024-01-15",
      priority: "high" as const,
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      title: "Set up authentication system",
      description: "Implement user login and registration with JWT tokens",
      tags: ["Backend", "Security"],
      assignee: { id: "2", name: "Bob Smith", avatar: "/thoughtful-man.png" },
      dueDate: "2024-01-20",
      priority: "medium" as const,
      createdAt: "2024-01-01T11:00:00Z",
      updatedAt: "2024-01-01T11:00:00Z",
    },
  ],
  "in-progress": [
    {
      id: "3",
      title: "Build responsive navigation",
      description: "Create mobile-friendly navigation component with hamburger menu",
      tags: ["Frontend", "React"],
      assignee: { id: "3", name: "Carol Davis", avatar: "/woman-developer.png" },
      dueDate: "2024-01-12",
      priority: "high" as const,
      createdAt: "2024-01-01T12:00:00Z",
      updatedAt: "2024-01-01T12:00:00Z",
    },
  ],
  done: [
    {
      id: "4",
      title: "Project setup and configuration",
      description: "Initialize Next.js project with TypeScript and Tailwind CSS",
      tags: ["Setup", "Config"],
      assignee: { id: "4", name: "David Wilson", avatar: "/man-developer.png" },
      dueDate: "2024-01-08",
      priority: "low" as const,
      createdAt: "2024-01-01T09:00:00Z",
      updatedAt: "2024-01-01T09:00:00Z",
    },
  ],
}

const initialUsers = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/diverse-woman-portrait.png",
    status: "online" as const,
    currentActivity: "Reviewing designs",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/thoughtful-man.png",
    status: "online" as const,
    currentActivity: "Working on backend",
  },
  {
    id: "3",
    name: "Carol Davis",
    avatar: "/woman-developer.png",
    status: "away" as const,
    lastSeen: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "4",
    name: "David Wilson",
    avatar: "/man-developer.png",
    status: "online" as const,
    currentActivity: "Testing features",
  },
]

const mockCollaborationActions = [
  { action: "updated", taskId: "1", details: "Changed priority to high" },
  { action: "moved", taskId: "2", fromColumn: "todo", toColumn: "in-progress" },
  { action: "created", taskTitle: "Fix mobile responsiveness", details: "Added new task" },
  { action: "commented", taskId: "3", details: "Added progress update" },
]

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  tasks: initialTasks,
  users: initialUsers,
  draggedTask: null,
  activities: [],
  notifications: [],
  currentUserId: "1", // Simulating current user as Alice
  isConnected: true,
  activeUsers: ["1", "2", "4"],

  setTasks: (tasks) => set({ tasks }),

  addTask: (columnId, taskData) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const state = get()
    const currentUser = state.users.find((u) => u.id === state.currentUserId)

    set((state) => ({
      tasks: {
        ...state.tasks,
        [columnId]: [...(state.tasks[columnId] || []), newTask],
      },
    }))

    get().addActivity({
      userId: state.currentUserId,
      userName: currentUser?.name || "Unknown",
      userAvatar: currentUser?.avatar || "",
      action: "created",
      taskId: newTask.id,
      taskTitle: newTask.title,
      details: `Created task in ${columnId}`,
    })

    get().addNotification({
      message: `New task "${newTask.title}" created`,
      type: "success",
      taskId: newTask.id,
    })
  },

  updateTask: (taskId, updates) => {
    const state = get()
    const taskLocation = state.findTaskById(taskId)
    const currentUser = state.users.find((u) => u.id === state.currentUserId)

    if (!taskLocation) return

    const updatedTask = {
      ...taskLocation.task,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({
      tasks: {
        ...state.tasks,
        [taskLocation.columnId]: state.tasks[taskLocation.columnId].map((task) =>
          task.id === taskId ? updatedTask : task,
        ),
      },
    }))

    get().addActivity({
      userId: state.currentUserId,
      userName: currentUser?.name || "Unknown",
      userAvatar: currentUser?.avatar || "",
      action: "updated",
      taskId,
      taskTitle: updatedTask.title,
      details: "Updated task details",
    })
  },

  deleteTask: (taskId) => {
    const state = get()
    const taskLocation = state.findTaskById(taskId)
    const currentUser = state.users.find((u) => u.id === state.currentUserId)

    if (!taskLocation) return

    set((state) => ({
      tasks: {
        ...state.tasks,
        [taskLocation.columnId]: state.tasks[taskLocation.columnId].filter((task) => task.id !== taskId),
      },
    }))

    get().addActivity({
      userId: state.currentUserId,
      userName: currentUser?.name || "Unknown",
      userAvatar: currentUser?.avatar || "",
      action: "deleted",
      taskId,
      taskTitle: taskLocation.task.title,
      details: "Deleted task",
    })

    get().addNotification({
      message: `Task "${taskLocation.task.title}" deleted`,
      type: "info",
      taskId,
    })
  },

  moveTask: (taskId, fromColumn, toColumn) => {
    if (fromColumn === toColumn) return

    const state = get()
    const task = state.tasks[fromColumn]?.find((t) => t.id === taskId)
    const currentUser = state.users.find((u) => u.id === state.currentUserId)

    if (!task) return

    set((state) => ({
      tasks: {
        ...state.tasks,
        [fromColumn]: state.tasks[fromColumn].filter((t) => t.id !== taskId),
        [toColumn]: [...(state.tasks[toColumn] || []), { ...task, updatedAt: new Date().toISOString() }],
      },
    }))

    get().addActivity({
      userId: state.currentUserId,
      userName: currentUser?.name || "Unknown",
      userAvatar: currentUser?.avatar || "",
      action: "moved",
      taskId,
      taskTitle: task.title,
      fromColumn,
      toColumn,
      details: `Moved from ${fromColumn} to ${toColumn}`,
    })

    get().addNotification({
      message: `"${task.title}" moved to ${toColumn}`,
      type: "info",
      taskId,
    })
  },

  setDraggedTask: (task) => set({ draggedTask: task }),

  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      activities: [newActivity, ...state.activities].slice(0, 50), // Keep last 50 activities
    }))
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 10), // Keep last 10 notifications
    }))
  },

  updateUserStatus: (userId, status, activity) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status,
              currentActivity: activity,
              lastSeen: status === "offline" ? new Date().toISOString() : user.lastSeen,
            }
          : user,
      ),
    }))
  },

  setCurrentUser: (userId) => set({ currentUserId: userId }),

  simulateCollaboration: () => {
    const state = get()
    const otherUsers = state.users.filter((u) => u.id !== state.currentUserId && u.status === "online")

    if (otherUsers.length === 0) return

    const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)]
    const randomAction = mockCollaborationActions[Math.floor(Math.random() * mockCollaborationActions.length)]

    setTimeout(
      () => {
        const currentState = get()

        if (randomAction.action === "moved" && randomAction.taskId) {
          const taskLocation = currentState.findTaskById(randomAction.taskId)
          if (taskLocation && randomAction.fromColumn && randomAction.toColumn) {
            currentState.moveTask(randomAction.taskId, randomAction.fromColumn, randomAction.toColumn)
          }
        } else if (randomAction.action === "updated" && randomAction.taskId) {
          currentState.addActivity({
            userId: randomUser.id,
            userName: randomUser.name,
            userAvatar: randomUser.avatar,
            action: "updated",
            taskId: randomAction.taskId,
            taskTitle: "Task",
            details: randomAction.details || "Updated task",
          })
        }

        // Schedule next simulation
        setTimeout(() => get().simulateCollaboration(), Math.random() * 10000 + 5000) // 5-15 seconds
      },
      Math.random() * 3000 + 1000,
    ) // 1-4 seconds delay
  },

  clearNotifications: () => set({ notifications: [] }),

  findTaskById: (taskId) => {
    const state = get()
    for (const [columnId, tasks] of Object.entries(state.tasks)) {
      const task = tasks.find((t) => t.id === taskId)
      if (task) {
        return { task, columnId }
      }
    }
    return null
  },

  getTasksByColumn: (columnId) => {
    const state = get()
    return state.tasks[columnId] || []
  },

  getRecentActivities: (limit = 10) => {
    const state = get()
    return state.activities.slice(0, limit)
  },
}))
