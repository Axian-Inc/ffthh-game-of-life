import PlayerAvatar from '../ui/PlayerAvatar'

const AvatarRow = ({ players, maxVisible = 4 }) => {
  const visible = players.slice(0, maxVisible)
  const overflow = players.length - visible.length

  return (
    <div className="avatar-row" aria-label={`${players.length} players`}>
      {visible.map((player, index) => (
        <span className="avatar" key={`player-${index}`} aria-hidden="true">
          <PlayerAvatar avatar={typeof player === 'string' ? player : player.avatar} decorative />
        </span>
      ))}
      {overflow > 0 ? (
        <span className="avatar avatar-overflow" aria-hidden="true">
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

export default AvatarRow
