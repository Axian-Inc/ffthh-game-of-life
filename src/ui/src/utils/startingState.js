import { getJobById } from '../data/setupCatalog'

const resolveSelectedJob = (selectedJob) => {
  if (typeof selectedJob === 'string') {
    return getJobById(selectedJob)
  }

  return selectedJob || null
}

export const createStartingStateFromJob = (selectedJob) => {
  const job = resolveSelectedJob(selectedJob)

  if (!job) {
    throw new Error('A valid starting job is required to create the starting state.')
  }

  const cash = job.startingCash ?? 500
  const assets = 0
  const investments = 0
  const debt = job.startDebt
  const monthlyIncome = Math.round(job.annualSalary / 12)
  const netWorth = assets + investments + cash - debt

  return {
    cash,
    assets,
    investments,
    debt,
    monthlyIncome,
    netWorth,
  }
}
