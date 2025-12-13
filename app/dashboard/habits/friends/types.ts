export type FriendHabit = {
  id: string;
  title: string;
  category: string;
  summary: string | null;
  timeWindow?: string | null;
  commitment?: string | null;
  likesCount: number;
  anchor?: string | null;
  highlight?: string | null;
  userName?: string | null;
  likedByCurrentUser?: boolean;
};

export type FriendProfile = {
  id: string;
  name: string;
  headline: string;
  focus: string;
  location?: string;
  mutualLikes: number;
  streakDays: number;
  level: number;
  totalXP: number;
  xpProgress: number;
  xpIntoLevel: number;
  xpNeededForLevelUp: number;
  badges: string[];
  likedHabits: FriendHabit[];
  dominantCategory?: string;
  joinedAt?: string;
  isNew?: boolean;
  vibe?: string;
  highlight?: string;
  recentActivity?: string[];
};

export type FriendsPagePayload = {
  friends: FriendProfile[];
};
