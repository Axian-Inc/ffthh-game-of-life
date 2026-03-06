import { Quote, Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const sections = [
  {
    title: 'A Month at a Time',
    body:
      'Every turn represents one in-game month. Life moves forward. Your turn summary shows income, costs, and health updates.',
  },
  {
    title: 'Choices Matter',
    body:
      'Each turn, you get one action. Choose a path-job training, moving city, or looking for love. Your choices create modifiers with immediate, delayed, and cumulative effects.',
  },
  {
    title: 'Life Happens',
    body:
      'Players are affected by randomized Life Events. Check explanations to see how likely an event was and what decisions influenced it. Your choices determine how you adapt!',
  },
]

const WelcomeToLifePage = ({ onHome }) => (
  <section className="welcome-page" aria-labelledby="welcome-title">
    <div className="welcome-shell">
      <div className="app-icon welcome-icon" aria-hidden="true">
        <Sparkles aria-hidden="true" />
      </div>
      <h2 className="welcome-title" id="welcome-title">
        Welcome to Life!
      </h2>
      <div className="welcome-sections">
        {sections.slice(0, 2).map((section) => (
          <section className="welcome-section" key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.body}</p>
          </section>
        ))}
        <blockquote className="welcome-quote">
          <span className="welcome-quote-icon" aria-hidden="true">
            <Quote aria-hidden="true" />
          </span>
          <div>
            <p>"The best way to predict your future is to create it."</p>
            <footer>-Abraham Lincoln</footer>
          </div>
        </blockquote>
        <section className="welcome-section" key={sections[2].title}>
          <h3>{sections[2].title}</h3>
          <p>{sections[2].body}</p>
        </section>
      </div>
      <PrimaryButton className="welcome-primary-action" onClick={onHome}>
        Let&apos;s Begin!
      </PrimaryButton>
    </div>
  </section>
)

export default WelcomeToLifePage
