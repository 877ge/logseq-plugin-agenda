import { atom } from 'jotai'
import { Task } from '../types/task'
import { logseq as LS } from '@logseq/libs'

/**
 * 本地存储服务 - 使用浏览器localStorage保存数据
 */

const STORAGE_KEY = 'agenda3_local_data'

/**
 * 本地存储数据结构定义
 */
interface LocalStorageData {
  tasks: Task[]
  calendars: any[]
  settings: any
}

/**
 * 存储模式枚举
 * Logseq: 使用Logseq原生存储
 * Local: 使用浏览器本地存储
 */
export enum StorageMode {
  Logseq = 'logseq',
  Local = 'local'
}

export const localDataAtom = atom<LocalStorageData>({
  tasks: [],
  calendars: [],
  settings: {}
})

/**
 * 数据服务抽象基类
 * 定义任务管理的基本接口
 */
export abstract class DataService {
  /**
   * 获取所有任务
   * @returns 任务数组
   */
  abstract getTasks(): Promise<Task[]>
  
  /**
   * 保存任务(新增或更新)
   * @param task 任务对象
   */
  abstract saveTask(task: Task): Promise<void>
  
  /**
   * 删除任务
   * @param id 任务ID
   */
  abstract deleteTask(id: string): Promise<void>
}

/**
 * 本地存储服务实现类
 * 继承DataService抽象类
 */
export class LocalStorageService extends DataService {
  /**
   * 保存数据到localStorage
   * @param data 要保存的数据
   */
  private static save(data: LocalStorageData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  /**
   * 从localStorage加载数据
   * @returns 加载的数据或null
   */
  private static load(): LocalStorageData | null {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  async getTasks(): Promise<Task[]> {
    const data = LocalStorageService.load()
    return data?.tasks || []
  }

  async saveTask(task: Task): Promise<void> {
    const data = LocalStorageService.load() || { tasks: [], calendars: [], settings: {} }
    const existingIndex = data.tasks.findIndex(t => t.id === task.id)
    if (existingIndex >= 0) {
      data.tasks[existingIndex] = task
    } else {
      data.tasks.push(task)
    }
    LocalStorageService.save(data)
  }

  async deleteTask(id: string): Promise<void> {
    const data = LocalStorageService.load()
    if (data) {
      data.tasks = data.tasks.filter(t => t.id !== id)
      LocalStorageService.save(data)
    }
  }

  static exportToFile() {
    const data = this.load()
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `agenda3_backup_${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  static importFromFile(file: File): Promise<LocalStorageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          this.save(data)
          resolve(data)
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsText(file)
    })
  }
}
