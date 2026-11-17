const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const landingIcons = {
  team: <><circle cx="9" cy="8.5" r="3" {...stroke} /><circle cx="16.5" cy="9.5" r="2.3" {...stroke} /><path d="M3.5 19c.6-3.2 2.6-5 5.5-5s4.9 1.8 5.5 5M14.5 14.4c.6-.3 1.3-.4 2-.4 2.2 0 3.6 1.5 4 4.5" {...stroke} /></>,
  chart: <path d="M4 20h16M6 20v-5h2.6v5M10.7 20v-8h2.6v8M15.4 20v-6H18v6M5 11l5-4 3 2.5L19 4m0 0h-3.5M19 4v3.5" {...stroke} />,
  gear: <><circle cx="12" cy="12" r="3" {...stroke} /><path d="M10.3 3.5h3.4l.5 2.4 1.8 1 2.3-.8 1.7 3-1.8 1.6v2.1l1.8 1.6-1.7 3-2.3-.8-1.8 1-.5 2.4h-3.4l-.5-2.4-1.8-1-2.3.8-1.7-3 1.8-1.6v-2.1L3.7 9.1l1.7-3 2.3.8 1.8-1 .8-2.4Z" {...stroke} /></>,
  clock: <><circle cx="12" cy="12" r="8" {...stroke} /><path d="M12 7.5V12l3 2" {...stroke} /></>,
  coins: <><ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" {...stroke} /><path d="M5.5 6.5v5.5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6.5M5.5 12v5.5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V12" {...stroke} /></>,
  target: <><circle cx="12" cy="12" r="8" {...stroke} /><circle cx="12" cy="12" r="4" {...stroke} /><path d="M12 12l6-6M15.5 5.5H18.5V8.5" {...stroke} /></>,
  pen: <path d="M4.5 19.5 5.5 15 15.5 5a2.1 2.1 0 0 1 3 3L8.5 18l-4 1.5ZM13.5 7l3 3" {...stroke} />,
  bars: <path d="M4 20h16M6.5 20v-6M11 20V9M15.5 20V5" {...stroke} strokeWidth="2.6" />,
  check: <path d="M5 12.5 9.5 17 19 7.5" {...stroke} />,
  shield: <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6l7-2.5ZM9 12l2 2 4-4.5" {...stroke} />,
  lock: <><rect x="6" y="10.5" width="12" height="9" rx="2" {...stroke} /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" {...stroke} /></>,
  globe: <><circle cx="12" cy="12" r="8" {...stroke} /><path d="M4 12h16M12 4c2.2 2.3 3.2 5 3.2 8s-1 5.7-3.2 8c-2.2-2.3-3.2-5-3.2-8s1-5.7 3.2-8Z" {...stroke} /></>,
  image: <><rect x="4" y="5" width="16" height="14" rx="2" {...stroke} /><path d="m4 16 4.5-4.5 3.5 3.5 2.5-2.5L20 17.5" {...stroke} /><circle cx="15.5" cy="9" r="1.5" {...stroke} /></>,
  video: <><rect x="3.5" y="6" width="12.5" height="12" rx="2" {...stroke} /><path d="m16 10.5 4.5-2.5v8l-4.5-2.5" {...stroke} /></>,
  text: <path d="M6 4.5h8l4 4v11H6zM14 4.5v4h4M9 12.5h6M9 15.5h6" {...stroke} />,
  audio: <path d="M5 10v4M8.5 7v10M12 4.5v15M15.5 8v8M19 10.5v3" {...stroke} />,
  search: <><circle cx="10.5" cy="10.5" r="6" {...stroke} /><path d="m15 15 4.5 4.5M8 10.5l1.8 1.8 3-3.3" {...stroke} /></>,
  health: <path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.1c0 5.1-7 9.4-7 9.4ZM9 12h1.8l1-2 1.6 4 1-2H16" {...stroke} />,
  sports: <><circle cx="12" cy="12" r="8" {...stroke} /><path d="m12 8 3 2.2-1.1 3.6h-3.8L9 10.2 12 8ZM12 4v4M15 10.2l4.5-1.5M13.9 13.8l2.6 4M10.1 13.8l-2.6 4M9 10.2 4.5 8.7" {...stroke} /></>,
  car: <><path d="M5 15.5V12l1.8-4.2A2 2 0 0 1 8.6 6.5h6.8a2 2 0 0 1 1.8 1.3L19 12v3.5H5ZM5 12h14" {...stroke} /><circle cx="8" cy="15.5" r="1.8" {...stroke} /><circle cx="16" cy="15.5" r="1.8" {...stroke} /></>,
  book: <path d="M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5v-13ZM12 6v13" {...stroke} />,
  wallet: <><path d="M4.5 7.5h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-10Zm0 0 9.5-3v3" {...stroke} /><circle cx="16" cy="13.5" r="1.2" {...stroke} /></>,
  bell: <path d="M6.5 16.5h11l-1.3-2V10a4.2 4.2 0 0 0-8.4 0v4.5l-1.3 2ZM10.5 19a1.6 1.6 0 0 0 3 0" {...stroke} />,
  calendar: <><rect x="4.5" y="5.5" width="15" height="14" rx="2" {...stroke} /><path d="M4.5 10h15M9 3.5v4M15 3.5v4M8.5 14l2 2 4-4" {...stroke} /></>,
  clipboard: <><rect x="6" y="5" width="12" height="15" rx="2" {...stroke} /><path d="M9.5 5V3.5h5V5M9 10h6M9 13.5h6M9 17h4" {...stroke} /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" {...stroke} /><path d="M5 20c.8-3.8 3.4-6 7-6s6.2 2.2 7 6" {...stroke} /></>,
  headset: <path d="M5 14v-2a7 7 0 0 1 14 0v2M5 14a2 2 0 0 0 2 2h1v-5H7a2 2 0 0 0-2 2v1Zm14 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1Zm-3 2.5c0 2-1.8 3-4 3" {...stroke} />,
  leaf: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14H5Zm0 0 9-9" {...stroke} />,
  bulb: <path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.7.5 1.2 1.3 1.2 2.2v.8h4v-.8c0-.9.5-1.7 1.2-2.2A5.5 5.5 0 0 0 12 3.5ZM10 19.5h4M10.8 21.5h2.4" {...stroke} />,
  star: <path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L12 3.8Z" {...stroke} />,
  chat: <path d="M5 6.5h14v9H10l-4 3v-3H5v-9ZM8.5 10.5h7M8.5 13h4" {...stroke} />,
}

// Default icon rotation for pages generated from plain data.
export const iconCycle = ['target', 'gear', 'chart', 'team', 'shield', 'search', 'clock', 'globe']

export function LandingIcon({ name, tone = 'red' }) {
  return (
    <span className={`ms-icon ms-icon--${tone}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{landingIcons[name] || landingIcons.check}</svg>
    </span>
  )
}
