import React, { useState, useEffect } from 'react';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const TributoCreate = () => {
  const [formData, setFormData] = useState({
    conta_energia: '',
    tipo: '',
    base: '',
    aliquota: '',
    valor: '',
  });

  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [clientes, setClientes] = useState([]);
  const [contasEnergia, setContasEnergia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, contasRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/clientes/clientes/'),
          fetch('http://127.0.0.1:8000/api/faturas/contas-energia/'),
        ]);

        if (clientesRes.ok && contasRes.ok) {
          setClientes(await clientesRes.json());
          setContasEnergia(await contasRes.json());
        } else {
          console.error('Erro ao buscar dados dos clientes e contas');
        }
      } catch (error) {
        console.error('Erro na comunicação com o servidor:', error);
      }
    };
    fetchData();
  }, []);

  // Obtém o nome do cliente associado a uma conta de energia
  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  // Validações dos campos
  const validateField = (name, value) => {
    if (name === 'conta_energia' && !value) {
      return 'A conta de energia é obrigatória.';
    }
    if (name === 'tipo' && !value.trim()) {
      return 'O tipo de tributo é obrigatório.';
    }
    if (
      ['base', 'aliquota', 'valor'].includes(name) &&
      value !== '' &&
      parseFloat(value) < 0
    ) {
      return 'O valor deve ser positivo.';
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
      setModalMessage('Preencha todos os campos obrigatórios corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/faturas/tributos/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Tributo cadastrado com sucesso!');
        setFormData({
          conta_energia: '',
          tipo: '',
          base: '',
          aliquota: '',
          valor: '',
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
      <h1 className="titulo">Cadastro de Tributo</h1>
      <p className="description">
        Preencha os campos abaixo para cadastrar um novo tributo.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Conta de Energia:
          <select
            name="conta_energia"
            value={formData.conta_energia}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          >
            <option value="">Selecione</option>
            {contasEnergia.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {conta.id} - {getClienteNome(conta.cliente)}
              </option>
            ))}
          </select>
          {touchedFields.conta_energia && <span>{errors.conta_energia}</span>}
        </label>
        <label>
          Tipo:
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="">Selecione</option>
            <option value="ICMS">ICMS</option>
            <option value="PIS">PIS</option>
            <option value="COFINS">COFINS</option>
          </select>
          {touchedFields.tipo && <span>{errors.tipo}</span>}
        </label>
        {[
          { name: 'base', label: 'Base' },
          { name: 'aliquota', label: 'Alíquota (%)' },
          { name: 'valor', label: 'Valor' },
        ].map(({ name, label }) => (
          <label key={name}>
            {label}:
            <input
              type="number"
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onBlur={handleBlur}
              step="0.01"
              className={styles.inputSize}
            />
            {touchedFields[name] && <span>{errors[name]}</span>}
          </label>
        ))}
        <CustomButton onClick={handleSubmit}>Salvar Tributo</CustomButton>
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

export default TributoCreate;
