import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ game, onBegin }) => (
  <section className="welcome-page" aria-label="Welcome to Life page">
    <div className="welcome-shell">
      <div className="welcome-icon" aria-hidden="true">
        <Sparkles aria-hidden="true" />
      </div>
      <h2>Welcome to Life!</h2>
      <p className="welcome-game-name">{game?.name || 'New Game'}</p>

      <div className="welcome-sections">
        <section>
          <h3>You Have Started A New Journey</h3>
          <p>
            Every turn represents a month of life where your choices shape your future.
          </p>
        </section>
        <section>
          <h3>Choices Matter</h3>
          <p>
            Money, physical health, and mental health all rise or fall based on your decisions.
          </p>
        </section>
        <section>
          <h3>Learn As You Go</h3>
          <p>
            Outcomes are not fixed. Adapt, recover, and build momentum from where you are.
          </p>
        </section>
      </div>

      <blockquote>
        Life is a balance of risk and reward. Think long-term, choose with intention, and keep
        moving.
      </blockquote>

      <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
    </div>
  </section>
)

export default WelcomeToLifePage
