const PrimaryButton = ({ children, className = '', type = 'button', ...props }) => (
  <button className={`primary-action ${className}`.trim()} type={type} {...props}>
    {children}
  </button>
)

export default PrimaryButton
