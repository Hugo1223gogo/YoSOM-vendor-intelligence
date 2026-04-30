// Inline SVG icons (lucide-style) — no external dep.
const Icon = ({ children, size = 20, color = 'currentColor', strokeWidth = 2, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke={color} strokeWidth={strokeWidth}
       strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

const IconHeart = (p) => (
  <Icon {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </Icon>
);

const IconHeartFill = ({ size = 20, color = '#fff', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconMic = (p) => (
  <Icon {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
  </Icon>
);

const IconSend = (p) => (
  <Icon {...p}>
    <path d="M22 2L11 13"/>
    <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
  </Icon>
);

const IconRefresh = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
    <path d="M3 21v-5h5"/>
  </Icon>
);

const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M20 6L9 17l-5-5"/>
  </Icon>
);

const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14"/>
    <path d="M12 5l7 7-7 7"/>
  </Icon>
);

const IconShare = (p) => (
  <Icon {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/>
  </Icon>
);

const IconSparkle = (p) => (
  <Icon {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/>
    <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/>
  </Icon>
);

const IconUsers = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </Icon>
);

Object.assign(window, {
  Icon, IconHeart, IconHeartFill, IconMic, IconSend, IconRefresh,
  IconCheck, IconArrowRight, IconShare, IconSparkle, IconUsers,
});
