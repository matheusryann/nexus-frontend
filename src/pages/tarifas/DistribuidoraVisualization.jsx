import React, { useEffect, useState } from 'react';
import styles from '../../css/ClientVisualization.module.css';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../../Components/Modal';

const DistribuidorasVisualization = () => {
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [distribuidoraSelecionada, setDistribuidoraSelecionada] =
    useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const distribuidorasPorPagina = 8;
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const navigate = useNavigate();

  // Função para buscar distribuidoras do backend
  const fetchDistribuidoras = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/tarifas/distribuidoras/',
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do backend');
      }
      const data = await response.json();
      setDistribuidoras(data);
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao carregar distribuidoras. Tente novamente.');
      setShowModal(true);
    }
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    fetchDistribuidoras();
  }, []);

  // Função para deletar distribuidora
  const handleDelete = async () => {
    if (!distribuidoraSelecionada) return; // Verifica se há uma distribuidora selecionada

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tarifas/distribuidoras/${distribuidoraSelecionada.id}/`,
        {
          method: 'DELETE',
        },
      );

      if (response.status === 204 || response.ok) {
        // Exclusão bem-sucedida
        setDistribuidoras((prev) =>
          prev.filter((dist) => dist.id !== distribuidoraSelecionada.id),
        );
        setDistribuidoraSelecionada(null); // Limpa a seleção
        setModalTitle('Sucesso');
        setModalMessage('Distribuidora excluída com sucesso!');
      } else {
        try {
          const errorData = await response.json(); // Captura detalhes do erro, se disponíveis
          setModalTitle('Erro');
          setModalMessage(
            errorData.detail || 'Erro ao excluir a distribuidora no backend.',
          );
        } catch {
          // Fallback para caso o erro não tenha um corpo JSON
          setModalTitle('Erro');
          setModalMessage('Erro ao excluir a distribuidora no backend.');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir distribuidora:', error);
      setModalTitle('Erro');
      setModalMessage(
        'Erro ao excluir distribuidora. Verifique sua conexão e tente novamente.',
      );
    } finally {
      setShowModal(true); // Mostra o modal com a mensagem apropriada
    }
  };

  // Função para abrir o modal de confirmação
  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage(
      'Tem certeza de que deseja excluir a distribuidora selecionada?',
    );
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
  const distribuidorasFiltradas = distribuidoras.filter((distribuidora) => {
    const termo = filtro.toLowerCase();
    return (
      distribuidora.codigo.toLowerCase().includes(termo) ||
      distribuidora.nome.toLowerCase().includes(termo) ||
      distribuidora.estado.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(
    distribuidorasFiltradas.length / distribuidorasPorPagina,
  );
  const inicio = (paginaAtual - 1) * distribuidorasPorPagina;
  const fim = inicio + distribuidorasPorPagina;
  const distribuidorasPaginadas = distribuidorasFiltradas.slice(inicio, fim);

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

  return (
    <div className={styles.content}>
      <h1 className="titulo">Distribuidoras</h1>
      <p className="description">
        Visualize todas as informações das distribuidoras registradas.
      </p>

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por código, nome ou estado"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!distribuidoraSelecionada}
          onClick={() =>
            navigate(`/distribuidoras/editar/${distribuidoraSelecionada.id}`)
          }
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!distribuidoraSelecionada}
          onClick={confirmDelete}
        >
          <FaTrash /> Excluir
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Código</th>
            <th>Nome</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {distribuidorasPaginadas.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.noData}>
                Nenhuma distribuidora encontrada.
              </td>
            </tr>
          ) : (
            distribuidorasPaginadas.map((distribuidora) => (
              <tr key={distribuidora.id}>
                <td>
                  <input
                    type="radio"
                    name="distribuidoraSelecionada"
                    className={styles.radioButton}
                    checked={distribuidoraSelecionada?.id === distribuidora.id}
                    onChange={() =>
                      setDistribuidoraSelecionada(
                        distribuidoraSelecionada?.id === distribuidora.id
                          ? null
                          : distribuidora,
                      )
                    }
                  />
                </td>
                <td>{distribuidora.codigo}</td>
                <td>{distribuidora.nome}</td>
                <td>{distribuidora.estado}</td>
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

      <CustomModal
        show={showModal}
        onClose={(confirm) => handleCloseModal(confirm)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default DistribuidorasVisualization;
