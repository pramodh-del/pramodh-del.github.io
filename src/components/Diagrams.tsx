import { motion } from 'motion/react'
import type { DiagramKey } from '../data/profile'

const S = { stroke: '#14161F', strokeWidth: 1.5 } as const

function Soap() {
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="WebLogic Ant build migrated to a Spring Boot and CXF JAR, WSDL hash identical">
      <rect x="14" y="40" width="150" height="96" rx="6" fill="#FFFFFF" {...S} />
      <text x="30" y="68" className="svg-t b">BEFORE</text>
      <text x="30" y="92" className="svg-t">WebLogic</text>
      <text x="30" y="110" className="svg-t">Ant · wsdlc/jwsc</text>
      <text x="30" y="128" className="svg-t m">javax.*</text>
      <path d="M172 88h66" fill="none" {...S} />
      <path d="M232 82l8 6-8 6" fill="none" {...S} />
      <rect x="248" y="40" width="160" height="96" rx="6" fill="#EAF5E2" {...S} />
      <text x="264" y="68" className="svg-t b">AFTER</text>
      <text x="264" y="92" className="svg-t">Spring Boot 4 · CXF</text>
      <text x="264" y="110" className="svg-t">Maven · Java 21 JAR</text>
      <text x="264" y="128" className="svg-t m">jakarta.*</text>
      <rect x="14" y="176" width="394" height="92" rx="6" fill="#FFFFFF" strokeDasharray="5 4" {...S} />
      <text x="30" y="204" className="svg-t b">WSDL SHA-256</text>
      <text x="30" y="228" className="svg-t">old  C6C9CB…0344A6</text>
      <text x="30" y="250" className="svg-t">new  C6C9CB…0344A6</text>
      <rect x="298" y="206" width="94" height="36" rx="18" fill="#6DB33F" {...S} />
      <text x="318" y="229" className="svg-t b">IDENTICAL</text>
    </svg>
  )
}

function Aws() {
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="API Gateway to VPC Link to ALB to ECS service, publishing to SQS FIFO with a dead letter queue and S3 claim-check">
      <rect x="10" y="30" width="96" height="40" rx="5" fill="#FFF2DC" {...S} />
      <text x="22" y="55" className="svg-t b">API Gateway</text>
      <rect x="162" y="30" width="96" height="40" rx="5" fill="#FFFFFF" {...S} />
      <text x="180" y="55" className="svg-t">VPC Link</text>
      <rect x="314" y="30" width="96" height="40" rx="5" fill="#FFFFFF" {...S} />
      <text x="326" y="55" className="svg-t">internal ALB</text>
      <path d="M106 50h56M258 50h56" {...S} />
      <rect x="236" y="110" width="174" height="52" rx="5" fill="#EAF5E2" {...S} />
      <text x="252" y="132" className="svg-t b">ECS Fargate</text>
      <text x="252" y="150" className="svg-t">Spring Boot · Java 21</text>
      <path d="M362 70v40" {...S} />
      <rect x="10" y="110" width="170" height="52" rx="5" fill="#FFFFFF" {...S} />
      <text x="24" y="132" className="svg-t b">SQS FIFO</text>
      <text x="24" y="150" className="svg-t m">visibility 300s</text>
      <path d="M236 136h-56" {...S} />
      <rect x="10" y="212" width="170" height="52" rx="5" fill="#F7E0DC" {...S} />
      <text x="24" y="234" className="svg-t b">Dead letter queue</text>
      <text x="24" y="252" className="svg-t m">kept 14 days</text>
      <path d="M95 162v50" stroke="#C74634" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x="102" y="192" className="svg-t" style={{ fill: '#C74634' }}>after 5 tries</text>
      <rect x="236" y="212" width="174" height="52" rx="5" fill="#FFFFFF" {...S} />
      <text x="252" y="234" className="svg-t b">S3 claim-check</text>
      <text x="252" y="252" className="svg-t m">large payloads</text>
      <path d="M323 162v50" strokeDasharray="4 3" {...S} />
      {/* A message travelling the happy path. */}
      <motion.circle
        r="5"
        fill="#FF9900"
        stroke="#14161F"
        strokeWidth={1.5}
        initial={{ cx: 58, cy: 50 }}
        animate={{ cx: [58, 210, 362, 362, 323, 180, 95], cy: [50, 50, 50, 136, 136, 136, 136] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
      />
    </svg>
  )
}

function Forms() {
  const exp = [190, 234, 278, 322, 366]
  const dom = [
    ...[190, 234, 278, 322, 366].map((x) => [x, 140]),
    ...[190, 234, 278, 322].map((x) => [x, 178]),
  ]
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="One Oracle Forms monolith split into 5 experience services and 9 domain services">
      <rect x="14" y="80" width="112" height="140" rx="6" fill="#F7E0DC" {...S} />
      <text x="28" y="140" className="svg-t b">Oracle</text>
      <text x="28" y="158" className="svg-t b">Forms</text>
      <text x="28" y="180" className="svg-t m">1 monolith</text>
      <path d="M134 150h40" {...S} />
      <path d="M168 144l8 6-8 6" fill="none" {...S} />
      <text x="190" y="40" className="svg-t b">EXPERIENCE · 5</text>
      {exp.map((x, i) => (
        <motion.g
          key={x}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6, delay: i * 0.06 }}
        >
          <rect x={x} y={52} width={38} height={30} rx={4} fill="#DCE7FF" {...S} />
        </motion.g>
      ))}
      <text x="190" y="128" className="svg-t b">DOMAIN · 9</text>
      {dom.map(([x, y], i) => (
        <motion.g
          key={`${x}-${y}`}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6, delay: 0.3 + i * 0.05 }}
        >
          <rect x={x} y={y} width={38} height={30} rx={4} fill="#FFFFFF" {...S} />
        </motion.g>
      ))}
      <path d="M297 82v58" stroke="#14161F" strokeWidth={1.2} strokeDasharray="3 3" />
      <text x="190" y="246" className="svg-t m">Spring Boot · REST · Spring JDBC</text>
    </svg>
  )
}

function Perf() {
  return (
    <svg viewBox="0 0 420 300" role="img" aria-label="Response time before 180 seconds, after under 60 seconds">
      <text x="20" y="40" className="svg-t b">RESPONSE TIME (seconds)</text>
      <path d="M92 60v170M178 60v170M264 60v170M350 60v170" stroke="#E3E5EB" strokeWidth={1} />
      <text x="20" y="104" className="svg-t">Before</text>
      <motion.rect
        x="92"
        y="84"
        height="34"
        fill="#C74634"
        {...S}
        initial={{ width: 0 }}
        whileInView={{ width: 258 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.215, 0.61, 0.355, 1] }}
      />
      <text x="296" y="106" className="svg-t b" style={{ fill: '#FFFFFF' }}>180s</text>
      <text x="20" y="178" className="svg-t">After</text>
      <motion.rect
        x="92"
        y="158"
        height="34"
        fill="#6DB33F"
        {...S}
        initial={{ width: 0 }}
        whileInView={{ width: 86 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      />
      <text x="188" y="180" className="svg-t b">&lt; 60s</text>
      <text x="88" y="252" className="svg-t m">0</text>
      <text x="168" y="252" className="svg-t m">60</text>
      <text x="252" y="252" className="svg-t m">120</text>
      <text x="338" y="252" className="svg-t m">180</text>
    </svg>
  )
}

export function Diagram({ kind }: { kind: DiagramKey }) {
  switch (kind) {
    case 'soap':
      return <Soap />
    case 'aws':
      return <Aws />
    case 'forms':
      return <Forms />
    case 'perf':
      return <Perf />
  }
}
