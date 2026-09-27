// Inline icons, so symbols render identically on every device regardless of font coverage.

export type IconName = 'braces' | 'cloud' | 'bolt' | 'arrow'

const PATHS: Record<IconName, string> = {
  braces: 'M6 2C4 2 4 3.5 4 5v1.5C4 7.3 3.4 8 2 8c1.4 0 2 .7 2 1.5V11c0 1.5 0 3 2 3M10 2c2 0 2 1.5 2 3v1.5c0 .8.6 1.5 2 1.5-1.4 0-2 .7-2 1.5V11c0 1.5 0 3-2 3',
  cloud: 'M4 12a3 3 0 0 1 .4-6 4 4 0 0 1 7.3 1.3A2.4 2.4 0 0 1 12 12z',
  bolt: 'M9 1 3 9h4l-1 6 6-8H8z',
  arrow: 'M2 8h10M8.5 4.5 12 8l-3.5 3.5',
}

const FILLED: Record<IconName, boolean> = { braces: false, cloud: true, bolt: true, arrow: false }

export function Icon({ name, size = 12 }: { name: IconName; size?: number }) {
  const filled = FILLED[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
