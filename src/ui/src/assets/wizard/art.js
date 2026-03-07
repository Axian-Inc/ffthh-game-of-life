const makeSvgDataUrl = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`

const citySkyline = makeSvgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220' fill='none'>
  <defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#9be4de'/><stop offset='1' stop-color='#68a7e8'/></linearGradient></defs>
  <rect width='320' height='220' rx='24' fill='url(#g1)'/>
  <circle cx='240' cy='58' r='30' fill='#fff' fill-opacity='.45'/>
  <rect x='20' y='120' width='44' height='70' rx='4' fill='#2b4b66' fill-opacity='.55'/>
  <rect x='74' y='92' width='60' height='98' rx='4' fill='#2b4b66' fill-opacity='.6'/>
  <rect x='142' y='108' width='52' height='82' rx='4' fill='#2b4b66' fill-opacity='.65'/>
  <rect x='202' y='80' width='48' height='110' rx='4' fill='#2b4b66' fill-opacity='.7'/>
  <rect x='258' y='102' width='40' height='88' rx='4' fill='#2b4b66' fill-opacity='.6'/>
</svg>
`)

const collegePath = makeSvgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220' fill='none'>
  <defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#9cc5ff'/><stop offset='1' stop-color='#b89df6'/></linearGradient></defs>
  <rect width='320' height='220' rx='24' fill='url(#g2)'/>
  <path d='M24 150 160 82l136 68-136 68L24 150Z' fill='#243b77' fill-opacity='.5'/>
  <path d='M160 86v112' stroke='#fff' stroke-width='8' stroke-linecap='round' stroke-opacity='.6'/>
  <circle cx='160' cy='72' r='22' fill='#fff' fill-opacity='.5'/>
</svg>
`)

const tradeTools = makeSvgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220' fill='none'>
  <defs><linearGradient id='g3' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#9ce0bd'/><stop offset='1' stop-color='#78b7d8'/></linearGradient></defs>
  <rect width='320' height='220' rx='24' fill='url(#g3)'/>
  <rect x='82' y='64' width='26' height='104' rx='13' transform='rotate(-24 82 64)' fill='#fff' fill-opacity='.55'/>
  <rect x='184' y='58' width='30' height='112' rx='15' transform='rotate(28 184 58)' fill='#223a4d' fill-opacity='.55'/>
  <circle cx='160' cy='108' r='26' fill='#fff' fill-opacity='.5'/>
</svg>
`)

const creatorWave = makeSvgDataUrl(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220' fill='none'>
  <defs><linearGradient id='g4' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#f7c27c'/><stop offset='1' stop-color='#e89bb8'/></linearGradient></defs>
  <rect width='320' height='220' rx='24' fill='url(#g4)'/>
  <path d='M24 138c28-38 52-38 80 0s52 38 80 0 52-38 80 0 52 38 52 38v44H24v-82Z' fill='#6d4066' fill-opacity='.45'/>
  <circle cx='90' cy='78' r='24' fill='#fff' fill-opacity='.5'/>
  <circle cx='230' cy='72' r='18' fill='#fff' fill-opacity='.45'/>
</svg>
`)

export const WIZARD_ART = {
  citySkyline,
  collegePath,
  tradeTools,
  creatorWave,
}

export default WIZARD_ART
