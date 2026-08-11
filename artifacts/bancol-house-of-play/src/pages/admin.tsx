import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ImagePlus, LogOut, Music2, Plus, Upload, Video } from 'lucide-react';
import { STORY_MEDIA_BUCKET, isSupabaseConfigured, supabase } from '@/lib/supabase';

function AdminMark() {
  return (
    <span className="flex items-center gap-3 text-[hsl(var(--foreground))]">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-current">
        <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))]" />
        <span className="absolute -right-1 top-1 h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
      </span>
      <span className="font-mono-label text-[12px] font-semibold tracking-[.22em]">BANCOL</span>
    </span>
  );
}

type MediaKey = 'image' | 'audio' | 'video';

const emptyForm = {
  title: '',
  titleAccent: '',
  origin: '',
  readTime: '5 min read',
  description: '',
  opening: '',
  paragraphs: '',
  image: undefined as File | undefined,
  audio: undefined as File | undefined,
  video: undefined as File | undefined,
};

async function uploadMedia(kind: MediaKey, file: File | undefined, storyId: string) {
  if (!file || !supabase) return null;

  const extension = file.name.split('.').pop() || 'bin';
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase();
  const path = `${storyId}/${kind}-${Date.now()}-${safeName || `file.${extension}`}`;
  const { error } = await supabase.storage.from(STORY_MEDIA_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });

  if (error) throw error;
  return supabase.storage.from(STORY_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const update = (key: keyof typeof form, value: string | File | undefined) => setForm((current) => ({ ...current, [key]: value }));

  const logout = async () => {
    await supabase?.auth.signOut();
    setAuthenticated(false);
  };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setMessage('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before logging in.');
      return;
    }

    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setAuthenticated(true);
  };

  const saveStory = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }
    if (!form.title || !form.description || !form.opening) {
      setMessage('Add a title, description and opening before saving.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const storyId = crypto.randomUUID();
      const [imageUrl, audioUrl, videoUrl] = await Promise.all([
        uploadMedia('image', form.image, storyId),
        uploadMedia('audio', form.audio, storyId),
        uploadMedia('video', form.video, storyId),
      ]);

      const { error } = await supabase.from('stories').insert({
        id: storyId,
        title: form.title,
        title_accent: form.titleAccent || null,
        origin: form.origin || 'BANCOL / New story',
        read_time: form.readTime,
        image_url: imageUrl,
        image_alt: `${form.title} artwork`,
        description: form.description,
        excerpt: form.description,
        opening: form.opening,
        paragraphs: form.paragraphs.split('\n').map((paragraph) => paragraph.trim()).filter(Boolean),
        audio_url: audioUrl,
        video_url: videoUrl,
        is_published: true,
      });

      if (error) throw error;

      setForm(emptyForm);
      setMessage('Story saved to Supabase. Refresh the public home to see it in the library.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--background))]">
        <div className="w-full max-w-md border border-[hsl(var(--background)/.2)] p-8 md:p-10">
          <a href="/" className="mb-16 inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--background)/.6)]">
            <ArrowLeft size={14} /> Back to BANCOL
          </a>
          <p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">BANCOL / setup needed</p>
          <h1 className="mt-5 font-display text-6xl leading-none">Connect<br /><span className="italic text-[hsl(var(--accent))]">Supabase.</span></h1>
          <p className="mt-10 text-sm leading-relaxed text-[hsl(var(--background)/.65)]">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment, then restart the dev server.</p>
        </div>
      </main>
    );
  }

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--secondary))] font-mono-label text-[10px] uppercase tracking-[.18em] text-[hsl(var(--background))]">Checking admin session...</main>;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--background))]">
        <form onSubmit={login} className="w-full max-w-md border border-[hsl(var(--background)/.2)] p-8 md:p-10">
          <a href="/" className="mb-16 inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--background)/.6)]">
            <ArrowLeft size={14} /> Back to BANCOL
          </a>
          <p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">BANCOL / private entry</p>
          <h1 className="mt-5 font-display text-6xl leading-none">The<br /><span className="italic text-[hsl(var(--accent))]">back room.</span></h1>
          <label className="mt-12 block font-mono-label text-[10px] uppercase tracking-[.15em]">
            Email
            <input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-3 w-full border-b border-[hsl(var(--background)/.35)] bg-transparent px-0 py-3 font-sans text-lg outline-none focus:border-[hsl(var(--accent))]" />
          </label>
          <label className="mt-6 block font-mono-label text-[10px] uppercase tracking-[.15em]">
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-3 w-full border-b border-[hsl(var(--background)/.35)] bg-transparent px-0 py-3 font-sans text-lg outline-none focus:border-[hsl(var(--accent))]" />
          </label>
          <button className="mt-8 w-full rounded-full bg-[hsl(var(--accent))] px-5 py-3 font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--secondary))]">Enter admin</button>
          {message && <p className="mt-4 text-sm text-[hsl(var(--accent))]">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-5 py-8 text-[hsl(var(--foreground))] md:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="Back to BANCOL"><AdminMark /></a>
          <button onClick={logout} className="flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]"><LogOut size={14} /> Sign out</button>
        </div>

        <div className="mt-24 max-w-2xl">
          <p className="font-mono-label text-[10px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">BANCOL / content studio</p>
          <h1 className="mt-5 font-display text-7xl leading-[.82] md:text-9xl">Add to<br /><span className="italic text-[hsl(var(--primary))]">the house.</span></h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">Create a story and attach the image, audio and video that help it travel.</p>
        </div>

        <form onSubmit={saveStory} className="mt-16 grid gap-8 border-t border-[hsl(var(--border))] pt-10 md:grid-cols-2">
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em]">Title<input value={form.title} onChange={(event) => update('title', event.target.value)} className="admin-input" placeholder="The story title" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em]">Italic title accent<input value={form.titleAccent} onChange={(event) => update('titleAccent', event.target.value)} className="admin-input" placeholder="Optional second line" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em]">Origin / context<input value={form.origin} onChange={(event) => update('origin', event.target.value)} className="admin-input" placeholder="Region / tradition" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em]">Reading time<input value={form.readTime} onChange={(event) => update('readTime', event.target.value)} className="admin-input" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em] md:col-span-2">Short description<textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="admin-input min-h-24" placeholder="What is this story about?" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em] md:col-span-2">Opening line<textarea value={form.opening} onChange={(event) => update('opening', event.target.value)} className="admin-input min-h-24" placeholder="The first words readers see" /></label>
          <label className="font-mono-label text-[10px] uppercase tracking-[.14em] md:col-span-2">Story paragraphs<textarea value={form.paragraphs} onChange={(event) => update('paragraphs', event.target.value)} className="admin-input min-h-40" placeholder="One paragraph per line" /></label>
          <FileField icon={<ImagePlus size={17} />} label="Cover image" file={form.image} accept="image/*" onFile={(file) => update('image', file)} />
          <FileField icon={<Music2 size={17} />} label="Audio" file={form.audio} accept="audio/*" onFile={(file) => update('audio', file)} />
          <FileField icon={<Video size={17} />} label="Video" file={form.video} accept="video/*" onFile={(file) => update('video', file)} />
          <div className="flex items-end"><button disabled={saving} className="flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 font-mono-label text-[10px] uppercase tracking-[.14em] text-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-55"><Plus size={15} /> {saving ? 'Saving...' : 'Save story'}</button></div>
          {message && <p className="font-mono-label text-[10px] uppercase tracking-[.12em] text-[hsl(var(--primary))] md:col-span-2">{message}</p>}
        </form>
      </div>
    </main>
  );
}

function FileField({ icon, label, file, accept, onFile }: { icon: ReactNode; label: string; file?: File; accept: string; onFile: (file?: File) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 border border-dashed border-[hsl(var(--border))] p-5 transition-colors hover:border-[hsl(var(--primary))]">
      <span className="text-[hsl(var(--primary))]">{icon}</span>
      <span>
        <span className="block font-mono-label text-[10px] uppercase tracking-[.14em]">{label}</span>
        <span className="mt-1 block max-w-[15rem] truncate text-xs text-[hsl(var(--muted-foreground))]">{file?.name || 'Choose a file'}</span>
      </span>
      <Upload size={15} className="ml-auto text-[hsl(var(--muted-foreground))]" />
      <input type="file" accept={accept} className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
    </label>
  );
}
