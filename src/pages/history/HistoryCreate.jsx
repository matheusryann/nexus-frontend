import React, { useState, useEffect } from 'react';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const HistoryCreate = () => {
  const [formData, setFormData] = useState({
    cliente: '',
    mes: '',
    demanda_medida_ponta: '',
    demanda_medida_fora_ponta: '',
    demanda_medida_reativo_excedente: '',
    consumo_faturado_ponta_tot: '',
    consumo_faturado_fora_ponta: '',
    consumo_faturado_reativo_excedente: '',
    horario_reservado_consumo: '',
    horario_reservado_reativo_excedente: '',
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Busca os clientes ao carregar o componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/clientes/clientes/',
        );
        if (response.ok) {
          setClientes(await response.json());
        } else {
          console.error('Erro ao buscar clientes');
        }
      } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
      }
    };
    fetchClientes();
  }, []);

  // Validações dos campos
  const validateField = (name, value) => {
    if (name === 'cliente' && !value) {
      return 'O cliente é obrigatório.';
    }
    if (name === 'mes' && (value < 1 || value > 12)) {
      return 'Mês deve ser entre 1 e 12.';
    }
    if (value !== '' && parseFloat(value) < 0) {
      return 'Valores devem ser positivos.';
    }
    return '';
  };

  // Gerencia alterações nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touchedFields[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  // Gerencia o foco perdido nos campos
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);
    setTouchedFields(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    );

    if (Object.values(newErrors).some((err) => err)) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha os campos obrigatórios corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/historicos/historicos-consumo-demanda/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Histórico cadastrado com sucesso!');
        setFormData({
          cliente: '',
          mes: '',
          demanda_medida_ponta: '',
          demanda_medida_fora_ponta: '',
          demanda_medida_reativo_excedente: '',
          consumo_faturado_ponta_tot: '',
          consumo_faturado_fora_ponta: '',
          consumo_faturado_reativo_excedente: '',
          horario_reservado_consumo: '',
          horario_reservado_reativo_excedente: '',
        });
        setTouchedFields({});
      } else {
        const errorData = await response.json();
        setModalTitle('Erro');
        setModalMessage(
          `Erro ao enviar os dados: ${JSON.stringify(errorData)}`,
        );
      }
    } catch (error) {
      console.error('Erro na comunicação com o servidor:', error);
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Cadastro de Histórico de Consumo e Demanda</h1>
      <p className="description">
        Preencha os campos abaixo para registrar o histórico de consumo e
        demanda do cliente.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Cliente:
          <select
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
          {touchedFields.cliente && <span>{errors.cliente}</span>}
        </label>
        {[
          { label: 'Mês', name: 'mes', type: 'number' },
          { label: 'Demanda Medida Ponta', name: 'demanda_medida_ponta' },
          {
            label: 'Demanda Medida Fora Ponta',
            name: 'demanda_medida_fora_ponta',
          },
          {
            label: 'Demanda Medida Reativo Excedente',
            name: 'demanda_medida_reativo_excedente',
          },
          {
            label: 'Consumo Faturado Ponta Total',
            name: 'consumo_faturado_ponta_tot',
          },
          {
            label: 'Consumo Faturado Fora Ponta',
            name: 'consumo_faturado_fora_ponta',
          },
          {
            label: 'Consumo Faturado Reativo Excedente',
            name: 'consumo_faturado_reativo_excedente',
          },
          {
            label: 'Horário Reservado Consumo',
            name: 'horario_reservado_consumo',
          },
          {
            label: 'Horário Reservado Reativo Excedente',
            name: 'horario_reservado_reativo_excedente',
          },
        ].map(({ label, name, type = 'number' }) => (
          <label key={name}>
            {label}:
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.inputSize}
            />
            {touchedFields[name] && <span>{errors[name]}</span>}
          </label>
        ))}
        <CustomButton onClick={handleSubmit}>Salvar Histórico</CustomButton>
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

export default HistoryCreate;
