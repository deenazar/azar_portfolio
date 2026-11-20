export const ME = {
  name: 'Azarudeen J',
  role: 'Senior Front-End Engineer',
  company: 'Wipro',
  place: 'Chennai, Tamil Nadu',
  email: 'deenazar1993@gmail.com',
  phone: '+91 99445 95725',
  tel: '+919944595725',
  linkedin: 'https://www.linkedin.com/in/deenazar',
  linkedinLabel: 'linkedin.com/in/deenazar',
  resume: 'Azarudeen_J_Resume.pdf',
  summary:
    'A highly motivated Senior Software Engineer with 9+ years of experience building scalable, high-performance front-end applications using Angular, React and TypeScript. Specialised in crafting elegant, responsive UI experiences with modern frameworks, component libraries and strong design principles.',
}

// c = scroll progress where the chapter is centred. The 3D gate sits just ahead of it.
export const JOBS = [
  { c: 0.31, years: '2016 — 2017', year: '2016', project: 'HMS', company: 'App-Angadi', role: 'Software Developer',
    text: 'A web-based Hotel Management System that streamlined bookings, reservations, staff management and admin tasks — cutting the managers’ workload.',
    tech: ['C#', 'SQL', 'LINQ', 'Normalization', 'OOPs', 'MVVM', 'SOLID'], skills: ['C#', 'SQL', 'LINQ', 'Normalization', 'OOPs & SOLID'] },
  { c: 0.42, years: '2017 — 2019', year: '2017', project: 'Claritas CMS', company: 'PsiberTech', role: 'Software Engineer',
    text: 'An edge-analytics platform that captures camera images, turns them into features and metadata, and triggers alerts through a video-analytics server when set conditions are met.',
    tech: ['Angular 6', 'C#', 'SQL', 'JavaScript', 'Ionic', 'TypeScript'], skills: ['Angular', 'C#', 'SQL', 'JavaScript', 'Ionic', 'TypeScript'] },
  { c: 0.53, years: '2019 — 2021', year: '2019', project: 'Maniacs Sites', company: 'Infosys', role: 'Technology Analyst',
    text: 'UI developer on artist websites for Warner Records, built in Angular — where fans explore artist profiles, book tour tickets, buy merchandise and read news.',
    tech: ['Angular 9', 'HTML', 'CSS', 'Media Queries', 'TypeScript'], skills: ['Angular', 'HTML', 'CSS', 'TypeScript'] },
  { c: 0.64, years: '2021 — 2022', year: '2021', project: 'Prime UI', company: 'Hexaware', role: 'Senior Software Engineer',
    text: 'Migrated a London Stock Exchange application from Silverlight to Angular for better performance and to meet end-of-support deadlines, with multi-country stock updates and value tracking.',
    tech: ['Angular 12', 'HTML5', 'CSS', 'TypeScript', 'Angular Material'], skills: ['Angular', 'HTML', 'CSS', 'TypeScript'] },
  { c: 0.75, years: '2022 — Present', year: '2022', project: 'Recon UI', company: 'Wipro', role: 'Senior Software Engineer', current: true,
    text: 'Modernising a stock trading application in Angular to improve performance and address Silverlight end-of-support — buying and selling with third-party integrations and multi-country market updates.',
    tech: ['Angular 18', 'React JS', 'Redux', 'MFA', 'TypeScript', 'Kendo', 'Git'], skills: ['Angular', 'React', 'Redux', 'TypeScript', 'Git'] },
]

export const CAT = {
  frontend: { label: 'Front-end', color: 'rgb(var(--fg))', mix: 0 },
  backend: { label: 'Backend & data', color: 'rgb(var(--fg) / .68)', mix: 0.32 },
  eng: { label: 'Engineering', color: 'rgb(var(--fg) / .46)', mix: 0.54 },
  learning: { label: 'Learning', color: 'rgb(var(--fg) / .3)', mix: 0.68 },
}

export const SKILLS = [
  ['Angular', 'frontend', 'v2 → 18'], ['React', 'frontend'], ['TypeScript', 'frontend'], ['JavaScript', 'frontend'],
  ['Redux', 'frontend'], ['Zustand', 'frontend'], ['HTML', 'frontend'], ['CSS', 'frontend'], ['Tailwind', 'frontend'], ['Ionic', 'frontend'],
  ['C#', 'backend'], ['SQL', 'backend'], ['LINQ', 'backend'], ['Normalization', 'backend'],
  ['OOPs & SOLID', 'eng'], ['Design Patterns', 'eng'], ['Git', 'eng'], ['TFS', 'eng'],
  ['Python', 'learning'], ['Node.js', 'learning'], ['Azure & CI/CD', 'learning'], ['GenAI', 'learning'],
].map(([name, cat, note]) => ({
  name, cat, note,
  usedIn: JOBS.filter((j) => j.skills.includes(name)).map((j) => j.project),
}))

export const EDU = [
  { title: 'Master of Computer Applications', score: '72%', place: 'Bharathidasan University, Trichy', years: '2013 – 2016' },
  { title: 'B.Sc – Computer Science', score: '78%', place: 'Jamal Mohamed College, Bharathidasan University, Trichy', years: '2011 – 2013' },
  { title: 'Higher Secondary', score: '72%', place: 'St. Joseph’s Higher Sec. School, Trichy', years: '2008 – 2010' },
  { title: 'SSLC', score: '78%', place: 'St. Joseph’s Higher Sec. School, Trichy', years: '2007 – 2008' },
]
export const CERTS = ['C# Boot Camp', 'System Hardware Control', 'Diploma in Computer Applications', 'English Typewriting']

export const CH = [
  { id: 'intro', label: 'Intro', c: 0 },
  { id: 'about', label: 'Profile', c: 0.17 },
  ...JOBS.map((j, i) => ({ id: 'job' + i, label: j.year, c: j.c })),
  { id: 'skills', label: 'Toolbox', c: 0.84 },
  { id: 'edu', label: 'Education', c: 0.91 },
  { id: 'contact', label: 'Contact', c: 0.985 },
]

export const STYLE_NAMES = ['Engraving', 'ASCII', 'Square halftone', 'Cross-hatch', '1-bit dither', 'Contour']
