const AvatarRow = ({ players, maxVisible = 4 }) => {
  const visible = players.slice(0, maxVisible)
  const overflow = players.length - visible.length

  return (
    <div className="avatar-row" aria-label={`${players.length} players`}>
      {visible.map((player, index) => (
        <span className="avatar" key={`player-${index}`} aria-hidden="true">
          {typeof player === 'string' ? player : player.avatar}
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
