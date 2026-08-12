import React from 'react'

/**
 * One stroke-based icon set, drawn on a 24-grid and inheriting currentColor.
 * Keeping these inline (rather than a dependency) means every glyph animates
 * and recolours with CSS, and the bundle stays asset-free.
 */
const P: Record<string, React.ReactNode> = {
  home: <path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  earnings: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M14.8 9.4c-.5-.9-1.6-1.4-2.8-1.4-1.6 0-2.7.8-2.7 2s1 1.7 2.7 2.1c1.9.4 3 .9 3 2.2s-1.2 2.1-3 2.1c-1.4 0-2.5-.6-3-1.5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </>
  ),
  education: <path d="M12 4 2 9l10 5 10-5zM6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5M20 9.6V15" />,
  accessibility: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M4.5 8.2c2.4.9 5 1.3 7.5 1.3s5.1-.4 7.5-1.3M12 9.5v5m0 0-3 6m3-6 3 6" />
    </>
  ),
  research: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4M11 8v6M8 11h6" />
    </>
  ),
  nonprofits: (
    <path d="M12 20.5s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 8.2a4.4 4.4 0 0 1 7.5 2.7c0 5-7.5 9.6-7.5 9.6z" />
  ),
  communities: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16.5 5.6a3 3 0 0 1 0 5.8M18 14.8c2.1.6 3.5 2.2 3.5 4.4" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10.5" width="16" height="10" rx="2.4" />
      <path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1M12 14.6v2.2" />
    </>
  ),
  gpu: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="12" r="2.6" />
      <path d="M14.5 9.6h4M14.5 12h4M14.5 14.4h4" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  wifi: <path d="M2.5 9.2a14 14 0 0 1 19 0M6 12.8a9 9 0 0 1 12 0M9.6 16.4a4 4 0 0 1 4.8 0M12 20h.01" />,
  bolt: <path d="M13.2 2 4 13.4h6.2L10.8 22 20 10.6h-6.2z" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  sliders: <path d="M4 7h9M17 7h3M4 17h4M12 17h8M15 4.5v5M8.5 14.5v5" />,
  heart: <path d="M12 20.3s-7.7-4.7-7.7-9.9a4.5 4.5 0 0 1 7.7-2.8 4.5 4.5 0 0 1 7.7 2.8c0 5.2-7.7 9.9-7.7 9.9z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.8V12l3.4 2" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17a9 9 0 1 1 16 0" />
      <path d="m12 12 4-3" />
      <circle cx="12" cy="17" r="1.4" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.4" />
      <path d="M2.5 10h19M6 14.7h3" />
    </>
  ),
  bell: <path d="M18 8.6a6 6 0 1 0-12 0c0 6-2 7.4-2 7.4h16s-2-1.4-2-7.4M13.7 19.4a2 2 0 0 1-3.4 0" />,
  chev: <path d="m9.5 5.5 7 6.5-7 6.5" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 4 5.6 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.6-4-9s1.4-6.4 4-9z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.6 20c0-3.5 2.9-5.8 6.4-5.8s6.4 2.3 6.4 5.8" />
      <path d="M17 4.9a3.2 3.2 0 0 1 0 6.2M18.5 14.5c1.9.7 3 2.3 3 4.4" />
    </>
  ),
  layers: <path d="m12 3 9 4.8-9 4.8-9-4.8zM3 12.4l9 4.8 9-4.8M3 16.9l9 4.8 9-4.8" />,
  shield: <path d="M12 2.8 4.5 6v6c0 4.6 3.1 8.1 7.5 9.2 4.4-1.1 7.5-4.6 7.5-9.2V6z" />,
  arrow: <path d="M5 12h13m-5-5.5L18.5 12 13 17.5" />,
  spark: <path d="M12 2.6 14 9l6.4 2-6.4 2-2 6.4-2-6.4L3.6 11 10 9zM19 3.4l.7 2.2 2.2.7-2.2.7L19 9.2l-.7-2.2-2.2-.7 2.2-.7z" />,
}

export function Icon({
  name, size = 18, className, strokeWidth = 1.6, fill,
}: {
  name: keyof typeof P | string
  size?: number
  className?: string
  strokeWidth?: number
  fill?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {P[name] ?? P.chip}
    </svg>
  )
}
