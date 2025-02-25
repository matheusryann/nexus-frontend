import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../Components/CustomButton';
import CustomModal from '../../Components/Modal';
import styles from '../../css/Simulacao.module.css';

const SimulacaoConsumoAnual = ({ clientId }) => {
  const [contas, setContas] = useState([]); // Lista de contas de energia
  const [contaSelecionada, setContaSelecionada] = useState(''); // Conta escolhida pelo usuário
  const [resultado, setResultado] = useState(null); // Dados do resultado
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [valorVerde, setValorVerde] = useState(0);
  const [valorAzul, setValorAzul] = useState(0);

  // Busca as contas de energia ao carregar a página
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/api/faturas/contas-energia/',
        );

        if (Array.isArray(response.data)) {
          // Filtra as contas do cliente logado
          const contasCliente = response.data.filter(
            (conta) => conta.cliente === clientId,
          );
          setContas(contasCliente);
        }
      } catch (error) {
        console.error('Erro ao buscar contas:', error);
      }
    };

    fetchContas();
  }, [clientId]);

  // Função para simular os cálculos
  const handleSimulacao = async () => {
    if (!contaSelecionada) {
      setModalTitle('Erro');
      setModalMessage(
        'Selecione uma conta de energia antes de iniciar a simulação.',
      );
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setResultado(null);
    setValorVerde(0);
    setValorAzul(0);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/faturas/calcular-melhor-consumo-anual/${contaSelecionada}/`,
      );

      if (response.status === 200) {
        const mensagem = response.data.mensagem;
        const valores = mensagem.match(/R\$ ([\d,.]+)/g);

        if (valores && valores.length >= 2) {
          const verde = parseFloat(
            valores[0].replace('R$ ', '').replace('.', '').replace(',', '.'),
          );
          const azul = parseFloat(
            valores[1].replace('R$ ', '').replace('.', '').replace(',', '.'),
          );

          setResultado(response.data.mensagem);

          // Inicia a animação dos valores subindo até o final
          animarValores(verde, azul);
        }
      } else {
        setModalTitle('Erro');
        setModalMessage('Não foi possível obter os resultados da simulação.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao calcular consumo anual:', error);
      setModalTitle('Erro');
      setModalMessage('Falha ao conectar com o servidor.');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para animar a contagem dos valores
  const animarValores = (verdeFinal, azulFinal) => {
    let intervalo = 30;
    let incrementoVerde = verdeFinal / 100;
    let incrementoAzul = azulFinal / 100;
    let contador = 0;

    const animacao = setInterval(() => {
      contador++;
      setValorVerde((prev) =>
        prev + incrementoVerde > verdeFinal
          ? verdeFinal
          : prev + incrementoVerde,
      );
      setValorAzul((prev) =>
        prev + incrementoAzul > azulFinal ? azulFinal : prev + incrementoAzul,
      );

      if (contador >= 100) {
        clearInterval(animacao);
      }
    }, intervalo);
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Simulação de Melhor Consumo Anual</h1>
      <p className="description">
        Escolha uma conta de energia cadastrada e descubra qual modalidade
        tarifária oferece o menor custo anual.
      </p>

      {/* Dropdown para selecionar a conta de energia */}
      <select
        className={styles.select}
        value={contaSelecionada}
        onChange={(e) => setContaSelecionada(e.target.value)}
      >
        <option value="">Selecione uma conta</option>
        {contas.map((conta) => (
          <option key={conta.id} value={conta.id}>
            {`Conta #${conta.id} - ${conta.nome_cliente || 'Desconhecido'}`}
          </option>
        ))}
      </select>

      {/* Botão para iniciar a simulação */}
      <CustomButton onClick={handleSimulacao} disabled={isLoading}>
        {isLoading ? 'Calculando...' : 'CALCULAR MELHOR CONSUMO'}
      </CustomButton>

      {/* Exibição dos resultados */}
      {resultado && (
        <div className={styles.resultadoContainer}>
          <p>
            Consumo anual na modalidade atual:{' '}
            <span className={styles.verde}>
              R${' '}
              {valorVerde.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p>
            Consumo anual na modalidade alternativa:{' '}
            <span className={styles.azul}>
              R${' '}
              {valorAzul.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p className={styles.mensagem}>{resultado.split('. ')[2] || ''}</p>
        </div>
      )}

      {/* Modal para mensagens de erro ou sucesso */}
      <CustomModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default SimulacaoConsumoAnual;
