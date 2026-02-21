import { readFileSync } from 'fs'

export interface LangData {
  [key: string]: any
}

/**
 * 从 JSON 中获取嵌套值（支持点式路径，如 "common.cancel"）
 */
export function getValueFromLangData(data: LangData, path: string): any {
  const keys = path.split('.')
  let current: any = data

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }

  return current
}

/**
 * 检查 key 是否在语言包中存在
 */
export function keyExistsInLangData(data: LangData, key: string): boolean {
  return getValueFromLangData(data, key) !== undefined
}

/**
 * 加载语言包 JSON 文件
 */
export function loadLangData(filePath: string): LangData {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to load language file ${filePath}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

