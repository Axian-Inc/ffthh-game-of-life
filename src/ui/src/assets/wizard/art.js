const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

const cardFrame = ({ background = '#ffffff', shadow = '#d7e9f6', content = '' }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" rx="28" fill="${background}"/>
  <rect x="12" y="12" width="156" height="156" rx="24" fill="#ffffff" stroke="${shadow}" stroke-width="3"/>
  ${content}
</svg>`

const personaContent = (primary, secondary, glyph) => `
  <defs>
    <linearGradient id="tile" x1="24" y1="24" x2="156" y2="156" gradientUnits="userSpaceOnUse">
      <stop stop-color="${primary}"/>
      <stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect x="24" y="24" width="132" height="132" rx="24" fill="url(#tile)"/>
  <circle cx="90" cy="90" r="44" fill="#ffffff" fill-opacity=".88"/>
  ${glyph}
`

const personaGlyphs = {
  rocket: '<path d="M80 56c14-10 24-6 30 8l-6 10 12 12-12 6-10 24-10-18-18-10 12-12 2-20Z" fill="#6f58d9" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><path d="M69 113 54 126l9-22" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><circle cx="96" cy="74" r="8" fill="#7be4ef"/>',
  robot: '<rect x="58" y="62" width="64" height="54" rx="12" fill="#b7eaf1" stroke="#2a3150" stroke-width="4"/><path d="M90 48v14" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><circle cx="78" cy="82" r="6" fill="#ff925d"/><circle cx="102" cy="82" r="6" fill="#ff925d"/><path d="M74 100h32" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M62 122v10M118 122v10M42 82h16M122 82h16" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  cat: '<path d="m62 118-8-42 18-12 18 8 18-8 18 12-8 42H62Z" fill="#ffd59d" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><path d="m76 62 10-16 12 14 10-14 10 16" fill="#ffd59d" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><circle cx="80" cy="88" r="5" fill="#2a3150"/><circle cx="106" cy="88" r="5" fill="#2a3150"/><path d="M87 100c2 5 14 5 16 0" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  octopus: '<path d="M90 54c24 0 38 18 38 40 0 26-18 42-38 42S52 120 52 94c0-22 14-40 38-40Z" fill="#c8a7ff" stroke="#2a3150" stroke-width="4"/><circle cx="78" cy="88" r="5" fill="#2a3150"/><circle cx="102" cy="88" r="5" fill="#2a3150"/><path d="M68 118c-10 10-20 6-24-6M80 124c-8 14-20 14-26 2M94 124c8 14 20 14 26 2M112 118c10 10 20 6 24-6" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  books: '<rect x="56" y="58" width="68" height="20" rx="6" fill="#5ec86f" stroke="#2a3150" stroke-width="4"/><rect x="50" y="80" width="74" height="18" rx="6" fill="#8ec4ff" stroke="#2a3150" stroke-width="4"/><rect x="58" y="100" width="66" height="18" rx="6" fill="#ffd274" stroke="#2a3150" stroke-width="4"/><path d="M70 58v60M96 58v60" stroke="#ffffff" stroke-width="4"/>',
  star: '<path d="m90 48 14 28 31 4-22 20 6 30-29-15-29 15 6-30-22-20 31-4 14-28Z" fill="#ffd857" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/>',
  saturn: '<ellipse cx="90" cy="98" rx="30" ry="24" fill="#7dd5f4" stroke="#2a3150" stroke-width="4"/><path d="M40 102c18-18 82-26 100 0-18 24-82 18-100 0Z" stroke="#6f58d9" stroke-width="8" stroke-linecap="round"/>',
  rocketSmall: '<path d="M82 56c16-8 24-4 28 10l-4 8 10 10-12 6-8 22-10-16-16-10 10-10 2-20Z" fill="#ff7b78" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><circle cx="96" cy="72" r="7" fill="#89e4fb"/><path d="m76 112-14 14" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  tree: '<rect x="82" y="100" width="16" height="34" rx="6" fill="#8f6238"/><circle cx="90" cy="86" r="28" fill="#7ad36f" stroke="#2a3150" stroke-width="4"/><circle cx="68" cy="96" r="16" fill="#66c95c"/><circle cx="112" cy="96" r="16" fill="#66c95c"/>',
  journal: '<rect x="56" y="52" width="68" height="76" rx="10" fill="#b57f45" stroke="#2a3150" stroke-width="4"/><rect x="68" y="66" width="40" height="10" rx="5" fill="#f4e4b2"/><path d="M78 52v76" stroke="#7d5533" stroke-width="6"/><path d="M88 90h18" stroke="#f4e4b2" stroke-width="4" stroke-linecap="round"/>',
  spider: '<circle cx="90" cy="88" r="18" fill="#44445c" stroke="#2a3150" stroke-width="4"/><circle cx="90" cy="64" r="10" fill="#44445c" stroke="#2a3150" stroke-width="4"/><path d="M56 74 42 64M124 74l14-10M56 100 38 104M124 100l18 4M60 118l-14 18M120 118l14 18" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  sun: '<circle cx="90" cy="90" r="26" fill="#ffd857" stroke="#2a3150" stroke-width="4"/><path d="M90 42v18M90 120v18M42 90h18M120 90h18M58 58l12 12M110 110l12 12M58 122l12-12M110 70l12-12" stroke="#f6a33d" stroke-width="6" stroke-linecap="round"/>',
  treeRound: '<rect x="82" y="102" width="16" height="32" rx="6" fill="#8f6238"/><circle cx="74" cy="86" r="18" fill="#7ad36f"/><circle cx="104" cy="80" r="22" fill="#8cd96d"/><circle cx="92" cy="98" r="24" fill="#66c95c" stroke="#2a3150" stroke-width="4"/>',
  openBook: '<path d="M48 64c18-14 42-14 58-2v56c-16-12-40-12-58 2V64ZM132 64c-18-14-42-14-58-2v56c16-12 40-12 58 2V64Z" fill="#f7f2e3" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><path d="M90 62v58M60 82h20M60 98h20M100 82h20M100 98h20" stroke="#8aa3c8" stroke-width="4" stroke-linecap="round"/>',
  car: '<path d="M52 102h76l-8-22H66l-14 22Z" fill="#ff786f" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><circle cx="72" cy="108" r="10" fill="#4a526a"/><circle cx="112" cy="108" r="10" fill="#4a526a"/><path d="M78 80h30l12 18H64l14-18Z" fill="#9bd7ff" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/>',
  crab: '<circle cx="90" cy="92" r="22" fill="#ff7f76" stroke="#2a3150" stroke-width="4"/><path d="M62 86 46 74M118 86l16-12M60 106 44 118M120 106l16 12M72 120l-8 14M108 120l8 14" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M72 70 56 56M108 70l16-14" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  snake: '<path d="M50 110c12-38 52-54 74-36 18 14 8 44-22 42-22-2-30-26-12-34 12-6 22 2 22 12" stroke="#7bbf55" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="118" cy="74" r="6" fill="#2a3150"/>',
  turtle: '<ellipse cx="92" cy="92" rx="34" ry="28" fill="#7bc664" stroke="#2a3150" stroke-width="4"/><circle cx="132" cy="90" r="12" fill="#93d882" stroke="#2a3150" stroke-width="4"/><path d="M70 66 58 54M112 66l12-12M72 118l-12 14M112 118l12 14" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  alien: '<path d="M90 48c24 0 40 18 40 40 0 30-20 48-40 48S50 118 50 88c0-22 16-40 40-40Z" fill="#9ef188" stroke="#2a3150" stroke-width="4"/><ellipse cx="74" cy="92" rx="10" ry="14" fill="#2a3150"/><ellipse cx="106" cy="92" rx="10" ry="14" fill="#2a3150"/><path d="M74 116c10 6 22 6 32 0" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  monster: '<path d="M56 66c0-10 8-18 18-18h32c10 0 18 8 18 18v52c0 10-8 18-18 18H74c-10 0-18-8-18-18V66Z" fill="#8ce28d" stroke="#2a3150" stroke-width="4"/><circle cx="76" cy="82" r="8" fill="#ffffff" stroke="#2a3150" stroke-width="4"/><circle cx="104" cy="82" r="8" fill="#ffffff" stroke="#2a3150" stroke-width="4"/><circle cx="76" cy="82" r="3" fill="#2a3150"/><circle cx="104" cy="82" r="3" fill="#2a3150"/><path d="M72 108h40" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M64 58 54 46M116 58l10-12" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  brain: '<path d="M72 54c-14 0-24 10-24 22 0 8 4 14 10 18-4 18 8 36 28 36 12 0 20-4 24-12 6 8 14 12 24 12 20 0 32-18 28-36 6-4 10-10 10-18 0-12-10-22-24-22-8 0-14 2-20 8-4-6-12-8-20-8-8 0-14 2-20 8-6-6-12-8-16-8Z" fill="#ff91b1" stroke="#2a3150" stroke-width="4"/><path d="M82 62v56M100 68v50M66 82h34M100 86h26" stroke="#d55f89" stroke-width="4" stroke-linecap="round"/>',
  laptop: '<path d="M54 70h72v42H54z" fill="#a4d8ff" stroke="#2a3150" stroke-width="4"/><path d="M44 118h92l-8 14H52l-8-14Z" fill="#8bc7cf" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><circle cx="90" cy="92" r="8" fill="#ffb66c"/><path d="M90 100v20M68 126h44" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M78 84h24" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>',
  machine: '<rect x="48" y="86" width="84" height="32" rx="10" fill="#8cdff2" stroke="#2a3150" stroke-width="4"/><circle cx="70" cy="102" r="8" fill="#ffffff" stroke="#2a3150" stroke-width="4"/><circle cx="110" cy="102" r="8" fill="#ffffff" stroke="#2a3150" stroke-width="4"/><path d="M66 86V62h48v24M78 62V48M102 62V48M90 48h24" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
}

const createPersonaArt = (key, colors) => encodeSvg(cardFrame({ content: personaContent(colors[0], colors[1], personaGlyphs[key]) }))

const createSceneArt = ({ content, background = '#ffffff', shadow }) =>
  encodeSvg(cardFrame({ background, shadow: shadow || '#d2e3f2', content }))

const sceneIcons = {
  bridge: '<rect x="26" y="122" width="128" height="10" rx="5" fill="#7bb7ff"/><path d="M44 122V78m92 44V78M40 92h100" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M44 78 90 46l46 32" stroke="#f2745c" stroke-width="8" stroke-linecap="round"/>',
  mountains: '<path d="M36 124 74 64l26 34 18-22 26 48H36Z" fill="#7a95b3"/><path d="M66 78 74 64l8 14M114 80l4-4 6 8" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><rect x="26" y="124" width="128" height="14" rx="7" fill="#7fcf69"/>',
  desert: '<rect x="26" y="112" width="128" height="26" rx="12" fill="#ebc27a"/><path d="M48 112c14-18 42-18 54 0" stroke="#d9a453" stroke-width="8" stroke-linecap="round"/><rect x="88" y="78" width="28" height="20" rx="4" fill="#d9a453" stroke="#2a3150" stroke-width="4"/><path d="M102 78V58M132 76c0-16-14-30-30-30" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><circle cx="58" cy="70" r="12" fill="#8bd4ef"/>',
  campus: '<rect x="40" y="74" width="100" height="54" rx="8" fill="#d88f67" stroke="#2a3150" stroke-width="4"/><path d="M38 74 90 46l52 28" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><path d="M64 92h14M64 108h14M102 92h14M102 108h14" stroke="#f7e9cb" stroke-width="6" stroke-linecap="round"/><rect x="82" y="92" width="16" height="36" fill="#89573f"/>',
  tools: '<circle cx="70" cy="98" r="18" fill="#f4b44c"/><path d="m78 70 34 34M112 78 78 112M50 60l12 12M118 60l12 12" stroke="#53606e" stroke-width="8" stroke-linecap="round"/><path d="M44 120h92" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  monitor: '<rect x="44" y="56" width="92" height="56" rx="10" fill="#87b1f7" stroke="#2a3150" stroke-width="4"/><path d="M58 72h48M58 88h34M82 120h16M64 132h52" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><rect x="98" y="74" width="22" height="26" rx="4" fill="#7fd29a"/>',
  dental: '<path d="M48 116c0-22 18-40 40-40 28 0 44 22 44 40" stroke="#2a3150" stroke-width="4"/><path d="M72 54c12-10 32-10 44 0" stroke="#2a3150" stroke-width="4"/><rect x="102" y="92" width="26" height="18" rx="6" fill="#ffd59d"/><path d="M84 70c0 20-10 30-10 42 0 10 8 18 16 18s16-8 16-18c0-12-10-22-10-42" fill="#ffffff" stroke="#2a3150" stroke-width="4"/>',
  electrician: '<rect x="46" y="52" width="64" height="82" rx="12" fill="#576b82" stroke="#2a3150" stroke-width="4"/><path d="M64 68h28M64 84h28M64 100h28" stroke="#9dd7ff" stroke-width="6" stroke-linecap="round"/><path d="M116 62c14 10 20 24 20 42" stroke="#2a3150" stroke-width="4"/><circle cx="126" cy="70" r="12" fill="#ffbe52" stroke="#2a3150" stroke-width="4"/><path d="M126 84v24" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/>',
  mechanic: '<path d="M34 108h112l-10 20H44l-10-20Z" fill="#7db0d9" stroke="#2a3150" stroke-width="4" stroke-linejoin="round"/><path d="M62 108V78h56l16 30" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><circle cx="66" cy="126" r="10" fill="#4a526a"/><circle cx="116" cy="126" r="10" fill="#4a526a"/><path d="m44 72 16 16m60-20 14 14" stroke="#738596" stroke-width="8" stroke-linecap="round"/>',
  roseCity: '<rect x="98" y="84" width="16" height="42" rx="4" fill="#7db067"/><path d="M64 90c0-20 18-34 34-34s34 14 34 34-18 34-34 34S64 110 64 90Z" fill="#d87272" stroke="#2a3150" stroke-width="4"/><path d="M48 126h90" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><rect x="118" y="82" width="22" height="44" fill="#9ab3c9"/><rect x="146" y="72" width="16" height="54" fill="#7d93b5"/>',
  stethoscope: '<path d="M66 48v30c0 14 10 24 24 24s24-10 24-24V48" stroke="#2a3150" stroke-width="6" stroke-linecap="round"/><circle cx="114" cy="110" r="14" fill="#9bd7ff" stroke="#2a3150" stroke-width="4"/><path d="M84 102c4 18 18 30 34 30" stroke="#2a3150" stroke-width="4" stroke-linecap="round"/><circle cx="146" cy="134" r="10" fill="#ffd59d" stroke="#2a3150" stroke-width="4"/>',
}

export const wizardArt = {
  personas: {
    rocket: createPersonaArt('rocket', ['#84dff5', '#ba7df4']),
    robot: createPersonaArt('robot', ['#9ed5ff', '#87d7c0']),
    cat: createPersonaArt('cat', ['#ffd8a2', '#ffb879']),
    octopus: createPersonaArt('octopus', ['#d9b4ff', '#95d9ff']),
    books: createPersonaArt('books', ['#b8efc3', '#8ed2ff']),
    star: createPersonaArt('star', ['#ffe590', '#f9c66b']),
    saturn: createPersonaArt('saturn', ['#91d0ff', '#8cb0ff']),
    rocketSmall: createPersonaArt('rocketSmall', ['#ffd7d6', '#ffb2ab']),
    tree: createPersonaArt('tree', ['#b7efaf', '#7dcf72']),
    journal: createPersonaArt('journal', ['#e8d2a8', '#d9b47d']),
    spider: createPersonaArt('spider', ['#ddddef', '#b8b8d9']),
    sun: createPersonaArt('sun', ['#ffe48d', '#ffc362']),
    treeRound: createPersonaArt('treeRound', ['#bceaa4', '#89d96f']),
    openBook: createPersonaArt('openBook', ['#f9f1d9', '#d5e0ff']),
    car: createPersonaArt('car', ['#ffd0c7', '#ffb5a8']),
    crab: createPersonaArt('crab', ['#ffd5d1', '#ffb0a7']),
    snake: createPersonaArt('snake', ['#c7f1b4', '#94d67b']),
    turtle: createPersonaArt('turtle', ['#d9f3b8', '#a7d987']),
    alien: createPersonaArt('alien', ['#d7ffc4', '#9ee387']),
    monster: createPersonaArt('monster', ['#d4ffd1', '#91e0a1']),
    robot2: createPersonaArt('robot', ['#c9e8ff', '#97d9e6']),
    brain: createPersonaArt('brain', ['#ffd3df', '#ffb0c4']),
    rocket2: createPersonaArt('rocketSmall', ['#ffd7d6', '#ffc36e']),
    laptop: createPersonaArt('laptop', ['#c9f0ff', '#9dd8d1']),
    machine: createPersonaArt('machine', ['#d4f3ff', '#b6d1ff']),
  },
  cities: {
    sanFrancisco: createSceneArt({ content: sceneIcons.bridge }),
    denver: createSceneArt({ content: sceneIcons.mountains }),
    tonopah: createSceneArt({ content: sceneIcons.desert }),
    portland: createSceneArt({ content: sceneIcons.roseCity }),
  },
  tracks: {
    degree: createSceneArt({ content: sceneIcons.campus }),
    trades: createSceneArt({ content: sceneIcons.tools }),
    selfTaught: createSceneArt({ content: sceneIcons.monitor }),
  },
  jobs: {
    dentalHygienist: createSceneArt({ content: sceneIcons.dental }),
    electrician: createSceneArt({ content: sceneIcons.electrician }),
    mechanic: createSceneArt({ content: sceneIcons.mechanic }),
    veterinarian: createSceneArt({ content: sceneIcons.stethoscope }),
  },
}
