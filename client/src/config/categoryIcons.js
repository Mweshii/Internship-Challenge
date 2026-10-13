// Which icon to show for each product category, matched on the category's
// `slug` in the database. A category without an entry here gets the fallback.
// Browse more icons at https://lucide.dev/icons
import {
  BatteryCharging,
  Cable,
  Gamepad2,
  Headphones,
  Keyboard,
  Laptop,
  LayoutGrid,
  MonitorSmartphone,
  Package,
  Plug,
  Shield,
  Smartphone,
  Sparkles,
  Tablet,
  Watch,
} from 'lucide-react';

const ICONS = {
  'phone-cases': Smartphone,
  'screen-protectors': Shield,
  'chargers-cables': Cable,
  'earphones-headphones': Headphones,
  'power-banks': BatteryCharging,
  adapters: Plug,
  'stands-mounts': MonitorSmartphone,
  'other-accessories': Package,
  tablets: Tablet,
  smartwatches: Watch,
  laptops: Laptop,
  'gaming-accessories': Gamepad2,
  'computer-accessories': Keyboard,
  'other-gadgets': Sparkles,
};

export const ALL_CATEGORIES_ICON = LayoutGrid;

export function categoryIcon(slug) {
  return ICONS[slug] || Package;
}
