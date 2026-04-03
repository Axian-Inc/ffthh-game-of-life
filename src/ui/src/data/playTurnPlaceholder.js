import moneyBagIcon from 'openmoji/color/svg/1F4B0.svg'
import cashIcon from 'openmoji/color/svg/1F4B5.svg'
import assetsIcon from 'openmoji/color/svg/1F4C8.svg'
import debtIcon from 'openmoji/color/svg/2B07.svg'
import briefcaseIcon from 'openmoji/color/svg/1F4BC.svg'
import incomeIcon from 'openmoji/color/svg/1F4B5.svg'
import heartIcon from 'openmoji/color/svg/1F493.svg'
import brainIcon from 'openmoji/color/svg/1F9E0.svg'
import locationIcon from 'openmoji/color/svg/1F4CD.svg'
import sportsIcon from 'openmoji/color/svg/1F3C0.svg'
import vacationIcon from 'openmoji/color/svg/1F334.svg'
import gardeningIcon from 'openmoji/color/svg/1F331.svg'
import vetBillIcon from 'openmoji/color/svg/1F415.svg'
import sewerBackupIcon from 'openmoji/color/svg/1F6B0.svg'
import marketCrashIcon from 'openmoji/color/svg/1F4C9.svg'

export const PLAY_TURN_PLACEHOLDER = {
  financialStats: [
    { id: 'net-worth', label: 'Net Worth', value: '$57,500', iconSrc: moneyBagIcon, iconAlt: 'Money bag' },
    { id: 'cash', label: 'Cash (Spendable)', value: '$12,350', iconSrc: cashIcon, iconAlt: 'Cash' },
    {
      id: 'assets',
      label: 'Assets & Investments',
      value: '$85,370',
      iconSrc: assetsIcon,
      iconAlt: 'Assets and investments',
    },
    {
      id: 'debt',
      label: 'Debt',
      value: '$27,870',
      iconSrc: debtIcon,
      iconAlt: 'Debt',
      tone: 'negative',
    },
  ],
  statusStats: [
    { id: 'job', label: 'Job', value: 'Software Engineer', iconSrc: briefcaseIcon, iconAlt: 'Job briefcase' },
    { id: 'income', label: 'Income', value: '$6,500 / month', iconSrc: incomeIcon, iconAlt: 'Income' },
    {
      id: 'physical-health',
      label: 'Physical Health',
      value: 1,
      iconSrc: heartIcon,
      iconAlt: 'Physical health',
      kind: 'meter',
    },
    {
      id: 'mental-health',
      label: 'Mental Health',
      value: 0.82,
      iconSrc: brainIcon,
      iconAlt: 'Mental health',
      kind: 'meter',
    },
    { id: 'location', label: 'Location', value: 'Denver, CO', iconSrc: locationIcon, iconAlt: 'Location' },
  ],
  modifierGroups: [
    {
      id: 'choice-modifiers',
      title: 'Choice Modifiers',
      items: [
        { id: 'sports', label: 'Play Sports', iconSrc: sportsIcon, iconAlt: 'Play Sports' },
        { id: 'vacation', label: 'Vacation', iconSrc: vacationIcon, iconAlt: 'Vacation' },
        { id: 'gardening', label: 'Gardening', iconSrc: gardeningIcon, iconAlt: 'Gardening' },
      ],
    },
    {
      id: 'life-modifiers',
      title: 'Life Modifiers',
      items: [
        { id: 'vet-bill', label: 'Vet Bill', iconSrc: vetBillIcon, iconAlt: 'Vet Bill' },
        { id: 'sewer-backup', label: 'Sewer Backup', iconSrc: sewerBackupIcon, iconAlt: 'Sewer Backup' },
        { id: 'market-crash', label: 'Market Crash', iconSrc: marketCrashIcon, iconAlt: 'Market Crash' },
      ],
    },
  ],
}
