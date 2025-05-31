// frontend/app/src/components/common/Button/Button.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';

const Button = ({
  children,
  onClick,
  to,
  type = 'button',
  disabled = false,
  className = '', // For additional layout classes (e.g., styles.fullWidth from parent)
  title = '',
  ...props
}) => {
  // Apply base button style and disabled style if applicable
  let buttonClasses = `${styles.button}`;
  
  if (disabled) {
    buttonClasses = `${buttonClasses} ${styles.disabled}`;
  }

  // Append any custom className passed in (for layout)
  if (className) {
    buttonClasses = `${buttonClasses} ${className}`;
  }

  if (to) {
    return (
      <Link to={to} className={buttonClasses.trim()} title={title} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses.trim()}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;