import { StorageMode } from './localStorageService'
import { LocalStorageService } from './localStorageService'
import { LogseqDataService } from './logseqDataService'
import { DataService } from './localStorageService'

/**
 * 创建数据服务实例
 * @param mode 存储模式(Logseq/Local)
 * @returns 数据服务实例
 */
export function createDataService(mode: StorageMode): DataService {
  switch (mode) {
    case StorageMode.Local:
      return new LocalStorageService()
    case StorageMode.Logseq:
      return new LogseqDataService()
    default:
      throw new Error(`Unknown storage mode: ${mode}`)
  }
}

/**
 * 数据迁移功能
 * @param from 源数据服务
 * @param to 目标数据服务
 */
export async function migrateData(
  from: DataService,
  to: DataService
): Promise<void> {
  const tasks = await from.getTasks()
  for (const task of tasks) {
    await to.saveTask(task)
  }
}
