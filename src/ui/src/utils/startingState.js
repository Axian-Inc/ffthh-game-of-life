export const computeStartingState = ({ city, track, job }) => {
  if (!city?.id) {
    throw new Error('computeStartingState requires a city with an id')
  }

  if (!track?.id) {
    throw new Error('computeStartingState requires a track with an id')
  }

  if (!job?.id) {
    throw new Error('computeStartingState requires a job with an id')
  }

  if (job.trackId !== track.id) {
    throw new Error(`job ${job.id} does not belong to track ${track.id}`)
  }

  const cash = job.startingCash ?? 500
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
