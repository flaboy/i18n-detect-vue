import { readFileSync } from 'fs'
import { extname } from 'path'
import { BabelKeyExtractor } from './babelExtractor.js'
import { HtmlKeyExtractor } from './htmlExtractor.js'
import { loadLangData, keyExistsInLangData, type LangData } from './langLoader.js'
import { MissingKey } from './types.js'

export interface CheckOptions {
  langJsonPath: string
}

export function checkLocalizedKeys(filePath: string, options: CheckOptions): MissingKey[] {
  const content = readFileSync(filePath, 'utf-8')
  const ext = extname(filePath).toLowerCase()
  const langData = loadLangData(options.langJsonPath)

  let extractor
  if (ext === '.vue') {
    // Vue 文件：需要提取 template 和 script 中的 key
    extractor = new HtmlKeyExtractor()
    const templateKeys = extractor.extractKeys(content, filePath)
    
    // 提取 <script> 标签中的 key
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (scriptMatch) {
      const scriptExtractor = new BabelKeyExtractor()
      const scriptKeys = scriptExtractor.extractKeys(scriptMatch[1], filePath)
      // 调整 script 中的行号（加上 template 部分的行数）
      const templateLineCount = content.substring(0, scriptMatch.index).split('\n').length
      scriptKeys.forEach(k => {
        k.line += templateLineCount - 1
      })
      templateKeys.push(...scriptKeys)
    }
    
    return checkKeys(templateKeys, filePath, langData)
  } else if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
    extractor = new BabelKeyExtractor()
    const keys = extractor.extractKeys(content, filePath)
    return checkKeys(keys, filePath, langData)
  } else if (ext === '.html') {
    extractor = new HtmlKeyExtractor()
    const keys = extractor.extractKeys(content, filePath)
    return checkKeys(keys, filePath, langData)
  }

  return []
}

function checkKeys(
  keys: Array<{ key: string; line: number }>,
  filePath: string,
  langData: LangData
): MissingKey[] {
  const missing: MissingKey[] = []

  for (const { key, line } of keys) {
    if (!keyExistsInLangData(langData, key)) {
      missing.push({
        file: filePath,
        line,
        key,
      })
    }
  }

  return missing
}

export * from './types.js'
export * from './langLoader.js'
export * from './babelExtractor.js'
export * from './htmlExtractor.js'

