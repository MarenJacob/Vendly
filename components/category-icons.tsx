import { Smartphone, Headphones, Home, Zap, Sofa, Gift, ChefHat, Flame, ShoppingBag, type LucideIcon } from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  'Phones, Computer & Mobile Accessories': Smartphone,
  'Electronics & Gadgets': Headphones,
  'Home Appliances': Home,
  'Power & Energy': Zap,
  'Home and Living': Sofa,
  'Lifestyle and Gift': Gift,
  'Kitchen': ChefHat,
  'New Arrivals & Trending': Flame,
};

export function getCategoryIcon(category: string): LucideIcon {
  return MAP[category] || ShoppingBag;
}
