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

const HistoryVisualization = () => {
  const [historicos, setHistoricos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [historicoSelecionado, setHistoricoSelecionado] = useState(null);
  const [historicoInfo, setHistoricoInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const historicosPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Função para buscar o nome do cliente pelo ID
  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  // Busca os dados do backend
  const fetchData = async () => {
    try {
      const [historicosResponse, clientesResponse] = await Promise.all([
        fetch(
          'http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/',
        ),
        fetch('http://127.0.0.1:8000/api/clientes/clientes/'),
      ]);

      if (historicosResponse.ok && clientesResponse.ok) {
        setHistoricos(await historicosResponse.json());
        setClientes(await clientesResponse.json());
      } else {
        console.error('Erro ao buscar dados do backend');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtra os históricos com base no filtro digitado
  const historicosFiltrados = historicos.filter((historico) => {
    const termo = filtro.toLowerCase();
    const clienteNome = getClienteNome(historico.cliente)?.toLowerCase();
    return (
      historico.id.toString().includes(termo) || clienteNome.includes(termo)
    );
  });

  const totalPaginas = Math.ceil(
    historicosFiltrados.length / historicosPorPagina,
  );
  const historicosPaginados = historicosFiltrados.slice(
    (paginaAtual - 1) * historicosPorPagina,
    paginaAtual * historicosPorPagina,
  );

  // Lógica para gerar números de paginação com reticências
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

  // Abre o modal de detalhes
  const openHistoricoDetails = (historico) => {
    setHistoricoInfo(historico);
    setShowDetailsModal(true);
  };

  // Função para excluir histórico
  const handleDelete = async () => {
    if (!historicoSelecionado) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/${historicoSelecionado.id}/`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        setHistoricos((prev) =>
          prev.filter((historico) => historico.id !== historicoSelecionado.id),
        );
        setHistoricoSelecionado(null);
      } else {
        console.error('Erro ao excluir histórico');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setShowConfirmDeleteModal(false);
    }
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Históricos</h1>
      <p className="description">
        Visualize todas as informações dos históricos de consumo e demanda.
      </p>
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
          onClick={() => setShowConfirmDeleteModal(true)}
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
        title="Detalhes do Histórico"
        data={historicoInfo}
      />
      <DetailsModal
        show={showConfirmDeleteModal}
        onClose={(confirm) => confirm && handleDelete()}
        title="Confirmação de Exclusão"
        data={{ mensagem: 'Tem certeza de que deseja excluir este histórico?' }}
      />
    </div>
  );
};

export default HistoryVisualization;
