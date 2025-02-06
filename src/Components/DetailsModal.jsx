// Components/DetailsModal.js

import React from 'react';
import CustomModal from './Modal';

const DetailsModal = ({ show, onClose, title, data }) => {
  return (
    <CustomModal
      show={show}
      onClose={onClose}
      title={title}
      message={
        data ? (
          <ul style={{ padding: '0', listStyle: 'none', margin: '0' }}>
            {Object.entries(data).map(([key, value]) => (
              <li key={key} style={{ marginBottom: '8px' }}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum dado disponível.</p>
        )
      }
    />
  );
};

export default DetailsModal;
