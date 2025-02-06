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
import CustomModal from '../../Components/Modal';

const TarifaVisualization = () => {
  const [tarifas, setTarifas] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [tarifaSelecionada, setTarifaSelecionada] = useState(null);
  const [tarifaInfo, setTarifaInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const tarifasPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Função para obter o nome da distribuidora pelo ID
  const getDistribuidoraNome = (id) => {
    const distribuidora = distribuidoras.find((d) => d.id === id);
    return distribuidora ? distribuidora.nome : 'Desconhecida';
  };

  // Função para buscar tarifas e distribuidoras do backend
  const fetchData = async () => {
    try {
      const [tarifasResponse, distribuidorasResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/tarifas/tarifas/'),
        fetch('http://127.0.0.1:8000/api/tarifas/distribuidoras/'),
      ]);

      if (!tarifasResponse.ok || !distribuidorasResponse.ok) {
        throw new Error('Erro ao buscar dados do backend');
      }

      const tarifasData = await tarifasResponse.json();
      const distribuidorasData = await distribuidorasResponse.json();

      setTarifas(tarifasData);
      setDistribuidoras(distribuidorasData);
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
      setErrorMessage('Erro ao carregar dados. Tente novamente.');
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchData();
  }, []);

  // Função para deletar tarifa
  const handleDelete = async () => {
    if (!tarifaSelecionada) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tarifas/tarifas/${tarifaSelecionada.id}/`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        // Atualiza a lista após exclusão
        setTarifas((prev) =>
          prev.filter((tarifa) => tarifa.id !== tarifaSelecionada.id),
        );
        setModalTitle('Sucesso');
        setModalMessage('Tarifa excluída com sucesso.');
        setTarifaSelecionada(null);
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao excluir a tarifa no backend.');
      }
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro na exclusão.');
      console.error('Erro na exclusão:', error);
    } finally {
      setShowModal(true);
    }
  };

  // Função para abrir o modal de confirmação
  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir a tarifa selecionada?');
    setShowModal(true);
  };

  // Fechar o modal e decidir ação
  const handleCloseModal = (confirm) => {
    setShowModal(false);
    if (confirm) {
      handleDelete(); // Executa a ação definida
    }
  };

  // Filtro e Paginação
  const tarifasFiltradas = tarifas?.filter((tarifa) => {
    const termo = filtro.toLowerCase();
    const distribuidoraNome = getDistribuidoraNome(
      tarifa.distribuidora,
    )?.toLowerCase();
    return (
      tarifa?.id?.toString().includes(termo) ||
      tarifa?.modalidade?.toLowerCase().includes(termo) ||
      distribuidoraNome?.includes(termo)
    );
  });

  const totalPaginas = Math.ceil(tarifasFiltradas.length / tarifasPorPagina);
  const inicio = (paginaAtual - 1) * tarifasPorPagina;
  const fim = inicio + tarifasPorPagina;
  const tarifasPaginadas = tarifasFiltradas.slice(inicio, fim);

  // Gerar números da paginação com reticências
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
  const openTarifaDetails = (tarifa) => {
    setTarifaInfo(tarifa);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Tarifas</h1>
      <p className="description">Visualize todas as tarifas cadastradas.</p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por ID, Modalidade ou Distribuidora"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!tarifaSelecionada}
          onClick={() => navigate(`/tarifas/editar/${tarifaSelecionada.id}`)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!tarifaSelecionada}
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
            <th>Modalidade</th>
            <th>Subgrupo</th>
            <th>Data Início Vigência</th>
            <th>Data Fim Vigência</th>
            <th>Distribuidora</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {tarifasPaginadas.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                Nenhuma tarifa encontrada.
              </td>
            </tr>
          ) : (
            tarifasPaginadas.map((tarifa) => (
              <tr key={tarifa.id}>
                <td>
                  <input
                    type="radio"
                    name="tarifaSelecionada"
                    className={styles.radioButton}
                    checked={tarifaSelecionada?.id === tarifa.id}
                    onChange={() =>
                      setTarifaSelecionada(
                        tarifaSelecionada?.id === tarifa.id ? null : tarifa,
                      )
                    }
                  />
                </td>
                <td>{tarifa.id}</td>
                <td>{tarifa.modalidade}</td>
                <td>{tarifa.subgrupo}</td>
                <td>{tarifa.data_inicio_vigencia}</td>
                <td>{tarifa.data_fim_vigencia || '-'}</td>
                <td>{getDistribuidoraNome(tarifa.distribuidora)}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => openTarifaDetails(tarifa)}
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
        title="Detalhes da Tarifa"
        data={tarifaInfo}
      />
      <CustomModal
        show={showModal}
        onClose={(confirm) => handleCloseModal(confirm)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default TarifaVisualization;
