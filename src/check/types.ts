export interface MissingKey {
  file: string
  line: number
  key: string
}

export interface KeyExtractor {
  extractKeys(content: string, filePath: string): Array<{ key: string; line: number; start: number; end: number }>
}

