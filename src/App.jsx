import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";

import Açai from "./assets/Açai.jpg";
import BandaDeFrango from "./assets/BandaDeFrango.jpg";
import Espetinho from "./assets/Espetinho.jpg";

// 🔗 API + SOCKET
const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";
const SOCKET_URL = "https://servidorestoque.onrender.com";

// ================= SOCKET INSTANCE =================
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

    if (!valor || isNaN(num) || num < 1) {
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
    const qtd = quantidades[produtoSelecionado.nome] || 1;
    const total = (produtoSelecionado.preco * qtd).toFixed(2);

    const msg = `🛒 Novo Pedido\n\nProduto: ${produtoSelecionado.nome}\nQtd: ${qtd}\nTotal: R$ ${total}`;
    window.open(
      `https://wa.me/5596991624580?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    navigate(
      `/pagamento?valor=${total}&id=${produtoSelecionado.id}&quantidade=${qtd}`
    );

    setFormAberto(false);
  };

  return (
    <div className="home">
      <div className="produtos-container">
        {produtos.map((p) => (
          <div key={p.id} className="produto">
            <h3>{p.nome}</h3>
            <img src={p.imagem} alt={p.nome} />

            <p>💰 R$ {p.preco}</p>
            <p>📦 Estoque: <strong>{p.quantidade}</strong></p>

            <input
              type="number"
              min="1"
              value={quantidades[p.nome] || 1}
              onChange={(e) => handleQuantidadeChange(p.nome, e.target.value)}
            />

            <button
              disabled={p.quantidade === 0}
              onClick={() => abrirFormulario(p)}
            >
              {p.quantidade === 0 ? "ESGOTADO" : "COMPRAR"}
            </button>
          </div>
        ))}
      </div>

      {formAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar pedido</h3>
            <button onClick={handleEnviarWhatsApp}>Confirmar</button>
            <button onClick={() => setFormAberto(false)}>Cancelar</button>
          </div>
        </div>
      )}

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
            <button onClick={validarSenhaADM}>Entrar</button>
            <button onClick={() => setAdmModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= APP =================
function App() {
  const [produtos, setProdutos] = useState([]);

  // 🔥 CARREGA ESTOQUE INICIAL
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

  // ================= SOCKET LISTENERS =================
  useEffect(() => {
    socket.on("estoque_atualizado", (produto) => {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produto._id
            ? { ...p, quantidade: produto.quantidade }
            : p
        )
      );
    });

    socket.on("produto_novo", (produto) => {
      setProdutos((prev) => [
        ...prev,
        { ...produto, id: produto._id },
      ]);
    });

    socket.on("produto_removido", (id) => {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    });

    return () => {
      socket.off();
    };
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
