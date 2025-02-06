import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Importa useLocation
import styles from '../css/Sidebar.module.css';

// Ícones
import clientesIcon from '../assets/icons/client.svg';
import historicoIcon from '../assets/icons/history.svg';
import faturasIcon from '../assets/icons/invoice.svg';
import simulacoesIcon from '../assets/icons/simulation.svg';
import relatoriosIcon from '../assets/icons/analytics.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';
import flashIcon from '../assets/icons/flash.svg';
import homeIcon from '../assets/icons/home.svg';

const Sidebar = () => {
  const location = useLocation(); // Obtém a URL atual

  // Estado para abrir/fechar submenus
  const [openMenus, setOpenMenus] = useState({});

  // Alterna a exibição do submenu
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu], // Alterna aberto/fechado
    }));
  };

  // Estrutura dos menus
  const menus = [
    {
      id: 'home',
      title: 'Início',
      icon: homeIcon,
      submenus: [],
    },
    {
      id: 'clientes',
      title: 'Clientes',
      icon: clientesIcon,
      submenus: [
        {
          id: 'cadastrarClientes',
          label: 'Cadastrar Dados',
          link: '/clientes/cadastrar',
        },
        {
          id: 'visualizarClientes',
          label: 'Visualizar Dados',
          link: '/clientes/visualizar',
        },
      ],
    },
    {
      id: 'historicos',
      title: 'Históricos',
      icon: historicoIcon,
      submenus: [
        {
          id: 'cadastrarHistorico',
          label: 'Cadastrar Histórico',
          link: '/historico/cadastrar-historico',
        },
        {
          id: 'visualizarHistorico',
          label: 'Visualizar Histórico',
          link: '/historico/visualizar-historico',
        },
      ],
    },
    {
      id: 'faturas',
      title: 'Faturas',
      icon: faturasIcon,
      submenus: [
        {
          id: 'cadastrarContaEnergia',
          label: 'Cadastrar Conta de Energia',
          link: '/faturas/cadastrar-conta-energia',
        },
        {
          id: 'visualizarContaEnergia',
          label: 'Visualizar Conta de Energia',
          link: '/faturas/visualizar-conta-energia',
        },
        {
          id: 'cadastrarItemFatura',
          label: 'Cadastrar Item de Fatura',
          link: '/faturas/cadastrar-item-fatura',
        },
        {
          id: 'visualizarItemFatura',
          label: 'Visualizar Item de Fatura',
          link: '/faturas/visualizar-item-fatura',
        },
        {
          id: 'cadastrarTributo',
          label: 'Cadastrar Tributo',
          link: '/faturas/cadastrar-tributo',
        },
        {
          id: 'visualizarTributo',
          label: 'Visualizar Tributo',
          link: '/faturas/visualizar-tributo',
        },
      ],
    },
    {
      id: 'simulacoes',
      title: 'Simulações',
      icon: simulacoesIcon,
      submenus: [],
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: relatoriosIcon,
      submenus: [],
    },
    {
      id: 'tarifas',
      title: 'Tarifas',
      icon: flashIcon,
      submenus: [
        {
          id: 'cadastrarTarifas',
          label: 'Cadastrar Tarifas',
          link: '/tarifas/cadastrar-tarifa',
        },
        {
          id: 'visualizarTarifa',
          label: 'Visualizar Tarifas',
          link: '/tarifas/visualizar-tarifas',
        },
        {
          id: 'cadastrarDistribuidora',
          label: 'Cadastrar Distribuidora',
          link: '/tarifas/cadastrar-distribuidora',
        },
        {
          id: 'visualizarDistribuidora',
          label: 'Visualizar Distribuidoras',
          link: '/tarifas/visualizar-distribuidoras',
        },
      ],
    },
  ];

  return (
    <nav className={styles.sidebar} aria-label="Menu principal">
      {menus.map((menu) => (
        <div key={menu.id} className={styles.menuContainer}>
          {/* Menu Principal */}
          <div
            className={styles.menuItem}
            onClick={() => toggleMenu(menu.id)}
            aria-label={`Menu ${menu.title}`}
          >
            <img src={menu.icon} alt={menu.title} className={styles.menuIcon} />
            <span className={styles.menuText}>{menu.title}</span>
            {menu.submenus.length > 0 && (
              <img
                src={arrowDownIcon}
                alt="Expandir"
                className={`${styles.arrowIcon} ${
                  openMenus[menu.id] ? styles.open : ''
                }`}
              />
            )}
          </div>
          {/* Submenu */}
          {openMenus[menu.id] && (
            <div
              className={styles.submenu}
              aria-label={`Submenu de ${menu.title}`}
            >
              {menu.submenus.map((submenu) => (
                <Link
                  to={submenu.link}
                  key={submenu.id}
                  className={`${styles.submenuItem} ${
                    location.pathname === submenu.link ? styles.active : '' // Usa URL para definir ativo
                  }`}
                  aria-label={submenu.label}
                >
                  {submenu.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
