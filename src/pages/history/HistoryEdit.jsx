import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const HistoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Lista de campos (exceto cliente, que será tratado separadamente)
  const fields = [
    { name: 'mes', label: 'Mês', type: 'number' },
    {
      name: 'demanda_medida_ponta',
      label: 'Demanda Medida Ponta',
      type: 'number',
    },
    {
      name: 'demanda_medida_fora_ponta',
      label: 'Demanda Medida Fora Ponta',
      type: 'number',
    },
    {
      name: 'demanda_medida_reativo_excedente',
      label: 'Demanda Medida Reativo Excedente',
      type: 'number',
    },
    {
      name: 'consumo_faturado_ponta_tot',
      label: 'Consumo Faturado Ponta Total',
      type: 'number',
    },
    {
      name: 'consumo_faturado_fora_ponta',
      label: 'Consumo Faturado Fora Ponta',
      type: 'number',
    },
    {
      name: 'consumo_faturado_reativo_excedente',
      label: 'Consumo Faturado Reativo Excedente',
      type: 'number',
    },
    {
      name: 'horario_reservado_consumo',
      label: 'Horário Reservado Consumo',
      type: 'number',
    },
    {
      name: 'horario_reservado_reativo_excedente',
      label: 'Horário Reservado Reativo Excedente',
      type: 'number',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyResponse, clientsResponse] = await Promise.all([
          fetch(
            `http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/${id}/`,
          ),
          fetch('http://127.0.0.1:8000/api/clientes/clientes/'),
        ]);

        if (!historyResponse.ok || !clientsResponse.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const historyData = await historyResponse.json();
        const clientsData = await clientsResponse.json();
        setFormData(historyData);
        setClientes(clientsData);
      } catch (error) {
        console.error(error);
        setModalTitle('Erro');
        setModalMessage('Erro ao carregar os dados.');
        setIsModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: value ? '' : 'Este campo é obrigatório',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = fields.some((field) => !formData[field.name]);
    if (!formData.cliente) {
      setErrors((prev) => ({ ...prev, cliente: 'Selecione um cliente.' }));
      return;
    }

    if (hasErrors) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos obrigatórios.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/${id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Histórico atualizado com sucesso!');
        setTimeout(() => navigate('/historico/visualizar-historico'), 2000);
      } else {
        throw new Error('Erro ao atualizar o histórico');
      }
    } catch (error) {
      console.error(error);
      setModalTitle('Erro');
      setModalMessage('Erro ao atualizar o histórico.');
    } finally {
      setIsModalOpen(true);
    }
  };

  if (isLoading) return <p>Carregando dados do histórico...</p>;

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Histórico</h1>
      <p className="description">
        Altere as informações do histórico e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.subtitle}>INFORMAÇÕES DO HISTÓRICO</h3>
        <label>
          Cliente:
          <select
            name="cliente"
            value={formData.cliente || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
          <span>{errors.cliente}</span>
        </label>
        {fields.map(({ name, label, type }) => (
          <label key={name}>
            {label}:
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.inputSize}
            />
            <span>{errors[name]}</span>
          </label>
        ))}
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

export default HistoryEdit;
