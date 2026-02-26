const templates = [
  {
    name: 'Fitness Tracker',
    description: 'Modern fitness app with workout tracking, progress charts, and motivation. Features an energetic gradient design.',
    category: 'health',
    is_premium: false,
    tier_required: 'free',
    thumbnail_url: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400',
    template_data: {
      screens: [
        {
          name: 'Dashboard',
          type: 'home',
          backgroundColor: '#0A0E27',
          components: [
            {
              type: 'container',
              props: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 0,
                borderWidth: 0,
                padding: 0
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 200
            },
            {
              type: 'text',
              props: {
                text: 'Good Morning!',
                fontSize: 16,
                color: '#FFFFFF99',
                fontWeight: '500'
              },
              position_x: 24,
              position_y: 60,
              width: 327,
              height: 24
            },
            {
              type: 'text',
              props: {
                text: 'Ready to Crush Today?',
                fontSize: 28,
                color: '#FFFFFF',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 88,
              width: 327,
              height: 40
            },
            {
              type: 'card',
              props: {
                title: '8,547',
                subtitle: 'Steps Today',
                backgroundColor: '#1a1f3a',
                borderRadius: 20,
                padding: 20
              },
              position_x: 24,
              position_y: 160,
              width: 160,
              height: 100
            },
            {
              type: 'card',
              props: {
                title: '2.4 mi',
                subtitle: 'Distance',
                backgroundColor: '#1a1f3a',
                borderRadius: 20,
                padding: 20
              },
              position_x: 198,
              position_y: 160,
              width: 153,
              height: 100
            },
            {
              type: 'text',
              props: {
                text: 'Today Workout',
                fontSize: 22,
                color: '#FFFFFF',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 288,
              width: 327,
              height: 32
            },
            {
              type: 'card',
              props: {
                title: 'Upper Body Strength',
                subtitle: '45 min • Intermediate',
                backgroundColor: '#667eea',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 332,
              width: 327,
              height: 90
            },
            {
              type: 'card',
              props: {
                title: 'Core & Abs',
                subtitle: '30 min • All Levels',
                backgroundColor: '#1a1f3a',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 438,
              width: 327,
              height: 90
            }
          ]
        },
        {
          name: 'Workouts',
          type: 'list',
          backgroundColor: '#0A0E27',
          components: [
            {
              type: 'header',
              props: {
                title: 'All Workouts',
                backgroundColor: '#0A0E27',
                textColor: '#FFFFFF',
                fontSize: 28,
                fontWeight: 'bold'
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Full Body HIIT',
                subtitle: '40 min • Advanced • 380 cal',
                backgroundColor: '#764ba2',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 96,
              width: 327,
              height: 100
            },
            {
              type: 'card',
              props: {
                title: 'Yoga Flow',
                subtitle: '60 min • Beginner • 200 cal',
                backgroundColor: '#1a1f3a',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 212,
              width: 327,
              height: 100
            },
            {
              type: 'card',
              props: {
                title: 'Cardio Blast',
                subtitle: '35 min • Intermediate • 420 cal',
                backgroundColor: '#1a1f3a',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 328,
              width: 327,
              height: 100
            }
          ]
        },
        {
          name: 'Profile',
          type: 'profile',
          backgroundColor: '#0A0E27',
          components: [
            {
              type: 'header',
              props: {
                title: 'Profile',
                backgroundColor: '#0A0E27',
                textColor: '#FFFFFF',
                fontSize: 28,
                fontWeight: 'bold'
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 80
            },
            {
              type: 'container',
              props: {
                backgroundColor: '#1a1f3a',
                borderRadius: 20,
                padding: 24
              },
              position_x: 24,
              position_y: 96,
              width: 327,
              height: 160
            },
            {
              type: 'text',
              props: {
                text: 'Weekly Goal',
                fontSize: 18,
                color: '#FFFFFF',
                fontWeight: '600'
              },
              position_x: 24,
              position_y: 280,
              width: 327,
              height: 32
            },
            {
              type: 'card',
              props: {
                title: '5 workouts completed',
                subtitle: '2 more to reach your goal!',
                backgroundColor: '#667eea',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 320,
              width: 327,
              height: 90
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Food Delivery',
    description: 'Delicious food ordering app with restaurant browsing, menu, and cart. Warm, appetizing design.',
    category: 'food',
    is_premium: false,
    tier_required: 'free',
    thumbnail_url: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=400',
    template_data: {
      screens: [
        {
          name: 'Home',
          type: 'home',
          backgroundColor: '#FFF9F0',
          components: [
            {
              type: 'container',
              props: {
                backgroundColor: '#FF6B6B',
                borderRadius: 0,
                padding: 0
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 180
            },
            {
              type: 'text',
              props: {
                text: 'Hungry?',
                fontSize: 36,
                color: '#FFFFFF',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 60,
              width: 327,
              height: 48
            },
            {
              type: 'text',
              props: {
                text: 'Order your favorite food now!',
                fontSize: 16,
                color: '#FFFFFFdd',
                fontWeight: '500'
              },
              position_x: 24,
              position_y: 116,
              width: 327,
              height: 24
            },
            {
              type: 'input',
              props: {
                placeholder: 'Search restaurants or dishes...',
                backgroundColor: '#FFFFFF',
                textColor: '#2D3436',
                borderRadius: 16,
                borderWidth: 0
              },
              position_x: 24,
              position_y: 156,
              width: 327,
              height: 52
            },
            {
              type: 'text',
              props: {
                text: 'Popular Near You',
                fontSize: 24,
                color: '#2D3436',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 232,
              width: 327,
              height: 32
            },
            {
              type: 'card',
              props: {
                title: 'Italian Kitchen',
                subtitle: '★ 4.8 • Pizza, Pasta • 25-35 min',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 16
              },
              position_x: 24,
              position_y: 276,
              width: 327,
              height: 100
            },
            {
              type: 'card',
              props: {
                title: 'Sushi Master',
                subtitle: '★ 4.9 • Japanese • 30-40 min',
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 16
              },
              position_x: 24,
              position_y: 392,
              width: 327,
              height: 100
            }
          ]
        },
        {
          name: 'Menu',
          type: 'custom',
          backgroundColor: '#FFF9F0',
          components: [
            {
              type: 'header',
              props: {
                title: 'Italian Kitchen',
                backgroundColor: '#FF6B6B',
                textColor: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold',
                showBackButton: true
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 70
            },
            {
              type: 'text',
              props: {
                text: '★ 4.8 (230 reviews) • $$ • 25-35 min',
                fontSize: 14,
                color: '#636e72',
                fontWeight: '500'
              },
              position_x: 24,
              position_y: 86,
              width: 327,
              height: 20
            },
            {
              type: 'text',
              props: {
                text: 'Popular Items',
                fontSize: 20,
                color: '#2D3436',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 126,
              width: 327,
              height: 28
            },
            {
              type: 'card',
              props: {
                title: 'Margherita Pizza',
                subtitle: 'Classic tomato, mozzarella, basil • $14.99',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16
              },
              position_x: 24,
              position_y: 166,
              width: 327,
              height: 90
            },
            {
              type: 'card',
              props: {
                title: 'Carbonara Pasta',
                subtitle: 'Creamy bacon pasta • $16.99',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16
              },
              position_x: 24,
              position_y: 272,
              width: 327,
              height: 90
            },
            {
              type: 'button',
              props: {
                text: 'View Cart (3 items)',
                backgroundColor: '#FF6B6B',
                textColor: '#FFFFFF',
                fontSize: 18,
                borderRadius: 16,
                fontWeight: '600'
              },
              position_x: 24,
              position_y: 580,
              width: 327,
              height: 56
            }
          ]
        },
        {
          name: 'Cart',
          type: 'custom',
          backgroundColor: '#FFF9F0',
          components: [
            {
              type: 'header',
              props: {
                title: 'Your Order',
                backgroundColor: '#FF6B6B',
                textColor: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold'
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 70
            },
            {
              type: 'card',
              props: {
                title: 'Margherita Pizza x2',
                subtitle: '$29.98',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16
              },
              position_x: 24,
              position_y: 90,
              width: 327,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Carbonara Pasta x1',
                subtitle: '$16.99',
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16
              },
              position_x: 24,
              position_y: 186,
              width: 327,
              height: 80
            },
            {
              type: 'text',
              props: {
                text: 'Total: $50.96',
                fontSize: 22,
                color: '#2D3436',
                fontWeight: 'bold'
              },
              position_x: 44,
              position_y: 390,
              width: 287,
              height: 32
            },
            {
              type: 'button',
              props: {
                text: 'Place Order',
                backgroundColor: '#00B894',
                textColor: '#FFFFFF',
                fontSize: 18,
                borderRadius: 16,
                fontWeight: '600'
              },
              position_x: 24,
              position_y: 580,
              width: 327,
              height: 56
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Music Player',
    description: 'Elegant music streaming app with playlists, player controls, and library. Dark sophisticated design.',
    category: 'entertainment',
    is_premium: false,
    tier_required: 'free',
    thumbnail_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    template_data: {
      screens: [
        {
          name: 'Home',
          type: 'home',
          backgroundColor: '#0F0F0F',
          components: [
            {
              type: 'text',
              props: {
                text: 'Good evening',
                fontSize: 28,
                color: '#FFFFFF',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 60,
              width: 327,
              height: 40
            },
            {
              type: 'card',
              props: {
                title: 'Liked Songs',
                subtitle: '847 songs',
                backgroundColor: '#1ED760',
                borderRadius: 12,
                padding: 16
              },
              position_x: 24,
              position_y: 116,
              width: 160,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Chill Vibes',
                subtitle: 'Playlist',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 198,
              position_y: 116,
              width: 153,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Workout Mix',
                subtitle: 'Playlist',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 24,
              position_y: 210,
              width: 160,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Focus Flow',
                subtitle: 'Playlist',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 198,
              position_y: 210,
              width: 153,
              height: 80
            },
            {
              type: 'text',
              props: {
                text: 'Made for You',
                fontSize: 24,
                color: '#FFFFFF',
                fontWeight: 'bold'
              },
              position_x: 24,
              position_y: 314,
              width: 327,
              height: 32
            },
            {
              type: 'card',
              props: {
                title: 'Discover Weekly',
                subtitle: 'Your weekly mixtape of fresh music',
                backgroundColor: '#282828',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 358,
              width: 327,
              height: 100
            },
            {
              type: 'card',
              props: {
                title: 'Release Radar',
                subtitle: 'New releases from artists you love',
                backgroundColor: '#282828',
                borderRadius: 16,
                padding: 20
              },
              position_x: 24,
              position_y: 474,
              width: 327,
              height: 100
            }
          ]
        },
        {
          name: 'Now Playing',
          type: 'custom',
          backgroundColor: '#0F0F0F',
          components: [
            {
              type: 'container',
              props: {
                backgroundColor: 'transparent',
                backgroundImage: 'linear-gradient(180deg, #535353 0%, #0F0F0F 100%)',
                borderRadius: 0,
                padding: 0
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 667
            },
            {
              type: 'container',
              props: {
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 0
              },
              position_x: 37,
              position_y: 120,
              width: 300,
              height: 300
            },
            {
              type: 'text',
              props: {
                text: 'Blinding Lights',
                fontSize: 26,
                color: '#FFFFFF',
                fontWeight: 'bold',
                textAlign: 'center'
              },
              position_x: 24,
              position_y: 448,
              width: 327,
              height: 36
            },
            {
              type: 'text',
              props: {
                text: 'The Weeknd',
                fontSize: 18,
                color: '#B3B3B3',
                fontWeight: '500',
                textAlign: 'center'
              },
              position_x: 24,
              position_y: 488,
              width: 327,
              height: 26
            },
            {
              type: 'button',
              props: {
                text: '▶',
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                fontSize: 32,
                borderRadius: 40
              },
              position_x: 157,
              position_y: 590,
              width: 60,
              height: 60
            }
          ]
        },
        {
          name: 'Library',
          type: 'list',
          backgroundColor: '#0F0F0F',
          components: [
            {
              type: 'header',
              props: {
                title: 'Your Library',
                backgroundColor: '#0F0F0F',
                textColor: '#FFFFFF',
                fontSize: 28,
                fontWeight: 'bold'
              },
              position_x: 0,
              position_y: 0,
              width: 375,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Liked Songs',
                subtitle: 'Playlist • 847 songs',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 24,
              position_y: 96,
              width: 327,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Summer Hits 2024',
                subtitle: 'Playlist • 42 songs',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 24,
              position_y: 192,
              width: 327,
              height: 80
            },
            {
              type: 'card',
              props: {
                title: 'Road Trip Tunes',
                subtitle: 'Playlist • 128 songs',
                backgroundColor: '#282828',
                borderRadius: 12,
                padding: 16
              },
              position_x: 24,
              position_y: 288,
              width: 327,
              height: 80
            },
            {
              type: 'button',
              props: {
                text: '+ Create Playlist',
                backgroundColor: '#1ED760',
                textColor: '#000000',
                fontSize: 16,
                borderRadius: 24,
                fontWeight: '700'
              },
              position_x: 24,
              position_y: 500,
              width: 327,
              height: 48
            }
          ]
        }
      ]
    }
  }
];

// Generate SQL migration
let sql = `/*
  # Redesign App Templates with Unique, Beautiful Designs

  1. Changes
    - Delete existing templates
    - Insert new professionally designed templates with:
      * Unique color palettes and visual identities
      * Proper spacing and layout
      * Modern design aesthetics
      * Distinct personalities for each template
      * Real-world usable designs

  2. Templates Included
    - Fitness Tracker (Energetic gradient design with vibrant greens/blues)
    - Food Delivery (Warm, appetizing red/orange palette)
    - Music Player (Dark elegant design with Spotify-inspired aesthetic)
*/

-- Delete existing templates
DELETE FROM app_templates;

-- Insert redesigned templates with unique identities
`;

templates.forEach((template, index) => {
  const jsonData = JSON.stringify(template.template_data).replace(/'/g, "''");
  sql += `INSERT INTO app_templates (name, description, category, is_premium, tier_required, template_data, thumbnail_url)
VALUES (
  '${template.name}',
  '${template.description}',
  '${template.category}',
  ${template.is_premium},
  '${template.tier_required}',
  '${jsonData}'::jsonb,
  '${template.thumbnail_url}'
);\n\n`;
});

console.log(sql);
