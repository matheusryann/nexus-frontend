import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const EnergyBillEdit = () => {
  const { id } = useParams(); // Obtém o ID da conta de energia da URL
  const navigate = useNavigate(); // Redirecionamento após salvar
  const [formData, setFormData] = useState(null); // Dados do formulário
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [clientes, setClientes] = useState([]);
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

  // Busca os dados iniciais da conta de energia e os dados relacionados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, distribuidorasResponse, contaResponse] =
          await Promise.all([
            fetch('http://127.0.0.1:8000/api/clientes/clientes/'),
            fetch('http://127.0.0.1:8000/api/tarifas/distribuidoras/'),
            fetch(`http://127.0.0.1:8000/api/faturas/contas-energia/${id}/`),
          ]);

        if (
          !clientesResponse.ok ||
          !distribuidorasResponse.ok ||
          !contaResponse.ok
        ) {
          throw new Error('Erro ao buscar dados do backend');
        }

        setClientes(await clientesResponse.json());
        setDistribuidoras(await distribuidorasResponse.json());
        setFormData(await contaResponse.json()); // Preenche o formulário com os dados da conta
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
      const response = await fetch(
        `http://127.0.0.1:8000/api/faturas/contas-energia/${id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Conta de energia atualizada com sucesso!');
        setTimeout(() => navigate('/faturas/visualizar'), 2000);
      } else {
        throw new Error('Erro ao atualizar os dados.');
      }
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  if (!formData) {
    return <p>Carregando dados da conta de energia...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Conta de Energia</h1>
      <p className="description">
        Altere as informações da conta de energia e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        {[
          {
            name: 'cliente',
            type: 'select',
            label: 'Cliente',
            options: clientes,
          },
          {
            name: 'distribuidora',
            type: 'select',
            label: 'Distribuidora',
            options: distribuidoras,
          },
          { name: 'mes', type: 'date', label: 'Mês' },
          { name: 'vencimento', type: 'date', label: 'Vencimento' },
          {
            name: 'total_pagar',
            type: 'number',
            label: 'Total a Pagar',
            step: '0.01',
          },
          { name: 'leitura_anterior', type: 'date', label: 'Leitura Anterior' },
          { name: 'leitura_atual', type: 'date', label: 'Leitura Atual' },
          { name: 'proxima_leitura', type: 'date', label: 'Próxima Leitura' },
          { name: 'numero_dias', type: 'number', label: 'Número de Dias' },
          {
            name: 'subgrupo',
            type: 'select',
            label: 'Subgrupo',
            options: SUBGRUPO_CHOICES,
          },
          {
            name: 'modalidade',
            type: 'select',
            label: 'Modalidade',
            options: MODALIDADE_CHOICES,
          },
          {
            name: 'demanda_contratada_unica',
            type: 'number',
            label: 'Demanda Contratada Única',
            step: '0.01',
          },
          {
            name: 'demanda_contratada_ponta',
            type: 'number',
            label: 'Demanda Contratada Ponta',
            step: '0.01',
          },
          {
            name: 'demanda_contratada_fora_ponta',
            type: 'number',
            label: 'Demanda Contratada Fora Ponta',
            step: '0.01',
          },
          {
            name: 'fator_potencia',
            type: 'number',
            label: 'Fator de Potência',
            step: '0.01',
          },
        ].map(({ name, type, label, options, step }) => (
          <label key={name}>
            {label}:
            {type === 'select' ? (
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                onBlur={handleBlur}
                className={styles.inputSize}
              >
                <option value="">Selecione</option>
                {options.map((option) =>
                  typeof option === 'string' ? (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ) : (
                    <option key={option.id} value={option.id}>
                      {option.nome}
                    </option>
                  ),
                )}
              </select>
            ) : (
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                onBlur={handleBlur}
                step={step}
                className={styles.inputSize}
              />
            )}
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

export default EnergyBillEdit;
