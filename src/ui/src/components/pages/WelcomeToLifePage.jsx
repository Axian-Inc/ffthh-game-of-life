import { Sparkles } from 'lucide-react'
import PrimaryButton from '../ui/PrimaryButton'
import './welcome-to-life.css'

const sectionCopy = [
  {
    heading: 'A Month at a Time',
    body: 'Each turn moves one month forward, so short-term choices can build into big long-term results.',
  },
  {
    heading: 'Choices Matter',
    body: 'Careers, spending, and personal priorities all shape your money, physical health, and mental health.',
  },
  {
    heading: 'Life Happens',
    body: 'Unexpected events can help or hurt. Adapt, recover, and keep making smart moves for your future.',
  },
]

const WelcomeToLifePage = ({ game, onBegin, mode = 'started' }) => {
  const statusLabel = mode === 'resumed' ? 'Welcome back' : 'Play Game'
  const gameName = game?.name || 'Your game'

  return (
    <section className="welcome-to-life-page" aria-labelledby="welcome-to-life-title">
      <header className="welcome-to-life-header">
        <div className="welcome-to-life-icon" aria-hidden="true">
          <Sparkles aria-hidden="true" />
        </div>
        <p className="welcome-to-life-eyebrow">{statusLabel}</p>
        <h2 id="welcome-to-life-title">Welcome to Life!</h2>
        <p className="welcome-to-life-intro">
          {gameName} is ready. You are about to guide each player through choices that shape their story.
        </p>
      </header>

      <div className="welcome-to-life-content">
        {sectionCopy.slice(0, 2).map((section) => (
          <section key={section.heading} className="welcome-to-life-section" aria-label={section.heading}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
          </section>
        ))}

        <blockquote className="welcome-to-life-quote" cite="internal-game-copy">
          <p>
            "Small decisions repeated over time can change everything. Stay curious, stay flexible, and keep
            going."
          </p>
        </blockquote>

        <section className="welcome-to-life-section" aria-label={sectionCopy[2].heading}>
          <h3>{sectionCopy[2].heading}</h3>
          <p>{sectionCopy[2].body}</p>
        </section>
      </div>

      <div className="welcome-to-life-actions">
        <PrimaryButton onClick={onBegin}>Let&apos;s Begin!</PrimaryButton>
      </div>
    </section>
  )
}

export default WelcomeToLifePage
