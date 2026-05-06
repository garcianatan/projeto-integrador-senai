import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCogs, FaSignOutAlt, FaUser } from "react-icons/fa";
import "./Header.css";
import ConfirmModal from "./ConfirmModal";

export default function Header({ usuario, onLogout }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSairAberto, setModalSairAberto] = useState(false);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  const inicial = usuario?.nome ? usuario.nome.trim().charAt(0).toUpperCase() : "U";

  function abrirModalSair() {
    setMenuAberto(false);
    setModalSairAberto(true);
  }

  function fecharModalSair() {
    setModalSairAberto(false);
  }

  function confirmarSaida() {
    setModalSairAberto(false);
    onLogout();
  }

  return (
    <>
    <header className="app-header">
      <div className="app-header-logo">
        <span className="app-header-icon">
          <FaCogs />
        </span>
        <h1>FABLAB - Maracanã</h1>
      </div>

      <div className="perfil-menu-wrapper" ref={menuRef}>
        <button
          type="button"
          className="perfil-botao"
          onClick={() => setMenuAberto(!menuAberto)}
          title="Abrir menu do usuário"
        >
          {inicial}
        </button>

        {menuAberto && (
          <div className="perfil-dropdown">
            <div className="perfil-dropdown-topo">
              <strong>{usuario?.nome || "Usuário"}</strong>
              <span>{usuario?.email || ""}</span>
            </div>

            <button
              type="button"
              className="perfil-dropdown-item"
              onClick={() => {
                setMenuAberto(false);
                navigate("/perfil");
              }}
            >
              <FaUser />
              Meu perfil
            </button>

            <button
              type="button"
              className="perfil-dropdown-item"
              onClick={abrirModalSair}
            >
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
    <ConfirmModal
        aberto={modalSairAberto}
        titulo="Sair da conta"
        mensagem="Deseja realmente encerrar sua sessão no sistema?"
        textoConfirmar="Sair"
        textoCancelar="Cancelar"
        onConfirm={confirmarSaida}
        onCancel={fecharModalSair}
      />
    </>
  );
}