import { MARKDOWN_POMODORO_REG, ORG_POMODORO_REG } from '@/util/constants'
import { parseUrlParams } from '@/util/util'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
export const secondsToTime = (seconds: number) => {
  const minute = Math.floor((seconds % 3600) / 60)
  const second = Math.floor(seconds % 60)
  return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
}

export const genToolbarPomodoro = (uuid: string, time: string, progress: number, isBreak: boolean = false) => {
  return `<div data-on-click="showPomodoro" class="agenda-toolbar-pompdoro ${isBreak ? 'break' : ''}" data-uuid="${uuid}">
    ${time}
    <div class="timer-progress-back" style="width: ${progress * 100}%;"></div>
  </div>`
}

export const togglePomodoro = (show: boolean = true) => {
  const pomodoro = document.querySelector('#pomodoro-root')
  if (pomodoro && show) pomodoro.classList.remove('hide')
  if (pomodoro && !show) pomodoro.classList.add('hide')
}

export type IPomodoroInfo = {
  isFull: boolean;
  start: number;
  length: number;
  interruptionRemark?: string
}
export const getPomodoroInfo = (blockContent: string, format: BlockEntity['format']): IPomodoroInfo[] | null => {
  const reg = format === 'markdown' ? MARKDOWN_POMODORO_REG : ORG_POMODORO_REG
  const res = blockContent.match(reg)
  if (!res || !res?.[1]) return null
  // >[🍅 50min](#agenda-pomo://?t=f-20220614123213-10,p-2023829809-4,p-2023829809-3-text)
  const params = parseUrlParams(res[1])
  const pomodoroInfo = params.t
  if (!pomodoroInfo) return null
  const pomodoros = pomodoroInfo.split(',')
  return pomodoros.map(pomodoro => {
    const info = pomodoro.split('-')
    const [type, start, length, remark] = info
    return {
      isFull: type === 'f',
      start: parseInt(start),
      length: parseInt(length),
      interruptionRemark: remark,
    }
  })
}

export const updatePomodoroInfo = async (
  uuid: string,
  pomodoro: IPomodoroInfo
) => {
  const block = await logseq.Editor.getBlock(uuid)
  if (!block) return
  const pomodoros = getPomodoroInfo(block.content, block.format)

  // gen new pomodoro info text
  const newPomodoros = pomodoros ? [...pomodoros, pomodoro] : [pomodoro]
  const newInfoText = newPomodoros.map(pomodoro => {
    const { isFull, start, length, interruptionRemark } = pomodoro
    const type = isFull ? 'f' : 'p'
    return `${type}-${start}-${length}${interruptionRemark ? `-${interruptionRemark}` : ''}`
  }).join(',')

  const url = new URL('agenda-pomo://')
  url.searchParams.append('t', newInfoText)

  const countTime = newPomodoros.reduce((acc, pomodoro) => {
    return acc + pomodoro.length
  }, 0)
  const tomato = newPomodoros.filter(pomodoro => pomodoro.isFull)?.map(() => '🍅')?.join('') || '🍅'
  const showText = `${tomato} ${countTime / 60}min`

  const newInfo = block?.format === 'org' ? `>[[#${url.toString()}][${showText}]]` : `>[${showText}](#${url.toString()})`

  // replace
  let newContent = block.content
  const reg = block.format === 'markdown' ? MARKDOWN_POMODORO_REG : ORG_POMODORO_REG
  if (reg.test(block.content)) {
    newContent = block.content.replace(reg, newInfo)
  } else {
    newContent = `${block.content} ${newInfo}`
  }
  return newContent
}

export const removePomodoroInfo = (blockContent: string, format: BlockEntity['format']) => {
  const reg = format === 'markdown' ? MARKDOWN_POMODORO_REG : ORG_POMODORO_REG
  return blockContent.replace(reg, '')?.trim()
}