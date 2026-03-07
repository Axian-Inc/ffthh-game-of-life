import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ game, onBegin }) => (
  <section className="welcome-to-life-page">
    <div className="welcome-logo" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <div className="welcome-copy">
      <p className="welcome-eyebrow">{game?.name || 'New Game'}</p>
      <h2>Welcome to Life!</h2>
      <section className="welcome-section" aria-label="Start with purpose">
        <h3>Start with purpose</h3>
        <p>Every turn is a chance to choose, adapt, and discover what matters most to your team.</p>
      </section>
      <section className="welcome-section" aria-label="Build your path">
        <h3>Build your path</h3>
        <p>Pick careers, make tradeoffs, and navigate surprises that reshape your journey.</p>
      </section>
      <section className="welcome-section" aria-label="Play your story">
        <h3>Play your story</h3>
        <p>Track milestones together and see how each decision changes the final outcome.</p>
      </section>
      <blockquote>
        "Life is what happens between your plans and your next bold move."
      </blockquote>
    </div>
    <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
  </section>
)

export default WelcomeToLifePage
