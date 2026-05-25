const TextField = ({
  id,
  label,
  error,
  className = '',
  inputClassName = '',
  ...props
}) => (
  <label className={`field ${className}`.trim()} htmlFor={id}>
    <span>{label}</span>
    <input id={id} className={inputClassName} {...props} />
    {error ? <span className="field-error">{error}</span> : null}
  </label>
)

export default TextField
