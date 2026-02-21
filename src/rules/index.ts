import { BasicExtrationRule } from './basic.js'
import { NonAsciiExtractionRule } from './non-ascii-characters.js'
import { DynamicExtractionRule } from './dynamic.js'

export * from './base.js'
export * from './basic.js'
export * from './non-ascii-characters.js'
export * from './dynamic.js'

export const DefaultExtractionRules = [
  new BasicExtrationRule(),
  new NonAsciiExtractionRule(),
]

export const DefaultDynamicExtractionsRules = [
  new DynamicExtractionRule(),
]

