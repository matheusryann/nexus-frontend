import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../../css/ClientCreate.module.css';
import CustomModal from '../../Components/Modal';
import CustomButton from '../../Components/CustomButton';

const ItemFaturaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [contasEnergia, setContasEnergia] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, contasResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/faturas/itens-fatura/${id}/`),
          fetch('http://127.0.0.1:8000/api/faturas/contas-energia/'),
        ]);

        if (!itemResponse.ok || !contasResponse.ok) {
          throw new Error('Erro ao buscar dados do backend');
        }

        const itemData = await itemResponse.json();
        const contasData = await contasResponse.json();

        setFormData(itemData);
        setContasEnergia(contasData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setModalTitle('Erro');
        setModalMessage('Não foi possível carregar os dados.');
        setIsModalOpen(true);
      }
    };

    fetchData();
  }, [id]);

  const getClienteNome = (conta) => {
    if (!conta) return 'Desconhecido';

    if (typeof conta.cliente === 'object' && conta.cliente.nome) {
      return `${conta.id} - ${conta.cliente.nome}`;
    }

    const contaEncontrada = contasEnergia.find((c) => c.id === conta.id);
    return contaEncontrada
      ? `${contaEncontrada.id} - ${contaEncontrada.cliente.nome}`
      : 'Desconhecido';
  };

  const validateField = (name, value) => {
    if (!value) return 'Este campo é obrigatório.';
    if (
      [
        'quantidade',
        'preco_unitario',
        'tarifa',
        'pis_cofins',
        'icms',
        'valor',
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
        `http://127.0.0.1:8000/api/faturas/itens-fatura/${id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Item de fatura atualizado com sucesso!');
        setTimeout(() => navigate('/itens-fatura/visualizar'), 2000);
      } else {
        throw new Error('Erro ao atualizar os dados.');
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      setModalTitle('Erro');
      setModalMessage('Erro na comunicação com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  if (!formData) {
    return <p>Carregando dados do item de fatura...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className="titulo">Editar Item de Fatura</h1>
      <p className="description">
        Altere as informações do item de fatura e salve as mudanças.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Conta de Energia:
          <select
            name="conta_energia"
            value={formData.conta_energia || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={styles.inputSizeOne}
          >
            <option value="">Selecione</option>
            {contasEnergia.map((conta) => (
              <option key={conta.id} value={conta.id}>
                {getClienteNome(conta)}
              </option>
            ))}
          </select>
        </label>
        {[
          { name: 'descricao', type: 'text', label: 'Descrição' },
          {
            name: 'quantidade',
            type: 'number',
            label: 'Quantidade',
            step: '0.01',
          },
          {
            name: 'preco_unitario',
            type: 'number',
            label: 'Preço Unitário',
            step: '0.000001',
          },
          { name: 'tarifa', type: 'number', label: 'Tarifa', step: '0.000001' },
          {
            name: 'pis_cofins',
            type: 'number',
            label: 'PIS/COFINS',
            step: '0.01',
          },
          { name: 'icms', type: 'number', label: 'ICMS', step: '0.01' },
          { name: 'valor', type: 'number', label: 'Valor Total', step: '0.01' },
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

export default ItemFaturaEdit;
