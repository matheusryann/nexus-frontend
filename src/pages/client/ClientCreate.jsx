import React, { useState } from 'react';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const ClientCreate = () => {
  const [formData, setFormData] = useState({
    nome: '',
    instalacao: '',
    cnpj: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    classificacao_comercial: '',
    tipo_fornecimento: '',
    tensao_nominal_disp: '',
  });
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];
  const validations = {
    nome: {
      regex: /^.{3,}$/,
      message: 'Nome deve ter pelo menos 3 caracteres.',
    },
    cnpj: {
      regex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      message: 'CNPJ inválido.',
    },
    cep: { regex: /^\d{5}-\d{3}$/, message: 'CEP inválido.' },
    tensao_nominal_disp: {
      regex: /^\d+(\.\d+)?$/,
      message: 'Tensão Nominal deve ser numérica.',
    },
  };

  const handleChange = ({ target: { name, value } }) => {
    const formattedValue = formatField(name, value);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formattedValue),
    }));
    if (name === 'cep' && formattedValue.length < 9) clearAddressFields();
  };

  const handleBlur = ({ target: { name, value } }) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    if (name === 'cep' && value.length === 9)
      fetchAddress(value.replace(/\D/g, ''));
  };

  const formatField = (name, value) =>
    name === 'cep'
      ? value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')
      : name === 'CNPJ'
      ? value
          .replace(/\D/g, '')
          .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
      : value;

  const validateField = (name, value) =>
    validations[name] && !validations[name].regex.test(value)
      ? validations[name].message
      : '';

  const fetchAddress = async (cep) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: `${data.logradouro || ''}, ${data.bairro || ''}`,
          cidade: data.localidade || '',
          estado: data.uf || '',
        }));
        setErrors((prev) => ({ ...prev, cep: '' }));
      } else {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, cep: 'Erro ao buscar CEP.' }));
    }
  };

  const clearAddressFields = () =>
    setFormData((prev) => ({ ...prev, endereco: '', cidade: '', estado: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Object.keys(formData).reduce((acc, key) => {
      acc[key] = validateField(key, formData[key]);
      return acc;
    }, {});
    setErrors(validationErrors);

    if (Object.values(validationErrors).some((err) => err)) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/clientes/clientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Dados cadastrados com sucesso!');
        resetForm();
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao enviar os dados.');
      }
    } catch {
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  const resetForm = () =>
    setFormData({
      nome: '',
      instalacao: '',
      cnpj: '',
      endereco: '',
      cep: '',
      cidade: '',
      estado: '',
      classificacao_comercial: '',
      tipo_fornecimento: '',
      tensao_nominal_disp: '',
    });

  return (
    <div className={styles.container}>
      <h1 className="titulo">Cadastro de Clientes</h1>
      <p className="description">
        Insira abaixo as informações do cliente para registro e gerenciamento.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.subtitle}>Dados Pessoais</h3>
        {['nome', 'instalacao', 'cnpj'].map((field) => (
          <label key={field}>
            {field === 'cnpj'
              ? field
              : field.charAt(0).toUpperCase() + field.slice(1)}
            :
            <input
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.inputSizeOne}
            />
            {touchedFields[field] && errors[field] && (
              <span>{errors[field]}</span>
            )}
          </label>
        ))}
        <label>
          CEP:
          <input
            type="text"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          />
          {touchedFields.cep && errors.cep && <span>{errors.cep}</span>}
        </label>
        <label>
          Endereço:
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            className={styles.inputSizeOne}
          />
        </label>
        <div className={styles.inputRow}>
          <label>
            Cidade:
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className={styles.inputSize}
            />
          </label>
          <label>
            Estado:
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={styles.inputSize}
            >
              <option value="">Selecione</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </label>
        </div>
        <h3 className={styles.subtitle}>Dados Técnicos</h3>
        {[
          {
            name: 'classificacao_comercial',
            options: [
              'Residencial',
              'Comercial',
              'Industrial',
              'Rural',
              'Público',
            ],
          },
          {
            name: 'tipo_fornecimento',
            options: ['Monofásico', 'Bifásico', 'Trifásico'],
          },
        ].map(({ name, options }) => (
          <label key={name}>
            {name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={styles.inputSize}
            >
              <option value="">Selecione</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Tensão Nominal:
          <input
            type="text"
            name="tensao_nominal_disp"
            value={formData.tensao_nominal_disp}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          />
          {touchedFields.tensao_nominal_disp && errors.tensao_nominal_disp && (
            <span>{errors.tensao_nominal_disp}</span>
          )}
        </label>
        <CustomButton onClick={handleSubmit}>Salvar Dados</CustomButton>
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

export default ClientCreate;
