const PageShell = ({ isBlurred, children, modals }) => (
  <div className="page">
    <div className={`layout ${isBlurred ? 'is-blurred' : ''}`.trim()}>{children}</div>
    {modals}
  </div>
)

export default PageShell
