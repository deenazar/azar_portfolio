import { createContext, useContext, useEffect, useState } from 'react'
import { animate, motion, useMotionValueEvent, useTransform } from 'framer-motion'
import { pm, scrollToP } from '../progress'
import { useUI } from '../store'
import { ME, JOBS, SKILLS, CAT, EDU, CERTS, STYLE_NAMES } from '../data'
import { IcPlay, IcArrow, IcDown, IcMail, IcPhone, IcLinked, IcCopy, IcCheck, IcPin, IcClock } from './Icons'

const On = createContext(false)

// One chapter of the tour: fades while the scroll progress crosses [a, b].
function Panel({ a, b, side = 'left', card = true, children }) {
  const f = 0.018
  const op = useTransform(pm, [a - f, a + f, b - f, b + f], [0, 1, 1, 0])
  const y = useTransform(pm, [a - f, a + f, b - f, b + f], [30, 0, 0, -30])
  const vis = useTransform(op, (v) => (v > 0.01 ? 'visible' : 'hidden'))
  const [on, setOn] = useState(a < 0)
  useMotionValueEvent(op, 'change', (v) => setOn((o) => { const n = v > 0.35; return o === n ? o : n }))
  const just = side === 'right' ? 'md:justify-end' : 'md:justify-start'
  return (
    <motion.section style={{ opacity: op, visibility: vis }} className={`pointer-events-none absolute inset-0 flex items-end px-4 pb-24 pt-24 md:items-center md:px-10 md:pb-16 ${just}`}>
      <motion.div style={{ y }} className={`pointer-events-auto ${card ? 'card w-full p-5 md:max-w-[520px] md:p-8' : 'w-full'}`}>
        <On.Provider value={on}>{children}</On.Provider>
      </motion.div>
    </motion.section>
  )
}

// full-screen decorative layer that fades with the scroll range, never blocks clicks
function Layer({ a, b, className = '', children }) {
  const f = 0.018
  const op = useTransform(pm, [a - f, a + f, b - f, b + f], [0, 1, 1, 0])
  const vis = useTransform(op, (v) => (v > 0.01 ? 'visible' : 'hidden'))
  const [on, setOn] = useState(a < 0)
  useMotionValueEvent(op, 'change', (v) => setOn((o) => { const n = v > 0.35; return o === n ? o : n }))
  return (
    <motion.section aria-hidden style={{ opacity: op, visibility: vis }} className={`pointer-events-none absolute inset-0 ${className}`}>
      <On.Provider value={on}>{children}</On.Provider>
    </motion.section>
  )
}

function R({ i = 0, className = '', children, as: Tag = 'div' }) {
  const on = useContext(On)
  return (
    <Tag className={className} style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)', transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${i * 80}ms, transform .7s cubic-bezier(.16,1,.3,1) ${i * 80}ms` }}>
      {children}
    </Tag>
  )
}

// headline: each word slides up out of a mask. *stars* mark the accent colour.
function Words({ text, className = '', i = 0, as: Tag = 'h2' }) {
  const on = useContext(On)
  const tokens = []
  text.split('\n').forEach((line, li) => {
    line.split(/(\*[^*]+\*)/).filter(Boolean).forEach((p) => {
      const acc = p.startsWith('*')
      ;(acc ? p.slice(1, -1) : p).split(' ').filter(Boolean).forEach((w) => tokens.push({ w, acc, br: false }))
    })
    if (li < text.split('\n').length - 1) tokens.push({ br: true })
  })
  return (
    <Tag className={className}>
      {tokens.map((t, n) => t.br ? <br key={n} /> : (
        <span key={n} className="mr-[0.2em] inline-block overflow-hidden pb-[0.12em] align-bottom [margin-bottom:-0.12em]">
          <span className={`inline-block ${t.acc ? 'italic' : ''}`} style={{ transform: on ? 'translateY(0)' : 'translateY(112%)', transition: `transform .9s cubic-bezier(.16,1,.3,1) ${i * 90 + n * 50}ms` }}>{t.w}</span>
        </span>
      ))}
    </Tag>
  )
}

function Count({ to, suffix = '' }) {
  const on = useContext(On)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!on) { setV(0); return }
    const c = animate(0, to, { duration: 1.3, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [on, to])
  return <>{v}{suffix}</>
}

const Eyebrow = ({ n, children }) => (
  <R className="label flex items-center gap-2.5"><span className="bullet" /><span className="text-cream">{n}</span><span>{children}</span></R>
)
const Data = ({ n, children, className = '' }) => (
  <R i={5} className={`absolute hidden md:block ${className}`}>
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em]"><span className="bullet !h-[7px] !w-[7px]" />{n}</div>
    <div className="label mt-0.5 pl-[15px] !text-cream/60">{children}</div>
  </R>
)

function Callout({ i, n, label, text, to, align = 'left' }) {
  const on = useContext(On)
  const [tx, ty] = text, [px, py] = to
  const x1 = align === 'left' ? tx + 15 : tx - 1
  return (
    <>
      <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1={x1} y1={ty} x2={px} y2={py} stroke="currentColor" strokeOpacity=".7" strokeWidth="1" vectorEffect="non-scaling-stroke"
          strokeDasharray="1400" strokeDashoffset={on ? 0 : 1400} style={{ transition: `stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1) ${0.9 + i * 0.18}s` }} />
      </svg>
      <span className="absolute hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream md:block" style={{ left: `${px}%`, top: `${py}%`, opacity: on ? 1 : 0, transition: `opacity .5s ${1.6 + i * 0.18}s` }} />
      <R i={4 + i} className="absolute inset-0 hidden md:block">
        <div style={{ position: 'absolute', left: `${align === 'left' ? tx : tx}%`, top: `${ty}%`, transform: align === 'left' ? 'translate(0,-50%)' : 'translate(0,-50%)' }} className="w-[170px]">
          <div className="font-display text-[2.6rem] leading-none">{n}</div>
          <div className="label mt-1">{label}</div>
        </div>
      </R>
    </>
  )
}

function Badge() {
  const rot = useTransform(pm, [0, 1], [0, 1440])
  return (
    <R i={6} className="absolute right-[5vw] top-[14vh] hidden md:block">
      <motion.div style={{ rotate: rot }}>
        <div className="h-[116px] w-[116px] [animation:spin_28s_linear_infinite]">
          <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
            <defs><path id="ring" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" /></defs>
            <text fontSize="8.4" className="fill-current font-mono uppercase"><textPath href="#ring" textLength="292" lengthAdjust="spacing">Senior front-end engineer · Chennai · 2016 — today ·</textPath></text>
          </svg>
        </div>
      </motion.div>
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
    </R>
  )
}

function Marquee() {
  const x = useTransform(pm, [0, 0.1], [0, -520])
  const word = 'Front-end · Angular · React · TypeScript · '
  return (
    <motion.div style={{ x }} className="absolute left-0 top-[64%] whitespace-nowrap opacity-[0.22]">
      <div className="outline inline-block font-display text-[15vw] leading-none [animation:marquee_60s_linear_infinite]">{word.repeat(4)}</div>
    </motion.div>
  )
}

function Hero() {
  return (
    <>
      <Layer a={-0.2} b={0.085}><Marquee /></Layer>
      <Panel a={-0.2} b={0.085} card={false}>
        <div className="relative h-full min-h-[70vh] w-full">
          <R className="label absolute left-0 top-[9vh] hidden md:block"><span className="bullet mr-2 align-middle" />{ME.name} — {ME.role}</R>
          <Words as="h1" i={1} text={'Front-end\n*that lasts.*'} className="h-display absolute left-0 top-[14vh] text-[clamp(3.4rem,8.2vw,8.4rem)] md:top-[15vh]" />
          <Words as="p" i={3} text={'Built\nto *scale.*'} className="h-display absolute bottom-[12vh] right-0 text-right text-[clamp(2.8rem,6.6vw,6.8rem)] md:bottom-[7vh]" />
          <R i={4} className="absolute bottom-[8vh] left-0 hidden max-w-[230px] text-[12.5px] leading-snug text-cream/85 md:block">
            Senior front-end engineer in Chennai, building scalable, high-performance interfaces with Angular, React and TypeScript.
          </R>
        </div>
      </Panel>
      <Layer a={-0.2} b={0.085}>
        <Callout i={0} n="9+" label="Years in front-end" text={[3.5, 66]} to={[44.5, 47]} />
        <Callout i={1} n="v18" label="Angular in production" text={[69, 13]} to={[57, 27]} align="right" />
        <Callout i={2} n="05" label="Companies · 2016 → today" text={[76, 55]} to={[59.5, 47]} align="right" />
        <Badge />
      </Layer>
    </>
  )
}

function About() {
  return (
    <Panel a={0.125} b={0.225} side="left">
      <Eyebrow n="01">Profile</Eyebrow>
      <Words i={1} text={'Front-end, *engineered*\nto last.'} className="h-display mt-5 text-[clamp(2.9rem,6vw,5rem)]" />
      <R i={3} className="mt-5 text-[14.5px] leading-relaxed text-cream/85">{ME.summary}</R>
      <R i={4} className="mt-6 grid grid-cols-3 gap-3 border-t border-cream/25 pt-5">
        {[[9, '+', 'Years'], [5, '', 'Companies'], [18, '', 'Latest Angular']].map(([n, s, l]) => (
          <div key={l}>
            <div className="font-display text-[2.6rem] font-light leading-none tracking-tight">{l === 'Latest Angular' ? 'v' : ''}<Count to={n} suffix={s} /></div>
            <div className="label mt-2">{l}</div>
          </div>
        ))}
      </R>
    </Panel>
  )
}

function JobAside({ j, i }) {
  const left = i % 2 === 0   // card on the right → aside on the left
  return (
    <Layer a={j.c - 0.045} b={j.c + 0.045}>
      <R className={`label absolute top-[13vh] hidden md:block ${left ? 'left-10' : 'right-10 text-right'}`}>Portrait study 0{i + 1} — {STYLE_NAMES[i]}</R>
      <R i={2} className={`absolute bottom-[10vh] hidden md:block ${left ? 'left-10' : 'right-10 text-right'}`}>
        <div className="outline font-display text-[clamp(3.4rem,7.6vw,8rem)] leading-[0.85]">{j.company}</div>
        <div className="label mt-3">{j.year} · {j.role}</div>
      </R>
    </Layer>
  )
}

function Job({ j, i }) {
  return (
    <Panel a={j.c - 0.045} b={j.c + 0.045} side={i % 2 === 0 ? 'right' : 'left'}>
      <R className="mb-5 flex items-center gap-1.5">
        {JOBS.map((x, k) => (
          <button key={x.c} onClick={() => scrollToP(x.c)} aria-label={`${x.project} ${x.years}`} title={`${x.year} · ${x.project}`}
            className={`h-[3px] flex-1 transition-colors ${k === i ? 'bg-ember' : k < i ? 'bg-cream/60 hover:bg-cream' : 'bg-cream/25 hover:bg-cream/60'}`} />
        ))}
      </R>
      <Eyebrow n={`0${i + 1} / 05`}>{j.years}</Eyebrow>
      <Words i={1} text={j.project} className="h-display mt-4 text-[clamp(2.9rem,6.2vw,5.2rem)]" />
      <R i={3} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.05em]">
        <span className="text-cream">{j.role}</span><span className="opacity-40">/</span><span>{j.company}</span>
        {j.current && <span className="chip !border-ember !text-ember">Present</span>}
      </R>
      <R i={4} className="mt-4 text-[14.5px] leading-relaxed text-cream/85">{j.text}</R>
      <R i={5} className="mt-5 flex flex-wrap gap-1.5">{j.tech.map((t) => <span key={t} className="chip hover:bg-cream hover:text-ink">{t}</span>)}</R>
    </Panel>
  )
}

function Skills() {
  const { cat, setCat, hover } = useUI()
  const h = SKILLS.find((s) => s.name === hover)
  const shown = SKILLS.filter((s) => cat === 'all' || s.cat === cat).length
  return (
    <Panel a={0.805} b={0.875} side="left">
      <Eyebrow n="07">Toolbox</Eyebrow>
      <Words i={1} text={'Pick a *skill.*'} className="h-display mt-4 text-[clamp(2.9rem,6vw,5rem)]" />
      <R i={2} className="mt-3 hidden text-[14px] text-cream/80 sm:block">Drag the sphere · hover a node · click one to filter its group.</R>
      <R i={3} className="mt-4 flex flex-wrap gap-1.5">
        {[['all', 'All'], ...Object.entries(CAT).map(([k, v]) => [k, v.label])].map(([k, l]) => (
          <button key={k} onClick={() => setCat(k)} className={`chip ${cat === k ? '!border-cream !bg-cream !text-ink' : 'hover:border-cream'}`}>
            {k !== 'all' && <i className="mr-1.5 h-[7px] w-[7px]" style={{ background: CAT[k].color }} />}{l}
          </button>
        ))}
      </R>
      <R i={4} className="mt-5 min-h-[72px] border border-cream/25 p-4">
        {h ? (
          <>
            <div className="flex items-baseline justify-between"><span className="font-display text-xl font-medium" style={{ color: CAT[h.cat].color }}>{h.name}</span><span className="label">{CAT[h.cat].label}</span></div>
            <div className="mt-1 text-[13.5px] text-cream/80">{h.cat === 'learning' ? 'Currently learning.' : h.usedIn.length ? <>Used in: {h.usedIn.join(' · ')}</> : 'Core skill.'}{h.note ? ` (${h.note})` : ''}</div>
          </>
        ) : <div className="text-[13.5px] text-cream/65">Showing {shown} of {SKILLS.length} skills. Hover a node →</div>}
      </R>
    </Panel>
  )
}

function Education() {
  return (
    <Panel a={0.885} b={0.935} side="left">
      <Eyebrow n="08">Education</Eyebrow>
      <R i={1} className="mt-4 space-y-3">
        {EDU.map((e) => (
          <div key={e.title} className="flex items-start justify-between gap-4 border-b border-cream/20 pb-3 last:border-0 last:pb-0">
            <div className="min-w-0"><div className="font-display text-[17px] font-medium leading-tight">{e.title}</div><div className="mt-0.5 text-[12.5px] text-cream/65">{e.place}</div></div>
            <div className="shrink-0 text-right"><div className="font-display text-xl font-light text-ember">{e.score}</div><div className="label">{e.years}</div></div>
          </div>
        ))}
      </R>
      <R i={2} className="mt-5 flex flex-wrap gap-1.5">{CERTS.map((c) => <span key={c} className="chip">{c}</span>)}<span className="chip !border-ember !text-ember">English · Tamil</span></R>
    </Panel>
  )
}

function LocalTime() {
  const get = () => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date())
  const [t, setT] = useState(get)
  useEffect(() => { const id = setInterval(() => setT(get()), 15000); return () => clearInterval(id) }, [])
  return <span className="flex items-center gap-2"><IcClock size={14} />{t} in Chennai</span>
}

function Contact() {
  const setToast = useUI((s) => s.setToast)
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(ME.email) } catch {}
    setCopied(true); setToast('Email copied to clipboard'); setTimeout(() => { setCopied(false); setToast(null) }, 1800)
  }
  return (
    <Panel a={0.945} b={1.2} side="left">
      <Eyebrow n="09">Contact</Eyebrow>
      <Words i={1} text={'Let’s build\n*something.*'} className="h-display mt-4 text-[clamp(2.9rem,6vw,5rem)]" />
      <R i={3} className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.05em] text-cream/80"><span className="flex items-center gap-2"><IcPin size={14} />{ME.place}</span><LocalTime /></R>
      <R i={4} className="mt-4 grid gap-2 md:mt-5">
        <button onClick={copy} className="btn-line justify-between !py-2 !normal-case md:!py-2.5"><span className="flex items-center gap-2.5"><IcMail size={16} />{ME.email}</span>{copied ? <IcCheck size={15} /> : <IcCopy size={15} className="opacity-70" />}</button>
        <a href={`tel:${ME.tel}`} className="btn-line !py-2 !normal-case md:!py-2.5"><IcPhone size={16} />{ME.phone}</a>
        <a href={ME.linkedin} target="_blank" rel="noreferrer" className="btn-line !py-2 !normal-case md:!py-2.5"><IcLinked size={16} />{ME.linkedinLabel}</a>
      </R>
      <R i={5} className="mt-4 flex flex-wrap gap-2">
        <a href={`mailto:${ME.email}`} className="btn-solid">Say hello <IcArrow size={14} /></a>
        <a href={ME.resume} download className="btn-line"><IcDown size={14} />Resume</a>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-line hidden sm:inline-flex">↺ Replay</button>
      </R>
    </Panel>
  )
}

export default function Overlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <Hero />
      <About />
      {JOBS.map((j, i) => <JobAside key={'a' + j.c} j={j} i={i} />)}
      {JOBS.map((j, i) => <Job key={j.c} j={j} i={i} />)}
      <Layer a={0.805} b={0.875}><R className="label absolute bottom-[12vh] right-10 hidden text-right md:block">Portrait study 06 — {STYLE_NAMES[5]}</R></Layer>
      <Skills />
      <Education />
      <Contact />
    </div>
  )
}
