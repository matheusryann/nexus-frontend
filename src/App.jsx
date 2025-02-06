import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ClientesProvider } from './context/ClientContext'; // Importa o Provider
import Footer from './Components/Footer';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import Home from './pages/Home';
import ClientVisualization from './pages/client/ClientVisualization';
import ClientCreate from './pages/client/ClientCreate';
import ClientEdit from './pages/client/ClientEdit'; // Importa o ClientEdit
import HistoricoCreate from './pages/history/HistoryCreate'; // Importa o HistoricoCreate
import HistoricoVisualization from './pages/history/HistoryVisualization'; // Importa o HistoricoVisualization
import EnergyBillCreate from './pages/invoice/EnergyBillCreate';
import HistoryEdit from './pages/history/HistoryEdit';
import DistribuidoraCreate from './pages/tarifas/DistribuidoraCreate';
import DistribuidoraVisualization from './pages/tarifas/DistribuidoraVisualization';
import DistribuidoraEdit from './pages/tarifas/DistribuidoraEdit';
import TarrifCreate from './pages/tarifas/TarrifCreate';
import TarrifVisualization from './pages/tarifas/TarrifVisualization';
import TarrifEdit from './pages/tarifas/TariffEdit';
import EnergyBillVisualization from './pages/invoice/EnergyBillVisualization';
import EnergyBillEdit from './pages/invoice/EnergyBillEdit';

function App() {
  return (
    <div className="container">
      <ClientesProvider>
        <BrowserRouter>
          <Header />
          <Sidebar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes/cadastrar" element={<ClientCreate />} />
            <Route
              path="/clientes/visualizar"
              element={<ClientVisualization />}
            />
            <Route path="/clientes/editar/:id" element={<ClientEdit />} />
            <Route
              path="/historico/cadastrar-historico"
              element={<HistoricoCreate />}
            />
            <Route
              path="/historico/visualizar-historico"
              element={<HistoricoVisualization />}
            />
            <Route path="/historicos/editar/:id" element={<HistoryEdit />} />
            <Route
              path="/faturas/cadastrar-conta-energia"
              element={<EnergyBillCreate />}
            />
            <Route
              path="/faturas/visualizar-conta-energia"
              element={<EnergyBillVisualization />}
            />
            <Route path="/faturas/editar/:id" element={<EnergyBillEdit />} />
            <Route
              path="/tarifas/cadastrar-distribuidora"
              element={<DistribuidoraCreate />}
            />
            <Route
              path="/tarifas/visualizar-distribuidoras"
              element={<DistribuidoraVisualization />}
            />
            <Route
              path="/distribuidoras/editar/:id"
              element={<DistribuidoraEdit />}
            />
            <Route
              path="/tarifas/cadastrar-tarifa"
              element={<TarrifCreate />}
            />
            <Route
              path="/tarifas/visualizar-tarifas"
              element={<TarrifVisualization />}
            />
            <Route path="/tarifas/editar/:id" element={<TarrifEdit />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </ClientesProvider>
    </div>
  );
}

export default App;
