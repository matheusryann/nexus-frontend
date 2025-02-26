import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const TributoEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [contasEnergia, setContasEnergia] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tributoResponse, contasResponse, clientesResponse] =
          await Promise.all([
            axios.get(`http://127.0.0.1:8000/api/faturas/tributos/${id}/`),
            axios.get('http://127.0.0.1:8000/api/faturas/contas-energia/'),
            axios.get('http://127.0.0.1:8000/api/clientes/clientes/'),
          ]);
        setFormData(tributoResponse.data);
        setContasEnergia(contasResponse.data);
        setClientes(clientesResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setModalTitle('Erro');
        setModalMessage('Não foi possível carregar os dados.');
        setIsModalOpen(true);
      }
    };
    fetchData();
  }, [id]);

  // Obtém o nome do cliente associado à conta de energia
  const getClienteNome = (contaId) => {
    const conta = contasEnergia.find((c) => c.id === contaId);
    if (!conta || !conta.cliente) return 'Cliente Desconhecido';

    const cliente = clientes.find((cli) => cli.id === conta.cliente);
    return cliente ? `${conta.id} - ${cliente.nome}` : 'Cliente Desconhecido';
  };

  const validateField = (name, value) => {
    if (!value) return 'Este campo é obrigatório.';
    if (['base', 'aliquota', 'valor'].includes(name) && value < 0) {
      return 'O valor deve ser positivo.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touchedFields[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/faturas/tributos/${id}/`,
        formData,
      );
      setModalTitle('Sucesso');
      setModalMessage('Tributo atualizado com sucesso!');
      setTimeout(() => navigate('/faturas/visualizar-tributo'), 2000);
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage(
        `Erro ao atualizar os dados: ${
          error.response
            ? JSON.stringify(error.response.data)
            : 'Erro desconhecido'
        }`,
      );
    } finally {
      setIsModalOpen(true);
    }
  };

  if (!formData) {
    return <p>Carregando dados do tributo...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Tributo</h1>
      <p className="description">
        Altere as informações do tributo e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Conta de Energia:
          <select
            name="conta_energia"
            value={formData.conta_energia || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Selecione</option>
            {contasEnergia.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {getClienteNome(conta.id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo:
          <select
            name="tipo"
            value={formData.tipo || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Selecione</option>
            <option value="ICMS">ICMS</option>
            <option value="PIS">PIS</option>
            <option value="COFINS">COFINS</option>
          </select>
        </label>
        <label>
          Base:
          <input
            type="number"
            name="base"
            step="0.01"
            value={formData.base || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </label>
        <label>
          Alíquota (%):
          <input
            type="number"
            name="aliquota"
            step="0.0001"
            value={formData.aliquota || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </label>
        <label>
          Valor:
          <input
            type="number"
            name="valor"
            step="0.01"
            value={formData.valor || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </label>
        <CustomButton type="submit">Salvar Alterações</CustomButton>
      </form>
      <CustomModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default TributoEdit;
