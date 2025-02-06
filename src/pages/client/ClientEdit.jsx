import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const ClientEdit = () => {
  const { id } = useParams(); // Obtém o ID do cliente da URL
  const navigate = useNavigate(); // Redirecionamento após salvar
  const [formData, setFormData] = useState(null); // Inicialmente null para controlar carregamento
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

  // Busca os dados do cliente ao carregar
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/clientes/clientes/${id}/`,
        );
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do cliente');
        }
        const data = await response.json();
        setFormData(data); // Preenche o formulário com os dados do cliente
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        setModalTitle('Erro');
        setModalMessage('Não foi possível carregar os dados do cliente.');
        setIsModalOpen(true);
      }
    };

    fetchClientData();
  }, [id]);

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

    // Validações antes de enviar
    const hasErrors = Object.values(formData).some((field) => !field);
    if (hasErrors) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos corretamente.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/clientes/clientes/${id}/`,
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
        setModalMessage('Dados atualizados com sucesso!');
        setIsModalOpen(true);
        setTimeout(() => navigate('/clientes/visualizar'), 2000); // Redireciona após salvar
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao atualizar os dados do cliente.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao atualizar os dados do cliente.');
      setIsModalOpen(true);
    }
  };

  // Renderização condicional para evitar erros enquanto os dados estão carregando
  if (!formData) {
    return <p>Carregando dados do cliente...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Cliente</h1>
      <p className="description">
        Altere as informações do cliente e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h3 className={styles.subtitle}>DADOS PESSOAIS</h3>
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
          Instalação:
          <input
            type="text"
            name="instalacao"
            value={formData.instalacao}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.instalacao}</span>
        </label>
        <label>
          CNPJ:
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.cnpj}</span>
        </label>
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
          <span>{errors.cep}</span>
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
            Estado
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
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <span>{errors.estado}</span>
          </label>
        </div>
        <h3 className={styles.subtitle}>DADOS TÉCNICOS</h3>
        <label>
          Classificação Comercial:
          <select
            name="classificacao_comercial"
            value={formData.classificacao_comercial}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="">Selecione</option>
            <option value="Residencial">Residencial</option>
            <option value="Comercial">Comercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Rural">Rural</option>
            <option value="Público">Público</option>
          </select>
          <span>{errors.classificacao_comercial}</span>
        </label>
        <label>
          Tipo de Fornecimento:
          <select
            name="tipo_fornecimento"
            value={formData.tipo_fornecimento}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="">Selecione</option>
            <option value="Monofásico">Monofásico</option>
            <option value="Bifásico">Bifásico</option>
            <option value="Trifásico">Trifásico</option>
          </select>
          <span>{errors.tipo_fornecimento}</span>
        </label>
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
          <span>{errors.tensao_nominal_disp}</span>
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

export default ClientEdit;
