import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";

import Açai from "./assets/Açai.jpg";
import BandaDeFrango from "./assets/BandaDeFrango.jpg";
import Espetinho from "./assets/Espetinho.jpg";

// 🔗 BACKEND
const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";
const SOCKET_URL = "https://servidorestoque.onrender.com";

// 🔌 SOCKET
const socket = io(SOCKET_URL, { transports: ["websocket"] });

function Home({ produtos }) {
  const navigate = useNavigate();

  const [quantidades, setQuantidades] = useState({});
  const [formAberto, setFormAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: "",
  });

  // 🔐 ADM
  const [admModal, setAdmModal] = useState(false);
  const [senhaADM, setSenhaADM] = useState("");

  const validarSenhaADM = () => {
    if (senhaADM === "689033rogerio") {
      window.location.href =
        "https://painelprodutoslojareact.netlify.app/";
    } else {
      alert("❌ Senha incorreta");
    }
  };

  // ✅ quantidade NÃO começa em 1
  const handleQuantidadeChange = (nome, valor) => {
    const produto = produtos.find((p) => p.nome === nome);
    if (!produto) return;

    if (valor === "") {
      setQuantidades((p) => ({ ...p, [nome]: "" }));
      return;
    }

    const numero = Number(valor);
    if (numero < 1) return;

    if (numero > produto.quantidade) {
      setQuantidades((p) => ({
        ...p,
        [nome]: produto.quantidade,
      }));
      return;
    }

    setQuantidades((p) => ({ ...p, [nome]: numero }));
  };

  const abrirFormulario = (produto) => {
    const qtd = quantidades[produto.nome];
    if (!qtd || qtd < 1) {
      alert("Informe a quantidade antes de continuar");
      return;
    }

    setProdutoSelecionado(produto);
    setFormAberto(true);
  };

  const enviarWhatsApp = () => {
    if (!formData.nome || !formData.telefone || !formData.endereco) {
      alert("Preencha todos os campos");
      return;
    }

    const qtd = quantidades[produtoSelecionado.nome];
    const total = (produtoSelecionado.preco * qtd).toFixed(2);

    const msg = `🛒 Pedido
Cliente: ${formData.nome}
Telefone: ${formData.telefone}
Endereço: ${formData.endereco}

Produto: ${produtoSelecionado.nome}
Quantidade: ${qtd}
Total: R$ ${total}`;

    window.open(
      `https://wa.me/5596991624580?text=${encodeURIComponent(msg)}`,
      "_blank"
    );

    navigate(
      `/pagamento?valor=${total}&quantidade=${qtd}&id=${produtoSelecionado.id}`
    );

    setFormAberto(false);
  };

  return (
    <div>
      <ul className="menu">
        <li>
          <a href="/">🥣 LojaReact 🍽</a>
        </li>
      </ul>

      <div className="produtos-container">
        {produtos.map((p) => {
          const qtd = quantidades[p.nome] ?? "";
          return (
            <div key={p.id} className="produto">
              <h3>{p.nome}</h3>
              <img src={p.imagem} alt={p.nome} />

              <p className="preco">R$ {p.preco}</p>

              <p className="estoque">
                Estoque: <strong>{p.quantidade}</strong>
              </p>

              <input
                type="number"
                min="1"
                className="input-quantidade"
                placeholder="Qtd"
                value={qtd}
                onChange={(e) =>
                  handleQuantidadeChange(p.nome, e.target.value)
                }
              />

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

      {/* MODAL CLIENTE */}
      {formAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Dados do Cliente</h2>

            <input
              placeholder="Nome"
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />

            <input
              placeholder="Telefone"
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />

            <textarea
              placeholder="Endereço"
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
            />

            <div className="botoes">
              <button onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="concluir" onClick={enviarWhatsApp}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 BOTÃO ADM */}
      <button className="botao-adm" onClick={() => setAdmModal(true)}>
        ADM
      </button>

      {admModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Área Administrativa</h2>

            <input
              type="password"
              placeholder="Senha do ADM"
              value={senhaADM}
              onChange={(e) => setSenhaADM(e.target.value)}
            />

            <div className="botoes">
              <button onClick={() => setAdmModal(false)}>Cancelar</button>
              <button className="concluir" onClick={validarSenhaADM}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ BOTÃO WHATSAPP (NÃO REMOVIDO) */}
      <a
        href="https://wa.me/5596991624580"
        className="whatsapp-flutuante"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://i.postimg.cc/KYLwjGBp/whatsapp.png"
          className="icone-whatsapp"
          alt="WhatsApp"
        />
      </a>
    </div>
  );
}

function App() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    socket.on("estoqueAtualizado", (produtoAtualizado) => {
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === produtoAtualizado._id
            ? { ...p, quantidade: produtoAtualizado.quantidade }
            : p
        )
      );
    });

    return () => socket.off("estoqueAtualizado");
  }, []);

  useEffect(() => {
    fetch(API_ESTOQUE)
      .then((res) => res.json())
      .then((dados) =>
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
        )
      );
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

