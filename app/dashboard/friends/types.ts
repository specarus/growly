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
  focusTags: string[];
  location?: string;
  privateAccount?: boolean;
  friendsInCommon?: number;
  mutualLikes: number;
  streakDays: number;
  level: number;
  totalXP: number;
  xpProgress: number;
  xpIntoLevel: number;
  xpNeededForLevelUp: number;
  likedHabits: FriendHabit[];
  joinedAt?: string;
  isNew?: boolean;
  highlight?: string;
  recentActivity?: string[];
  username?: string;
  friendStatus?: "none" | "incoming" | "outgoing" | "friends";
  requestId?: string;
};

export type FriendsPagePayload = {
  friends: FriendProfile[];
};
