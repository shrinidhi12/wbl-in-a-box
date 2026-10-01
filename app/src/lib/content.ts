import { marked } from 'marked'
import journey from '../content/journey.json'

const learnFiles = import.meta.glob('../content/learn/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const resourceFiles = import.meta.glob('../content/resources/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const byName = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, body]) => [path.split('/').pop()!.replace('.md', ''), body]))

const LEARN = byName(learnFiles)
const RESOURCES = byName(resourceFiles)

export type Step = (typeof journey.steps)[number]
export type ResourceId = keyof typeof journey.resources

export const PARTS = journey.parts
export const STEPS = journey.steps
export const stepById = (id: string) => STEPS.find((s) => s.id === id)

export const learnMarkdown = (stepId: string) => LEARN[stepId] ?? ''

export const resourceMeta = (id: string) => journey.resources[id as ResourceId]
export const resourceMarkdown = (id: string) => RESOURCES[id] ?? ''
export const ALL_RESOURCES = Object.keys(journey.resources).map((id) => ({
  id,
  ...journey.resources[id as ResourceId],
  step: STEPS.find((s) => s.resources.includes(id))!,
}))

export const renderMarkdown = (md: string) => marked.parse(md, { async: false }) as string
