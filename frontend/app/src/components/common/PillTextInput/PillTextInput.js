// frontend/app/src/components/common/PillTextInput/PillTextInput.js
import React from 'react';
import styles from './PillTextInput.module.scss';

const PillTextInput = ({
  id,
  name,
  type = 'text', // Default to text input
  value,
  onChange,
  placeholder,
  className = '', // For additional layout classes from parent
  inputStyle = {}, // For specific inline styles like maxWidth
  min,
  max,
  required,
  disabled,
  // any other native input attributes you might need
  ...rest 
}) => {
  const combinedClassName = `${styles.inputPill} ${className}`.trim();

  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={combinedClassName}
      style={inputStyle}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      {...rest} // Spread any other props like aria-label, etc.
    />
  );
};

export default PillTextInput;