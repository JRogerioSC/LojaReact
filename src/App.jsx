import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";

import Açai from "./assets/Açai.jpg";
import BandaDeFrango from "./assets/BandaDeFrango.jpg";
import Espetinho from "./assets/Espetinho.jpg";

const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";
const SOCKET_URL = "https://servidorestoque.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});

// ================= HOME =================
function Home({ produtos }) {
  const navigate = useNavigate();
  const [quantidades, setQuantidades] = useState({});
  const [formAberto, setFormAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "" });

  const [admModal, setAdmModal] = useState(false);
  const [senhaADM, setSenhaADM] = useState("");

  const validarSenhaADM = () => {
    if (senhaADM === "689033rogerio") {
      window.location.href = "https://painelprodutoslojareact.netlify.app/";
    } else {
      alert("❌ Senha incorreta!");
    }
  };

  const handleQuantidadeChange = (nome, valor) => {
    const num = Number(valor);
    const produto = produtos.find((p) => p.nome === nome);
    if (!produto) return;

    if (valor === "") {
      setQuantidades((p) => ({ ...p, [nome]: "" }));
      return;
    }

    if (isNaN(num) || num < 1) {
      setQuantidades((p) => ({ ...p, [nome]: 1 }));
      return;
    }

    setQuantidades((p) => ({
      ...p,
      [nome]: Math.min(num, produto.quantidade),
    }));
  };

  const abrirFormulario = (produto) => {
    setProdutoSelecionado(produto);
    setFormAberto(true);
  };

  const handleEnviarWhatsApp = () => {
    if (!formData.nome || !formData.telefone || !formData.endereco) {
      alert("Preencha todos os campos");
      return;
    }

    const qtd = quantidades[produtoSelecionado.nome] || 1;
    const total = (produtoSelecionado.preco * qtd).toFixed(2);

    const msg = `🛒 Novo Pedido\n\n👤 ${formData.nome}\n📞 ${formData.telefone}\n🏠 ${formData.endereco}\n\n📦 ${produtoSelecionado.nome}\nQtd: ${qtd}\n💰 Total: R$ ${total}`;

    window.open(
      `https://wa.me/5596991624580?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    navigate(`/pagamento?valor=${total}&id=${produtoSelecionado.id}&quantidade=${qtd}`);
    setFormAberto(false);
  };

  return (
    <div className="home">
      {/* MENU */}
      <ul className="menu">
        <li>
          <a href="/">🥣 LojaReact 🍽</a>
        </li>
      </ul>

      {/* PRODUTOS */}
      <div className="produtos-container">
        {produtos.map((p) => {
          const qtd = quantidades[p.nome] || 1;
          const total = (p.preco * qtd).toFixed(2);

          return (
            <div key={p.id} className="produto">
              <h3>{p.nome}</h3>
              <div className="produto-img">
                <img src={p.imagem} alt={p.nome} />
              </div>


              <p className="preco">R$ {p.preco.toLocaleString("pt-BR")}</p>

              <p className="estoque">
                Estoque disponível: <strong>{p.quantidade}</strong>
              </p>

              <div className="quantidade-container">
                <label>Qtd:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Digite"
                  value={quantidades[p.nome] ?? ""}
                  onChange={(e) => handleQuantidadeChange(p.nome, e.target.value)}
                  className="input-quantidade"
                />
              </div>

              <p className="total">Total: R$ {Number(total).toLocaleString("pt-BR")}</p>

              <button
                className="comprar"
                disabled={p.quantidade === 0}
                onClick={() => abrirFormulario(p)}
              >
                {p.quantidade === 0 ? "ESGOTADO" : "COMPRAR"}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {formAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Dados do Cliente</h2>

            <input
              placeholder="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
            <input
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
            <textarea
              placeholder="Endereço"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />

            <div className="botoes">
              <button onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="concluir" onClick={handleEnviarWhatsApp}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO ADM */}
      <button className="botao-adm" onClick={() => setAdmModal(true)}>
        ADM
      </button>

      {admModal && (
        <div className="modal-overlay">
          <div className="modal">
            <input
              type="password"
              placeholder="Senha ADM"
              value={senhaADM}
              onChange={(e) => setSenhaADM(e.target.value)}
            />
            <div className="botoes">
              <button onClick={validarSenhaADM}>Entrar</button>
              <button onClick={() => setAdmModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP */}
      <a
        href="https://wa.me/5596991624580"
        className="whatsapp-flutuante"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://i.postimg.cc/KYLwjGBp/whatsapp.png"
          alt="WhatsApp"
          className="icone-whatsapp"
        />
      </a>

      {/* RODAPÉ */}
      <footer className="rodape">
        <div className="rodape-conteudo">
          <p>© {new Date().getFullYear()} LojaReact</p>
          <p className="rodape-site">
            Desenvolvido por{" "}
            <a href="https://wa.me/5596991624580" target="_blank" rel="noreferrer">
              【J】
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ================= APP =================
function App() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(API_ESTOQUE)
      .then((r) => r.json())
      .then((dados) => {
        setProdutos(
          dados.map((p) => ({
            ...p,
            id: p._id,
            imagem:
              p.imagem ||
              (p.nome.includes("Açai")
                ? Açai
                : p.nome.includes("Banda")
                  ? BandaDeFrango
                  : Espetinho),
          }))
        );
      });
  }, []);

  useEffect(() => {
    socket.on("estoque_atualizado", (produto) => {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produto._id ? { ...p, quantidade: produto.quantidade } : p
        )
      );
    });

    socket.on("produto_novo", (produto) => {
      setProdutos((prev) => [...prev, { ...produto, id: produto._id }]);
    });

    socket.on("produto_removido", (id) => {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    });

    return () => socket.off();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home produtos={produtos} />} />
        <Route path="/pagamento" element={<Pagamento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
