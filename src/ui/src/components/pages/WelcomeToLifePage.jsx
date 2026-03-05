import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ game, onBegin, mode = 'started' }) => (
  <section aria-label="Welcome to Life" className="welcome-to-life-page">
    <div className="welcome-to-life-column">
      <div className="welcome-to-life-icon" aria-hidden="true">
        <Sparkles aria-hidden="true" />
      </div>
      <header className="welcome-to-life-header">
        <h1>Welcome to Life!</h1>
      </header>

      <div className="welcome-to-life-sections">
        <section aria-labelledby="month-heading">
          <h2 id="month-heading">A Month at a Time</h2>
          <p>
            Every turn represents one in-game month. Life moves forward. Your turn summary shows
            income, costs, and health updates.
          </p>
        </section>

        <section aria-labelledby="choices-heading">
          <h2 id="choices-heading">Choices Matter</h2>
          <p>
            Each turn, you get one action. Choose a path, like job training, moving city, or
            looking for love. Your choices create modifiers with immediate, delayed, and
            cumulative effects.
          </p>
        </section>

        <figure className="welcome-to-life-quote" role="group">
          <blockquote>
            <p>&ldquo;The best way to predict your future is to create it.&rdquo;</p>
          </blockquote>
          <figcaption>-Abraham Lincoln</figcaption>
        </figure>

        <section aria-labelledby="life-heading">
          <h2 id="life-heading">Life Happens</h2>
          <p>
            Players are affected by randomized Life Events. Check explanations to see how likely an
            event was and what decisions influenced it. Your choices determine how you adapt.
          </p>
        </section>
      </div>

      <div className="welcome-to-life-actions">
        <PrimaryButton onClick={onBegin} className="welcome-to-life-begin">
          Let&apos;s Begin!
        </PrimaryButton>
      </div>
      <p className="welcome-to-life-mode">
        {mode === 'resumed' ? `Resuming ${game?.name || 'your game'}.` : `Starting ${game?.name || 'your game'}.`}
      </p>
    </div>
  </section>
)

export default WelcomeToLifePage
