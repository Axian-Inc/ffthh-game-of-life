export const seedGames = () => {
  const now = Date.now()

  return [
    {
      id: 1,
      name: 'Family Game Night',
      status: 'active',
      players: [
        { name: 'Jules', avatar: '🧩' },
        { name: 'Seth', avatar: '⚡' },
        { name: 'Ari', avatar: '🌿' },
      ],
      lastUpdated: now - 60 * 60 * 1000,
      createdAt: now - 5 * 60 * 60 * 1000,
      resumable: true,
    },
    {
      id: 2,
      name: 'Weekend Tournament',
      status: 'paused',
      players: [
        { name: 'Mira', avatar: '🔥' },
        { name: 'Quinn', avatar: '💫' },
        { name: 'Leo', avatar: '🪐' },
        { name: 'Parker', avatar: '🧠' },
        { name: 'Vera', avatar: '🎯' },
        { name: 'Eli', avatar: '🛰️' },
      ],
      lastUpdated: now - 3 * 60 * 60 * 1000,
      createdAt: now - 7 * 60 * 60 * 1000,
      resumable: false,
    },
    {
      id: 3,
      name: 'Ultra-Long Experimental Universe Name That Keeps Going',
      status: 'completed',
      players: [
        { name: 'Cora', avatar: '🌊' },
        { name: 'Rafi', avatar: '🧩' },
      ],
      lastUpdated: now - 24 * 60 * 60 * 1000,
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
      resumable: false,
    },
  ]
}
