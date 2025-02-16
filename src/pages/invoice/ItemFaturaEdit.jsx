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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/faturas/tributos/${id}/`,
        );
        setFormData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setModalTitle('Erro');
        setModalMessage('Não foi possível carregar os dados.');
        setIsModalOpen(true);
      }
    };
    fetchData();
  }, [id]);

  const validateField = (name, value) => {
    if (name === 'aliquota' && (value < 0 || value > 100)) {
      return 'A alíquota deve estar entre 0 e 100%.';
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
      setModalMessage('Corrija os erros antes de salvar.');
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
      setTimeout(() => navigate('/tributos/visualizar'), 2000);
    } catch (error) {
      console.error('Erro ao atualizar tributo:', error);
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
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
        {[
          { name: 'nome', type: 'text', label: 'Nome' },
          {
            name: 'aliquota',
            type: 'number',
            label: 'Alíquota (%)',
            step: '0.01',
          },
        ].map(({ name, type, label, step }) => (
          <label key={name}>
            {label}:
            <input
              type={type}
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              step={step}
              className={styles.inputSize}
            />
            {touchedFields[name] && <span>{errors[name]}</span>}
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

export default TributoEdit;
