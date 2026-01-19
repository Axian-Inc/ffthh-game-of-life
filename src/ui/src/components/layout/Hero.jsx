import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'

const Hero = ({ onCreate }) => (
  <header className="hero">
    <div className="app-icon" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <div className="hero-copy">
      <p className="eyebrow">Game Hub</p>
      <h1>Game of LIFE</h1>
      <p className="tagline">
        Watch tiny cells spark, survive, and evolve as you explore Conway’s classic universe
        of simple rules and endless outcomes.
      </p>
      <PrimaryButton onClick={onCreate}>New Game</PrimaryButton>
    </div>
  </header>
)

export default Hero
