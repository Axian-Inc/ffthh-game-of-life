import { getPlayerAvatarOption } from '../../data/playerAvatars'

const PlayerAvatar = ({ avatar, className = '', decorative = false }) => {
  const option = getPlayerAvatarOption(avatar)
  const classes = `player-avatar-render ${className}`.trim()

  if (option) {
    const { src, label } = option
    return (
      <span
        aria-hidden={decorative}
        aria-label={decorative ? undefined : label}
        className={classes}
        role={decorative ? undefined : 'img'}
      >
        <img alt={decorative ? '' : label} src={src} />
      </span>
    )
  }

  return (
    <span aria-hidden={decorative} className={classes} role={decorative ? undefined : 'img'}>
      {avatar || '?'}
    </span>
  )
}

export default PlayerAvatar
