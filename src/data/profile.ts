import type { IconName } from '../components/Icons'

// Everything the site says lives here, so content changes never touch components.

export type DiagramKey = 'soap' | 'aws' | 'forms' | 'perf'

export interface CaseStudy {
  id: string
  tab: string
  tabLong: string
  color: string
  tabText: string
  when: string
  title: string
  summary: string
  metric: { value: string; label: string }
  details: { term: string; desc: string }[]
  tags: string[]
  badge: string
  diagram: DiagramKey
}

export const profile = {
  name: 'PRAMODH',
  fullName: 'Kadam Pramodh',
  role: 'Backend Engineer',
  city: 'Hyderabad',
  timeZone: 'Asia/Kolkata',
  email: 'pramodhkadam68@gmail.com',
  linkedin: 'https://www.linkedin.com/in/kadam-pramodh-88975432a',
  github: 'https://github.com/pramodh-del',
  availability: 'Open to backend roles',
  tagline: ['I build backend systems', 'that stay up at 2 AM.'],
  about:
    '2 years 4 months at Accenture on a Fortune 500 insurance platform. I design the API, tune the SQL, provision the infrastructure and pick up the production defect when it breaks.',
  lookingFor: 'Open to backend engineering roles at product companies and GCCs. Hyderabad, or remote.',
}

export const chips: { label: string; icon: IconName; bg: string; fg: string }[] = [
  { label: 'Java & Spring Boot', icon: 'braces', bg: 'var(--spring)', fg: 'var(--ink)' },
  { label: 'AWS & Terraform', icon: 'cloud', bg: 'var(--aws)', fg: 'var(--ink)' },
  { label: 'SQL Performance', icon: 'bolt', bg: 'var(--oracle)', fg: '#fff' },
  { label: 'Event-Driven Systems', icon: 'arrow', bg: 'var(--blue)', fg: '#fff' },
]

export const facts = [
  { value: '14', label: 'Services moved off a legacy platform' },
  { value: '26', label: 'SOAP operations migrated, zero contract changes' },
  { value: '3m→<60s', label: 'Production timeout fixed' },
  { value: '80%+', label: 'Unit test coverage, JUnit 5 + Mockito' },
]

export const tickets = [
  { year: '2024', caption: 'May · joined Accenture', bg: '#EAF5E2', rotate: -6 },
  { year: '2026', caption: 'June · promoted to Analyst', bg: '#FFF2DC', rotate: 12 },
]

export const cases: CaseStudy[] = [
  {
    id: 'soap',
    tab: 'Case 01',
    tabLong: 'migration',
    color: 'var(--spring)',
    tabText: 'var(--ink)',
    when: '2026 · Analyst',
    title: 'Moving a 26-operation SOAP platform to Spring Boot without breaking a single client',
    summary:
      'A legacy Group Benefits SOAP service built with WebLogic Ant tooling, moved onto an embedded Spring Boot 4 and Apache CXF JAR on Java 21.',
    metric: { value: '0', label: 'contract changes for existing clients' },
    details: [
      {
        term: 'Problem',
        desc: 'Existing clients had generated stubs from the published WSDL. Any change to names, types or element order would break them.',
      },
      {
        term: 'What I did',
        desc: 'Migrated the build from Ant to Maven, moved javax to jakarta, and rebuilt the service on CXF across three Oracle UCP datasources.',
      },
      { term: 'How I proved it', desc: 'Compared the SHA-256 of the old and new WSDL. Byte-for-byte identical.' },
    ],
    tags: ['Java 21', 'Spring Boot', 'Apache CXF'],
    badge: '26 operations',
    diagram: 'soap',
  },
  {
    id: 'aws',
    tab: 'Case 02',
    tabLong: 'AWS',
    color: 'var(--aws)',
    tabText: 'var(--ink)',
    when: '2026 · Analyst',
    title: 'Retiring IBM MQ for an event-driven publishing service on AWS',
    summary:
      'Rebuilt a Group Benefits event and acknowledgement API on Spring Boot and Java 21, and provisioned its runtime in Terraform.',
    metric: { value: '25 min', label: 'retry window before a message reaches the DLQ' },
    details: [
      {
        term: 'Problem',
        desc: 'Outbound dispatch ran on IBM MQ with a scheduled batch bootstrap. Failed messages had no clean retry or parking path.',
      },
      {
        term: 'What I did',
        desc: 'Provisioned API Gateway, VPC Link, an internal ALB and ECS Fargate in Terraform, with SQS FIFO queues and a 5-attempt redrive to a 14-day dead letter queue. Large payloads go to S3 using the claim-check pattern.',
      },
      {
        term: 'Design choice',
        desc: 'Manual acknowledgement: a message is deleted only after the database commit, so a crash causes a retry, not a lost event.',
      },
    ],
    tags: ['SQS FIFO', 'ECS Fargate', 'Terraform'],
    badge: 'IBM MQ retired',
    diagram: 'aws',
  },
  {
    id: 'forms',
    tab: 'Case 03',
    tabLong: 'modernisation',
    color: 'var(--blue)',
    tabText: '#fff',
    when: '2024–2026 · Associate',
    title: 'Breaking a legacy Oracle Forms platform into 14 Java services',
    summary:
      'A case management platform rebuilt as 5 experience-layer and 9 domain-layer Spring Boot services, with its business rules rewritten as testable service code.',
    metric: { value: '20–40%', label: 'faster responses on frequently used APIs' },
    details: [
      { term: 'Problem', desc: 'Business rules lived inside Oracle Forms and PL/SQL, hard to test and harder to change.' },
      {
        term: 'What I did',
        desc: 'Moved the rules into Spring Boot service layers, built the data access on Spring JDBC, and tuned the SQL with joins, pagination and indexed access paths.',
      },
      {
        term: 'Quality',
        desc: 'Global exception handling with consistent HTTP mapping cut recurring QA defects by 20–30%. Coverage held above 80%.',
      },
    ],
    tags: ['Spring Boot', 'Spring JDBC', 'Oracle'],
    badge: '14 services',
    diagram: 'forms',
  },
  {
    id: 'perf',
    tab: 'Case 04',
    tabLong: 'performance',
    color: 'var(--oracle)',
    tabText: '#fff',
    when: '2025 · Associate',
    title: 'A business-critical flow timing out after 3 minutes',
    summary:
      'A slow endpoint was tripping production gateway timeouts. I traced it through the UI, experience and domain layers down to the query.',
    metric: { value: '70%', label: 'faster, from 3+ minutes to under 60 seconds' },
    details: [
      {
        term: 'Symptom',
        desc: 'Gateway timeouts on one flow, reproducible with a specific filter. Result sets of 15k rows in test and 25k+ in pre-production.',
      },
      {
        term: 'Isolating it',
        desc: 'HAR traces to find the slow call, then timing each hop to separate transport cost from database cost.',
      },
      {
        term: 'Fix',
        desc: 'Paged data retrieval with indexed lookups, so the query returns a bounded page instead of the whole result set.',
      },
    ],
    tags: ['SQL', 'Oracle', 'Pagination'],
    badge: '70% faster',
    diagram: 'perf',
  },
]

export const sideBuilds = [
  {
    tab: 'GenAI · shipped',
    title: 'Defect-triage agent',
    body: 'Drafts root-cause summaries from recurring defect patterns. Triage went from about a day to minutes across 25+ defects, and every draft goes through a human before anyone acts on it.',
    log: [
      [{ t: '> triage DEF-2291' }],
      [{ t: 'reading UI, API and PL/SQL paths…' }],
      [{ t: 'match', k: 'ok' }, { t: ' 3 similar past defects' }],
      [{ t: 'draft RCA ready', k: 'hl' }, { t: ' → ' }, { t: 'awaiting human review', k: 'warn' }],
    ],
  },
  {
    tab: 'Java 21 · next build',
    title: 'A web server from raw sockets',
    body: 'An HTTP server in plain Java 21, built to see exactly what Spring Boot and Tomcat do for me. Coming soon on GitHub.',
    log: [
      [{ t: 'ServerSocket :8080' }],
      [{ t: 'pool core=10 max=18 queue=200' }],
      [{ t: '200', k: 'ok' }, { t: ' GET / · virtual thread' }],
      [{ t: 'rejected', k: 'warn' }, { t: ' task 219 · AbortPolicy' }],
    ],
  },
] as const

export const stack = [
  {
    group: 'Backend',
    color: 'var(--spring)',
    items: [['Java 21', 'daily'], ['Spring Boot'], ['Spring MVC'], ['Spring Data JPA'], ['Hibernate'], ['REST · SOAP'], ['Apache CXF']],
  },
  {
    group: 'Cloud',
    color: 'var(--aws)',
    items: [['AWS', 'certified'], ['SQS FIFO · DLQ'], ['ECS Fargate'], ['S3'], ['API Gateway'], ['Terraform'], ['Docker']],
  },
  {
    group: 'Data',
    color: 'var(--oracle)',
    items: [['Oracle'], ['SQL tuning'], ['Spring JDBC'], ['Indexing'], ['Pagination'], ['UCP pooling']],
  },
  {
    group: 'Delivery',
    color: 'var(--blue)',
    items: [['JUnit 5 · Mockito'], ['Maven'], ['Jenkins · CI/CD'], ['Git'], ['SAFe Agile'], ['Multithreading']],
  },
] as const

export const offClock = {
  text: "I'm usually the one behind the camera. Wildlife when I can get out of the city, friends when I can't, always with something loud playing.",
  exif: ['f/2.8', '1/1000s', 'ISO 200'],
}
