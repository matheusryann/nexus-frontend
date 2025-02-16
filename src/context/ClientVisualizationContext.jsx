import React, { createContext, useReducer } from 'react';

const initialState = {
  clientes: [],
  filtro: '',
  clienteSelecionado: null,
  clienteInfo: null,
  paginaAtual: 1,
  isLoading: true,
  isDeleting: false,
  showDetailsModal: false,
  modalMessage: '',
  modalTitle: '',
  isModalOpen: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_CLIENTS_SUCCESS':
      return { ...state, clientes: action.payload, isLoading: false };
    case 'FETCH_CLIENTS_ERROR':
      return {
        ...state,
        isLoading: false,
        modalTitle: 'Erro',
        modalMessage: 'Não foi possível carregar os clientes.',
        isModalOpen: true,
      };
    case 'SELECT_CLIENT':
      return { ...state, clienteSelecionado: action.payload };
    case 'DELETE_CLIENT_SUCCESS':
      return {
        ...state,
        clientes: state.clientes.filter(
          (cliente) => cliente.id !== state.clienteSelecionado.id,
        ),
        clienteSelecionado: null,
        modalTitle: 'Sucesso',
        modalMessage: 'Cliente excluído com sucesso.',
        isModalOpen: true,
      };
    case 'DELETE_CLIENT_ERROR':
      return {
        ...state,
        isDeleting: false,
        modalTitle: 'Erro',
        modalMessage: 'Erro ao excluir o cliente.',
        isModalOpen: true,
      };
    case 'SET_FILTER':
      return { ...state, filtro: action.payload };
    case 'SET_PAGE':
      return { ...state, paginaAtual: action.payload };
    case 'TOGGLE_DETAILS_MODAL':
      return {
        ...state,
        showDetailsModal: !state.showDetailsModal,
        clienteInfo: action.payload,
      };
    default:
      return state;
  }
};

export const ClientVisualizationContext = createContext();

export const ClientVisualizationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ClientVisualizationContext.Provider value={{ state, dispatch }}>
      {children}
    </ClientVisualizationContext.Provider>
  );
};
