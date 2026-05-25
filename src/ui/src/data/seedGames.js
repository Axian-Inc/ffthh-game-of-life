export const seedGames = () => {
  const now = Date.now()

  return [
    {
      id: 1,
      name: 'Family Game Night',
      status: 'active',
      players: [
        { name: 'Jules', avatar: 'monkey-face' },
        { name: 'Seth', avatar: 'owl' },
        { name: 'Ari', avatar: 'koala' },
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
        { name: 'Mira', avatar: 'tiger-face' },
        { name: 'Quinn', avatar: 'fox' },
        { name: 'Leo', avatar: 'panda' },
        { name: 'Parker', avatar: 'gorilla' },
        { name: 'Vera', avatar: 'frog' },
        { name: 'Eli', avatar: 'penguin' },
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
        { name: 'Cora', avatar: 'penguin' },
        { name: 'Rafi', avatar: 'dog-face' },
      ],
      lastUpdated: now - 24 * 60 * 60 * 1000,
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
      resumable: false,
    },
  ]
}
