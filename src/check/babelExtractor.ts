import { parse } from '@babel/parser'
// @ts-ignore - @babel/traverse doesn't have proper ESM types
import _traverse from '@babel/traverse'
const traverse = _traverse.default || _traverse
import { KeyExtractor } from './types.js'

// Vue i18n 使用模式
const I18N_PATTERNS = [
  // $t('key') 或 $t("key")
  /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // t('key') 或 t("key") - 需要避免匹配到其他函数
  /(?:^|[^a-zA-Z0-9_$\.])t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // i18n.t('key') 或 i18n.t("key")
  /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // useI18n().t('key') 或 useI18n().t("key")
  /useI18n\(\)\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // const { t } = useI18n(); t('key')
  // 这个已经在上面通过 t('key') 模式匹配了
]

export class BabelKeyExtractor implements KeyExtractor {
  extractKeys(content: string, filePath: string): Array<{ key: string; line: number; start: number; end: number }> {
    const keys: Array<{ key: string; line: number; start: number; end: number }> = []

    try {
      const ast = parse(content, {
        sourceType: 'unambiguous',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
        ],
      })

      // 使用正则表达式提取 key（更简单可靠）
      for (const pattern of I18N_PATTERNS) {
        let match: RegExpExecArray | null
        pattern.lastIndex = 0
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1]
          if (key) {
            const start = match.index
            const line = content.substring(0, start).split('\n').length
            keys.push({
              key,
              line,
              start,
              end: start + match[0].length,
            })
          }
        }
      }
    } catch (error) {
      // 如果解析失败，使用正则表达式回退
      for (const pattern of I18N_PATTERNS) {
        let match: RegExpExecArray | null
        pattern.lastIndex = 0
        while ((match = pattern.exec(content)) !== null) {
          const key = match[1]
          if (key) {
            const start = match.index
            const line = content.substring(0, start).split('\n').length
            keys.push({
              key,
              line,
              start,
              end: start + match[0].length,
            })
          }
        }
      }
    }

    // 去重（同一个 key 在同一位置只记录一次）
    const seen = new Set<string>()
    return keys.filter(({ key, start }) => {
      const id = `${start}:${key}`
      if (seen.has(id)) {
        return false
      }
      seen.add(id)
      return true
    })
  }
}

