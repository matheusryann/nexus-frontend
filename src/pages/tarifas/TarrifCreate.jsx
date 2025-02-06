import React, { useEffect, useState } from 'react';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const TarifaCreate = () => {
  const [formData, setFormData] = useState({
    distribuidora: '',
    data_geracao_conjunto_dados: '',
    dsc_reh: '',
    data_inicio_vigencia: '',
    data_fim_vigencia: '',
    modalidade: '',
    subgrupo: '',
    tipo_tarifa: '',
    valor_tusd: '',
    valor_te: '',
    dsc_classe: '',
    dsc_subclasse: '',
    dsc_detalhe: '',
    nom_posto_tarifario: '',
    dsc_unidade_terciaria: '',
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [distribuidoras, setDistribuidoras] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

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

  const requiredFields = [
    'distribuidora',
    'data_geracao_conjunto_dados',
    'data_inicio_vigencia',
    'modalidade',
    'subgrupo',
    'tipo_tarifa',
    'valor_tusd',
    'valor_te',
  ];

  // Fetch Distribuidoras
  useEffect(() => {
    const fetchDistribuidoras = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/tarifas/distribuidoras/',
        );
        if (!response.ok) throw new Error('Erro ao buscar distribuidoras');
        const data = await response.json();
        setDistribuidoras(data);
      } catch (error) {
        console.error('Erro ao buscar distribuidoras:', error);
        setModalTitle('Erro');
        setModalMessage('Erro ao carregar as distribuidoras.');
        setIsModalOpen(true);
      }
    };

    fetchDistribuidoras();
  }, []);

  const validateField = (name, value) => {
    if (requiredFields.includes(name) && !value) {
      return 'Este campo é obrigatório';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      newErrors[key] = validateField(key, value);
    });

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      setModalTitle('Erro de Validação');
      setModalMessage('Preencha todos os campos obrigatórios.');
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/tarifas/tarifas/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Tarifa cadastrada com sucesso!');
        setFormData({
          distribuidora: '',
          data_geracao_conjunto_dados: '',
          dsc_reh: '',
          data_inicio_vigencia: '',
          data_fim_vigencia: '',
          modalidade: '',
          subgrupo: '',
          tipo_tarifa: '',
          valor_tusd: '',
          valor_te: '',
          dsc_classe: '',
          dsc_subclasse: '',
          dsc_detalhe: '',
          nom_posto_tarifario: '',
          dsc_unidade_terciaria: '',
        });
      } else {
        throw new Error('Erro ao cadastrar tarifa');
      }
    } catch (error) {
      console.error('Erro ao cadastrar tarifa:', error);
      setModalTitle('Erro');
      setModalMessage('Erro ao cadastrar a tarifa. Tente novamente.');
    } finally {
      setIsModalOpen(true);
    }
  };

  const renderField = (name, label, type = 'text', options = []) => {
    const commonProps = {
      name,
      value: formData[name],
      onChange: handleChange,
      onBlur: handleBlur,
      className: styles.inputSize,
    };

    return (
      <label key={name}>
        {label}:
        {options.length ? (
          <select {...commonProps}>
            <option value="" disabled>
              Selecione
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input {...commonProps} type={type} />
        )}
        <span>{errors[name]}</span>
      </label>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Cadastrar Tarifa</h1>
      <p className="description">
        Preencha as informações para cadastrar uma nova tarifa.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        {renderField(
          'data_geracao_conjunto_dados',
          'Data Geração Conjunto Dados',
          'date',
        )}
        {renderField('dsc_reh', 'Dsc REH')}
        {renderField('data_inicio_vigencia', 'Data Início Vigência', 'date')}
        {renderField('data_fim_vigencia', 'Data Fim Vigência', 'date')}
        {renderField('modalidade', 'Modalidade', 'text', MODALIDADE_CHOICES)}
        {renderField('subgrupo', 'Subgrupo', 'text', SUBGRUPO_CHOICES)}
        {renderField('tipo_tarifa', 'Tipo Tarifa')}
        {renderField('valor_tusd', 'Valor TUSD', 'number')}
        {renderField('valor_te', 'Valor TE', 'number')}
        {renderField('dsc_classe', 'Descrição Classe')}
        {renderField('dsc_subclasse', 'Descrição Subclasse')}
        {renderField('dsc_detalhe', 'Detalhe')}
        {renderField('nom_posto_tarifario', 'Posto Tarifário')}
        {renderField('dsc_unidade_terciaria', 'Unidade Terciária')}
        {renderField(
          'distribuidora',
          'Distribuidora',
          'text',
          distribuidoras.map((d) => d.nome),
        )}
        <CustomButton>Cadastrar Tarifa</CustomButton>
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

export default TarifaCreate;
