import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../Components/CustomButton';
import CustomModal from '../../Components/Modal';
import styles from '../../css/Simulacao.module.css';

const SimulacaoMelhorDemanda = () => {
  const [contas, setContas] = useState([]); // Lista de contas de energia
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [contaSelecionada, setContaSelecionada] = useState(''); // Conta escolhida pelo usuário
  const [resultado, setResultado] = useState(null); // Dados do resultado
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [isModalOpen, setIsModalOpen] = useState(false); // Controle do modal
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [demandaVerde, setDemandaVerde] = useState(0);
  const [custoVerde, setCustoVerde] = useState(0);
  const [demandaAzul, setDemandaAzul] = useState(0);
  const [custoAzul, setCustoAzul] = useState(0);

  // Buscar contas de energia e clientes ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contasResponse, clientesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/faturas/contas-energia/'),
          axios.get('http://127.0.0.1:8000/api/clientes/clientes/'),
        ]);

        setContas(contasResponse.data);
        setClientes(clientesResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        setContas([]);
        setClientes([]);
      }
    };

    fetchData();
  }, []);

  // Função para obter o nome do cliente pelo ID
  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente Desconhecido';
  };

  // Função para simular a melhor demanda
  const handleSimulacao = async (e) => {
    e.preventDefault(); // Evita comportamento inesperado

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
    setDemandaVerde(0);
    setCustoVerde(0);
    setDemandaAzul(0);
    setCustoAzul(0);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/faturas/calcular-melhor-demanda/${contaSelecionada}/`,
      );

      if (response.status === 200) {
        const mensagem = response.data.mensagem;

        // Capturar os valores corretamente usando regex
        const regex = /([\d,.]+) kW - Custo: R\$ ([\d,.]+)/g;
        const valores = [...mensagem.matchAll(regex)];

        // Dentro do bloco que processa a resposta da API no handleSimulacao
        if (valores && valores.length >= 2) {
          // Extração correta dos valores
          const verdeKw = parseFloat(valores[0][1].replace(',', '.'));
          const verdeCusto = parseFloat(valores[0][2].replace(',', '.'));

          const azulKw = parseFloat(valores[1][1].replace(',', '.'));
          const azulCusto = parseFloat(valores[1][2].replace(',', '.'));

          setResultado(mensagem);

          // Inicia a animação para os valores de demanda e custo
          animarValores(verdeKw, verdeCusto, azulKw, azulCusto);
        } else {
          setModalTitle('Erro');
          setModalMessage('Não foi possível extrair os valores da resposta.');
          setIsModalOpen(true);
        }
      } else {
        setModalTitle('Erro');
        setModalMessage('Não foi possível obter os resultados da simulação.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Erro ao calcular melhor demanda:', error);
      setModalTitle('Erro');
      setModalMessage('Falha ao conectar com o servidor.');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para animar a contagem dos valores
  const animarValores = (verdeKw, verdeCusto, azulKw, azulCusto) => {
    let intervalo = 30;
    let incrementoVerdeKw = verdeKw / 100;
    let incrementoVerdeCusto = verdeCusto / 100;
    let incrementoAzulKw = azulKw / 100;
    let incrementoAzulCusto = azulCusto / 100;
    let contador = 0;

    const animacao = setInterval(() => {
      contador++;
      setDemandaVerde((prev) =>
        prev + incrementoVerdeKw > verdeKw ? verdeKw : prev + incrementoVerdeKw,
      );
      setCustoVerde((prev) =>
        prev + incrementoVerdeCusto > verdeCusto
          ? verdeCusto
          : prev + incrementoVerdeCusto,
      );
      setDemandaAzul((prev) =>
        prev + incrementoAzulKw > azulKw ? azulKw : prev + incrementoAzulKw,
      );
      setCustoAzul((prev) =>
        prev + incrementoAzulCusto > azulCusto
          ? azulCusto
          : prev + incrementoAzulCusto,
      );

      if (contador >= 100) {
        clearInterval(animacao);
      }
    }, intervalo);
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Simulação de Melhor Demanda</h1>
      <p className="description">
        Escolha uma conta de energia cadastrada para descobrir qual modalidade
        tarifária oferece a melhor demanda.
      </p>

      {/* Seleção de Conta de Energia */}
      <label className={styles.label}>Selecione uma Conta de Energia:</label>
      <select
        className={styles.select}
        value={contaSelecionada}
        onChange={(e) => setContaSelecionada(e.target.value)}
      >
        <option value="">Selecione uma Conta</option>
        {contas.map((conta) => (
          <option key={conta.id} value={conta.id}>
            {`Conta #${conta.id} - ${getClienteNome(conta.cliente)}`}
          </option>
        ))}
      </select>

      {/* Botão para iniciar a simulação */}
      <CustomButton
        onClick={handleSimulacao}
        disabled={isLoading || !contaSelecionada}
      >
        {isLoading ? 'Calculando...' : 'CALCULAR MELHOR DEMANDA'}
      </CustomButton>

      {/* Exibição dos resultados */}
      {resultado && (
        <div className={styles.resultadoContainer}>
          <p>
            Demanda na modalidade atual:{' '}
            <span className={styles.verde}>{demandaVerde.toFixed(2)} kW</span> -
            Custo:
            <span className={styles.verde}>
              {' '}
              R${' '}
              {custoVerde.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
          <p>
            Demanda na modalidade alternativa:{' '}
            <span className={styles.azul}>{demandaAzul.toFixed(2)} kW</span> -
            Custo:
            <span className={styles.azul}>
              {' '}
              R${' '}
              {custoAzul.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

export default SimulacaoMelhorDemanda;
