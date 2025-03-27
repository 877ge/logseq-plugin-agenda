export interface Task {
  id: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  completed: boolean
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  parentId?: string
  createdAt: string
  updatedAt: string
}
