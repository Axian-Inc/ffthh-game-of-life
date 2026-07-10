const PageShell = ({ isBlurred, children, modals, className = '' }) => (
  <div className={`page ${className}`.trim()}>
    <div className={`layout ${isBlurred ? 'is-blurred' : ''}`.trim()}>{children}</div>
    {modals}
  </div>
)

export default PageShell
