export type DisplayPost = {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  createdAt: string;
  cadence: string;
  timeWindow: string;
  commitment: string;
  anchor: string | null;
  duration: string | null;
  highlight: string | null;
  likesCount: number;
  label: string;
};

export type SectionProps = {
  title: string;
  description: string;
  posts: DisplayPost[];
};
