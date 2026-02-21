#!/usr/bin/env node

import { resolve } from 'path'
import { checkLocalizedKeys } from './check/index.js'

function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error('Usage: i18n-check-keys-vue <file> <lang_json_file>')
    process.exit(1)
  }

  const filePath = resolve(args[0])
  const langJsonPath = resolve(args[1])

  try {
    const missing = checkLocalizedKeys(filePath, { langJsonPath })

    for (const item of missing) {
      // Output format: filepath:line\tkey
      // Similar to iOS check_localized_keys tool
      console.log(`${item.file}:${item.line}\t${item.key}`)
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
