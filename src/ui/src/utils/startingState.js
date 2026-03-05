import { getCityById, getEducationTrackById, getJobById } from '../data/setupCatalog'

const DEFAULT_STARTING_CASH = 500

export const buildStartingState = ({ cityId, trackId, jobId }) => {
  const city = getCityById(cityId)
  if (!city) {
    throw new Error(`Unknown city id: ${cityId}`)
  }

  const track = getEducationTrackById(trackId)
  if (!track) {
    throw new Error(`Unknown track id: ${trackId}`)
  }

  const job = getJobById(jobId)
  if (!job) {
    throw new Error(`Unknown job id: ${jobId}`)
  }

  if (job.trackId !== track.id) {
    throw new Error(`Job ${job.id} does not belong to track ${track.id}`)
  }

  const cash = Number.isFinite(job.startingCash) ? job.startingCash : DEFAULT_STARTING_CASH
  const assets = 0
  const investments = 0
  const debt = job.startDebt
  const monthlyIncome = Math.round(job.annualSalary / 12)
  const netWorth = assets + investments + cash - debt

  return {
    cityId: city.id,
    trackId: track.id,
    jobId: job.id,
    cash,
    assets,
    investments,
    debt,
    monthlyIncome,
    netWorth,
  }
}
