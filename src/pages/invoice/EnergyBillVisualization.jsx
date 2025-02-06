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

const EnergyBillVisualization = () => {
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [contaInfo, setContaInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const contasPorPagina = 8;
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  // Função para buscar o nome do cliente ou distribuidora
  const getEntityName = (id, data) => {
    const entity = data.find((item) => item.id === id);
    return entity ? entity.nome : 'Desconhecido';
  };

  // Busca os dados do backend
  const fetchData = async () => {
    try {
      const [contasResponse, clientesResponse, distribuidorasResponse] =
        await Promise.all([
          fetch('http://127.0.0.1:8000/api/faturas/contas-energia/'),
          fetch('http://127.0.0.1:8000/api/clientes/clientes/'),
          fetch('http://127.0.0.1:8000/api/tarifas/distribuidoras/'),
        ]);

      if (
        !contasResponse.ok ||
        !clientesResponse.ok ||
        !distribuidorasResponse.ok
      ) {
        throw new Error('Erro ao buscar dados do backend');
      }

      setContas(await contasResponse.json());
      setClientes(await clientesResponse.json());
      setDistribuidoras(await distribuidorasResponse.json());
    } catch (error) {
      console.error('Erro ao buscar os dados da API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const contasFiltradas = contas.filter((conta) => {
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

  const openContaInfo = (conta) => {
    setContaInfo(conta);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!contaSelecionada) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/faturas/contas-energia/${contaSelecionada.id}/`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        setContas((prev) =>
          prev.filter((conta) => conta.id !== contaSelecionada.id),
        );
        setContaSelecionada(null);
        alert('Conta excluída com sucesso!');
      } else {
        alert('Erro ao excluir a conta.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir.');
    } finally {
      setShowConfirmDelete(false);
    }
  };

  const gerarNumerosPaginacao = () => {
    const numeros = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) numeros.push(i);
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
      <h1 className="titulo">Contas de Energia</h1>
      <p className="description">
        Visualize todas as contas de energia cadastradas.
      </p>
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
                    onClick={() => openContaInfo(conta)}
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
            setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))
          }
          disabled={paginaAtual === totalPaginas}
        >
          Próximo <FaArrowRight />
        </button>
      </div>
      <DetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Conta de Energia"
        data={contaInfo}
      />
      <DetailsModal
        show={showConfirmDelete}
        onClose={(confirm) => confirm && handleDelete()}
        title="Confirmação"
        data={{
          mensagem: 'Tem certeza de que deseja excluir esta conta?',
        }}
      />
    </div>
  );
};

export default EnergyBillVisualization;
