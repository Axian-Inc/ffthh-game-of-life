import PlayerAvatar from '../ui/PlayerAvatar'
import {
  getWizardCity,
  getWizardJob,
  getWizardTrack,
  getWizardPersona,
  wizardSummaryFixture,
} from '../../data/wizardVisualCatalog'

const mapPlayerToSummaryRow = (player) => {
  const persona = typeof player.avatar === 'string' ? getWizardPersona(player.avatar) : player.avatar
  const city = player.cityAsset ? { asset: player.cityAsset, title: player.cityLabel } : getWizardCity(player.cityId)
  const track = player.educationAsset
    ? { asset: player.educationAsset, title: player.educationLabel }
    : getWizardTrack(player.educationTrackId)
  const job = player.jobAsset ? { asset: player.jobAsset, title: player.jobLabel } : getWizardJob(player.jobId)

  return {
    ...player,
    avatar: persona,
    city,
    track,
    job,
  }
}

const NewGameWizardStep5Summary = ({ players, visualFixture = false }) => {
  const rows = (visualFixture ? wizardSummaryFixture : players).map(mapPlayerToSummaryRow)

  return (
    <div className="wizard-step wizard-step-summary" data-step="5">
      <div className="wizard-summary-sheet" aria-label="New game summary">
        {rows.map((player) => (
          <div key={player.id} className="wizard-summary-row">
            <div className="wizard-summary-cluster wizard-summary-player">
              <div className="wizard-summary-avatar">
                <PlayerAvatar avatar={player.avatar} decorative />
              </div>
              <div className="wizard-summary-copy">
                <p>
                  <strong>Name:</strong> {player.name}
                </p>
                <p>
                  <strong>City:</strong> {player.cityLabel || player.city.title}
                </p>
              </div>
            </div>
            <div className="wizard-summary-cluster wizard-summary-visual">
              <img alt="" aria-hidden="true" src={player.city.asset} />
            </div>
            <div className="wizard-summary-cluster wizard-summary-education">
              <div className="wizard-summary-copy">
                <p>
                  <strong>Education:</strong>
                </p>
              </div>
              <img alt="" aria-hidden="true" src={player.track.asset} />
            </div>
            <div className="wizard-summary-cluster wizard-summary-job">
              <div className="wizard-summary-copy">
                <p>
                  <strong>Job:</strong>
                </p>
                <p>{player.jobLabel || player.job.title}</p>
              </div>
              <img alt="" aria-hidden="true" src={player.job.asset} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewGameWizardStep5Summary
