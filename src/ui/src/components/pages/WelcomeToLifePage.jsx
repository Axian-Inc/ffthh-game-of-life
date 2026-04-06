import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const WelcomeToLifePage = ({ game, onBegin, isStarting = false, startError = '' }) => (
  <section className="welcome-life-page">
    <div className="welcome-life-icon" aria-hidden="true">
      <Sparkles aria-hidden="true" />
    </div>
    <h2>Welcome to Life!</h2>
    <p className="welcome-life-game-name">
      {game?.name || 'Your game'} is ready. The first month starts after this screen.
    </p>
    <div className="welcome-life-sections">
      <section>
        <h3>A Month at a Time</h3>
        <p>
          Every turn represents one in-game month. Life moves forward. Your turn summary shows income,
          costs, and health updates.
        </p>
      </section>
      <section>
        <h3>Choices Matter</h3>
        <p>
          Each turn, you get one action. Choose a path-job training, moving city, or looking for love.
          Your choices create modifiers with immediate, delayed, and cumulative effects.
        </p>
      </section>
    </div>
    <blockquote>
      <span className="welcome-life-quote-mark" aria-hidden="true">
        ✦
      </span>
      <div>
        <p>&quot;The best way to predict your future is to create it.&quot;</p>
        <cite>- Abraham Lincoln</cite>
      </div>
    </blockquote>
    <section className="welcome-life-section-final">
      <h3>Life Happens</h3>
      <p>
        Players are affected by randomized Life Events. Check explanations to see how likely an event
        was and what decisions influenced it. Your choices determine how you adapt!
      </p>
    </section>
    <PrimaryButton disabled={isStarting} onClick={onBegin}>
      {isStarting ? 'Saving...' : "Let's Begin!"}
    </PrimaryButton>
    {startError ? (
      <p className="field-error" role="alert">
        {startError}
      </p>
    ) : null}
  </section>
)

export default WelcomeToLifePage
