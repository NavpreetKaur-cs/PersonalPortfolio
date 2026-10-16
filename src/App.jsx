import { useEffect, useRef, useState } from 'react'
import { projects, skillGroups } from './data/projects'
import './App.css'

const navItems = [
  { label: 'Workspace', href: '/workspace' },
  { label: 'Log', href: '/log' },
  { label: 'Core', href: '/core' },
  { label: 'About', href: '/about' },
  { label: 'Resume', href: '/resume' },
  { label: 'Contact', href: '/contact' },
]

function getPage() {
  return window.location.pathname.replace(/^\//, '') || 'home'
}

function ArrowLink({ children, href = '#contact', variant = 'outline' }) {
  const external = href.startsWith('http')
  return <a className={`button button-${variant}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}<span aria-hidden="true">↗</span></a>
}

function SectionLabel({ index, children }) {
  return <p className="section-label"><span>{index}</span> / {children}</p>
}

function LabCard({ index, title, eyebrow, description, stack, href, tone }) {
  return (
    <a className={`lab-card ${tone}`} href={href}>
      <div className="lab-card-top"><span className="mono">{index}</span><span className="lab-arrow" aria-hidden="true">↗</span></div>
      <div><p className="eyebrow">{eyebrow}</p><h3>{title}</h3><p className="lab-description">{description}</p></div>
      <div className="tag-row">{stack.map((item) => <span key={item}>{item}</span>)}</div>
    </a>
  )
}

function GameGallery({ project }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [isInteracting, setIsInteracting] = useState(false)
  const touchStart = useRef(null)
  const activeImage = project.images[activeIndex]

  useEffect(() => {
    if (!isPlaying || isInteracting || project.images.length < 2) return undefined
    const advanceSlide = () => {
      if (!document.hidden) setActiveIndex((current) => (current + 1) % project.images.length)
    }
    const timer = window.setInterval(advanceSlide, 6000)
    document.addEventListener('visibilitychange', advanceSlide)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', advanceSlide)
    }
  }, [isInteracting, isPlaying, project.images.length])

  const showImage = (index) => {
    setActiveIndex((index + project.images.length) % project.images.length)
    setIsPlaying(false)
  }

  return (
    <div
      className="project-visual game-gallery"
      role="region"
      aria-label={`${project.title} image slideshow`}
      aria-roledescription="carousel"
      aria-describedby={`${project.id}-gallery-help`}
      tabIndex={0}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setIsInteracting(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') setIsInteracting(false)
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'touch' && !event.target.closest('button')) {
          touchStart.current = { x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }
      }}
      onPointerUp={(event) => {
        if (!touchStart.current || event.pointerType !== 'touch') return
        const deltaX = event.clientX - touchStart.current.x
        const deltaY = event.clientY - touchStart.current.y
        touchStart.current = null
        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
          showImage(activeIndex + (deltaX < 0 ? 1 : -1))
        }
      }}
      onPointerCancel={() => {
        touchStart.current = null
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          showImage(activeIndex + (event.key === 'ArrowRight' ? 1 : -1))
        }
      }}
      onFocus={() => setIsInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
      }}
    >
      {project.images.map((image, index) => (
        <figure
          className={`game-gallery-frame ${index === activeIndex ? 'is-active' : ''}`}
          key={image.src}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${project.images.length}: ${image.label}`}
          aria-hidden={index !== activeIndex}
        >
          <img className="game-gallery-image" src={image.src} alt={image.alt} loading="lazy" />
          <figcaption><span>{project.number} / {String(index + 1).padStart(2, '0')}</span>{image.label}</figcaption>
        </figure>
      ))}
      <span className="visual-index">{project.number} / PROJECT GALLERY</span>
      <span className="visual-corner">{String(activeIndex + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}</span>
      {project.images.length > 1 && (
        <div className="game-gallery-controls" aria-label="Slideshow controls">
          <button type="button" aria-label="Previous image" onClick={() => showImage(activeIndex - 1)}>←</button>
          <div className="game-gallery-dots">
            {project.images.map((image, index) => (
              <button
                type="button"
                className={index === activeIndex ? 'is-active' : ''}
                key={image.src}
                aria-label={`Show image ${index + 1}: ${image.label}`}
                aria-pressed={index === activeIndex}
                onClick={() => showImage(index)}
              />
            ))}
          </div>
          <button type="button" aria-label="Next image" onClick={() => showImage(activeIndex + 1)}>→</button>
          <button type="button" aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setIsPlaying(!isPlaying)}>
            <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
          </button>
        </div>
      )}
      <span className="visually-hidden" aria-live={isPlaying ? 'off' : 'polite'} aria-atomic="true">
        {activeIndex + 1} of {project.images.length}: {activeImage.label}
      </span>
      <span className="visually-hidden" id={`${project.id}-gallery-help`}>
        Swipe to change images, or use the slideshow controls. When the slideshow is focused, use the left and right arrow keys to change images.
      </span>
    </div>
  )
}

function GameProject({ project }) {
  return (
    <article className="project-row">
      <GameGallery project={project} />
      <div className="project-copy">
        <div className="project-heading"><span className="project-number">{project.number}</span><div><p className="eyebrow">{project.type}</p><h3>{project.title}</h3></div></div>
        <p className="project-summary">{project.summary}</p>
        <dl className="metadata-grid"><div><dt>ROLE</dt><dd>{project.role}</dd></div><div><dt>ENGINE</dt><dd>{project.engine}</dd></div><div className="focus-cell"><dt>FOCUS</dt><dd>{project.focus.map((item) => <span key={item}>{item}</span>)}</dd></div></dl>
        <div className="project-actions"><ArrowLink href={project.url || project.githubUrl || '/contact'}>View project</ArrowLink><ArrowLink href={project.githubUrl || 'https://github.com/NavpreetKaur-cs'} variant="text">GitHub</ArrowLink></div>
      </div>
    </article>
  )
}

const resumeSkills = [
  ['Languages', 'C++, C, Java, Python, JavaScript, HTML, CSS'],
  ['Core CS', 'Data Structures & Algorithms (Java - primary), OOP, Problem Solving, Computer Architecture'],
  ['AI / ML', 'Machine Learning, Deep Learning, NLP, Computer Vision, NumPy, Pandas, scikit-learn'],
  ['Game Development', 'Unreal Engine 5, C++, Blueprints, Behavior Trees, Blackboard, AI Perception, Blender'],
  ['Web Development', 'Node.js, Express.js, MongoDB, Mongoose, REST APIs, JWT'],
  ['Tools', 'Git, GitHub, VS Code, Postman, Perforce'],
]

const resumeProjects = [
  {
    title: 'ReVesto - Clothing Rental, Resale & Contest Platform',
    stack: 'Node.js | Express.js | MongoDB | JavaScript | JWT',
    bullets: [
      'Developed a full-stack platform supporting clothing rental, resale, product listings and interactive contests.',
      'Implemented JWT authentication, user profiles, reward points, wallet functionality and secure password handling.',
      'Built order management for rental and purchase workflows with administrative controls for users, products and orders.',
      'Designed a marketplace for ethnic wear and wedding clothing with options to list items for rental or resale.',
    ],
  },
  {
    title: 'Echoes of the Valley - 3D Endless Runner',
    stack: 'Unreal Engine 5 | Blueprints',
    bullets: [
      'Built and deployed a 3D endless-runner game with continuous gameplay, obstacle spawning, collision detection and scoring.',
      'Implemented player movement, animation systems, UI, camera mechanics and gameplay logic using Blueprints.',
      'Created a forest environment using Unreal Engine\'s Foliage Tool with lighting, materials, physics and level-design techniques.',
    ],
  },
  {
    title: 'The Last Student - First-Person Horror Game',
    stack: 'Unreal Engine 5 | Blueprints | AI',
    bullets: [
      'Developed a first-person horror game with exploration, puzzles, key-door mechanics and interactive object.',
      'Implemented enemy AI using Behavior Trees, Blackboards and AI Perception for patrol and chase behavior.',
      'Built flashlight mechanics, HUD/UI, contextual interaction prompts, objective-based progression and dynamic lighting.',
    ],
  },
]

function ResumePage() {
  return (
    <section id="resume" className="section-frame resume-section resume-page">
      <div className="resume-heading"><SectionLabel index="08">Resume</SectionLabel><h2>NAVPREET<br /><em>KAUR.</em></h2><p className="resume-role-line">Computer Science & Engineering Student<br />Software Developer | Unreal Engine Developer | AI/ML Learner</p></div>
      <div className="resume-content">
        <div className="resume-contact"><a href="mailto:navpreetnoorpreet212@gmail.com">navpreetnoorpreet212@gmail.com</a><a href="https://leetcode.com/u/Navpreet_kaur25cs/" target="_blank" rel="noreferrer">Leetcode - Navpreet_kaur25cs</a><a href="https://github.com/NavpreetKaur-cs" target="_blank" rel="noreferrer">Github - github.com/NavpreetKaur-cs</a></div>
        <div className="resume-block"><p className="eyebrow">EDUCATION</p><h3>Dr. B. R. Ambedkar National Institute of Technology, Jalandhar</h3><p>NIT Jalandhar, India</p><p>B.Tech. in Computer Science & Engineering | 2025-2029</p><strong>CGPA: 9.33 / 10</strong></div>
        <div className="resume-block"><p className="eyebrow">TECHNICAL SKILLS</p><div className="resume-skill-list">{resumeSkills.map(([title, items]) => <div key={title}><strong>{title}</strong><span>{items}</span></div>)}</div></div>
        <div className="resume-block"><p className="eyebrow">PROJECTS</p><div className="resume-project-list">{resumeProjects.map((project) => <article key={project.title}><h3>{project.title}</h3><strong>{project.stack}</strong><ul>{project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></article>)}</div></div>
        <div className="resume-block resume-columns"><div><p className="eyebrow">ACHIEVEMENTS & ACTIVITIES</p><ul><li>Built and deployed multiple Unreal Engine 5 games.</li><li>Participated in coding and debugging competitions.</li><li>DSA practice primarily in Java, also C++ and Python.</li><li>Exploring Machine Learning, Deep Learning, Computer Vision and NLP through personal learning and projects.</li></ul></div><div><p className="eyebrow">INTERESTS</p><p>Software Engineering | AI/ML | Computer Vision | Game Development | Unreal Engine | Full-Stack Development | DSA (Java)</p></div></div>
        <div className="hero-actions"><ArrowLink href="/contact" variant="solid">Contact me</ArrowLink><ArrowLink href="https://nkverse.itch.io/" variant="outline">itch.io</ArrowLink></div>
      </div>
    </section>
  )
}

function App() {
  const [entered, setEntered] = useState(() => sessionStorage.getItem('nk-portfolio-entered') === 'true')
  const [menuOpen, setMenuOpen] = useState(false)
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const handleNavigation = () => {
      setPage(getPage())
      setMenuOpen(false)
      window.scrollTo(0, 0)
    }

    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  useEffect(() => {
    if (entered) return undefined

    const timer = setTimeout(() => {
      sessionStorage.setItem('nk-portfolio-entered', 'true')
      setEntered(true)
    }, 1300)
    return () => clearTimeout(timer)
  }, [entered])

  const enterSystem = () => {
    sessionStorage.setItem('nk-portfolio-entered', 'true')
    setEntered(true)
    window.history.pushState({}, '', '/workspace')
    setPage('workspace')
  }

  return (
    <div className={`site-shell page-${page}`}>
      <div className={`boot-screen ${entered ? 'boot-screen-hidden' : ''}`} onClick={enterSystem}>
        <div className="boot-grid" /><div className="boot-content"><div className="boot-mark">N//K</div><div className="boot-lines"><span>IDENTITY ........ NAVPREET KAUR</span><span>FIELD ........... COMPUTER SCIENCE & ENGINEERING</span><span>FOCUS ........... SOFTWARE / GAMES / AI-ML</span><span>STATUS .......... ONLINE</span></div><div className="boot-progress"><span /></div><p className="boot-loading">LOADING PORTFOLIO <b>100%</b></p><button className="enter-button" onClick={enterSystem}>[ ENTER ]</button><span className="boot-hint">CLICK ANYWHERE TO SKIP</span></div>
      </div>

      <header className="topbar"><a className="brand" href="/">N//K <span>SYSTEM</span></a><div className="system-status"><i /> SYSTEM STATUS: ONLINE</div><button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button><nav className={menuOpen ? 'nav-open' : ''}>{navItems.map((item) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav></header>

      <main id="top">
        {page === 'home' && <section className="hero section-frame"><div className="hero-aside"><span>00</span><span>IDENTITY / 2026</span></div><div className="hero-content"><p className="eyebrow accent-text">COMPUTER SCIENCE & ENGINEERING STUDENT</p><h1>Building worlds,<br /><em>products & software.</em></h1><p className="hero-intro">Software Developer&nbsp; | &nbsp;Unreal Engine Developer&nbsp; | &nbsp;AI/ML Learner</p><div className="hero-actions"><ArrowLink href="/workspace" variant="solid">Explore work</ArrowLink><ArrowLink href="https://github.com/NavpreetKaur-cs" variant="outline">GitHub</ArrowLink><ArrowLink href="/resume" variant="text">Resume</ArrowLink></div></div><div className="hero-focus"><span>PRIMARY AREAS</span><strong>01 / GAME DEVELOPMENT</strong><strong>02 / SOFTWARE DEVELOPMENT</strong><strong>03 / AI / ML LEARNING</strong></div></section>}

        <section id="workspace" className="section-frame workspace-section"><div className="section-head"><div><SectionLabel index="01">Workspace</SectionLabel><h2>THREE PLACES<br /><em>TO BUILD.</em></h2></div><p className="section-note">The N//K system is organized as a working environment: a place for shipped projects, software experiments, and skills still in motion.</p></div><div className="lab-grid"><LabCard index="01" title="GAME LAB" eyebrow="Interactive worlds" description="Gameplay, mechanics, and environments made in Unreal Engine." stack={['Unreal Engine 5', 'C++', 'Blueprints']} href="/game-lab" tone="lab-game" /><LabCard index="02" title="DEV LAB" eyebrow="Useful products" description="Full-stack systems that connect interfaces, APIs, and data." stack={['React', 'Node.js', 'MongoDB']} href="/dev-lab" tone="lab-dev" /><LabCard index="03" title="LEARNING LAB" eyebrow="Currently exploring" description="AI / ML, computer vision, and NLP as an active learning direction." stack={['Python', 'AI / ML', 'NLP']} href="/learning-lab" tone="lab-learning" /></div></section>

        <section id="game-lab" className="section-frame lab-section"><div className="section-head"><div><SectionLabel index="02">Game Lab</SectionLabel><h2>UNREAL ENGINE<br /><em>DEVELOPMENT.</em></h2></div><p className="section-note">Interactive experiences built and deployed with Unreal Engine. No invented features, just the work and the direction.</p></div><div className="project-list">{projects.filter((project) => project.lab === 'GAME LAB').map((project) => <GameProject key={project.id} project={project} />)}</div></section>

        <section id="dev-lab" className="section-frame dev-section"><div className="section-head"><div><SectionLabel index="03">Dev Lab</SectionLabel><h2>SOFTWARE &<br /><em>FULL-STACK DEVELOPMENT.</em></h2></div><p className="section-note">A focused case study in building one platform around three connected ways to participate.</p></div><div className="revesto-feature"><div className="revesto-intro"><p className="eyebrow accent-text">FEATURED PROJECT / 03</p><h3>REVESTO</h3><p>Platform / Full-stack</p><p className="project-summary">A platform combining rental, resale, and contests. ReVesto is built around more than a single marketplace flow.</p><ArrowLink href="https://github.com/NavpreetKaur-cs/resale-rent-project">View project</ArrowLink></div><div className="revesto-map"><span className="map-label">ONE PLATFORM</span><div className="map-core">REVESTO</div><div className="map-branches"><span>RENTAL</span><span>RESALE</span><span>CONTESTS</span></div></div></div><div className="case-study-grid"><div><p className="eyebrow">OVERVIEW</p><p className="case-copy">ReVesto brings rental, resale, and contests into a single product direction. Details beyond this concept are intentionally left open for the next iteration.</p></div><div><p className="eyebrow">FEATURES</p><div className="case-list"><span>Rental</span><span>Resale</span><span>Contests</span></div></div><div><p className="eyebrow">TECHNOLOGY</p><div className="case-list"><span>React</span><span>Node.js / Express</span><span>MongoDB</span><span>JWT / REST APIs</span></div></div><div className="architecture"><p className="eyebrow">ARCHITECTURE</p><div className="architecture-flow"><span>FRONTEND</span><b>↓</b><span>REST API</span><b>↓</b><span>NODE.JS / EXPRESS</span><b>↓</b><span>MONGODB</span></div></div></div></section>

        <section id="learning-lab" className="section-frame learning-section"><div className="section-head"><div><SectionLabel index="04">Learning Lab</SectionLabel><h2>SKILLS IN<br /><em>PROGRESS.</em></h2></div><div className="exploring-badge"><i /> CURRENTLY EXPLORING <strong>AI / ML</strong></div></div><div className="skill-grid">{skillGroups.map((group) => <div className="skill-group" key={group.title}><div className="skill-group-head"><h3>{group.title}</h3>{group.note && <span>{group.note}</span>}</div><div className="skill-items">{group.items.map((item) => <span key={item}>{item}</span>)}</div></div>)}</div></section>

        <section id="log" className="section-frame log-section"><div className="section-head"><div><SectionLabel index="05">Log</SectionLabel><h2>THE WORK<br /><em>SO FAR.</em></h2></div><p className="section-note">A project-led development journey. There are no invented roles here, only the things I am building and learning.</p></div><div className="timeline"><div className="timeline-entry"><span className="timeline-year">2026</span><div><p className="eyebrow">GAME DEVELOPMENT</p><h3>Echoes of the Valley</h3><p>Endless Runner</p><h3>The Last Student</h3><p>Horror Game</p></div></div><div className="timeline-entry"><span className="timeline-year">2026</span><div><p className="eyebrow">FULL-STACK DEVELOPMENT</p><h3>ReVesto</h3><p>Rental · Resale · Contests</p></div></div><div className="timeline-entry"><span className="timeline-year">CURRENT</span><div><p className="eyebrow">LEARNING</p><h3>AI / ML</h3><p>Computer Vision · NLP</p></div></div></div></section>

        <section id="core" className="section-frame core-section"><div className="section-head"><div><SectionLabel index="06">Core</SectionLabel><h2>FUNDAMENTALS<br /><em>FIRST.</em></h2></div><p className="section-note">Computer science fundamentals are the base layer. DSA is primarily practiced in Java.</p></div><div className="core-grid"><div className="core-list">{['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Recursion'].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}</div><div className="core-side"><p className="eyebrow">PRIMARY DSA LANGUAGE</p><strong>JAVA</strong><p className="eyebrow">PRACTICE LOG</p><a href="https://leetcode.com/u/Navpreet_kaur25cs/" target="_blank" rel="noreferrer">Leetcode — Navpreet_kaur25cs ↗</a><a href="https://github.com/NavpreetKaur-cs" target="_blank" rel="noreferrer">Github — github.com/NavpreetKaur-cs ↗</a></div></div></section>

        <section id="about" className="section-frame about-section"><SectionLabel index="07">About</SectionLabel><div className="about-content"><h2>CURIOUS BY DEFAULT,<br /><em>PRECISE BY PRACTICE.</em></h2><p>I&apos;m Navpreet Kaur, a Computer Science student at NIT Jalandhar.<br /><br />I enjoy building across different areas of technology — from interactive experiences in Unreal Engine to full-stack applications and emerging AI/ML technologies.<br /><br />Currently, I&apos;m focused on strengthening my software engineering, game development, and AI/ML skills through hands-on projects.</p></div></section>

        <ResumePage />

        <section id="contact" className="section-frame contact-section"><div><SectionLabel index="09">Contact</SectionLabel><h2>READY TO<br /><em>BUILD?</em></h2></div><div className="contact-copy"><p>I&apos;m open to interesting projects, collaborations and opportunities.</p><div className="contact-links"><a href="mailto:navpreetnoorpreet212@gmail.com">Email — navpreetnoorpreet212@gmail.com <span>↗</span></a><a href="https://github.com/NavpreetKaur-cs" target="_blank" rel="noreferrer">Github — github.com/NavpreetKaur-cs <span>↗</span></a><a href="https://www.linkedin.com/in/navpreet-k-967b78383/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a><a href="https://nkverse.itch.io/" target="_blank" rel="noreferrer">itch.io — nkverse.itch.io <span>↗</span></a></div></div></section>
      </main>

      <footer><a className="brand" href="/">N//K</a><span>BUILDING WORLDS, PRODUCTS & SOFTWARE</span><span>SYSTEM STATUS: ONLINE</span></footer>
    </div>
  )
}

export default App
