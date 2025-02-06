import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const TarifaEdit = () => {
  const { id } = useParams(); // Obtém o ID da tarifa da URL
  const navigate = useNavigate(); // Redirecionamento após salvar
  const [formData, setFormData] = useState(null); // Dados do formulário
  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [distribuidoras, setDistribuidoras] = useState([]); // Lista de distribuidoras

  const SUBGRUPO_CHOICES = [
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
  ];

  const MODALIDADE_CHOICES = [
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
  ];

  // Busca os dados da tarifa e distribuidoras ao carregar o componente
  useEffect(() => {
    const fetchTarifaData = async () => {
      try {
        const [tarifaResponse, distribuidorasResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/tarifas/tarifas/${id}/`),
          fetch('http://127.0.0.1:8000/api/tarifas/distribuidoras/'),
        ]);

        if (!tarifaResponse.ok || !distribuidorasResponse.ok) {
          throw new Error('Erro ao buscar dados da tarifa ou distribuidoras');
        }

        const tarifaData = await tarifaResponse.json();
        const distribuidorasData = await distribuidorasResponse.json();

        setFormData(tarifaData); // Preenche o formulário com os dados da tarifa
        setDistribuidoras(distribuidorasData); // Preenche a lista de distribuidoras
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setModalTitle('Erro');
        setModalMessage(
          'Não foi possível carregar os dados da tarifa ou distribuidoras.',
        );
        setIsModalOpen(true);
      }
    };

    fetchTarifaData();
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
        `http://127.0.0.1:8000/api/tarifas/tarifas/${id}/`,
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
        setModalMessage('Tarifa atualizada com sucesso!');
        setIsModalOpen(true);
        setTimeout(() => navigate('/tarifas/visualizar-tarifas'), 2000); // Redireciona após salvar
      } else {
        setModalTitle('Erro');
        setModalMessage('Erro ao atualizar os dados da tarifa.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao salvar tarifa:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao atualizar os dados da tarifa.');
      setIsModalOpen(true);
    }
  };

  // Renderização condicional enquanto os dados estão sendo carregados
  if (!formData) {
    return <p>Carregando dados da tarifa...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Tarifa</h1>
      <p className="description">
        Altere as informações da tarifa e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Data Geração Conjunto Dados:
          <input
            type="date"
            name="data_geracao_conjunto_dados"
            value={formData.data_geracao_conjunto_dados}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.data_geracao_conjunto_dados}</span>
        </label>
        <label>
          Descrição REH:
          <input
            type="text"
            name="dsc_reh"
            value={formData.dsc_reh}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.dsc_reh}</span>
        </label>
        <label>
          Data Início Vigência:
          <input
            type="date"
            name="data_inicio_vigencia"
            value={formData.data_inicio_vigencia}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.data_inicio_vigencia}</span>
        </label>
        <label>
          Data Fim Vigência:
          <input
            type="date"
            name="data_fim_vigencia"
            value={formData.data_fim_vigencia}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.data_fim_vigencia}</span>
        </label>
        <label>
          Modalidade:
          <select
            name="modalidade"
            value={formData.modalidade}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="" disabled>
              Selecione
            </option>
            {MODALIDADE_CHOICES.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
          <span>{errors.modalidade}</span>
        </label>
        <label>
          Subgrupo:
          <select
            name="subgrupo"
            value={formData.subgrupo}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="" disabled>
              Selecione
            </option>
            {SUBGRUPO_CHOICES.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <span>{errors.subgrupo}</span>
        </label>
        <label>
          Tipo Tarifa:
          <input
            type="text"
            name="tipo_tarifa"
            value={formData.tipo_tarifa}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.tipo_tarifa}</span>
        </label>
        <label>
          Valor TUSD:
          <input
            type="number"
            name="valor_tusd"
            value={formData.valor_tusd}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.valor_tusd}</span>
        </label>
        <label>
          Valor TE:
          <input
            type="number"
            name="valor_te"
            value={formData.valor_te}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.valor_te}</span>
        </label>
        <label>
          Descrição Classe:
          <input
            type="text"
            name="dsc_classe"
            value={formData.dsc_classe}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.dsc_classe}</span>
        </label>
        <label>
          Descrição Subclasse:
          <input
            type="text"
            name="dsc_subclasse"
            value={formData.dsc_subclasse}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.dsc_subclasse}</span>
        </label>
        <label>
          Detalhe:
          <input
            type="text"
            name="dsc_subclasse"
            value={formData.dsc_detalhe}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.dsc_detalhe}</span>
        </label>
        <label>
          Posto Tarifário:
          <input
            type="text"
            name="nom_posto_tarifario"
            value={formData.nom_posto_tarifario}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.nom_posto_tarifario}</span>
        </label>
        <label>
          Unidade Terciária:
          <input
            type="text"
            name="dsc_subclasse"
            value={formData.dsc_unidade_terciaria}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          />
          <span>{errors.dsc_unidade_terciaria}</span>
        </label>
        <label>
          Distribuidora:
          <select
            name="distribuidora"
            value={formData.distribuidora}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSize}
          >
            <option value="" disabled>
              Selecione
            </option>
            {distribuidoras.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.nome}
              </option>
            ))}
          </select>
          <span>{errors.distribuidora}</span>
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

export default TarifaEdit;
