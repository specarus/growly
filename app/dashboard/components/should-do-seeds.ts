import {
  BicepsFlexed,
  Clock,
  Footprints,
  LucideIcon,
} from "lucide-react";

export type ShouldDoSeed = {
  id: string;
  title: string;
  description?: string;
  likesCount: number;
  icon: LucideIcon;
  iconColor: string;
};

export const shouldDoSeeds: ShouldDoSeed[] = [
  {
    id: "seed-we-go-jim",
    title: "We go jimmm!",
    description: "Turn the group chat hype into a Saturday PR session.",
    likesCount: 4200,
    icon: BicepsFlexed,
    iconColor: "text-yellow-500",
  },
  {
    id: "seed-5am-club",
    title: "The 5am club",
    description: "Who actually shows up before sunrise? Call the bluff.",
    likesCount: 5400,
    icon: Clock,
    iconColor: "text-pink-400",
  },
  {
    id: "seed-go-running",
    title: "Go running",
    description: "No routes, no excuses—drop a pin and sprint there.",
    likesCount: 2000,
    icon: Footprints,
    iconColor: "text-blue-400",
  },
];
