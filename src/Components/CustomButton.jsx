import React from 'react';
import styles from '../css/customButton.module.css';

const CustomButton = ({
  onClick,
  disabled = false,
  children = 'Salvar Dados',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.customButton} ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
