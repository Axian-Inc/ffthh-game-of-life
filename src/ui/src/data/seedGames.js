export const seedGames = () => {
  const now = Date.now()

  return [
    {
      id: 1,
      name: 'Family Game Night',
      status: 'active',
      lifecycle: { phase: 'started' },
      startedAt: now - 60 * 60 * 1000,
      players: [
        { id: 'seed-1', name: 'Jules', avatar: 'monkey-face' },
        { id: 'seed-2', name: 'Seth', avatar: 'owl' },
        { id: 'seed-3', name: 'Ari', avatar: 'koala' },
      ],
      lastUpdated: now - 60 * 60 * 1000,
      createdAt: now - 5 * 60 * 60 * 1000,
      resumable: true,
    },
    {
      id: 2,
      name: 'Weekend Tournament',
      status: 'paused',
      lifecycle: { phase: 'started' },
      startedAt: now - 3 * 60 * 60 * 1000,
      players: [
        { id: 'seed-4', name: 'Mira', avatar: 'tiger-face' },
        { id: 'seed-5', name: 'Quinn', avatar: 'fox' },
        { id: 'seed-6', name: 'Leo', avatar: 'panda' },
        { id: 'seed-7', name: 'Parker', avatar: 'gorilla' },
        { id: 'seed-8', name: 'Vera', avatar: 'frog' },
        { id: 'seed-9', name: 'Eli', avatar: 'penguin' },
      ],
      lastUpdated: now - 3 * 60 * 60 * 1000,
      createdAt: now - 7 * 60 * 60 * 1000,
      resumable: false,
    },
    {
      id: 3,
      name: 'Ultra-Long Experimental Universe Name That Keeps Going',
      status: 'completed',
      lifecycle: { phase: 'started' },
      startedAt: now - 2 * 24 * 60 * 60 * 1000,
      players: [
        { id: 'seed-10', name: 'Cora', avatar: 'penguin' },
        { id: 'seed-11', name: 'Rafi', avatar: 'dog-face' },
      ],
      lastUpdated: now - 24 * 60 * 60 * 1000,
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
      resumable: false,
    },
  ]
}
