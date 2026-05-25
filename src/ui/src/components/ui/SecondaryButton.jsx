const SecondaryButton = ({ children, className = '', type = 'button', ...props }) => (
  <button className={`secondary-action ${className}`.trim()} type={type} {...props}>
    {children}
  </button>
)

export default SecondaryButton
