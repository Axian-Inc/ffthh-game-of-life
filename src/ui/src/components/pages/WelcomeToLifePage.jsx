import './welcome-to-life.css'

const WelcomeMark = () => (
  <svg
    aria-hidden="true"
    className="welcome-to-life-mark"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M47.56 18.64C47.8255 17.7734 48.6309 17.1815 49.5371 17.1815C50.4434 17.1815 51.2488 17.7734 51.5142 18.64L55.6641 32.1882L69.2122 36.338C70.0789 36.6035 70.6707 37.4089 70.6707 38.3151C70.6707 39.2214 70.0789 40.0268 69.2122 40.2922L55.6641 44.4421L51.5142 57.9902C51.2488 58.8569 50.4434 59.4487 49.5371 59.4487C48.6309 59.4487 47.8255 58.8569 47.56 57.9902L43.4102 44.4421L29.8621 40.2922C28.9954 40.0268 28.4036 39.2214 28.4036 38.3151C28.4036 37.4089 28.9954 36.6035 29.8621 36.338L43.4102 32.1882L47.56 18.64Z"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M68.5 21.5V33.5"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M62.5 27.5H74.5"
      stroke="currentColor"
      strokeWidth="5.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="30" cy="61.5" r="6.75" stroke="currentColor" strokeWidth="5.5" />
  </svg>
)

const WelcomeToLifePage = ({ onBegin }) => (
  <section className="welcome-to-life-page">
    <div className="welcome-to-life-column">
      <div className="welcome-to-life-logo" aria-hidden="true">
        <WelcomeMark />
      </div>
      <h1 className="welcome-to-life-title">Welcome to Life!</h1>

      <div className="welcome-to-life-copy">
        <section className="welcome-to-life-section" aria-labelledby="welcome-month-heading">
          <h2 id="welcome-month-heading">A Month at a Time</h2>
          <p>
            Every turn represents one in-game month. Life moves forward. Your turn summary shows
            income, costs, and health updates.
          </p>
        </section>

        <section className="welcome-to-life-section" aria-labelledby="welcome-choices-heading">
          <h2 id="welcome-choices-heading">Choices Matter</h2>
          <p>
            Each turn, you get one action. Choose a path-job training, moving city, or looking for
            love. Your choices create modifiers with immediate, delayed, and cumulative effects.
          </p>
        </section>

        <figure className="welcome-to-life-quote">
          <blockquote>
            <p>&quot;The best way to predict your future is to create it.&quot;</p>
          </blockquote>
          <figcaption>-Abraham Lincoln</figcaption>
        </figure>

        <section className="welcome-to-life-section" aria-labelledby="welcome-life-heading">
          <h2 id="welcome-life-heading">Life Happens</h2>
          <p>
            Players are affected by randomized Life Events. Check explanations to see how likely an
            event was and what decisions influenced it. Your choices determine how you adapt!
          </p>
        </section>
      </div>

      <button className="welcome-to-life-cta" type="button" onClick={onBegin}>
        Let&apos;s Begin!
      </button>
    </div>
  </section>
)

export default WelcomeToLifePage
