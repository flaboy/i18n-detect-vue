import { readFileSync } from 'fs'
import { extname } from 'path'
import { detect as detectBabel } from './parsers/babel.js'
import { detect as detectHTML } from './parsers/html.js'
import { DefaultExtractionRules, DefaultDynamicExtractionsRules } from './rules/index.js'
import { DetectionResult } from './types.js'

export interface DetectOptions {
  attributes?: string[]
  ignoredTags?: string[]
  vBind?: boolean
  inlineText?: boolean
  ignoredJSXAttributes?: string[]
}

export function detectHardStrings(filePath: string, options: DetectOptions = {}): DetectionResult[] {
  const content = readFileSync(filePath, 'utf-8')
  const ext = extname(filePath).toLowerCase()

  // Vue files: detect HTML template and script
  if (ext === '.vue') {
    return detectHTML(
      content,
      DefaultExtractionRules,
      DefaultDynamicExtractionsRules,
      {
        attributes: options.attributes || ['title', 'alt', 'placeholder', 'label', 'aria-label'],
        ignoredTags: options.ignoredTags || ['script', 'style'],
        vBind: options.vBind !== false,
        inlineText: options.inlineText !== false,
      },
      // Extract from <script> tags
      (script, start) => detectBabel(
        script,
        DefaultExtractionRules,
        DefaultDynamicExtractionsRules,
        {
          ignoredJSXAttributes: options.ignoredJSXAttributes || ['class', 'className', 'key', 'style', 'ref', 'onClick'],
        }
      )
    )
  }

  // TypeScript/JavaScript files
  if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
    return detectBabel(
      content,
      DefaultExtractionRules,
      DefaultDynamicExtractionsRules,
      {
        ignoredJSXAttributes: options.ignoredJSXAttributes || ['class', 'className', 'key', 'style', 'ref', 'onClick'],
      }
    )
  }

  // HTML files
  if (ext === '.html') {
    return detectHTML(
      content,
      DefaultExtractionRules,
      DefaultDynamicExtractionsRules,
      {
        attributes: options.attributes || ['title', 'alt', 'placeholder', 'label', 'aria-label'],
        ignoredTags: options.ignoredTags || ['script', 'style'],
        vBind: false,
        inlineText: options.inlineText !== false,
      }
    )
  }

  return []
}

export * from './types.js'
export * from './rules/index.js'
export * from './parsers/index.js'
export * from './shouldExtract.js'
export * from './parseHardString.js'
export * from './utils.js'

