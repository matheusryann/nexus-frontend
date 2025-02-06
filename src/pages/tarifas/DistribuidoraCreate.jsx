import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const DistribuidoraCreate = () => {
  const navigate = useNavigate(); // Para redirecionar após salvar
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    estado: '',
  });
  const [errors, setErrors] = useState({});
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

  // Validação e manipulação do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value) {
      setErrors((prev) => ({ ...prev, [name]: 'Este campo é obrigatório' }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação dos campos
    const hasErrors = Object.values(formData).some((field) => !field);
    if (hasErrors) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos obrigatórios.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/tarifas/distribuidoras/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Distribuidora criada com sucesso!');
        setIsModalOpen(true);
        setTimeout(() => navigate('/distribuidoras/visualizar'), 2000); // Redireciona após salvar
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao criar a distribuidora.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao salvar distribuidora:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao criar a distribuidora.');
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Adicionar Distribuidora</h1>
      <p className="description">
        Preencha os campos abaixo para cadastrar uma nova distribuidora.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.subtitle}>DADOS DA DISTRIBUIDORA</h3>
        <label>
          Código:
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.codigo}</span>
        </label>
        <label>
          Nome:
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.nome}</span>
        </label>
        <label>
          Estado:
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="">Selecione</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <span>{errors.estado}</span>
        </label>
        <CustomButton type="submit">Salvar</CustomButton>
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

export default DistribuidoraCreate;
