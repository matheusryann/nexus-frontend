import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../css/ClientVisualization.module.css';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaInfoCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DetailsModal from '../../Components/DetailsModal';
import CustomModal from '../../Components/Modal';

const ClientVisualization = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Busca os dados do backend
  const fetchClientes = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/api/clientes/clientes/',
      );
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
      setErrorMessage('Erro ao carregar dados. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Função para abrir o modal de detalhes do cliente
  const openClienteDetails = (cliente) => {
    setClienteInfo(cliente);
    setShowDetailsModal(true);
  };

  // Função para deletar cliente
  const handleDelete = async () => {
    if (!clienteSelecionado) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/clientes/clientes/${clienteSelecionado.id}/`,
      );

      setClientes((prev) =>
        prev.filter((cliente) => cliente.id !== clienteSelecionado.id),
      );
      setModalTitle('Sucesso');
      setModalMessage('Cliente excluído com sucesso.');
      setClienteSelecionado(null);
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao excluir o cliente.');
      console.error('Erro na exclusão:', error);
    } finally {
      setShowModal(true);
    }
  };

  // Confirmação de exclusão
  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir este cliente?');
    setShowModal(true);
  };

  // Fecha modal e decide ação
  const handleCloseModal = (confirm) => {
    setShowModal(false);
    if (confirm) {
      handleDelete();
    }
  };

  // Filtro e Paginação
  const clientesFiltrados = clientes?.filter((cliente) => {
    const termo = filtro.toLowerCase();
    return (
      cliente?.id?.toString().includes(termo) ||
      cliente?.nome?.toLowerCase().includes(termo) ||
      cliente?.cnpj?.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const inicio = (paginaAtual - 1) * clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(
    inicio,
    inicio + clientesPorPagina,
  );

  const gerarNumerosPaginacao = () => {
    const numeros = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) {
        numeros.push(i);
      }
    } else {
      if (paginaAtual > 4) numeros.push(1, '...');
      for (
        let i = Math.max(1, paginaAtual - 2);
        i <= Math.min(totalPaginas, paginaAtual + 2);
        i++
      ) {
        numeros.push(i);
      }
      if (paginaAtual < totalPaginas - 3) numeros.push('...', totalPaginas);
    }
    return numeros;
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Clientes</h1>
      <p className="description">
        Visualize todas as informações dos clientes.
      </p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por cliente (ID, Nome ou CNPJ)"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!clienteSelecionado}
          onClick={() => navigate(`/clientes/editar/${clienteSelecionado.id}`)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!clienteSelecionado}
          onClick={confirmDelete}
        >
          <FaTrash /> Excluir
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Cidade</th>
            <th>Estado</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {clientesPaginados.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.noData}>
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            clientesPaginados.map((cliente) => (
              <tr key={cliente.id}>
                <td>
                  <input
                    type="radio"
                    name="clienteSelecionado"
                    className={styles.radioButton}
                    checked={clienteSelecionado?.id === cliente.id}
                    onChange={() =>
                      setClienteSelecionado(
                        clienteSelecionado?.id === cliente.id ? null : cliente,
                      )
                    }
                  />
                </td>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cnpj}</td>
                <td>{cliente.cidade}</td>
                <td>{cliente.estado}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => openClienteDetails(cliente)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => setPaginaAtual(Math.max(paginaAtual - 1, 1))}
          disabled={paginaAtual === 1}
        >
          <FaArrowLeft /> Anterior
        </button>
        {gerarNumerosPaginacao().map((numero, index) => (
          <button
            key={index}
            className={`${styles.paginationNumber} ${
              paginaAtual === numero ? styles.activePage : ''
            }`}
            onClick={() => numero !== '...' && setPaginaAtual(numero)}
            disabled={numero === '...'}
          >
            {numero}
          </button>
        ))}
        <button
          className={styles.paginationButton}
          onClick={() =>
            setPaginaAtual(Math.min(paginaAtual + 1, totalPaginas))
          }
          disabled={paginaAtual === totalPaginas}
        >
          Próximo <FaArrowRight />
        </button>
      </div>

      <DetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes do Cliente"
        data={clienteInfo}
      />

      <CustomModal
        show={showModal}
        onClose={handleCloseModal}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default ClientVisualization;
