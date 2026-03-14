export interface BadgeDefinition {
  name: string;
  description: string;
  category: 'projects' | 'armies' | 'recipes' | 'social' | 'community' | 'special' | 'time' | 'engagement';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  icon: string;
  color: string;
  points: number;
  hidden: boolean;
  trigger_type: 'stat_milestone';
  trigger_field: string;
  trigger_value: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Projects
  { name: 'First Brush', description: 'Create your first project', category: 'projects', tier: 'bronze', icon: '🎨', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'project_count', trigger_value: 1 },
  { name: 'Prolific Painter', description: 'Create 5 projects', category: 'projects', tier: 'silver', icon: '🖌️', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'project_count', trigger_value: 5 },
  { name: 'Master Craftsman', description: 'Create 25 projects', category: 'projects', tier: 'gold', icon: '🏆', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'project_count', trigger_value: 25 },
  { name: 'Legendary Artisan', description: 'Create 100 projects', category: 'projects', tier: 'platinum', icon: '👑', color: '#E5E4E2', points: 100, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'project_count', trigger_value: 100 },
  { name: 'First Finish', description: 'Complete your first project', category: 'projects', tier: 'bronze', icon: '✅', color: '#CD7F32', points: 15, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'completed_count', trigger_value: 1 },
  { name: 'Finisher', description: 'Complete 10 projects', category: 'projects', tier: 'silver', icon: '🎖️', color: '#C0C0C0', points: 30, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'completed_count', trigger_value: 10 },
  { name: 'Completion Master', description: 'Complete 50 projects', category: 'projects', tier: 'gold', icon: '💎', color: '#FFD700', points: 75, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'completed_count', trigger_value: 50 },

  // Armies
  { name: 'Muster', description: 'Create your first army', category: 'armies', tier: 'bronze', icon: '🛡️', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'army_count', trigger_value: 1 },
  { name: 'Warlord', description: 'Create 5 armies', category: 'armies', tier: 'silver', icon: '⚔️', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'army_count', trigger_value: 5 },
  { name: 'Grand Marshal', description: 'Create 10 armies', category: 'armies', tier: 'gold', icon: '🏰', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'army_count', trigger_value: 10 },

  // Recipes
  { name: 'First Recipe', description: 'Create your first recipe', category: 'recipes', tier: 'bronze', icon: '🧪', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'recipe_count', trigger_value: 1 },
  { name: 'Paint Chef', description: 'Create 10 recipes', category: 'recipes', tier: 'silver', icon: '👨‍🍳', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'recipe_count', trigger_value: 10 },
  { name: 'Master Alchemist', description: 'Create 25 recipes', category: 'recipes', tier: 'gold', icon: '⚗️', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'recipe_count', trigger_value: 25 },

  // Social
  { name: 'Socialite', description: 'Get your first follower', category: 'social', tier: 'bronze', icon: '👋', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'follower_count', trigger_value: 1 },
  { name: 'Influencer', description: 'Reach 10 followers', category: 'social', tier: 'silver', icon: '⭐', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'follower_count', trigger_value: 10 },
  { name: 'Community Pillar', description: 'Reach 50 followers', category: 'social', tier: 'gold', icon: '🌟', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'follower_count', trigger_value: 50 },
  { name: 'Legend', description: 'Reach 100 followers', category: 'social', tier: 'platinum', icon: '🔥', color: '#E5E4E2', points: 100, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'follower_count', trigger_value: 100 },

  // Community
  { name: 'Commentator', description: 'Leave 10 comments', category: 'community', tier: 'bronze', icon: '💬', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'comment_count', trigger_value: 10 },
  { name: 'Generous', description: 'Like 25 posts', category: 'community', tier: 'bronze', icon: '❤️', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'like_given_count', trigger_value: 25 },
  { name: 'Beloved', description: 'Receive 50 likes', category: 'community', tier: 'silver', icon: '💖', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'like_received_count', trigger_value: 50 },

  // Engagement / AI
  { name: 'AI Curious', description: 'Use an AI feature for the first time', category: 'engagement', tier: 'bronze', icon: '🧪', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'ai_usage_count', trigger_value: 1 },
  { name: 'AI Enthusiast', description: 'Use AI features 10 times', category: 'engagement', tier: 'silver', icon: '🔮', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'ai_usage_count', trigger_value: 10 },

  // Photography
  { name: 'Shutterbug', description: 'Upload 10 project photos', category: 'projects', tier: 'bronze', icon: '📸', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'photo_count', trigger_value: 10 },
  { name: 'Photographer', description: 'Upload 50 project photos', category: 'projects', tier: 'silver', icon: '📷', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'photo_count', trigger_value: 50 },

  // Paint Collection
  { name: 'Paint Collector', description: 'Own 25 paints', category: 'engagement', tier: 'bronze', icon: '🎨', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'paint_owned_count', trigger_value: 25 },
  { name: 'Paint Hoarder', description: 'Own 100 paints', category: 'engagement', tier: 'silver', icon: '🐉', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'paint_owned_count', trigger_value: 100 },
  { name: 'Paint Dragon', description: 'Own 250 paints', category: 'engagement', tier: 'gold', icon: '🐲', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'paint_owned_count', trigger_value: 250 },

  // Time
  { name: 'One Month', description: 'Be a member for 30 days', category: 'time', tier: 'bronze', icon: '📅', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'days_since_join', trigger_value: 30 },
  { name: 'Veteran', description: 'Be a member for 365 days', category: 'time', tier: 'gold', icon: '🏛️', color: '#FFD700', points: 50, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'days_since_join', trigger_value: 365 },

  // Special (hidden)
  { name: 'Score Chaser', description: 'Get an S grade on AI critique', category: 'special', tier: 'legendary', icon: '🥇', color: '#FF6B35', points: 200, hidden: true, trigger_type: 'stat_milestone', trigger_field: 's_grade_count', trigger_value: 1 },
  { name: 'Annotator', description: 'Add annotations to 5 photos', category: 'special', tier: 'silver', icon: '✏️', color: '#C0C0C0', points: 25, hidden: true, trigger_type: 'stat_milestone', trigger_field: 'annotated_photo_count', trigger_value: 5 },

  // Diary
  { name: 'Diarist', description: 'Write 5 diary entries', category: 'engagement', tier: 'bronze', icon: '📖', color: '#CD7F32', points: 10, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'diary_count', trigger_value: 5 },
  { name: 'Chronicler', description: 'Write 25 diary entries', category: 'engagement', tier: 'silver', icon: '📚', color: '#C0C0C0', points: 25, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'diary_count', trigger_value: 25 },

  // Challenges
  { name: 'Challenger', description: 'Enter your first challenge', category: 'community', tier: 'bronze', icon: '🚩', color: '#CD7F32', points: 15, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'challenge_entry_count', trigger_value: 1 },
  { name: 'Challenge Veteran', description: 'Enter 5 challenges', category: 'community', tier: 'silver', icon: '🏅', color: '#C0C0C0', points: 30, hidden: false, trigger_type: 'stat_milestone', trigger_field: 'challenge_entry_count', trigger_value: 5 },
];
