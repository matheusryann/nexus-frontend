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

const ItemFaturaVisualization = () => {
  const [itensFatura, setItensFatura] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [itemInfo, setItemInfo] = useState(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 8;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/faturas/itens-fatura/',
        );
        setItensFatura(response.data);
      } catch (error) {
        console.error('Erro ao buscar os dados da API:', error);
        setErrorMessage('Erro ao carregar dados. Tente novamente.');
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!itemSelecionado) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/faturas/itens-fatura/${itemSelecionado.id}/`,
      );

      setItensFatura((prev) =>
        prev.filter((item) => item.id !== itemSelecionado.id),
      );
      setModalTitle('Sucesso');
      setModalMessage('Item de fatura excluído com sucesso.');
      setItemSelecionado(null);
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao excluir o item de fatura.');
      console.error('Erro na exclusão:', error);
    } finally {
      setShowModal(true);
    }
  };

  const confirmDelete = () => {
    setModalTitle('Confirmar Exclusão');
    setModalMessage('Tem certeza de que deseja excluir este item de fatura?');
    setShowModal(true);
  };

  const handleCloseModal = (confirm) => {
    setShowModal(false);
    if (confirm) {
      handleDelete();
    }
  };

  const itensFiltrados = itensFatura.filter((item) =>
    item.descricao.toLowerCase().includes(filtro.toLowerCase()),
  );

  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const itensPaginados = itensFiltrados.slice(inicio, inicio + itensPorPagina);

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

  const openItemDetails = (item) => {
    setItemInfo(item);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.content}>
      <h1 className="titulo">Itens de Fatura</h1>
      <p className="description">
        Visualize todos os itens cadastrados na fatura.
      </p>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.navigation}>
        <div className={styles.inputWrapper}>
          <FaSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Procure por descrição do item"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <button
          className={styles.actionButton}
          disabled={!itemSelecionado}
          onClick={() => navigate(`/itens-fatura/editar/${itemSelecionado.id}`)}
        >
          <FaEdit /> Editar
        </button>
        <button
          className={styles.actionButton}
          disabled={!itemSelecionado}
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
            <th>Descrição</th>
            <th>Quantidade</th>
            <th>Preço Unitário</th>
            <th>Valor Total</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {itensPaginados.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.noData}>
                Nenhum item de fatura encontrado.
              </td>
            </tr>
          ) : (
            itensPaginados.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="radio"
                    name="itemSelecionado"
                    className={styles.radioButton}
                    checked={itemSelecionado?.id === item.id}
                    onChange={() =>
                      setItemSelecionado(
                        itemSelecionado?.id === item.id ? null : item,
                      )
                    }
                  />
                </td>
                <td>{item.id}</td>
                <td>{item.descricao}</td>
                <td>{item.quantidade}</td>
                <td>{item.preco_unitario}</td>
                <td>{item.valor}</td>
                <td>
                  <FaInfoCircle
                    className={styles.iconAction}
                    onClick={() => openItemDetails(item)}
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
        title="Detalhes do Item de Fatura"
        data={itemInfo}
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

export default ItemFaturaVisualization;
