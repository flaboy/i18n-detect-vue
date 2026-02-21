import { Parser } from 'htmlparser2'
import { KeyExtractor } from './types.js'

// Vue 模板中的 i18n 使用模式
const I18N_PATTERNS = [
  // $t('key') 或 $t("key")
  /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // t('key') 或 t("key")
  /(?:^|[^a-zA-Z0-9_$\.])t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // i18n.t('key') 或 i18n.t("key")
  /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // useI18n().t('key') 或 useI18n().t("key")
  /useI18n\(\)\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,
  // v-t="'key'" 或 v-t='"key"'
  /v-t\s*=\s*["']([^"']+)["']/g,
]

export class HtmlKeyExtractor implements KeyExtractor {
  extractKeys(content: string, filePath: string): Array<{ key: string; line: number; start: number; end: number }> {
    const keys: Array<{ key: string; line: number; start: number; end: number }> = []
    
    // 提取 template 部分（如果是 Vue 文件）
    let templateContent = content
    let templateOffset = 0
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
    if (templateMatch) {
      templateContent = templateMatch[1]
      templateOffset = templateMatch.index! + templateMatch[0].indexOf(templateMatch[1])
    }

    let lastTag = ''
    let inScript = false
    
    // 提取 key 的辅助函数
    const extractKeysFromText = (
      text: string,
      baseOffset: number
    ) => {
      for (const pattern of I18N_PATTERNS) {
        let match: RegExpExecArray | null
        pattern.lastIndex = 0
        while ((match = pattern.exec(text)) !== null) {
          const key = match[1]
          if (key) {
            const start = baseOffset + match.index
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

    const parser = new Parser({
      onopentag(name, attrs) {
        lastTag = name
        if (name === 'script') {
          inScript = true
          return
        }
        
        // 检查属性值中的 i18n key
        for (const [attrName, attrValue] of Object.entries(attrs)) {
          if (typeof attrValue === 'string' && attrValue) {
            const attrStart = parser.startIndex || 0
            extractKeysFromText(attrValue, attrStart + templateOffset)
          }
        }
      },
      onclosetag(name) {
        if (name === 'script') {
          inScript = false
        }
        lastTag = ''
      },
      ontext(text: string) {
        if (inScript || lastTag === 'script' || lastTag === 'style') {
          return
        }
        
        // 从文本节点中提取 i18n key
        const textStart = parser.startIndex || 0
        extractKeysFromText(text, textStart + templateOffset)
      },
    }, {
      xmlMode: true,
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
      recognizeSelfClosing: true,
    })

    parser.parseComplete(templateContent)

    // 去重
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

