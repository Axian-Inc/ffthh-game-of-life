import PropTypes from 'prop-types';
import styles from './Button.module.css';

const variantClasses = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
};

const sizeClasses = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  icon,
  children,
  className = '',
  ...props
}) {
  const isIconOnly = !children;
  const combinedClassName = [
    styles.button,
    variantClasses[variant],
    sizeClasses[size],
    isIconOnly ? styles.iconOnly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  icon: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Button;
