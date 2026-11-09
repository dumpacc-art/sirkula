import { findSub, WASTE_CATEGORIES } from './wasteTaxonomy'
import type { Workflow, WasteStream } from '../types'

/** Each sub-category belongs to one stream. Recyclable and residual are both inorganic. */
const STREAM_BY_CATEGORY: Record<string, WasteStream> = { organic: 'organic', recyclable: 'inorganic', residual: 'inorganic', ewaste: 'ewaste' }
export const WORKFLOW_BY_STREAM: Record<WasteStream, Workflow> = { organic: 'organic-batch', inorganic: 'standard-batch', ewaste: 'sirkula-ewaste' }

export interface SegregationResult {
  valid: boolean; streams: WasteStream[]; stream: WasteStream | null; workflow: Workflow | null
  /** English source strings, translated by the UI. Empty when valid. */
  messages: string[]
}

/** Rules: organic never shares an order with inorganic; e-waste never shares an order with anything else. */
export function analyzeSegregation(ids: string[]): SegregationResult {
  const streams = [...new Set(ids.map(id => { const f = findSub(id); return f ? STREAM_BY_CATEGORY[f.cat.id] : undefined }))]
    .filter((x): x is WasteStream => !!x)
  const messages: string[] = []
  if (streams.includes('ewaste') && streams.length > 1) messages.push('E-waste goes through its own SIRKULA workflow and must be in a separate order.')
  if (streams.includes('organic') && streams.includes('inorganic')) messages.push('Organic waste must be in a separate order from inorganic waste.')
  const valid = messages.length === 0
  const stream = streams.length === 1 ? streams[0] : null
  return { valid, streams, stream, workflow: stream ? WORKFLOW_BY_STREAM[stream] : null, messages }
}

export const STREAM_LABEL: Record<WasteStream, string> = { organic: 'Organic', inorganic: 'Inorganic (recyclable and residual)', ewaste: 'E-waste' }
export const WORKFLOW_LABEL: Record<Workflow, string> = { 'organic-batch': 'Organic batch', 'standard-batch': 'Standard batch', 'sirkula-ewaste': 'SIRKULA e-waste workflow' }
export const WORKFLOW_HELP: Record<Workflow, string> = {
  'organic-batch': 'Collected in its own organic batch, separate from inorganic waste.',
  'standard-batch': 'Matched with standard recycling partners in an inorganic batch.',
  'sirkula-ewaste': 'Handled by SIRKULA. Regular partners cannot be selected for e-waste.',
}
export const allSubIds = () => WASTE_CATEGORIES.flatMap(c => c.subs.map(s => s.id))
