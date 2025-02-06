import React from 'react';
import styles from '../css/Header.module.css';
import logoIcon from '../assets/icons/camada.svg';
import userIcon from '../assets/icons/user.svg';

const Header = () => {
  return (
    <div className={styles.header}>
      <img src={logoIcon} alt="Logo" className={styles.icon} />
      <img src={userIcon} alt="Account Icon" className={styles.logo} />
    </div>
  );
};

export default Header;
