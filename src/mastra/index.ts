import { Mastra } from '@mastra/core'
import { nbaAgent, dane } from './agents'

export const mastra = new Mastra({
  agents: { nbaAgent, dane }
})