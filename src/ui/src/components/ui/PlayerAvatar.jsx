import { getPlayerAvatarOption } from '../../data/playerAvatars'
import { getWizardPersona } from '../../data/wizardVisualCatalog'

const PlayerAvatar = ({ avatar, className = '', decorative = false }) => {
  const option =
    typeof avatar === 'string'
      ? getPlayerAvatarOption(avatar) || getWizardPersona(avatar)
      : avatar
  const classes = `player-avatar-render ${className}`.trim()

  if (option?.src || option?.asset) {
    const src = option.src || option.asset
    const label = option.label
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
