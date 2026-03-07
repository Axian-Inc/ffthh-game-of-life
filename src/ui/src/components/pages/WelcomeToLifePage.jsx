import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ onBegin }) => (
  <section className="welcome-to-life-page" aria-label="Welcome to Life">
    <div className="welcome-logo" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <h2>Welcome to Life!</h2>

    <div className="welcome-section">
      <h3>A Month at a Time</h3>
      <p>
        Every turn represents one in-game month. Life moves forward. Your turn summary shows income, costs, and
        health updates.
      </p>
    </div>

    <div className="welcome-section">
      <h3>Choices Matter</h3>
      <p>
        Each turn, you get one action. Choose a path-job training, moving city, or looking for love. Your choices
        create modifiers with immediate, delayed, and cumulative effects.
      </p>
    </div>

    <blockquote className="welcome-quote">
      <p>&quot;The best way to predict your future is to create it.&quot;</p>
      <cite>-Abraham Lincoln</cite>
    </blockquote>

    <div className="welcome-section">
      <h3>Life Happens</h3>
      <p>
        Players are affected by randomized Life Events. Check explanations to see how likely an event was and what
        decisions influenced it. Your choices determine how you adapt!
      </p>
    </div>

    <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
  </section>
)

export default WelcomeToLifePage
