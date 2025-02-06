import React, { useState, useEffect } from 'react';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

// Campos do formulário
const FORM_FIELDS = [
  { name: 'cliente', label: 'Cliente', type: 'select', required: true },
  {
    name: 'distribuidora',
    label: 'Distribuidora',
    type: 'select',
    required: true,
  },
  { name: 'mes', label: 'Mês', type: 'date', required: true },
  { name: 'vencimento', label: 'Vencimento', type: 'date', required: true },
  {
    name: 'total_pagar',
    label: 'Total a Pagar',
    type: 'number',
    required: true,
    step: '0.01',
  },
  { name: 'leitura_anterior', label: 'Leitura Anterior', type: 'date' },
  { name: 'leitura_atual', label: 'Leitura Atual', type: 'date' },
  { name: 'proxima_leitura', label: 'Próxima Leitura', type: 'date' },
  { name: 'numero_dias', label: 'Número de Dias', type: 'number' },
  {
    name: 'subgrupo',
    label: 'Subgrupo',
    type: 'select',
    choices: [
      'A1',
      'A2',
      'A3',
      'A3a',
      'A4',
      'A4a',
      'A4b',
      'AS',
      'B',
      'B1',
      'B2',
      'B3',
      'B4',
    ],
  },
  {
    name: 'modalidade',
    label: 'Modalidade',
    type: 'select',
    choices: [
      'Azul',
      'Azul ABRACE CATIVO',
      'Azul ABRACE LIVRE',
      'Verde',
      'Verde ABRACE CATIVO',
      'Verde ABRACE LIVRE',
      'Branca',
      'Convencional',
      'Convencional ABRACE',
      'Convencional pré-pagamento',
    ],
  },
  {
    name: 'demanda_contratada_unica',
    label: 'Demanda Contratada Única',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'demanda_contratada_ponta',
    label: 'Demanda Contratada Ponta',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'demanda_contratada_fora_ponta',
    label: 'Demanda Contratada Fora Ponta',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'fator_potencia',
    label: 'Fator de Potência',
    type: 'number',
    step: '0.01',
  },
];

// Componente principal
const EnergyBillCreate = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [clientes, setClientes] = useState([]);
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesResponse = await fetch(
          'http://127.0.0.1:8000/api/clientes/clientes/',
        );
        const distribuidorasResponse = await fetch(
          'http://127.0.0.1:8000/api/tarifas/distribuidoras/',
        );

        if (clientesResponse.ok) setClientes(await clientesResponse.json());
        if (distribuidorasResponse.ok)
          setDistribuidoras(await distribuidorasResponse.json());
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
        'total_pagar',
        'demanda_contratada_unica',
        'demanda_contratada_ponta',
        'demanda_contratada_fora_ponta',
        'fator_potencia',
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
      const response = await fetch(
        'http://127.0.0.1:8000/api/faturas/contas-energia/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Conta de energia cadastrada com sucesso!');
        setFormData({});
        setTouchedFields({});
      } else {
        const errorData = await response.json();
        setModalTitle('Erro');
        setModalMessage(
          `Erro ao enviar os dados: ${JSON.stringify(errorData)}`,
        );
      }
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Cadastro de Conta de Energia</h1>
      <p className="description">
        Preencha os campos abaixo para registrar uma nova conta de energia.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        {FORM_FIELDS.map(({ name, label, type, choices, step, required }) => (
          <label key={name}>
            {label}:
            {type === 'select' ? (
              <select
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={styles.inputSizeOne}
              >
                <option value="">Selecione</option>
                {(
                  choices || (name === 'cliente' ? clientes : distribuidoras)
                ).map((choice) =>
                  typeof choice === 'string' ? (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ) : (
                    <option key={choice.id} value={choice.id}>
                      {choice.nome}
                    </option>
                  ),
                )}
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
        <CustomButton type="submit">Salvar Conta</CustomButton>
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

export default EnergyBillCreate;
