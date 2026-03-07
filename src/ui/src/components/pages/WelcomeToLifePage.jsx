import { Quote, Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const welcomeSections = [
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
    <div className="welcome-reading-column">
      <div className="welcome-icon" aria-hidden="true">
        <Sparkles aria-hidden="true" />
      </div>
      <h2 className="welcome-title" id="welcome-title">
        Welcome to Life!
      </h2>
      <div className="welcome-sections">
        {welcomeSections.map((section) => (
          <section className="welcome-section" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <blockquote className="welcome-quote">
        <Quote aria-hidden="true" />
        <p>
          &quot;The best way to predict your future is to create it.&quot;
          <br />
          -Abraham Lincoln
        </p>
      </blockquote>
      <PrimaryButton className="welcome-cta" onClick={onBegin}>
        Let&apos;s Begin!
      </PrimaryButton>
    </div>
  </section>
)

export default WelcomeToLifePage
