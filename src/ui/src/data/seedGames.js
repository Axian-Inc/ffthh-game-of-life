import { beginNextTurnState, createInitialGameState } from '../utils/turnEngine'

const buildPlayers = (players) =>
  players.map((player, index) => ({
    id: player.id ?? `player-${index + 1}`,
    name: player.name,
    avatar: player.avatar,
    cityId: player.cityId,
    educationTrackId: player.educationTrackId,
    jobId: player.jobId,
  }))

export const seedGames = () => {
  const active = createInitialGameState({
    id: '1',
    name: 'Family Game Night',
    players: buildPlayers([
      { name: 'Jules', avatar: 'monkey-face', cityId: 'suburbia', educationTrackId: 'degree', jobId: 'software-engineer' },
      { name: 'Seth', avatar: 'owl', cityId: 'metro', educationTrackId: 'trades', jobId: 'electrician' },
      { name: 'Ari', avatar: 'koala', cityId: 'small-town', educationTrackId: 'self-taught', jobId: 'content-creator' },
    ]),
  })

  const paused = beginNextTurnState(
    createInitialGameState({
      id: '2',
      name: 'Weekend Tournament',
      players: buildPlayers([
        { name: 'Mira', avatar: 'tiger-face', cityId: 'metro', educationTrackId: 'degree', jobId: 'registered-nurse' },
        { name: 'Quinn', avatar: 'fox', cityId: 'suburbia', educationTrackId: 'trades', jobId: 'plumber' },
        { name: 'Leo', avatar: 'panda', cityId: 'small-town', educationTrackId: 'self-taught', jobId: 'entrepreneur' },
      ]),
    }),
  )
  paused.status = 'handoff'
  paused.pendingHandoff = {
    fromPlayerId: paused.players[0].id,
    toPlayerId: paused.players[1].id,
    toPlayerName: paused.players[1].name,
    month: paused.currentMonth,
    readyAt: paused.lastUpdated,
  }

  const completed = createInitialGameState({
    id: '3',
    name: 'Completed Session',
    players: buildPlayers([
      { name: 'Cora', avatar: 'penguin', cityId: 'suburbia', educationTrackId: 'degree', jobId: 'financial-analyst' },
      { name: 'Rafi', avatar: 'dog-face', cityId: 'small-town', educationTrackId: 'self-taught', jobId: 'musician' },
    ]),
  })
  completed.status = 'completed'

  return [active, paused, completed]
}
