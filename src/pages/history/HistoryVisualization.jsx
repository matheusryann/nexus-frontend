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

const HistoryVisualization = () => {
  const [historicos, setHistoricos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [historicoSelecionado, setHistoricoSelecionado] = useState(null);
  const [historicoInfo, setHistoricoInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const historicosPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Busca dados do backend
  const fetchData = async () => {
    try {
      const [historicosRes, clientesRes] = await Promise.all([
        axios.get(
          'http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/',
        ),
        axios.get('http://127.0.0.1:8000/api/clientes/clientes/'),
      ]);

      setHistoricos(historicosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
      setErrorMessage('Erro ao carregar dados. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Retorna o nome do cliente pelo ID
  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  // Função para deletar histórico
  const handleDelete = async () => {
    if (!historicoSelecionado) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/${historicoSelecionado.id}/`,
      );

      setHistoricos((prev) =>
        prev.filter((historico) => historico.id !== historicoSelecionado.id),
      );
      setModalTitle('Sucesso');
      setModalMessage('Histórico excluído com sucesso.');
      setHistoricoSelecionado(null);
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao excluir o histórico.');
      console.error('Erro na exclusão:', error);
    } finally {
      setShowModal(true);
    }
  };

  // Confirmação de exclusão
  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir este histórico?');
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
  const historicosFiltrados = historicos?.filter((historico) => {
    const termo = filtro.toLowerCase();
    const clienteNome = getClienteNome(historico.cliente)?.toLowerCase();

    return (
      historico?.id?.toString().includes(termo) || clienteNome?.includes(termo)
    );
  });

  const totalPaginas = Math.ceil(
    historicosFiltrados.length / historicosPorPagina,
  );
  const inicio = (paginaAtual - 1) * historicosPorPagina;
  const historicosPaginados = historicosFiltrados.slice(
    inicio,
    inicio + historicosPorPagina,
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

  // Abre modal de detalhes
  const openHistoricoDetails = (historico) => {
    setHistoricoInfo(historico);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Históricos</h1>
      <p className="description">
        Visualize todas as informações dos históricos de consumo e demanda.
      </p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por ID ou Nome do Cliente"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!historicoSelecionado}
          onClick={() =>
            navigate(`/historicos/editar/${historicoSelecionado.id}`)
          }
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!historicoSelecionado}
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
            <th>Cliente</th>
            <th>Mês</th>
            <th>Demanda Medida Ponta</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {historicosPaginados.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.noData}>
                Nenhum histórico encontrado.
              </td>
            </tr>
          ) : (
            historicosPaginados.map((historico) => (
              <tr key={historico.id}>
                <td>
                  <input
                    type="radio"
                    name="historicoSelecionado"
                    className={styles.radioButton}
                    checked={historicoSelecionado?.id === historico.id}
                    onChange={() =>
                      setHistoricoSelecionado(
                        historicoSelecionado?.id === historico.id
                          ? null
                          : historico,
                      )
                    }
                  />
                </td>
                <td>{historico.id}</td>
                <td>{getClienteNome(historico.cliente)}</td>
                <td>{historico.mes}</td>
                <td>{historico.demanda_medida_ponta || '-'}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => openHistoricoDetails(historico)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <DetailsModal
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalhes do Histórico"
        data={historicoInfo}
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

export default HistoryVisualization;
