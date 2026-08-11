import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowUpRight, BookOpen, ChevronDown, Compass, Headphones, Menu, Pause, Play, Radio, Sparkles, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Admin from '@/pages/admin';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { getAllPublishedStories, getPublishedStories, stories, type Story } from '@/data/stories';

const queryClient = new QueryClient();

const sections = [
  { href: '#story', label: 'The story' },
  { href: '#listen', label: 'Listen' },
  { href: '#world', label: 'The world' },
  { href: '#house', label: 'The house' },
];

function Mark({ inverse = false, prominent = false }: { inverse?: boolean; prominent?: boolean }) {
  return (
    <span className={`flex items-center ${prominent ? 'gap-3.5' : 'gap-3'} ${inverse ? 'text-[hsl(var(--background))]' : 'text-[hsl(var(--foreground))]'}`}>
      <span className={`relative flex items-center justify-center rounded-full border border-current ${prominent ? 'h-10 w-10' : 'h-8 w-8'}`}>
        <span className={`${prominent ? 'h-3 w-3' : 'h-2.5 w-2.5'} rounded-full bg-[hsl(var(--primary))]`} />
        <span className="absolute -right-1 top-1 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
      </span>
      <span className={`font-mono-label font-medium tracking-[.22em] ${prominent ? 'text-[13px] font-semibold' : 'text-[11px]'}`}>BANCOL</span>
    </span>
  );
}

function Spiral({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path d="M70 11c34 0 59 24 59 55 0 36-28 63-64 63-34 0-55-23-55-52 0-28 22-48 48-48 25 0 42 17 42 39 0 20-16 34-36 34-18 0-30-12-30-28 0-14 11-24 25-24 12 0 21 8 21 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${scrolled ? 'border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.92)] backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
        <a href="#top" aria-label="BANCOL home" className="header-mark"><Mark inverse={!scrolled} prominent /></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {sections.map((section) => <a key={section.href} href={section.href} className="font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--foreground)/.72)] transition-colors hover:text-[hsl(var(--primary))]">{section.label}</a>)}
        </nav>
        <button onClick={onOpenMenu} className="flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.16em] md:hidden" aria-label="Open navigation"><Menu size={18} /> Menu</button>
        <a href="#house" className="hidden items-center gap-2 rounded-full border border-[hsl(var(--foreground)/.25)] px-4 py-2 font-mono-label text-[10px] uppercase tracking-[.13em] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] sm:flex">Enter the house <ArrowUpRight size={13} /></a>
      </div>
    </header>
  );
}

function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[hsl(var(--secondary))] p-6 text-[hsl(var(--background))] md:hidden">
      <div className="flex items-center justify-between"><Mark inverse /><button onClick={close} aria-label="Close navigation"><X /></button></div>
      <nav className="mt-20 flex flex-col gap-7" aria-label="Mobile navigation">
        {sections.map((section, index) => <a onClick={close} key={section.href} href={section.href} className="font-display text-5xl italic">{String(index + 1).padStart(2, '0')} <span className="not-italic">{section.label}</span></a>)}
      </nav>
      <p className="mt-auto max-w-xs font-mono-label text-[10px] uppercase leading-relaxed tracking-[.14em] text-[hsl(var(--background)/.6)]">Stories, games, songs and cultural experiences — made to be carried forward.</p>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="hero relative flex min-h-[92dvh] items-end overflow-hidden bg-[hsl(var(--secondary))] text-[hsl(var(--background))]">
      <div className="hero-glow absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,hsl(var(--primary)/.32),transparent_36%),linear-gradient(110deg,hsl(var(--secondary))_34%,transparent_77%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--secondary))] via-transparent to-[hsl(var(--secondary)/.15)]" />
      <div className="relative mx-auto grid w-full max-w-[1440px] items-end gap-12 px-5 pb-14 pt-36 md:grid-cols-[1.15fr_.85fr] md:px-10 md:pb-20">
        <div className="reveal max-w-4xl">
          <p className="hero-eyebrow font-mono-label mb-7 text-[10px] uppercase tracking-[.24em] text-[hsl(var(--accent))]">A living home for African culture</p>
          <h1 className="hero-title font-display text-[clamp(4.8rem,13vw,12.5rem)] leading-[.76] tracking-[-.045em]">Stories<br /><span className="ml-[.16em] italic text-[hsl(var(--accent))]">live here.</span></h1>
          <div className="hero-actions mt-10 flex flex-wrap items-center gap-4">
            <a href="#story" className="group flex items-center gap-3 rounded-full bg-[hsl(var(--accent))] px-5 py-3 font-mono-label text-[10px] uppercase tracking-[.12em] text-[hsl(var(--secondary))] transition-transform hover:scale-[1.03]">Explore stories <ArrowDown size={14} className="transition-transform group-hover:translate-y-1" /></a>
            <a href="#house" className="flex items-center gap-3 rounded-full border border-[hsl(var(--background)/.4)] px-5 py-3 font-mono-label text-[10px] uppercase tracking-[.12em] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"><Compass size={14} /> Enter the house</a>
          </div>
        </div>
        <div className="reveal reveal-delay-2 mb-1 max-w-xs md:justify-self-end">
          <p className="border-l border-[hsl(var(--accent)/.7)] pl-5 font-display text-2xl leading-tight text-[hsl(var(--background)/.82)]">“Before there were many, there were two — and a world waiting to be made.”</p>
          <p className="mt-5 pl-5 font-mono-label text-[9px] uppercase tracking-[.17em] text-[hsl(var(--background)/.48)]">A BANCOL story hub · 001</p>
        </div>
      </div>
      <div className="absolute bottom-6 left-5 hidden font-mono-label text-[9px] uppercase tracking-[.2em] text-[hsl(var(--background)/.4)] md:left-10 md:block">Scroll to enter</div>
      <Spiral className="hero-spiral absolute -bottom-12 right-[-10px] h-44 w-44 text-[hsl(var(--accent)/.55)] md:h-64 md:w-64" />
    </section>
  );
}

function Introduction() {
  return (
    <section className="bg-[hsl(var(--background))] px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[.36fr_1fr]">
        <div className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">01 / A beginning</div>
        <div>
          <h2 className="max-w-4xl font-display text-5xl leading-[.92] tracking-[-.02em] md:text-8xl">A story is a home<br /><span className="italic text-[hsl(var(--primary))]">you can return to.</span></h2>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))] md:text-xl">BANCOL is a living home for African stories, games, songs and cultural experiences. It brings together the stories we inherit, the ways we play and the cultural worlds we create together.</p>
          <div className="mt-10 flex items-center gap-4 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--foreground)/.6)]"><span className="h-px w-12 bg-[hsl(var(--primary))]" /> Read, listen, look closer.</div>
        </div>
      </div>
    </section>
  );
}

function StorySection({ onRead, storyList }: { onRead: (story: Story) => void; storyList: Story[] }) {
  return (
    <section id="story" className="overflow-hidden bg-[hsl(var(--primary))] px-5 py-24 text-[hsl(var(--background))] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-start justify-between gap-5">
          <div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--background)/.68)]">02 / The story library</p><h2 className="mt-7 max-w-3xl font-display text-6xl leading-[.85] md:text-9xl">Stories to<br /><span className="italic">return to.</span></h2></div>
          <span className="font-mono-label mt-1 text-[10px] text-[hsl(var(--background)/.5)]">{storyList.length} {storyList.length === 1 ? 'story' : 'stories'}</span>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {storyList.map((story) => <article key={story.id} className="group overflow-hidden border border-[hsl(var(--background)/.28)] bg-[hsl(var(--secondary)/.12)]">
            <img src={story.image} alt={story.imageAlt} className="aspect-[16/9] w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105" />
            <div className="p-6"><div className="flex justify-between gap-4 font-mono-label text-[9px] uppercase tracking-[.14em] text-[hsl(var(--background)/.62)]"><span>{story.number} / {story.origin}</span><span className="shrink-0">{story.readTime}</span></div><h3 className="mt-8 font-display text-5xl leading-[.85]">{story.title}{story.titleAccent && <><br /><span className="italic">{story.titleAccent}</span></>}</h3><p className="mt-6 max-w-md text-sm leading-relaxed text-[hsl(var(--background)/.72)]">{story.description}</p><button onClick={() => onRead(story)} className="story-link mt-8 flex items-center gap-3 border-b border-[hsl(var(--accent))] pb-2 font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--accent))]">Read this story <ArrowUpRight size={15} /></button></div>
          </article>)}
        </div>
        <div className="mt-20 hidden grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
          <div className="relative aspect-[4/5] overflow-hidden bg-[hsl(var(--secondary))]">
            <img src="/kintu-nambi-hero.png" alt="Kintu and Nambi beneath a fig tree" className="h-full w-full object-cover grayscale-[.2] opacity-70 transition-transform duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--secondary)/.85)] to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-mono-label text-[9px] uppercase leading-relaxed tracking-[.15em] text-[hsl(var(--background)/.7)]">A visual study for the first BANCOL story film<br />In development</p>
          </div>
          <div className="md:pb-2">
            <p className="max-w-xl font-display text-3xl leading-[1.05] md:text-5xl">Kintu lived alone on the earth. He had cattle, and the open land, and the quiet that comes before a world fills with voices.</p>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-[hsl(var(--background)/.72)]">Then came Nambi. With her arrival, the shape of life changed — and with it, the beginning of a people, a place, and a story still being told.</p>
            <button onClick={() => onRead(stories[0])} className="story-link mt-10 flex items-center gap-3 border-b border-[hsl(var(--accent))] pb-2 font-mono-label text-[10px] uppercase tracking-[.16em] text-[hsl(var(--accent))]">Open the reading room <ArrowUpRight size={15} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListenSection() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(34);
  return (
    <section id="listen" className="bg-[hsl(var(--secondary))] px-5 py-24 text-[hsl(var(--background))] md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1180px] gap-14 md:grid-cols-[.8fr_1.2fr] md:items-center">
        <div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">03 / Listen closely</p><h2 className="mt-7 font-display text-6xl leading-[.88] md:text-8xl">Stories<br /><span className="italic text-[hsl(var(--accent))]">have breath.</span></h2><p className="mt-7 max-w-sm leading-relaxed text-[hsl(var(--background)/.62)]">BANCOL's listening room is being shaped for stories, music and the voices that carry culture forward.</p></div>
        <div className="border border-[hsl(var(--background)/.2)] p-5 md:p-8">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]"><Radio size={17} /></span><div><p className="font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--accent))]">Story audio · preview</p><p className="mt-1 font-display text-2xl">The beginning of things</p></div></div><span className="font-mono-label text-[10px] text-[hsl(var(--background)/.46)]">00:48</span></div>
          <div className="mt-12 flex items-center gap-4"><button onClick={() => setPlaying(!playing)} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--secondary))] transition-transform hover:scale-105" aria-label={playing ? 'Pause audio' : 'Play audio'}>{playing ? <Pause size={19} /> : <Play size={19} fill="currentColor" />}</button><div className="w-full"><div className="relative h-1 cursor-pointer bg-[hsl(var(--background)/.18)]" onClick={(event) => { const box = event.currentTarget.getBoundingClientRect(); setProgress(((event.clientX - box.left) / box.width) * 100); }}><span className="absolute inset-y-0 left-0 bg-[hsl(var(--accent))]" style={{ width: `${progress}%` }} /><span className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[hsl(var(--accent))]" style={{ left: `${progress}%` }} /></div><div className="mt-3 flex justify-between font-mono-label text-[9px] text-[hsl(var(--background)/.45)]"><span>00:16</span><span>Coming soon</span></div></div></div>
          <div className="mt-10 flex items-center gap-2 font-mono-label text-[9px] uppercase tracking-[.14em] text-[hsl(var(--background)/.48)]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /> Narration is in the making</div>
        </div>
      </div>
    </section>
  );
}

function WorldSection() {
  const details = [
    { number: '01', title: 'The Baganda', text: 'A cultural context guide is being shaped with care, so the legend can be met alongside the people and place it comes from.' },
    { number: '02', title: 'The setting', text: 'Central Uganda, where landscape, cattle, weather and the space between voices give the story its first atmosphere.' },
    { number: '03', title: 'Many tellings', text: 'Oral traditions live through variation. This story hub will make room for context, versions and the questions they open.' },
  ];
  return (
    <section id="world" className="bg-[hsl(var(--background))] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1180px]"><div className="grid gap-8 md:grid-cols-[.55fr_1fr]"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">04 / Look closer</p><Spiral className="mt-12 hidden h-36 w-36 text-[hsl(var(--primary)/.55)] md:block" /></div><div><h2 className="font-display text-6xl leading-[.88] md:text-8xl">A legend is<br /><span className="italic text-[hsl(var(--primary))]">more than plot.</span></h2><p className="mt-8 max-w-xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">It is a doorway into the knowledge around it. BANCOL stories will be entertaining, but never flattened — a place to learn about language, community, setting, tradition and the different ways a story can travel.</p></div></div><div className="mt-20 border-t border-[hsl(var(--border))]">{details.map((detail) => <div key={detail.number} className="grid gap-5 border-b border-[hsl(var(--border))] py-8 md:grid-cols-[.2fr_.8fr_1fr] md:items-start"><span className="font-mono-label text-[10px] text-[hsl(var(--primary))]">{detail.number}</span><h3 className="font-display text-4xl">{detail.title}</h3><p className="max-w-sm text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{detail.text}</p></div>)}</div></div>
    </section>
  );
}

function HouseSection() {
  const cards = [
    { icon: Compass, eyebrow: 'Find your way in', title: 'Stories', text: 'Legends and folktales from Uganda, then further across the continent.', tone: 'bg-[hsl(var(--primary))]' },
    { icon: Sparkles, eyebrow: 'Make it yours', title: 'Games', text: 'Story-based play, traditional games and digital worlds — in time.', tone: 'bg-[hsl(var(--accent))]' },
    { icon: BookOpen, eyebrow: 'Carry it onward', title: 'Experiences', text: 'Songs, exhibitions, school sessions and cultural encounters.', tone: 'bg-[hsl(var(--background))] border border-[hsl(var(--border))]' },
  ];
  return (
    <section id="house" className="bg-[hsl(var(--muted))] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1180px]"><div className="flex flex-wrap items-end justify-between gap-8"><div><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">05 / The bigger house</p><h2 className="mt-7 max-w-2xl font-display text-6xl leading-[.84] md:text-8xl">Many paths.<br /><span className="italic text-[hsl(var(--primary))]">One living house.</span></h2></div><p className="max-w-xs text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">BANCOL connects stories, play, sound and shared experiences into a growing home for African culture.</p></div><div className="mt-16 grid gap-4 md:grid-cols-[1.15fr_.85fr_.95fr]">{cards.map(({ icon: Icon, eyebrow, title, text, tone }, i) => <article key={title} className={`lift min-h-[280px] p-6 md:min-h-[360px] md:p-8 ${tone} ${i === 1 ? 'md:translate-y-10' : ''}`}><Icon size={22} strokeWidth={1.4} /><p className="mt-20 font-mono-label text-[9px] uppercase tracking-[.16em] opacity-65">{eyebrow}</p><h3 className="mt-3 font-display text-5xl leading-none">{title}</h3><p className="mt-5 max-w-xs text-sm leading-relaxed opacity-70">{text}</p></article>)}</div><div className="mt-28 overflow-hidden border-y border-[hsl(var(--foreground)/.16)] py-5"><div className="marquee flex w-max gap-10 font-display text-4xl italic text-[hsl(var(--foreground)/.55)] md:text-6xl"><span>Stories that stay with you.</span><span>Stories that stay with you.</span><span>Stories that stay with you.</span><span>Stories that stay with you.</span></div></div></div>
    </section>
  );
}

function Footer() {
  return <footer className="bg-[hsl(var(--secondary))] px-5 py-12 text-[hsl(var(--background))] md:px-10"><div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-12 md:flex-row md:items-end"><div><Mark inverse /><p className="mt-6 max-w-xs font-display text-3xl leading-none text-[hsl(var(--background)/.8)]">A living home<br />for African stories.</p></div><div className="flex flex-col gap-3 text-right font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--background)/.5)]"><a href="#top" className="hover:text-[hsl(var(--accent))]">Back to the beginning ↑</a><a href="/admin" className="hover:text-[hsl(var(--accent))]">Admin entry</a><span>House of Play · first edition</span><span>More is being made.</span></div></div></footer>;
}

function StoryReadingRoom({ story, close }: { story: Story; close: () => void }) {
  const title = <>{story.title}{story.titleAccent && <><br /><span className="italic text-[hsl(var(--accent))]">{story.titleAccent}</span></>}</>;
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[hsl(var(--secondary))] text-[hsl(var(--background))]" role="dialog" aria-modal="true" aria-label={`${story.title} reading room`}><div className="mx-auto max-w-3xl px-6 py-7 md:px-10 md:py-10"><div className="flex items-center justify-between"><Mark inverse /><button onClick={close} className="flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.15em]" aria-label="Close reading room">Close <X size={18} /></button></div><div className="mt-24 border-l border-[hsl(var(--accent)/.7)] pl-6 md:pl-12"><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The reading room / {story.number}</p><p className="mt-5 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--background)/.5)]">{story.origin}</p><h2 className="mt-8 font-display text-7xl leading-[.8] md:text-[9rem]">{title}</h2><p className="mt-10 font-display text-3xl leading-tight text-[hsl(var(--background)/.8)] md:text-5xl">{story.opening}</p><div className="prose prose-invert mt-14 max-w-xl text-[hsl(var(--background)/.7)]">{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{story.closing && <p className="font-display text-3xl italic text-[hsl(var(--accent))]">{story.closing}</p>}</div>{story.audioUrl && <audio controls src={story.audioUrl} className="mt-10 w-full" />}{story.videoUrl && <video controls src={story.videoUrl} className="mt-6 aspect-video w-full bg-black object-contain" />}{story.note && <div className="mt-16 border-t border-[hsl(var(--background)/.2)] pt-5 font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--background)/.45)]">{story.note}</div>}</div></div></div>;
}

function LegacyReadingRoom({ close }: { close: () => void }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[hsl(var(--secondary))] text-[hsl(var(--background))]" role="dialog" aria-modal="true" aria-label="Kintu and Nambi reading room"><div className="mx-auto max-w-3xl px-6 py-7 md:px-10 md:py-10"><div className="flex items-center justify-between"><Mark inverse /><button onClick={close} className="flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.15em]" aria-label="Close reading room">Close <X size={18} /></button></div><div className="mt-24 border-l border-[hsl(var(--accent)/.7)] pl-6 md:pl-12"><p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">The reading room · 001</p><h2 className="mt-8 font-display text-7xl leading-[.8] md:text-[9rem]">Kintu<br /><span className="italic text-[hsl(var(--accent))]">&amp; Nambi</span></h2><p className="mt-10 font-display text-3xl leading-tight text-[hsl(var(--background)/.8)] md:text-5xl">In the beginning, there was a man, a herd, and the wide, unfilled world.</p><div className="prose prose-invert mt-14 max-w-xl text-[hsl(var(--background)/.7)]"><p>Kintu was the first man. He lived with his cattle, and the earth was open around him. There were no neighbours to greet, no children to call his name, no one to share the evening with.</p><p>Then Nambi came into the story. Her arrival changed the quiet of the world. Together, they stand at the threshold of a life that will become many lives — a beginning remembered by the Baganda people of Central Uganda.</p><p className="font-display text-3xl italic text-[hsl(var(--accent))]">The rest of the telling is still unfolding.</p></div><div className="mt-16 border-t border-[hsl(var(--background)/.2)] pt-5 font-mono-label text-[9px] uppercase tracking-[.15em] text-[hsl(var(--background)/.45)]">This reading experience is an early interpretation. Cultural context and further versions are being developed with care.</div></div></div></div>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [publishedStories, setPublishedStories] = useState<Story[]>(() => getPublishedStories());
  useEffect(() => {
    getAllPublishedStories().then(setPublishedStories).catch((error) => {
      console.error('Unable to load Supabase stories', error);
    });
  }, []);
  useEffect(() => {
    document.body.style.overflow = selectedStory ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedStory]);
  return <div className="texture min-h-[100dvh]"><Header onOpenMenu={() => setMenuOpen(true)} /><MobileMenu open={menuOpen} close={() => setMenuOpen(false)} /><main><Hero /><Introduction /><StorySection storyList={publishedStories} onRead={setSelectedStory} /><ListenSection /><WorldSection /><HouseSection /></main><Footer />{selectedStory && <StoryReadingRoom story={selectedStory} close={() => setSelectedStory(null)} />}</div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/admin" component={Admin} /><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
