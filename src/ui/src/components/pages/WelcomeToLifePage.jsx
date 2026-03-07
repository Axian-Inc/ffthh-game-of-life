import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ game, onBegin }) => (
  <section className="welcome-life-page">
    <div className="welcome-life-icon" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <p className="welcome-life-kicker">GAME HUB</p>
    <h2>Welcome to Life!</h2>
    <p className="welcome-life-intro">
      <strong>{game?.name || 'Your game'}</strong> is ready. You are about to step into a world where
      every choice has a tradeoff and every turn can shift your story.
    </p>
    <div className="welcome-life-sections">
      <section>
        <h3>Money</h3>
        <p>Plan ahead, manage debt, and grow your net worth over time.</p>
      </section>
      <section>
        <h3>Physical Health</h3>
        <p>Energy and wellbeing can open opportunities or close them fast.</p>
      </section>
      <section>
        <h3>Mental Health</h3>
        <p>Resilience, stress, and relationships shape your outcomes every month.</p>
      </section>
    </div>
    <blockquote>
      Success in life is not free. Every action has a cost, and every cost can teach you something.
    </blockquote>
    <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
  </section>
)

export default WelcomeToLifePage
