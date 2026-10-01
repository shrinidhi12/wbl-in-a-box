import type { ComponentType } from 'react'
import { EmpathyMap, Lifecycle, SelfCheck, WhyBuilder } from './background'
import { NetworkMap, ObjectionHandler, OutreachComposer } from './outreach'
import { Cultivate, EntryPicker, OpportunityBuilder } from './grow'

/** Maps the `tool` key in content/journey.json to the component rendered in the DO section. */
export const TOOLS: Record<string, ComponentType> = {
  why: WhyBuilder,
  empathy: EmpathyMap,
  selfcheck: SelfCheck,
  lifecycle: Lifecycle,
  network: NetworkMap,
  outreach: OutreachComposer,
  objections: ObjectionHandler,
  entry: EntryPicker,
  cultivate: Cultivate,
  opportunity: OpportunityBuilder,
}
