// frontend/app/src/components/common/PillDropdown/PillDropdown.js
import React from 'react';
import styles from './PillDropdown.module.css';

const PillDropdown = ({
  id,
  name,
  value,
  onChange,
  options = [], // Array of { value: 'val', label: 'Display Label' }
  placeholder = '-- Select --',
  className = '', // For additional layout classes from parent
  dropdownStyle = {}, // For specific inline styles for the wrapper
  ariaLabel,
  disabled = false,
  required,
  ...rest
}) => {
  const wrapperClassName = `${styles.dropdownWrapper} ${className} ${disabled ? styles.disabled : ''}`.trim();
  
  const selectedOption = options.find(option => String(option.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Allows the hidden select to be focused programmatically if needed
  const selectRef = React.useRef(null);
  const handleWrapperClick = () => {
    if (!disabled && selectRef.current) {
      // This is a bit of a hack to try and trigger the native select on wrapper click.
      // It might not work consistently across all browsers for opening the dropdown.
      // A more robust custom dropdown would handle its own open/close state and option list rendering.
      selectRef.current.focus();
      // For some browsers, a click might be needed after focus.
      // Consider if more advanced custom dropdown logic is needed for perfect behavior.
    }
  };

  return (
    <div
      className={wrapperClassName}
      style={dropdownStyle}
      onClick={handleWrapperClick}
      tabIndex={disabled ? -1 : 0} // Make wrapper focusable if not disabled
      onKeyDown={(e) => { // Allow space/enter to open select when wrapper is focused
        if (!disabled && (e.key === ' ' || e.key === 'Enter') && selectRef.current) {
          e.preventDefault();
          // This doesn't reliably open the select programmatically across browsers.
          // Users would typically tab to the hidden select or click.
        }
      }}
    >
      <span className={styles.selectedText}>{displayLabel}</span>
      <span className={styles.dropdownArrow}>▼</span>
      <select
        ref={selectRef}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={styles.hiddenSelect}
        aria-label={ariaLabel || name || placeholder}
        disabled={disabled}
        required={required}
        {...rest}
      >
        {placeholder && <option value="" disabled={required ? false : true}>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PillDropdown;