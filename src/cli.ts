#!/usr/bin/env node

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { detectHardStrings } from './index.js'

function getLineNumber(content: string, position: number): number {
  return content.substring(0, position).split('\n').length
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: i18n-detect-vue <file>')
    process.exit(1)
  }

  const filePath = resolve(args[0])

  try {
    const content = readFileSync(filePath, 'utf-8')
    const detections = detectHardStrings(filePath)

    for (const detection of detections) {
      const line = getLineNumber(content, detection.start)
      // Output format: filepath:line\ttext\tcontext\tpriority
      // Similar to iOS detect_string tool
      // Normalize text: trim whitespace and replace newlines with spaces
      // This prevents valid strings from being filtered out by Makefile grep rules
      const normalizedText = detection.text.replace(/\s+/g, ' ').trim()
      if (normalizedText) {
        console.log(`${filePath}:${line}\t${normalizedText}\t${detection.source}\tlow`)
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      // File not found, exit silently (for find -exec compatibility)
      process.exit(0)
    }
    console.error(`Error processing ${filePath}:`, error)
    process.exit(1)
  }
}

main()
