import React, { createContext, useState } from 'react';

// Define o contexto
export const ClientContext = createContext({
  clientes: [], // Estado inicial vazio
  setClientes: () => {}, // Função vazia para evitar erros
});

// Provedor do contexto
export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]); // Lista de clientes

  return (
    <ClientContext.Provider value={{ clientes, setClientes }}>
      {children}
    </ClientContext.Provider>
  );
};
