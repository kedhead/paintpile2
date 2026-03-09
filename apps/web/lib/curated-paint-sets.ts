export interface CuratedPaintSet {
  name: string;
  brand: string;
  description: string;
  paints: string[]; // paint names to match against DB
}

export const CURATED_PAINT_SETS: CuratedPaintSet[] = [
  {
    name: 'Citadel Starter Set',
    brand: 'Citadel',
    description: 'Essential paints for getting started with Warhammer',
    paints: [
      'Abaddon Black', 'Corax White', 'Mephiston Red', 'Macragge Blue',
      'Retributor Armour', 'Leadbelcher', 'Agrax Earthshade', 'Nuln Oil',
      'Wraithbone', 'Averland Sunset', 'Warpstone Glow', 'Bugmans Glow',
    ],
  },
  {
    name: 'Army Painter Speedpaint Set',
    brand: 'Army Painter',
    description: 'Fast painting with contrast-style paints',
    paints: [
      'Speedpaint Medium', 'Crusader Skin', 'Zealot Yellow', 'Fire Giant Orange',
      'Blood Red', 'Orc Skin', 'Absolution Green', 'Holy White',
      'Hive Dweller', 'Gravelord Grey', 'Hardened Leather', 'Slaughter Red',
    ],
  },
  {
    name: 'Vallejo Game Color Basics',
    brand: 'Vallejo',
    description: 'Versatile acrylic paints for any miniature',
    paints: [
      'Dead White', 'Black', 'Bloody Red', 'Sunrise Yellow',
      'Magic Blue', 'Goblin Green', 'Bonewhite', 'Bronze Fleshtone',
      'Glorious Gold', 'Chainmail Silver', 'Charred Brown', 'Cold Grey',
    ],
  },
  {
    name: 'Scale75 Fantasy & Games',
    brand: 'Scale75',
    description: 'Premium paints for display-quality work',
    paints: [
      'White', 'Black', 'Blood Red', 'Mars Orange',
      'Caribbean Blue', 'Spring Green', 'Sahara Yellow', 'Innsmouth Blue',
      'Ardennes Green', 'Victorian Brass', 'Thrash Metal', 'Pale Skin',
    ],
  },
  {
    name: 'NMM (Non-Metallic Metal) Kit',
    brand: 'Mixed',
    description: 'Essential paints for painting NMM effects',
    paints: [
      'Rhinox Hide', 'Mournfang Brown', 'Skrag Brown', 'Balor Brown',
      'Zamesi Desert', 'Ushabti Bone', 'Screaming Skull', 'Corax White',
      'Abaddon Black', 'Thunderhawk Blue', 'Fenrisian Grey',
    ],
  },
];
