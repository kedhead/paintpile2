import type { RecipeIngredient, RecipeStep, RecipeData } from '../hooks/use-recipes';

export const CURATED_RECIPES: RecipeData[] = [
  {
    name: 'Ultramarine Power Armor',
    description: 'The classic blue power armor of the Ultramarines Chapter. This beginner-friendly recipe achieves a bold, striking blue with crisp edge highlights that capture the iconic Space Marine look.',
    category: 'armor',
    difficulty: 'beginner',
    techniques: ['layering', 'washing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Macragge Blue', paint_brand: 'Citadel', paint_color: '#0b3f8c', role: 'base' },
      { paint_name: 'Nuln Oil', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'wash' },
      { paint_name: 'Calgar Blue', paint_brand: 'Citadel', paint_color: '#4b7fc4', role: 'layer' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Prime and Base Coat', instruction: 'Prime the model black, then apply two thin coats of Macragge Blue over all armor plates. Let each coat dry fully before applying the next.', estimated_time: 15, technique: 'layering', paint_indices: [0], tips: ['Thin your paint slightly with water for better coverage without obscuring detail'],
      },
      {
        id: 'step-2', title: 'Shade the Recesses', instruction: 'Apply Nuln Oil carefully into the recesses and panel lines of the armor. Use a fine brush to control where the wash flows, avoiding pooling on flat surfaces.', estimated_time: 10, technique: 'washing', paint_indices: [1], tips: ['Tilt the model to direct the wash into recesses'],
      },
      {
        id: 'step-3', title: 'Layer the Raised Surfaces', instruction: 'Apply Calgar Blue to the raised areas and flat panels of the armor, leaving Macragge Blue visible in the deepest recesses. Build up coverage in 2-3 thin coats.', estimated_time: 20, technique: 'layering', paint_indices: [2], tips: ['Leave a thin dark line at every panel edge for depth'],
      },
      {
        id: 'step-4', title: 'Edge Highlights', instruction: 'Using a fine detail brush, carefully apply thin lines of White Scar to the sharpest edges and corners of the armor plates. Keep lines thin and consistent.', estimated_time: 25, technique: 'layering', paint_indices: [3], tips: ['Rest your brush hand against the model to steady it for precise lines'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Battle-Ready Steel Chainmail',
    description: 'A quick and effective metallic recipe for chainmail, mail coifs, and steel weapons. The combination of wash and drybrush creates realistic depth without requiring advanced techniques.',
    category: 'metallic',
    difficulty: 'beginner',
    techniques: ['drybrushing', 'washing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Leadbelcher', paint_brand: 'Citadel', paint_color: '#8a8a8a', role: 'base' },
      { paint_name: 'Nuln Oil', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'wash' },
      { paint_name: 'Ironbreaker', paint_brand: 'Citadel', paint_color: '#b4b4b4', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat Metal', instruction: 'Apply two coats of Leadbelcher over all metallic surfaces. The paint is self-leveling so minimal thinning is needed.', estimated_time: 10, technique: 'layering', paint_indices: [0], tips: ['A basecoat of Chaos Black spray first gives better coverage'],
      },
      {
        id: 'step-2', title: 'Apply Nuln Oil', instruction: 'Flood the metallic areas with Nuln Oil. Allow it to settle fully into the chain links and recesses. Let dry completely before proceeding.', estimated_time: 8, technique: 'washing', paint_indices: [1], tips: ['Be generous — you want the wash to pool in every gap of the chainmail'],
      },
      {
        id: 'step-3', title: 'Drybrush Ironbreaker', instruction: 'Load a flat brush with Ironbreaker, then wipe most of the paint off on a paper towel. Lightly drag the brush across the chainmail to catch raised rings and create a worn metallic sheen.', estimated_time: 10, technique: 'drybrushing', paint_indices: [2], tips: ['Less paint on the brush is always better — build up gradually'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Human Skin Tone Triad',
    description: 'A classic three-stage recipe for realistic Caucasian human skin. Builds a warm, natural tone from a mid-range base, using washes to add depth and selective highlights for a healthy glow.',
    category: 'skin-tone',
    difficulty: 'beginner',
    techniques: ['layering', 'washing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Rakarth Flesh', paint_brand: 'Citadel', paint_color: '#c9a882', role: 'base' },
      { paint_name: 'Reikland Fleshshade', paint_brand: 'Citadel', paint_color: '#8b4513', role: 'wash' },
      { paint_name: 'Kislev Flesh', paint_brand: 'Citadel', paint_color: '#e8c9a0', role: 'layer' },
      { paint_name: 'Pallid Wych Flesh', paint_brand: 'Citadel', paint_color: '#f5e6d3', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat Skin', instruction: 'Apply 2 smooth coats of Rakarth Flesh to all skin areas. This mid-tone creates a warm, natural starting point.', estimated_time: 12, technique: 'layering', paint_indices: [0], tips: ['Prime the model with Corax White or Grey Seer for a brighter result'],
      },
      {
        id: 'step-2', title: 'Shade with Fleshshade', instruction: 'Apply Reikland Fleshshade over all skin, allowing it to settle into wrinkles, eye sockets, and between fingers. Use a brush to guide the wash away from flat cheek areas if needed.', estimated_time: 10, technique: 'washing', paint_indices: [1], tips: ['Fleshshade is forgiving — it naturally enhances the natural tones of skin'],
      },
      {
        id: 'step-3', title: 'Reapply and Highlight', instruction: 'Once dry, layer Kislev Flesh onto the raised areas of the face — nose, cheeks, forehead, and chin — leaving Rakarth Flesh in mid areas and Fleshshade in recesses.', estimated_time: 18, technique: 'layering', paint_indices: [2], tips: ['Work in small thin coats to build gradual highlights'],
      },
      {
        id: 'step-4', title: 'Final Highlights', instruction: 'Apply tiny amounts of Pallid Wych Flesh to the very highest points: the tip of the nose, brow ridge, upper cheekbones. Keep it minimal for a natural look.', estimated_time: 15, technique: 'layering', paint_indices: [3], tips: ['A single thin line on the nose bridge goes a long way'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Ork Green Skin',
    description: 'Captures the tough, muscular green skin of an Ork warrior. Dark shadowing in the recesses emphasizes bulging muscle definition while bright highlights on the knuckles and brow add a brutish vitality.',
    category: 'skin-tone',
    difficulty: 'beginner',
    techniques: ['layering', 'washing', 'drybrushing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Death World Forest', paint_brand: 'Citadel', paint_color: '#5c7a3e', role: 'base' },
      { paint_name: 'Athonian Camoshade', paint_brand: 'Citadel', paint_color: '#3d5c2a', role: 'wash' },
      { paint_name: 'Elysian Green', paint_brand: 'Citadel', paint_color: '#8cb45e', role: 'layer' },
      { paint_name: 'Ogryn Camo', paint_brand: 'Citadel', paint_color: '#b0cc7e', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat Green', instruction: 'Apply 2 coats of Death World Forest to all skin areas. This desaturated green is the perfect dark midtone for Ork skin.', estimated_time: 12, technique: 'layering', paint_indices: [0], tips: ['A dark primer works well here — less base coats needed'],
      },
      {
        id: 'step-2', title: 'Shade Into Recesses', instruction: 'Apply Athonian Camoshade over all the skin, flooding the recesses between muscles, in the jaw line, and around scars. This creates the dark shadows that define the musculature.', estimated_time: 10, technique: 'washing', paint_indices: [1], tips: ['Two thin coats of wash create very deep shadows for dramatic effect'],
      },
      {
        id: 'step-3', title: 'Highlight the Muscles', instruction: 'Using Elysian Green, layer over the raised muscle mass, leaving the shaded recesses visible. Focus on the top of the forearms, shoulders, and upper forehead.', estimated_time: 20, technique: 'layering', paint_indices: [2], tips: ['Think about where light would hit from above when placing highlights'],
      },
      {
        id: 'step-4', title: 'Bright Highlight', instruction: 'Apply Ogryn Camo sparingly to the very highest points — knuckles, brow ridge, cheekbones, and the tops of muscles. Keep it to small, bright touches.', estimated_time: 15, technique: 'layering', paint_indices: [3], tips: ['Drybrush this lightly over the skin for a quicker result on infantry'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Pale Elven Complexion',
    description: 'An ethereal, porcelain skin tone for High Elves, Aelves, or similar fair-skinned fantasy races. Combines a ghostly pale base with subtle blush tones for a beautiful, otherworldly appearance.',
    category: 'skin-tone',
    difficulty: 'intermediate',
    techniques: ['layering', 'glazing', 'blending'],
    is_public: true,
    ingredients: [
      { paint_name: 'Pallid Wych Flesh', paint_brand: 'Citadel', paint_color: '#f5e6d3', role: 'base' },
      { paint_name: 'Carroburg Crimson', paint_brand: 'Citadel', paint_color: '#7a1a2a', role: 'glaze' },
      { paint_name: 'Pink Horror', paint_brand: 'Citadel', paint_color: '#cc6688', role: 'accent' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat Pale Skin', instruction: 'Prime with Grey Seer and apply 2-3 smooth coats of Pallid Wych Flesh to all skin areas. This very light tone requires good coverage without visible brush strokes.', estimated_time: 15, technique: 'layering', paint_indices: [0], tips: ['Grey Seer primer gives a much brighter result than black or Corax White'],
      },
      {
        id: 'step-2', title: 'Glaze Recesses', instruction: 'Heavily thin Carroburg Crimson (roughly 1:4 paint to medium) and glaze it into the deep recesses — eye sockets, nostril creases, ear details, and the corner of the mouth. Build slowly.', estimated_time: 20, technique: 'glazing', paint_indices: [1], tips: ['Glazing medium gives you more control over the transparency'],
      },
      {
        id: 'step-3', title: 'Blush Cheeks and Lips', instruction: 'Thin Pink Horror slightly and carefully stipple or glaze a small amount onto the cheeks and lips. Blend the edges outward gently while still wet.', estimated_time: 20, technique: 'blending', paint_indices: [2], tips: ['Less is more — a hint of blush is more convincing than an obvious patch'],
      },
      {
        id: 'step-4', title: 'Bright Skin Highlights', instruction: 'Apply tiny amounts of White Scar to the very highest points: tip of the nose, brow ridge, upper cheekbone, and the cupid\'s bow of the upper lip.', estimated_time: 20, technique: 'layering', paint_indices: [3], tips: ['A wet palette helps keep the paint workable for blending these tiny areas'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Dark Worn Leather',
    description: 'A rich, aged leather recipe for belts, holsters, pouches, and straps. Achieves a darkly tanned hide look with visible wear on the edges, as if the equipment has seen years of hard use.',
    category: 'leather',
    difficulty: 'beginner',
    techniques: ['layering', 'washing', 'drybrushing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Rhinox Hide', paint_brand: 'Citadel', paint_color: '#3d2b1e', role: 'base' },
      { paint_name: 'Agrax Earthshade', paint_brand: 'Citadel', paint_color: '#4a2c14', role: 'wash' },
      { paint_name: 'Doombull Brown', paint_brand: 'Citadel', paint_color: '#6b3a2a', role: 'midtone' },
      { paint_name: 'Skrag Brown', paint_brand: 'Citadel', paint_color: '#8b5a3a', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat', instruction: 'Apply two coats of Rhinox Hide to all leather surfaces. This very dark brown forms the deep shadow tones.', estimated_time: 10, technique: 'layering', paint_indices: [0], tips: ['Rhinox Hide can be patchy — thin it slightly and apply a second coat'],
      },
      {
        id: 'step-2', title: 'Shade', instruction: 'Apply Agrax Earthshade into all recesses — stitching lines, folds, and where leather meets buckles. This deepens the shadows without lightening the overall tone.', estimated_time: 8, technique: 'washing', paint_indices: [1], tips: ['A fine brush gives better control than flooding the area'],
      },
      {
        id: 'step-3', title: 'Layer Raised Areas', instruction: 'Apply Doombull Brown to the raised surfaces of the leather — the front of straps, the outer face of pouches. Leave Rhinox Hide in the recesses.', estimated_time: 15, technique: 'layering', paint_indices: [2], tips: ['Keep the brown slightly streaky to suggest grain in the leather'],
      },
      {
        id: 'step-4', title: 'Highlight Edges', instruction: 'Edge-highlight the top surfaces and fold creases with Skrag Brown using a fine brush. Concentrate on buckle edges, corners, and the edges of belt straps.', estimated_time: 15, technique: 'layering', paint_indices: [3], tips: ['Worn leather tends to lighten at edges — this effect is realistic and looks great'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Velvet Red Cloak',
    description: 'A deep, luxurious red for cloaks, robes, and cloth. The multiple layering stages create convincing fabric folds with rich shadow depths and vivid highlights on the crests.',
    category: 'fabric',
    difficulty: 'intermediate',
    techniques: ['layering', 'washing', 'glazing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Khorne Red', paint_brand: 'Citadel', paint_color: '#7a1c1c', role: 'base' },
      { paint_name: 'Carroburg Crimson', paint_brand: 'Citadel', paint_color: '#7a1a2a', role: 'wash' },
      { paint_name: 'Evil Sunz Scarlet', paint_brand: 'Citadel', paint_color: '#b22222', role: 'layer' },
      { paint_name: 'Wild Rider Red', paint_brand: 'Citadel', paint_color: '#d44040', role: 'highlight' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'accent' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat', instruction: 'Apply 2 coats of Khorne Red to all fabric areas. This rich dark red sets the tone for a deep, luxurious finish.', estimated_time: 12, technique: 'layering', paint_indices: [0], tips: ['Red is notoriously patchy — 2-3 thin coats over a grey primer works best'],
      },
      {
        id: 'step-2', title: 'Shade the Folds', instruction: 'Apply Carroburg Crimson into all the recessed folds of the fabric, deepening the shadows to near-black in the deepest creases.', estimated_time: 12, technique: 'washing', paint_indices: [1], tips: ['Guide the wash along fold lines with a brush tip'],
      },
      {
        id: 'step-3', title: 'Layer Mid Tones', instruction: 'Layer Evil Sunz Scarlet over the raised areas of the cloth, blending softly at the edges. Leave Khorne Red at the transition between highlight and shadow.', estimated_time: 20, technique: 'layering', paint_indices: [2], tips: ['Feather the edges of your strokes to create smooth transitions between folds'],
      },
      {
        id: 'step-4', title: 'Highlight Fold Crests', instruction: 'Apply Wild Rider Red to the top of each fold ridge and any raised fabric creases. Keep the area small to create a natural light falloff.', estimated_time: 20, technique: 'layering', paint_indices: [3], tips: ['Imagine the light coming from above — only the very tops of the folds catch full light'],
      },
      {
        id: 'step-5', title: 'Final Edge Highlights', instruction: 'Touch the very tip of fold crests with an extremely thin line of White Scar. This simulates a fabric sheen on worn silk or velvet and makes highlights pop.', estimated_time: 20, technique: 'layering', paint_indices: [4], tips: ['Mix White Scar with Wild Rider Red first for a less stark result'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Rusty Metal Weathering',
    description: 'A realistic rust and corrosion effect for neglected weapons, decrepit machinery, and weathered armor. Uses stippling to create irregular rust patches that look like genuine oxidized steel.',
    category: 'weathering',
    difficulty: 'intermediate',
    techniques: ['stippling', 'washing', 'layering'],
    is_public: true,
    ingredients: [
      { paint_name: 'Leadbelcher', paint_brand: 'Citadel', paint_color: '#8a8a8a', role: 'base' },
      { paint_name: 'Nuln Oil', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'wash' },
      { paint_name: 'Skrag Brown', paint_brand: 'Citadel', paint_color: '#8b5a3a', role: 'layer' },
      { paint_name: 'Ryza Rust', paint_brand: 'Citadel', paint_color: '#a85c28', role: 'accent' },
      { paint_name: 'Typhus Corrosion', paint_brand: 'Citadel', paint_color: '#3d2a18', role: 'base' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Metallic Base', instruction: 'Apply Leadbelcher over the entire metallic surface, then wash thoroughly with Nuln Oil. Let dry completely.', estimated_time: 15, technique: 'washing', paint_indices: [0, 1], tips: ['The cleaner the metal base, the more the rust will stand out'],
      },
      {
        id: 'step-2', title: 'Build Rust Foundation', instruction: 'Using a torn sponge or stipple brush, dab Skrag Brown in irregular patches across the surface. Concentrate rust near edges, corners, and anywhere water would gather.', estimated_time: 15, technique: 'stippling', paint_indices: [2], tips: ['Tear a bit of blister pack foam for a perfect stippling texture'],
      },
      {
        id: 'step-3', title: 'Add Active Rust', instruction: 'Stipple Ryza Rust over the Skrag Brown patches, leaving the edges of the brown visible. Ryza Rust is bright and granular — it reads as fresh, active oxidization.', estimated_time: 15, technique: 'stippling', paint_indices: [3], tips: ['Also dab Ryza Rust in thin streaks running downward to simulate rust runs'],
      },
      {
        id: 'step-4', title: 'Add Grime and Corrosion', instruction: 'Apply Typhus Corrosion texture paint into the deepest rust areas and any deep recesses. It adds grit and texture that sells the effect as truly corroded metal.', estimated_time: 10, technique: 'layering', paint_indices: [4], tips: ['Typhus Corrosion can be thinned slightly to flow into recesses more naturally'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Cracked Stone Base',
    description: 'A fast and effective recipe for creating realistic stone texture bases. Uses Citadel texture paint for an instant cracked stone effect, finished with dry brushing to bring out surface detail.',
    category: 'stone',
    difficulty: 'intermediate',
    techniques: ['drybrushing', 'washing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Astrogranite Debris', paint_brand: 'Citadel', paint_color: '#6b6b6b', role: 'base' },
      { paint_name: 'Nuln Oil', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'wash' },
      { paint_name: 'Dawnstone', paint_brand: 'Citadel', paint_color: '#8a8a7a', role: 'layer' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Apply Texture Paint', instruction: 'Apply a generous coat of Astrogranite Debris to the base using an old brush. Work it into a natural, uneven surface with random peaks and valleys.', estimated_time: 5, technique: 'layering', paint_indices: [0], tips: ['Apply while still wet and drag the brush to create directional texture'],
      },
      {
        id: 'step-2', title: 'Shade the Stone', instruction: 'Once fully dry, wash the entire base with Nuln Oil. This pools in the cracks and depressions, creating instant depth.', estimated_time: 5, technique: 'washing', paint_indices: [1], tips: ['A second coat of wash after the first dries makes the cracks even deeper'],
      },
      {
        id: 'step-3', title: 'Drybrush Dawnstone', instruction: 'Drybrush Dawnstone over the entire base with a flat brush. This picks out the raised areas and high points of the texture, giving it a stone-like grey hue.', estimated_time: 8, technique: 'drybrushing', paint_indices: [2], tips: ['Use a broad, flat brush in circular or cross-hatch motions'],
      },
      {
        id: 'step-4', title: 'Final Highlight', instruction: 'Apply a very light drybrush of White Scar to the very top surfaces. This creates a sun-bleached look and makes the texture pop on the tabletop.', estimated_time: 5, technique: 'drybrushing', paint_indices: [3], tips: ['Less is more — a barely loaded brush gives the most realistic effect'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Jungle Wood Texture',
    description: 'Natural-looking wood for weapon hafts, fence posts, wooden shields, and scatter terrain. Uses layering and drybrushing along a simulated wood grain direction to create convincing organic texture.',
    category: 'wood',
    difficulty: 'beginner',
    techniques: ['drybrushing', 'washing', 'layering'],
    is_public: true,
    ingredients: [
      { paint_name: 'Rhinox Hide', paint_brand: 'Citadel', paint_color: '#3d2b1e', role: 'base' },
      { paint_name: 'Agrax Earthshade', paint_brand: 'Citadel', paint_color: '#4a2c14', role: 'wash' },
      { paint_name: 'Gorthor Brown', paint_brand: 'Citadel', paint_color: '#7a5a3a', role: 'layer' },
      { paint_name: 'Karak Stone', paint_brand: 'Citadel', paint_color: '#b0946a', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Base Coat', instruction: 'Apply 2 coats of Rhinox Hide to all wood surfaces. This very dark brown anchors the colour depth of the wood.', estimated_time: 10, technique: 'layering', paint_indices: [0], tips: ['Prime black for the darkest look — prime grey for more natural wood tones'],
      },
      {
        id: 'step-2', title: 'Shade', instruction: 'Apply Agrax Earthshade into any carved grooves, grain lines, and knot holes. On smooth wood, apply over the entire surface to tie the colour together.', estimated_time: 8, technique: 'washing', paint_indices: [1], tips: ['On smooth surfaces, dilute the wash slightly so it doesn\'t darken excessively'],
      },
      {
        id: 'step-3', title: 'Layer the Grain', instruction: 'Load Gorthor Brown onto a flat brush and drag along the direction of the wood grain in long, thin strokes. Leave Rhinox Hide visible in the grain lines. Work along the length of the wood piece.', estimated_time: 15, technique: 'layering', paint_indices: [2], tips: ['Slightly irregular strokes look more like real wood grain than perfectly parallel lines'],
      },
      {
        id: 'step-4', title: 'Highlight Grain', instruction: 'Drybrush Karak Stone lightly along the length of the wood, following the same grain direction. This brightens the raised grain lines and gives a worn, weathered look.', estimated_time: 10, technique: 'drybrushing', paint_indices: [3], tips: ['Focus dry brushing on edges and ends of the wood — these naturally bleach faster'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Classic Gemstone Effect',
    description: 'A refined, step-by-step approach to painting convincing gemstones — perfect for psychic crystals, elven jewellery, and sword pommels. Achieves a glassy depth with a single bright specular highlight.',
    category: 'gem',
    difficulty: 'intermediate',
    techniques: ['layering', 'glazing'],
    is_public: true,
    ingredients: [
      { paint_name: 'Abaddon Black', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'base' },
      { paint_name: 'Sotek Green', paint_brand: 'Citadel', paint_color: '#1a6b6b', role: 'layer' },
      { paint_name: 'Kabalite Green', paint_brand: 'Citadel', paint_color: '#2a8a5a', role: 'midtone' },
      { paint_name: 'Sybarite Green', paint_brand: 'Citadel', paint_color: '#3ab874', role: 'highlight' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'accent' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Black Base', instruction: 'Paint the entire gem Abaddon Black. This is the top of the gem, which in gems appears darkest as it reflects the sky overhead.', estimated_time: 5, technique: 'layering', paint_indices: [0], tips: ['For very small gems, a fine detail brush is essential'],
      },
      {
        id: 'step-2', title: 'First Colour Layer', instruction: 'Apply Sotek Green to the bottom two-thirds of the gem, leaving the very top black. This builds the dark base colour from below.', estimated_time: 8, technique: 'layering', paint_indices: [1], tips: ['Working in very small steps like this is key — don\'t rush it'],
      },
      {
        id: 'step-3', title: 'Mid Colour Layer', instruction: 'Apply Kabalite Green to the bottom half, overlapping the Sotek Green slightly and building toward a brighter centre of the gem\'s "light source".', estimated_time: 8, technique: 'layering', paint_indices: [2], tips: ['Keep your paint thin so each layer is transparent and shows the previous one through it'],
      },
      {
        id: 'step-4', title: 'Bright Highlight Zone', instruction: 'Apply Sybarite Green to just the bottom third of the gem. This is the brightest area, simulating light entering from below and bouncing back out.', estimated_time: 8, technique: 'layering', paint_indices: [3], tips: ['The brighter the Sybarite Green area, the more vivid the gem will appear'],
      },
      {
        id: 'step-5', title: 'Specular Dot', instruction: 'Place a tiny dot of White Scar in the top corner of the gem. This represents the hardest reflection of the light source and is what makes it convincingly glassy.', estimated_time: 5, technique: 'layering', paint_indices: [4], tips: ['The dot should be tiny — smaller than you think. Use the very tip of the finest brush you own'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'NMM Gold Sword Hilt',
    description: 'Non-Metallic Metal gold for sword hilts, trophy icons, and ornamental details. Uses careful value transitions without any actual metallic paint to create the illusion of polished gold through contrast alone.',
    category: 'nmm',
    difficulty: 'advanced',
    techniques: ['nmm', 'blending', 'layering'],
    is_public: true,
    ingredients: [
      { paint_name: 'Rhinox Hide', paint_brand: 'Citadel', paint_color: '#3d2b1e', role: 'shadow' },
      { paint_name: 'Doombull Brown', paint_brand: 'Citadel', paint_color: '#6b3a2a', role: 'midtone' },
      { paint_name: 'Skullcrusher Brass', paint_brand: 'Citadel', paint_color: '#b8882a', role: 'layer' },
      { paint_name: 'Liberator Gold', paint_brand: 'Citadel', paint_color: '#d4aa4a', role: 'highlight' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'accent' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Map Shadow Zones', instruction: 'Undercoat the hilt with Rhinox Hide, then carefully plan where your darkest shadows will fall. On a cylinder, the very top and bottom edges are darkest; on a flat face, the corners and edges facing away from the light source.', estimated_time: 15, technique: 'nmm', paint_indices: [0], tips: ['Sketch your light source position lightly in pencil on a reference photo before starting'],
      },
      {
        id: 'step-2', title: 'Build Mid Tones', instruction: 'Apply Doombull Brown in the mid-shadow zones transitioning out from the darkest Rhinox Hide. Work in thin, smooth layers blending toward the centre of each face.', estimated_time: 25, technique: 'blending', paint_indices: [1], tips: ['A wet palette is essential here — keep your paints workable for blending'],
      },
      {
        id: 'step-3', title: 'Apply Gold Mid Tone', instruction: 'Carefully apply Skullcrusher Brass to the flat, well-lit faces of the hilt, blending it into the Doombull Brown at the transition zones. This is the first recognizable "gold" colour.', estimated_time: 30, technique: 'blending', paint_indices: [2], tips: ['Don\'t rush the transitions — smooth gradients are the entire trick of NMM'],
      },
      {
        id: 'step-4', title: 'Bright Gold Highlight', instruction: 'Apply Liberator Gold to the areas that would catch the most direct light — the centre of flat faces, the outside of curves pointing toward your light source. Blend edges carefully.', estimated_time: 30, technique: 'blending', paint_indices: [3], tips: ['On cylindrical hilts, the bright spot is a vertical stripe; on flat surfaces, a central spot'],
      },
      {
        id: 'step-5', title: 'White Specular Highlights', instruction: 'Add the very brightest reflections with thin strokes of White Scar at the absolute peak of the form — the very centre of the bright area. Keep it to a tiny line or dot.', estimated_time: 15, technique: 'layering', paint_indices: [4], tips: ['If White Scar looks wrong, mix it with Liberator Gold first to desaturate it slightly'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'OSL Plasma Glow',
    description: 'Object Source Lighting for a glowing plasma weapon. Paints the blue-white light the weapon casts onto the surrounding miniature, creating a dramatic, immersive effect that makes the model appear to truly emit light.',
    category: 'osl',
    difficulty: 'advanced',
    techniques: ['osl', 'glazing', 'blending'],
    is_public: true,
    ingredients: [
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'accent' },
      { paint_name: 'Teclis Blue', paint_brand: 'Citadel', paint_color: '#5888cc', role: 'layer' },
      { paint_name: 'Caledor Sky', paint_brand: 'Citadel', paint_color: '#3366aa', role: 'midtone' },
      { paint_name: 'Macragge Blue', paint_brand: 'Citadel', paint_color: '#0b3f8c', role: 'shadow' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Paint the Plasma Coils', instruction: 'Paint the plasma coils themselves: start with Macragge Blue as the base, layer up Caledor Sky, then Teclis Blue, finishing with a bright White Scar centre. The coil must be the brightest point.', estimated_time: 25, technique: 'layering', paint_indices: [0, 1, 2, 3], tips: ['Paint the light source before adding the OSL, so you have a target to paint toward'],
      },
      {
        id: 'step-2', title: 'Block Out OSL Zones', instruction: 'Identify all surfaces facing the plasma coil. Lightly mark these areas with a pencil if needed. Mix Teclis Blue thinly (1:3 with water or medium) and apply the first transparent coat to these surfaces.', estimated_time: 20, technique: 'glazing', paint_indices: [1], tips: ['OSL fades quickly with distance — surfaces far from the coil should barely show any tint'],
      },
      {
        id: 'step-3', title: 'Build OSL Layers', instruction: 'Apply further thin coats of Teclis Blue, concentrating the layers on the surfaces closest to the plasma coil. Each coat builds the light effect gradually.', estimated_time: 25, technique: 'glazing', paint_indices: [1], tips: ['5-8 thin glazes look far better than 1-2 thick ones'],
      },
      {
        id: 'step-4', title: 'Add White Core Glow', instruction: 'Mix White Scar into Teclis Blue (1:1) and apply to the surfaces immediately adjacent to the coil. These surfaces are so close they reflect the white-hot core of the plasma.', estimated_time: 20, technique: 'blending', paint_indices: [0, 1], tips: ['Use a dry brush or stipple technique for a more natural, less sharp edge to the glow'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Ethereal Energy Blade',
    description: 'A glowing, supernatural energy effect for ghost blades, psychic weapons, and magical swords. Achieves a luminous appearance where the weapon seems to emit green light from within using careful blending from black to bright green to white.',
    category: 'glow-effect',
    difficulty: 'advanced',
    techniques: ['blending', 'glazing', 'layering'],
    is_public: true,
    ingredients: [
      { paint_name: 'Abaddon Black', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'base' },
      { paint_name: 'Warpstone Glow', paint_brand: 'Citadel', paint_color: '#2a7a2a', role: 'midtone' },
      { paint_name: 'Moot Green', paint_brand: 'Citadel', paint_color: '#4ab84a', role: 'layer' },
      { paint_name: 'White Scar', paint_brand: 'Citadel', paint_color: '#f0f0f0', role: 'highlight' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Black Base', instruction: 'Basecoat the blade completely with Abaddon Black. This deep black will remain at the outer edges of the blade and forms the darkest extreme of the gradient.', estimated_time: 8, technique: 'layering', paint_indices: [0], tips: ['A smooth, uniform black is important here — no brush marks'],
      },
      {
        id: 'step-2', title: 'First Glow Layer', instruction: 'Working from the blade edges inward, apply thin Warpstone Glow from the edges toward the centre. Leave a stripe of black showing at each edge. This is a thin glaze application.', estimated_time: 20, technique: 'glazing', paint_indices: [1], tips: ['Thin the Warpstone Glow significantly — it should be very transparent'],
      },
      {
        id: 'step-3', title: 'Bright Glow Zone', instruction: 'Apply Moot Green in a narrower stripe closer to the central spine of the blade. Blend the edges into the Warpstone Glow while still wet for a smooth transition.', estimated_time: 25, technique: 'blending', paint_indices: [2], tips: ['Work quickly while the Warpstone Glow is still slightly tacky to ease blending'],
      },
      {
        id: 'step-4', title: 'White Hot Core', instruction: 'Apply a thin line of White Scar right along the very centre spine of the blade. This represents the hottest, brightest point of the energy field.', estimated_time: 15, technique: 'layering', paint_indices: [3], tips: ['Keep this line razor thin — it should be about 1-2 bristles wide on your brush'],
      },
      {
        id: 'step-5', title: 'Glaze to Smooth', instruction: 'Once dry, apply a final thin glaze of Warpstone Glow over the entire blade to unify the colours and smooth any hard transitions. This also adds a slight glow across the whole blade.', estimated_time: 15, technique: 'glazing', paint_indices: [1], tips: ['If the white line disappears, touch it up after the glaze dries'],
      },
    ] as RecipeStep[],
  },

  {
    name: 'Battle-Worn Armour Weathering',
    description: 'Heavy weathering for armour that has survived countless battles. Combines chipping effects, grime accumulation, and streaking rust to tell a story of hard-fought campaigns without a single painting competition in sight.',
    category: 'weathering',
    difficulty: 'advanced',
    techniques: ['stippling', 'washing', 'weathering', 'layering'],
    is_public: true,
    ingredients: [
      { paint_name: 'Iron Warriors', paint_brand: 'Citadel', paint_color: '#8c8c8c', role: 'base' },
      { paint_name: 'Nuln Oil', paint_brand: 'Citadel', paint_color: '#1a1a1a', role: 'wash' },
      { paint_name: 'Leadbelcher', paint_brand: 'Citadel', paint_color: '#8a8a8a', role: 'highlight' },
      { paint_name: 'Typhus Corrosion', paint_brand: 'Citadel', paint_color: '#3d2a18', role: 'layer' },
      { paint_name: 'Ryza Rust', paint_brand: 'Citadel', paint_color: '#a85c28', role: 'accent' },
      { paint_name: 'Agrax Earthshade', paint_brand: 'Citadel', paint_color: '#4a2c14', role: 'glaze' },
    ] as RecipeIngredient[],
    steps: [
      {
        id: 'step-1', title: 'Metal Base', instruction: 'Apply Iron Warriors as the main armour colour. This slightly darker metallic gives a grimmer, more worn starting point than Leadbelcher.', estimated_time: 12, technique: 'layering', paint_indices: [0], tips: ['If painting coloured armour (blue, red, etc.) apply that colour first, then this weathering goes on top'],
      },
      {
        id: 'step-2', title: 'Heavy Wash', instruction: 'Apply Nuln Oil wash generously over all surfaces, making sure it pools in every recess. A second coat in deep areas creates very dark shadows.', estimated_time: 12, technique: 'washing', paint_indices: [1], tips: ['Let this dry fully — at least 20 minutes — before the next step'],
      },
      {
        id: 'step-3', title: 'Chip Effects', instruction: 'Using a small piece of torn blister foam or a stipple brush, dab Leadbelcher in irregular patches on edges, corners, and impact areas. Vary the size of chips — small scratches and larger gouges.', estimated_time: 20, technique: 'stippling', paint_indices: [2], tips: ['Chips are most convincing on protruding edges that would realistically catch knocks'],
      },
      {
        id: 'step-4', title: 'Add Grime and Filth', instruction: 'Apply Typhus Corrosion into recesses, joints, vents, and anywhere grime would collect. Use an old brush — Typhus Corrosion is thick and will ruin a good brush.', estimated_time: 15, technique: 'weathering', paint_indices: [3], tips: ['Focus grime at the lower portions of the model — dirt and filth settle with gravity'],
      },
      {
        id: 'step-5', title: 'Rust Streaks', instruction: 'Apply Ryza Rust in streaks running downward from any rust spots, chips, or rivets. Thin it slightly and let gravity guide the streak direction.', estimated_time: 15, technique: 'weathering', paint_indices: [4], tips: ['Dilute Ryza Rust 1:1 and pull thin downward streaks with a liner brush'],
      },
      {
        id: 'step-6', title: 'Unifying Wash', instruction: 'Thin Agrax Earthshade to approximately 1:3 with water and apply a final glaze over the entire model. This ties all the weathering elements together with a coherent warm-grime tint.', estimated_time: 10, technique: 'glazing', paint_indices: [5], tips: ['This final step is optional but makes a huge difference to the overall cohesion'],
      },
    ] as RecipeStep[],
  },
];
