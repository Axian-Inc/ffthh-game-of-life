import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const sections = [
  {
    title: 'A Month at a Time',
    body: 'Every turn represents one in-game month. Life moves forward. Your turn summary shows income, costs, and health updates.',
  },
  {
    title: 'Choices Matter',
    body: 'Each turn, you get one action. Choose a path-job training, moving city, or looking for love. Your choices create modifiers with immediate, delayed, and cumulative effects.',
  },
  {
    title: 'Life Happens',
    body: 'Players are affected by randomized Life Events. Check explanations to see how likely an event was and what decisions influenced it. Your choices determine how you adapt!',
  },
]

const WelcomeToLifePage = ({ onBegin }) => (
  <section className="welcome-page" aria-labelledby="welcome-title">
    <div className="welcome-shell">
      <div className="welcome-logo" aria-hidden="true">
        <Sparkles aria-hidden="true" />
      </div>
      <h2 className="welcome-title" id="welcome-title">
        Welcome to Life!
      </h2>
      <div className="welcome-copy">
        <section className="welcome-section">
          <h3>{sections[0].title}</h3>
          <p>{sections[0].body}</p>
        </section>
        <section className="welcome-section">
          <h3>{sections[1].title}</h3>
          <p>{sections[1].body}</p>
        </section>
        <blockquote className="welcome-quote">
          <span className="welcome-quote-mark" aria-hidden="true">
            &#10077;
          </span>
          <p>"The best way to predict your future is to create it." -Abraham Lincoln</p>
        </blockquote>
        <section className="welcome-section">
          <h3>{sections[2].title}</h3>
          <p>{sections[2].body}</p>
        </section>
      </div>
      <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
    </div>
  </section>
)

export default WelcomeToLifePage
