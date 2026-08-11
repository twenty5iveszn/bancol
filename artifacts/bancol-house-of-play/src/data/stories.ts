import { supabase } from '@/lib/supabase';

export type Story = {
  id: string;
  number: string;
  title: string;
  titleAccent?: string;
  origin: string;
  readTime: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  excerpt: string;
  description: string;
  opening: string;
  paragraphs: string[];
  closing?: string;
  note?: string;
  audioUrl?: string;
  videoUrl?: string;
};

type StoryRow = {
  id: string;
  story_number: string | null;
  title: string;
  title_accent: string | null;
  origin: string | null;
  read_time: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_caption: string | null;
  excerpt: string | null;
  description: string;
  opening: string;
  paragraphs: string[] | null;
  closing: string | null;
  note: string | null;
  audio_url: string | null;
  video_url: string | null;
};

// Add new stories here. The story library and reading room render from this list.
export const stories: Story[] = [
  {
    id: 'kintu-and-nambi',
    number: '001',
    title: 'Kintu',
    titleAccent: '& Nambi',
    origin: 'A legend from Buganda · Central Uganda',
    readTime: '8 min read',
    image: '/kintu-nambi-hero.png',
    imageAlt: 'Kintu and Nambi beneath a fig tree',
    imageCaption: 'A visual study for the first BANCOL story film · In development',
    excerpt: 'Kintu lived alone on the earth. He had cattle, and the open land, and the quiet that comes before a world fills with voices.',
    description: 'Then came Nambi. With her arrival, the shape of life changed — and with it, the beginning of a people, a place, and a story still being told.',
    opening: 'In the beginning, there was a man, a herd, and the wide, unfilled world.',
    paragraphs: [
      'Kintu was the first man. He lived with his cattle, and the earth was open around him. There were no neighbours to greet, no children to call his name, no one to share the evening with.',
      'Then Nambi came into the story. Her arrival changed the quiet of the world. Together, they stand at the threshold of a life that will become many lives — a beginning remembered by the Baganda people of Central Uganda.',
    ],
    closing: 'The rest of the telling is still unfolding.',
    note: 'This reading experience is an early interpretation. Cultural context and further versions are being developed with care.',
  },
];

export function getPublishedStories(): Story[] {
  if (typeof window === 'undefined') return stories;
  try {
    const saved = JSON.parse(localStorage.getItem('bancol-admin-stories') || '[]') as Story[];
    return [...stories, ...saved];
  } catch {
    return stories;
  }
}

function storyFromRow(row: StoryRow, index: number): Story {
  return {
    id: row.id,
    number: row.story_number || String(index + stories.length + 1).padStart(3, '0'),
    title: row.title,
    titleAccent: row.title_accent || undefined,
    origin: row.origin || 'BANCOL / Story',
    readTime: row.read_time || '5 min read',
    image: row.image_url || '/kintu-nambi-hero.png',
    imageAlt: row.image_alt || `${row.title} artwork`,
    imageCaption: row.image_caption || undefined,
    excerpt: row.excerpt || row.description,
    description: row.description,
    opening: row.opening,
    paragraphs: row.paragraphs || [],
    closing: row.closing || undefined,
    note: row.note || undefined,
    audioUrl: row.audio_url || undefined,
    videoUrl: row.video_url || undefined,
  };
}

export async function getSupabaseStories(): Promise<Story[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as StoryRow[]).map(storyFromRow);
}

export async function getAllPublishedStories(): Promise<Story[]> {
  const remoteStories = await getSupabaseStories();
  return [...stories, ...remoteStories];
}
