import React from 'react';
import styles from '../css/InputField.module.css';

const InputField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = 'text',
  className = '',
}) => {
  return (
    <div className={`${styles.inputContainer} ${className}`}>
      <label htmlFor={name} className={styles.label}>
        {label}:
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`${styles.input} ${
          error && touched ? styles.inputError : ''
        }`}
      />
      {touched && error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default InputField;
