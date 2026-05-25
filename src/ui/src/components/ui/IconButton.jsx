const IconButton = ({ children, className = '', type = 'button', ...props }) => (
  <button className={`icon-button ${className}`.trim()} type={type} {...props}>
    {children}
  </button>
)

export default IconButton
