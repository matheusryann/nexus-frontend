import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../css/ClientVisualization.module.css';
import { FaSearch, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DetailsModal from '../../Components/DetailsModal';
import CustomModal from '../../Components/Modal';

const TributoVisualization = () => {
  const [tributos, setTributos] = useState([]);
  const [contasEnergia, setContasEnergia] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [tributoSelecionado, setTributoSelecionado] = useState(null);
  const [tributoInfo, setTributoInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const tributosPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tributosRes, contasRes, clientesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/faturas/tributos/'),
          axios.get('http://127.0.0.1:8000/api/faturas/contas-energia/'),
          axios.get('http://127.0.0.1:8000/api/clientes/clientes/'),
        ]);

        setTributos(tributosRes.data);
        setContasEnergia(contasRes.data);
        setClientes(clientesRes.data);
      } catch (error) {
        console.error('Erro ao buscar os dados da API:', error);
        setErrorMessage('Erro ao carregar tributos. Tente novamente.');
      }
    };
    fetchData();
  }, []);

  // Obtém o nome do cliente associado à conta de energia do tributo
  const getClienteNome = (contaId) => {
    const conta = contasEnergia.find((c) => c.id === contaId);
    if (!conta || !conta.cliente) return 'Cliente Desconhecido';

    const cliente = clientes.find((cli) => cli.id === conta.cliente);
    return cliente ? `${conta.id} - ${cliente.nome}` : 'Cliente Desconhecido';
  };

  const tributosFiltrados = tributos?.filter((tributo) => {
    const termo = filtro.toLowerCase();
    return (
      tributo?.id?.toString().includes(termo) ||
      tributo?.tipo?.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(tributosFiltrados.length / tributosPorPagina);
  const inicio = (paginaAtual - 1) * tributosPorPagina;
  const tributosPaginados = tributosFiltrados.slice(
    inicio,
    inicio + tributosPorPagina,
  );

  const handleDelete = async () => {
    if (!tributoSelecionado) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/faturas/tributos/${tributoSelecionado.id}/`,
      );
      setTributos((prev) =>
        prev.filter((tributo) => tributo.id !== tributoSelecionado.id),
      );
      setTributoSelecionado(null);
      setModalTitle('Sucesso');
      setModalMessage('Tributo excluído com sucesso.');
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao excluir tributo.');
      console.error('Erro ao excluir:', error);
    } finally {
      setShowModal(true);
    }
  };

  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir este tributo?');
    setShowModal(true);
  };

  const handleCloseModal = (confirm) => {
    setShowModal(false);
    if (confirm) {
      handleDelete();
    }
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Tributos</h1>
      <p className="description">
        Visualize todas as informações sobre os tributos cadastrados.
      </p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por tipo de tributo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!tributoSelecionado}
          onClick={() => navigate(`/tributos/editar/${tributoSelecionado.id}`)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!tributoSelecionado}
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
            <th>Tipo</th>
            <th>Base</th>
            <th>Alíquota (%)</th>
            <th>Valor</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {tributosPaginados.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                Nenhum tributo encontrado.
              </td>
            </tr>
          ) : (
            tributosPaginados.map((tributo) => (
              <tr key={tributo.id}>
                <td>
                  <input
                    type="radio"
                    name="tributoSelecionado"
                    className={styles.radioButton}
                    checked={tributoSelecionado?.id === tributo.id}
                    onChange={() =>
                      setTributoSelecionado(
                        tributoSelecionado?.id === tributo.id ? null : tributo,
                      )
                    }
                  />
                </td>
                <td>{tributo.id}</td>
                <td>{getClienteNome(tributo.conta_energia)}</td>
                <td>{tributo.tipo}</td>
                <td>R$ {Number(tributo.base).toFixed(2) || '0.00'}</td>
                <td>{tributo.aliquota ? `${tributo.aliquota}%` : 'N/A'}</td>
                <td>R$ {Number(tributo.valor).toFixed(2) || '0.00'}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => {
                      setTributoInfo(tributo);
                      setShowDetailsModal(true);
                    }}
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
        title="Detalhes do Tributo"
        data={tributoInfo}
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

export default TributoVisualization;
