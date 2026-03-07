const svgUri = (markup) => `data:image/svg+xml,${encodeURIComponent(markup)}`

const makeArt = ({ title, subtitle, colors, glyph = '' }) =>
  svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="480" height="300" rx="24" fill="url(#bg)"/>
      <rect x="20" y="20" width="440" height="260" rx="18" fill="rgba(255,255,255,0.22)"/>
      <text x="32" y="66" fill="#ffffff" font-family="Inter, sans-serif" font-size="40" font-weight="800">${glyph}</text>
      <text x="32" y="116" fill="#ffffff" font-family="Inter, sans-serif" font-size="30" font-weight="800">${title}</text>
      <text x="32" y="152" fill="rgba(255,255,255,0.95)" font-family="Inter, sans-serif" font-size="22" font-weight="600">${subtitle}</text>
    </svg>
  `)

export const WIZARD_ART = {
  citySanFrancisco: makeArt({
    title: 'San Francisco',
    subtitle: 'High opportunity and high cost',
    colors: ['#4a9bda', '#1f6ca8'],
    glyph: '🌉',
  }),
  cityDenver: makeArt({
    title: 'Denver',
    subtitle: 'Balanced growth profile',
    colors: ['#7ab0e4', '#4f83bd'],
    glyph: '🏔️',
  }),
  cityTonopah: makeArt({
    title: 'Tonopah, NV',
    subtitle: 'Low cost and slower growth',
    colors: ['#bba26b', '#9e8551'],
    glyph: '🏜️',
  }),
  jobDental: makeArt({
    title: 'Dental Hygienist',
    subtitle: 'Good further specialization options',
    colors: ['#74c6d1', '#5b9cab'],
    glyph: '🦷',
  }),
  jobElectrician: makeArt({
    title: 'Electrician',
    subtitle: 'High with master electrician license track',
    colors: ['#5f86c8', '#355894'],
    glyph: '⚡',
  }),
  jobMechanic: makeArt({
    title: 'Mechanic',
    subtitle: 'Good with ASE certification track',
    colors: ['#8fa8bc', '#5f798f'],
    glyph: '🔧',
  }),
}
