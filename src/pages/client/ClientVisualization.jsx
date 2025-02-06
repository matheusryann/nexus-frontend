import React, { useEffect, useState } from 'react';
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

const ClientVisualization = () => {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const clientesPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/clientes/clientes/',
        );
        if (response.ok) {
          setClientes(await response.json());
        } else {
          console.error('Erro ao buscar dados do backend');
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = filtro.toLowerCase();
    return (
      cliente.id.toString().includes(termo) ||
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cnpj.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const clientesPaginados = clientesFiltrados.slice(
    (paginaAtual - 1) * clientesPorPagina,
    paginaAtual * clientesPorPagina,
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

  const openClienteDetails = (cliente) => {
    setClienteInfo(cliente);
    setShowDetailsModal(true);
  };

  const handleDelete = async () => {
    if (!clienteSelecionado) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/clientes/clientes/${clienteSelecionado.id}/`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        setClientes((prev) =>
          prev.filter((cliente) => cliente.id !== clienteSelecionado.id),
        );
        setClienteSelecionado(null);
      } else {
        console.error('Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Clientes</h1>
      <p className="description">
        Visualize todas as informações dos clientes.
      </p>
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
          onClick={handleDelete}
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
          onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaAtual === 1}
        >
          <FaArrowLeft /> Anterior
        </button>
        <div className={styles.paginationNumbers}>
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
        </div>
        <button
          className={styles.paginationButton}
          onClick={() =>
            setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
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
    </div>
  );
};

export default ClientVisualization;
