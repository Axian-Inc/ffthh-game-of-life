import { useId } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  required = false,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.error : ''}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        required={required}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email']),
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  id: PropTypes.string,
};

export default Input;
