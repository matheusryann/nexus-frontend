import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa'; // Ícone de upload
import CustomButton from '../../Components/CustomButton';
import CustomModal from '../../Components/Modal';
import styles from '../../css/UploadFatura.module.css';

const UploadFatura = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [clientes, setClientes] = useState([]); // Lista de clientes
  const [clienteSelecionado, setClienteSelecionado] = useState(''); // Cliente escolhido

  const fileInputRef = React.useRef(null);

  // Buscar lista de clientes ao carregar a página
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/clientes/clientes/',
        );
        if (!response.ok) throw new Error('Erro ao buscar clientes');

        const data = await response.json();

        // Verifique se 'data' é realmente um array antes de chamar setClientes
        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          console.error('Erro: API retornou um formato inesperado', data);
          setClientes([]); // Evita que clientes.map cause erro
        }
      } catch (error) {
        console.error('Erro ao conectar com o servidor', error);
        setClientes([]); // Mantém um array vazio para evitar crash
      }
    };

    fetchClientes();
  }, []);

  // Manipula seleção de arquivo via clique no input
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Manipula arrastar e soltar
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files.length) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  // Abre o explorador de arquivos ao clicar na caixa de upload
  const handleClickUploadBox = () => {
    fileInputRef.current.click();
  };

  // Enviar arquivo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setModalTitle('Erro');
      setModalMessage('Nenhum arquivo selecionado.');
      setIsModalOpen(true);
      return;
    }
    if (!clienteSelecionado) {
      setModalTitle('Erro');
      setModalMessage('Selecione um cliente antes de enviar.');
      setIsModalOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cliente_id', clienteSelecionado); // Adicionando cliente_id

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/historicos/extrair-historico-fatura/',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (response.ok) {
        setModalTitle('Sucesso');
        setModalMessage('Fatura enviada com sucesso!');
        setFile(null);
        setClienteSelecionado('');
      } else {
        const errorData = await response.json();
        setModalTitle('Erro');
        setModalMessage(errorData.detail || 'Falha ao enviar a fatura.');
      }
    } catch (error) {
      setModalTitle('Erro');
      setModalMessage('Erro ao conectar com o servidor.');
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="titulo">Upload de Fatura</h1>
      <p className="description">
        Selecione um cliente e faça o upload de um arquivo PDF contendo a fatura
        para processamento.
      </p>

      <select
        value={clienteSelecionado}
        onChange={(e) => setClienteSelecionado(e.target.value)}
        className={styles.selectBox}
      >
        <option value="">Selecione um Cliente</option>
        {Array.isArray(clientes) && clientes.length > 0 ? (
          clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))
        ) : (
          <option disabled>Nenhum cliente encontrado</option>
        )}
      </select>

      <div
        className={`${styles.uploadBox} ${dragActive ? styles.active : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUploadBox} // Clique na box para abrir explorador de arquivos
      >
        <span className={styles.uploadBoxText}>
          {file
            ? file.name.length > 40
              ? file.name.substring(0, 40) + '...'
              : file.name
            : 'Arraste e solte o arquivo aqui ou clique para selecionar'}
        </span>

        <FaCloudUploadAlt
          size={30}
          color="#69ffc8"
          className={styles.UploadIcon}
        />

        {/* Input oculto para seleção manual */}
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
      </div>

      <CustomButton onClick={handleSubmit}>ENVIAR FATURA</CustomButton>

      <CustomModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default UploadFatura;
