import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'

const Hero = ({ onCreate, buttonRef }) => (
  <header className="hero">
    <div className="app-icon" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <div className="hero-copy">
      <p className="eyebrow">Game of Life</p>
      <h1>Game of LIFE</h1>
      <p className="tagline">
        Start and career and see how your life unfolds in this easy, fun, and exciting simulation of this game we call life! 
      </p>
      <PrimaryButton onClick={onCreate} ref={buttonRef}>
        New Game
      </PrimaryButton>
    </div>
  </header>
)

export default Hero
