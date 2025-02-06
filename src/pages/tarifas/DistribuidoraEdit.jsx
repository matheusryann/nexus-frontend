import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const DistribuidoraEdit = () => {
  const { id } = useParams(); // Obtém o ID da distribuidora da URL
  const navigate = useNavigate(); // Redirecionamento após salvar
  const [formData, setFormData] = useState(null); // Dados do formulário
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Busca os dados da distribuidora ao carregar o componente
  useEffect(() => {
    const fetchDistribuidoraData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/tarifas/distribuidoras/${id}/`,
        );
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da distribuidora');
        }
        const data = await response.json();
        setFormData(data); // Preenche o formulário com os dados da distribuidora
      } catch (error) {
        console.error('Erro ao buscar distribuidora:', error);
        setModalTitle('Erro');
        setModalMessage('Não foi possível carregar os dados da distribuidora.');
        setIsModalOpen(true);
      }
    };

    fetchDistribuidoraData();
  }, [id]);

  // Manipulação do formulário
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

    // Verifica se há campos vazios
    const hasErrors = Object.values(formData).some((field) => !field);
    if (hasErrors) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tarifas/distribuidoras/${id}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Distribuidora atualizada com sucesso!');
        setIsModalOpen(true);
        setTimeout(() => navigate('/distribuidoras/visualizar'), 2000); // Redireciona após salvar
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao atualizar os dados da distribuidora.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao salvar distribuidora:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao atualizar os dados da distribuidora.');
      setIsModalOpen(true);
    }
  };

  // Renderização condicional enquanto os dados estão sendo carregados
  if (!formData) {
    return <p>Carregando dados da distribuidora...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Distribuidora</h1>
      <p className="description">
        Altere as informações da distribuidora e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
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
            <option value="" disabled>
              Selecione
            </option>
            {[
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
            ].map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <span>{errors.estado}</span>
        </label>
        <CustomButton onClick={handleSubmit}>Salvar Alterações</CustomButton>
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

export default DistribuidoraEdit;
