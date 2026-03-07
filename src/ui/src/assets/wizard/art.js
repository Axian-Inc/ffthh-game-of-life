const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const buildJobArt = ({ accent, secondary, title, figure, detail }) =>
  encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" fill="none">
      <defs>
        <linearGradient id="bg" x1="24" y1="18" x2="330" y2="196" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}" />
          <stop offset="1" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="360" height="220" rx="20" fill="url(#bg)" />
      <rect x="16" y="16" width="328" height="188" rx="16" fill="rgba(255,255,255,0.22)" />
      <path d="${figure}" fill="#FDFBF5" fill-opacity="0.92" />
      <path d="${detail}" stroke="#2A3040" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="24" y="24" width="132" height="30" rx="15" fill="rgba(255,255,255,0.28)" />
      <text x="90" y="44" fill="#243042" font-family="Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle">
        ${title}
      </text>
    </svg>
  `)

export const WIZARD_JOB_ART = {
  dentalHygienist: buildJobArt({
    accent: '#99d7dd',
    secondary: '#74b8db',
    title: 'Dental',
    figure:
      'M87 162c0-32 22-57 49-57 26 0 48 25 48 57H87Zm137-27c0-44 29-78 65-78s64 34 64 78v27h-129v-27Zm-32-18c0-17 13-30 29-30 17 0 30 13 30 30s-13 30-30 30c-16 0-29-13-29-30Zm-76-24c0-22 18-40 40-40s40 18 40 40-18 40-40 40-40-18-40-40Z',
    detail:
      'M283 64v88M246 95h78M96 161h145M123 88l26 26m38-52v66',
  }),
  electrician: buildJobArt({
    accent: '#9fd6f3',
    secondary: '#6990da',
    title: 'Electric',
    figure:
      'M38 170h136V52H38v118Zm176 6c0-48 31-86 69-86s69 38 69 86H214Zm19-94c0-21 17-38 38-38s38 17 38 38-17 38-38 38-38-17-38-38Z',
    detail:
      'M62 77h88M62 105h88M62 133h88M273 84l-21 48h31l-15 43M286 74v21',
  }),
  mechanic: buildJobArt({
    accent: '#b8d8ea',
    secondary: '#8fb5c9',
    title: 'Garage',
    figure:
      'M40 168c0-51 34-91 76-91s75 40 75 91H40Zm196-16c0-44 28-78 62-78s62 34 62 78v16H236v-16Zm15-86c0-19 16-35 35-35s35 16 35 35-16 35-35 35-35-16-35-35Z',
    detail:
      'M230 121h108M258 91l18 18m27-18-18 18M84 146h62M102 121l16 25m24-25-16 25',
  }),
}
