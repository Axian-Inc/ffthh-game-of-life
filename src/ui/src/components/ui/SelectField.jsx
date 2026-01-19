const SelectField = ({
  id,
  label,
  children,
  className = '',
  selectClassName = '',
  ...props
}) => (
  <label className={`field ${className}`.trim()} htmlFor={id}>
    <span>{label}</span>
    <select id={id} className={selectClassName} {...props}>
      {children}
    </select>
  </label>
)

export default SelectField
