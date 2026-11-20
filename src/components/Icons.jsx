const S = ({ children, size = 20, className = '', sw = 1.8, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...p}>{children}</svg>
)
export const IcPlay = (p) => <S {...p}><path d="M7 4.6c0-.8.9-1.3 1.6-.9l10.2 6.4c.6.4.6 1.4 0 1.8L8.6 18.3c-.7.4-1.6-.1-1.6-.9Z" fill="currentColor" /></S>
export const IcPause = (p) => <S {...p}><path d="M8 5v14M16 5v14" strokeWidth="3" /></S>
export const IcArrow = (p) => <S {...p}><path d="M4.2 12.3c5.3-.4 10.4-.5 15.4-.3M14.4 6.6c1.8 2 3.6 3.8 5.4 5.4-1.9 1.6-3.7 3.4-5.3 5.4" /></S>
export const IcDown = (p) => <S {...p}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></S>
export const IcMail = (p) => <S {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7.5 8 6 8-6" /></S>
export const IcPhone = (p) => <S {...p}><path d="M5.1 3.5h3l1.6 4.2-2 1.4c1 2.3 2.9 4.2 5.2 5.2l1.4-2 4.2 1.6v3c0 1.2-1 2.1-2.2 2C9.6 18.5 5.5 14.4 3.1 5.7c-.1-1.2.8-2.2 2-2.2Z" /></S>
export const IcLinked = (p) => <S {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" /><path d="M8 10.5V16M8 7.8v.1M12 16v-5.5M12 13c0-1.5 1-2.5 2.3-2.5S16.5 11.4 16.5 13V16" /></S>
export const IcCopy = (p) => <S {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></S>
export const IcCheck = (p) => <S {...p}><path d="M4.5 12.8c1.6 1.4 3.1 3 4.5 4.6 3.3-4.4 6.8-8.4 10.5-11.8" /></S>
export const IcPin = (p) => <S {...p}><path d="M12 21.2c-3.9-4.5-6.6-8.1-6.5-11.3C5.6 6.2 8.4 3.1 12 3.1s6.5 3 6.5 6.8c0 3.2-2.7 6.8-6.5 11.3Z" /><circle cx="12" cy="9.8" r="2.3" /></S>
export const IcClock = (p) => <S {...p}><circle cx="12" cy="12" r="8.8" /><path d="M12 6.8v5.4l3.4 2.1" /></S>
