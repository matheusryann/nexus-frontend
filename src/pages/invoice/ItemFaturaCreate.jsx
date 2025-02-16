import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const FORM_FIELDS = [
  {
    name: 'conta_energia',
    label: 'Conta de Energia',
    type: 'select',
    required: true,
  },
  { name: 'descricao', label: 'Descrição', type: 'text', required: true },
  { name: 'quantidade', label: 'Quantidade', type: 'number', step: '0.01' },
  {
    name: 'preco_unitario',
    label: 'Preço Unitário',
    type: 'number',
    step: '0.000001',
  },
  { name: 'tarifa', label: 'Tarifa', type: 'number', step: '0.000001' },
  { name: 'pis_cofins', label: 'PIS/COFINS', type: 'number', step: '0.01' },
  { name: 'icms', label: 'ICMS', type: 'number', step: '0.01' },
  { name: 'valor', label: 'Valor Total', type: 'number', step: '0.01' },
];

const ItemFaturaCreate = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [contasEnergia, setContasEnergia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/faturas/contas-energia/',
        );
        setContasEnergia(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
    fetchData();
  }, []);

  const validateField = (name, value, required) => {
    if (required && !value) return 'Este campo é obrigatório.';
    if (
      [
        'quantidade',
        'preco_unitario',
        'tarifa',
        'pis_cofins',
        'icms',
        'valor',
      ].includes(name) &&
      value < 0
    ) {
      return 'O valor deve ser positivo.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touchedFields[name]) {
      const field = FORM_FIELDS.find((f) => f.name === name);
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, field.required),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const field = FORM_FIELDS.find((f) => f.name === name);
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, field.required),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    FORM_FIELDS.forEach((field) => {
      newErrors[field.name] = validateField(
        field.name,
        formData[field.name],
        field.required,
      );
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos obrigatórios corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/faturas/itens-fatura/',
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      setModalTitle('Sucesso');
      setModalMessage('Item da fatura cadastrado com sucesso!');
      setFormData({});
      setTouchedFields({});
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage(
        `Erro ao enviar os dados: ${
          error.response
            ? JSON.stringify(error.response.data)
            : 'Erro desconhecido'
        }`,
      );
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Cadastro de Item de Fatura</h1>
      <p className="description">
        Cadastre os itens da fatura, como consumo, tarifas e impostos, para um
        detalhamento preciso dos custos.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        {FORM_FIELDS.map(({ name, label, type, step, required }) => (
          <label key={name}>
            {label}:
            {name === 'conta_energia' ? (
              <select
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Selecione</option>
                {contasEnergia.map((conta) => (
                  <option key={conta.id} value={conta.id}>
                    {conta.id} - {conta.cliente}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                step={step}
                className={styles.inputSize}
              />
            )}
            {touchedFields[name] && errors[name] && <span>{errors[name]}</span>}
          </label>
        ))}
        <CustomButton type="submit">Salvar Item</CustomButton>
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

export default ItemFaturaCreate;
