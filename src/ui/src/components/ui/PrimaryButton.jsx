import { forwardRef } from 'react'

const PrimaryButton = forwardRef(({ children, className = '', type = 'button', ...props }, ref) => (
  <button ref={ref} className={`primary-action ${className}`.trim()} type={type} {...props}>
    {children}
  </button>
))

PrimaryButton.displayName = 'PrimaryButton'

export default PrimaryButton
