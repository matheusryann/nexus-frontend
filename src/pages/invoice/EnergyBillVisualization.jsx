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

const EnergyBillVisualization = () => {
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [contaInfo, setContaInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const contasPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Busca dados do backend
  const fetchData = async () => {
    try {
      const [contasRes, clientesRes, distribuidorasRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/faturas/contas-energia/'),
        axios.get('http://127.0.0.1:8000/api/clientes/clientes/'),
        axios.get('http://127.0.0.1:8000/api/tarifas/distribuidoras/'),
      ]);

      setContas(contasRes.data);
      setClientes(clientesRes.data);
      setDistribuidoras(distribuidorasRes.data);
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
      setErrorMessage('Erro ao carregar dados. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Retorna o nome do cliente ou distribuidora pelo ID
  const getEntityName = (id, data) => {
    const entity = data.find((item) => item.id === id);
    return entity ? entity.nome : 'Desconhecido';
  };

  // Função para deletar conta
  const handleDelete = async () => {
    if (!contaSelecionada) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/faturas/contas-energia/${contaSelecionada.id}/`,
      );

      setContas((prev) =>
        prev.filter((conta) => conta.id !== contaSelecionada.id),
      );
      setModalTitle('Sucesso');
      setModalMessage('Conta excluída com sucesso.');
      setContaSelecionada(null);
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao excluir a conta.');
      console.error('Erro na exclusão:', error);
    } finally {
      setShowModal(true);
    }
  };

  // Confirmação de exclusão
  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir esta conta?');
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
  const contasFiltradas = contas?.filter((conta) => {
    const termo = filtro.toLowerCase();
    const clienteNome = getEntityName(conta.cliente, clientes).toLowerCase();
    const distribuidoraNome = getEntityName(
      conta.distribuidora,
      distribuidoras,
    ).toLowerCase();

    return (
      conta?.id?.toString().includes(termo) ||
      clienteNome.includes(termo) ||
      distribuidoraNome.includes(termo)
    );
  });

  const totalPaginas = Math.ceil(contasFiltradas.length / contasPorPagina);
  const inicio = (paginaAtual - 1) * contasPorPagina;
  const contasPaginadas = contasFiltradas.slice(
    inicio,
    inicio + contasPorPagina,
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
  const openContaDetails = (conta) => {
    setContaInfo(conta);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Contas de Energia</h1>
      <p className="description">
        Visualize todas as contas de energia cadastradas.
      </p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por ID, Cliente ou Distribuidora"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!contaSelecionada}
          onClick={() => navigate(`/faturas/editar/${contaSelecionada.id}`)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!contaSelecionada}
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
            <th>Distribuidora</th>
            <th>Mês</th>
            <th>Vencimento</th>
            <th>Total a Pagar</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {contasPaginadas.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                Nenhuma conta encontrada.
              </td>
            </tr>
          ) : (
            contasPaginadas.map((conta) => (
              <tr key={conta.id}>
                <td>
                  <input
                    type="radio"
                    name="contaSelecionada"
                    checked={contaSelecionada?.id === conta.id}
                    onChange={() =>
                      setContaSelecionada(
                        contaSelecionada?.id === conta.id ? null : conta,
                      )
                    }
                  />
                </td>
                <td>{conta.id}</td>
                <td>{getEntityName(conta.cliente, clientes)}</td>
                <td>{getEntityName(conta.distribuidora, distribuidoras)}</td>
                <td>{conta.mes}</td>
                <td>{conta.vencimento}</td>
                <td>{conta.total_pagar}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => openContaDetails(conta)}
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
        title="Detalhes da Conta de Energia"
        data={contaInfo}
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

export default EnergyBillVisualization;
