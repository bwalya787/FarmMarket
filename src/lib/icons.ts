import {
  Carrot, Apple, Milk, Wheat, Sprout, Hexagon, Drumstick, Croissant,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Carrot, Apple, Milk, Wheat, Sprout, Hexagon, Drumstick, Croissant,
};

export function getCategoryIcon(name: string | null): LucideIcon {
  if (!name) return Sprout;
  return iconMap[name] ?? Sprout;
}
