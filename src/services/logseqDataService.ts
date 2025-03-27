import { Task } from '../types/task'
import { DataService } from './localStorageService'
import { logseq as LS } from '@logseq/libs'

/**
 * Logseq数据服务 - 使用Logseq API操作数据
 */

/**
 * Logseq数据服务实现类
 * 继承DataService抽象类，通过Logseq API操作数据
 */
export class LogseqDataService extends DataService {
  /**
   * 从Logseq获取所有任务
   * @returns 任务数组
   */
  async getTasks(): Promise<Task[]> {
    const blocks = await LS.api.query('[:find (pull ?b [*]) :where [?b :block/marker ?m] [(contains? #{"TODO" "DOING" "DONE"} ?m)]]')
    return blocks.map((block: any) => ({
      id: block.uuid,
      title: block.content,
      completed: block.marker === 'DONE',
      createdAt: block.createdAt,
      updatedAt: block.updatedAt
    }))
  }

  /**
   * 保存任务到Logseq(新增或更新)
   * @param task 任务对象
   */
  async saveTask(task: Task): Promise<void> {
    if (task.id) {
      await LS.api.update_block(
        task.id,
        task.title,
        { marker: task.completed ? 'DONE' : 'TODO' }
      )
    } else {
      await LS.api.insert_block(
        LS.api.get_current_page()?.name || 'agenda',
        task.title,
        { isPageBlock: false, marker: task.completed ? 'DONE' : 'TODO' }
      )
    }
  }

  /**
   * 从Logseq删除任务
   * @param id 任务块UUID
   */
  async deleteTask(id: string): Promise<void> {
    await LS.api.remove_block(id)
  }
}
