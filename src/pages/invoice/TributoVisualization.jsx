import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../css/ClientVisualization.module.css';
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DetailsModal from '../../Components/DetailsModal';

const TributoVisualization = () => {
  const [tributos, setTributos] = useState([]);
  const [contasEnergia, setContasEnergia] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [tributoSelecionado, setTributoSelecionado] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const tributosPorPagina = 8;
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  // Busca os tributos e as contas de energia associadas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tributosResponse, contasResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/faturas/tributos/'),
          axios.get('http://127.0.0.1:8000/api/faturas/contas-energia/'),
        ]);

        setTributos(tributosResponse.data);
        setContasEnergia(contasResponse.data);
      } catch (error) {
        console.error('Erro ao buscar os dados da API:', error);
      }
    };
    fetchData();
  }, []);

  // Função para buscar o nome da conta de energia associada
  const getContaNome = (contaId) => {
    const conta = contasEnergia.find((item) => item.id === contaId);
    return conta
      ? `Conta #${conta.id} - ${conta.cliente_nome || 'Sem Nome'}`
      : 'Desconhecido';
  };

  // Filtragem dos tributos com base no input do usuário
  const tributosFiltrados = tributos.filter((tributo) =>
    tributo.tipo.toLowerCase().includes(filtro.toLowerCase()),
  );

  const totalPaginas = Math.ceil(tributosFiltrados.length / tributosPorPagina);
  const inicio = (paginaAtual - 1) * tributosPorPagina;
  const tributosPaginados = tributosFiltrados.slice(
    inicio,
    inicio + tributosPorPagina,
  );

  // Excluir tributo
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
      alert('Tributo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir.');
    } finally {
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Tributos</h1>
      <p className="description">Visualize todos os tributos cadastrados.</p>
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
          onClick={() => setShowConfirmDelete(true)}
        >
          <FaTrash /> Excluir
        </button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Conta de Energia</th>
            <th>Tipo</th>
            <th>Base</th>
            <th>Alíquota (%)</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {tributosPaginados.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.noData}>
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
                    checked={tributoSelecionado?.id === tributo.id}
                    onChange={() =>
                      setTributoSelecionado(
                        tributoSelecionado?.id === tributo.id ? null : tributo,
                      )
                    }
                  />
                </td>
                <td>{tributo.id}</td>
                <td>{getContaNome(tributo.conta_energia)}</td>
                <td>{tributo.tipo}</td>
                <td>
                  R${' '}
                  {tributo.base.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td>{tributo.aliquota}%</td>
                <td>
                  R${' '}
                  {tributo.valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
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
        <span className={styles.pageNumber}>
          Página {paginaAtual} de {totalPaginas}
        </span>
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
        show={showConfirmDelete}
        onClose={(confirm) => confirm && handleDelete()}
        title="Confirmação"
        data={{ mensagem: 'Tem certeza de que deseja excluir este tributo?' }}
      />
    </div>
  );
};

export default TributoVisualization;
