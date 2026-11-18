/**
 * The contract film's documents and provisions. Invented: an investment firm
 * ("Fernbrook Investments") and a data vendor ("Halden Data Services"). No
 * employer's documents, wording or topic lists are used.
 *
 * Every count shown on screen is computed from these arrays, so the film cannot
 * say "5 superseded" while showing four.
 */

export type DocKind = 'Agreement' | 'Schedule' | 'Amendment' | 'Side letter' | 'Email'

export type Doc = {
  id: string
  kind: DocKind
  title: string
  date: string // as printed
  binding: boolean
  note?: string
}

export const PARTIES = 'Fernbrook Investments × Halden Data Services'

export const DOCS: Doc[] = [
  { id: 'msa', kind: 'Agreement', title: 'Master services agreement', date: '12 Mar 2019', binding: true },
  { id: 'sch2', kind: 'Schedule', title: 'Schedule 2 · Service levels', date: '12 Mar 2019', binding: true },
  { id: 'amd1', kind: 'Amendment', title: 'Amendment 1', date: '4 Jun 2020', binding: true },
  { id: 'sl', kind: 'Side letter', title: 'Side letter · availability', date: '18 Jan 2021', binding: true },
  { id: 'amd2', kind: 'Amendment', title: 'Amendment 2', date: '9 Sep 2023', binding: true },
  {
    id: 'email',
    kind: 'Email',
    title: 'Email · notice period',
    date: '2 Feb 2024',
    binding: false,
    note: 'Not applied · clause 22 needs a signed variation',
  },
]

/** The agreement's own order of precedence (clause 1.4 of the invented MSA). */
export const PRECEDENCE: string[] = ['Amendments', 'Side letters', 'The agreement', 'Schedules']

export type Version = { doc: string; ref: string; text: string; status: 'superseded' | 'in force' | 'not applied' }

export type Provision = { topic: string; clause: string; versions: Version[] }

export const PROVISIONS: Provision[] = [
  {
    topic: 'Annual fee',
    clause: 'Clause 7.2',
    versions: [
      { doc: 'Agreement 2019', ref: 'cl. 7.2', text: '£420,000', status: 'superseded' },
      { doc: 'Amendment 1 · 2020', ref: 'cl. 2', text: '£385,000', status: 'in force' },
    ],
  },
  {
    topic: 'Notice to terminate',
    clause: 'Clause 14.1',
    versions: [
      { doc: 'Agreement 2019', ref: 'cl. 14.1', text: '90 days', status: 'superseded' },
      { doc: 'Email · 2024', ref: '', text: '30 days', status: 'not applied' },
      { doc: 'Amendment 2 · 2023', ref: 'cl. 3', text: '60 days', status: 'in force' },
    ],
  },
  {
    topic: 'Service availability',
    clause: 'Schedule 2',
    versions: [
      { doc: 'Schedule 2 · 2019', ref: 'para 1', text: '99.5%', status: 'superseded' },
      { doc: 'Side letter · 2021', ref: 'para 2', text: '99.9%', status: 'in force' },
    ],
  },
  {
    topic: 'Liability cap',
    clause: 'Clause 12.3',
    versions: [
      { doc: 'Agreement 2019', ref: 'cl. 12.3', text: '1× annual fee', status: 'superseded' },
      { doc: 'Amendment 2 · 2023', ref: 'cl. 5', text: '2× annual fee', status: 'in force' },
    ],
  },
  {
    topic: 'Term',
    clause: 'Clause 3.1',
    versions: [
      { doc: 'Agreement 2019', ref: 'cl. 3.1', text: 'To 31 Mar 2025', status: 'superseded' },
      { doc: 'Amendment 1 · 2020', ref: 'cl. 4', text: 'To 31 Mar 2027', status: 'in force' },
    ],
  },
  {
    topic: 'Data location',
    clause: 'Clause 18.2',
    versions: [{ doc: 'Agreement 2019', ref: 'cl. 18.2', text: 'UK only', status: 'in force' }],
  },
]

export const inForce = (p: Provision) => p.versions.find(v => v.status === 'in force')!

export const COUNTS = {
  documents: DOCS.length,
  provisions: PROVISIONS.length,
  superseded: PROVISIONS.flatMap(p => p.versions).filter(v => v.status === 'superseded').length,
  notApplied: PROVISIONS.flatMap(p => p.versions).filter(v => v.status === 'not applied').length,
}

export const QUESTION = 'How much notice do we need to give to exit Halden?'
export const ANSWER = {
  lead: '60 days’ written notice.',
  body: 'Amendment 2 (Sep 2023), clause 3 replaced the 90 days in clause 14.1 of the 2019 agreement. The 2024 email mentioning 30 days was never signed as a variation, so it does not apply.',
  sources: ['Amendment 2 · cl. 3', 'Agreement 2019 · cl. 14.1', 'Agreement 2019 · cl. 22'],
}
