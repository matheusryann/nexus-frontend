import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomButton from '../../Components/CustomButton';
import CustomModal from '../../Components/Modal';
import styles from '../../css/Simulacao.module.css';

const SimulacaoMelhorModalidade = () => {
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState('');
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [verdeTotal, setVerdeTotal] = useState(0);
  const [verdeConsumo, setVerdeConsumo] = useState(0);
  const [verdeDemanda, setVerdeDemanda] = useState(0);
  const [azulTotal, setAzulTotal] = useState(0);
  const [azulConsumo, setAzulConsumo] = useState(0);
  const [azulDemanda, setAzulDemanda] = useState(0);
  const [mensagemFinal, setMensagemFinal] = useState('');

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

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente Desconhecido';
  };

  const formatarValor = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSimulacao = async (e) => {
    e.preventDefault();

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
    setVerdeTotal(0);
    setVerdeConsumo(0);
    setVerdeDemanda(0);
    setAzulTotal(0);
    setAzulConsumo(0);
    setAzulDemanda(0);
    setMensagemFinal('');

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/faturas/calcular-melhor-modalidade/${contaSelecionada}/`,
      );

      if (response.status === 200) {
        const mensagem = response.data.mensagem;

        // Captura os valores corretamente usando regex
        const regex =
          /R\$ ([\d,.]+) \(Consumo: R\$ ([\d,.]+), Demanda: R\$ ([\d,.]+)\)/g;
        const valores = [...mensagem.matchAll(regex)];

        if (valores.length >= 2) {
          // Extração correta dos valores sem transformar em milhões
          const verdeTotal = parseFloat(valores[0][1].replace(',', '.'));
          const verdeConsumo = parseFloat(valores[0][2].replace(',', '.'));
          const verdeDemanda = parseFloat(valores[0][3].replace(',', '.'));

          const azulTotal = parseFloat(valores[1][1].replace(',', '.'));
          const azulConsumo = parseFloat(valores[1][2].replace(',', '.'));
          const azulDemanda = parseFloat(valores[1][3].replace(',', '.'));

          setResultado(mensagem);
          setMensagemFinal(mensagem.split('. ')[2] || '');
          animarValores(
            verdeTotal,
            verdeConsumo,
            verdeDemanda,
            azulTotal,
            azulConsumo,
            azulDemanda,
          );
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
      console.error('Erro ao calcular melhor modalidade:', error);
      setModalTitle('Erro');
      setModalMessage('Falha ao conectar com o servidor.');
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const animarValores = (
    verdeTotalFinal,
    verdeConsumoFinal,
    verdeDemandaFinal,
    azulTotalFinal,
    azulConsumoFinal,
    azulDemandaFinal,
  ) => {
    let intervalo = 30;
    let contador = 0;

    const animacao = setInterval(() => {
      contador++;
      setVerdeTotal((prev) =>
        prev + verdeTotalFinal / 100 > verdeTotalFinal
          ? verdeTotalFinal
          : prev + verdeTotalFinal / 100,
      );
      setVerdeConsumo((prev) =>
        prev + verdeConsumoFinal / 100 > verdeConsumoFinal
          ? verdeConsumoFinal
          : prev + verdeConsumoFinal / 100,
      );
      setVerdeDemanda((prev) =>
        prev + verdeDemandaFinal / 100 > verdeDemandaFinal
          ? verdeDemandaFinal
          : prev + verdeDemandaFinal / 100,
      );
      setAzulTotal((prev) =>
        prev + azulTotalFinal / 100 > azulTotalFinal
          ? azulTotalFinal
          : prev + azulTotalFinal / 100,
      );
      setAzulConsumo((prev) =>
        prev + azulConsumoFinal / 100 > azulConsumoFinal
          ? azulConsumoFinal
          : prev + azulConsumoFinal / 100,
      );
      setAzulDemanda((prev) =>
        prev + azulDemandaFinal / 100 > azulDemandaFinal
          ? azulDemandaFinal
          : prev + azulDemandaFinal / 100,
      );

      if (contador >= 100) {
        clearInterval(animacao);
      }
    }, intervalo);
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Simulação de Melhor Modalidade</h1>
      <p className="description">
        Escolha uma conta de energia cadastrada para descobrir qual modalidade
        tarifária oferece o melhor custo total baseado no histórico.
      </p>

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

      <CustomButton
        onClick={handleSimulacao}
        disabled={isLoading || !contaSelecionada}
      >
        {isLoading ? 'Calculando...' : 'CALCULAR MELHOR MODALIDADE'}
      </CustomButton>

      {resultado && (
        <div className={styles.resultadoContainer}>
          <p className={styles.verde}>
            Modalidade atual (Verde): R$ {formatarValor(verdeTotal)} (Consumo:
            R$ {formatarValor(verdeConsumo)}, Demanda: R${' '}
            {formatarValor(verdeDemanda)})
          </p>
          <p className={styles.azul}>
            Modalidade alternativa (Azul): R$ {formatarValor(azulTotal)}{' '}
            (Consumo: R$ {formatarValor(azulConsumo)}, Demanda: R${' '}
            {formatarValor(azulDemanda)})
          </p>
          <p className={styles.mensagem}>{mensagemFinal}</p>
        </div>
      )}
    </div>
  );
};

export default SimulacaoMelhorModalidade;
