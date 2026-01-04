import React, { useState, useEffect } from "react";
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

// 🔌 SOCKET GLOBAL
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnection: true,
});

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
      alert("❌ Senha incorreta!");
    }
  };

  // 🔄 AJUSTA QUANTIDADE SE ESTOQUE ATUALIZAR
  useEffect(() => {
    setQuantidades((prev) => {
      const novo = { ...prev };
      produtos.forEach((p) => {
        if (novo[p.nome] > p.quantidade) {
          novo[p.nome] = p.quantidade;
        }
      });
      return novo;
    });
  }, [produtos]);

  // ================================
  // |     CONTROLE DE QUANTIDADE   |
  // ================================
  const handleQuantidadeChange = (nome, valorDigitado) => {
    const produto = produtos.find((p) => p.nome === nome);
    if (!produto) return;

    if (valorDigitado === "") {
      setQuantidades((prev) => ({ ...prev, [nome]: "" }));
      return;
    }

    const numero = Number(valorDigitado);

    if (isNaN(numero) || numero < 1) {
      setQuantidades((prev) => ({ ...prev, [nome]: 1 }));
      return;
    }

    if (numero > produto.quantidade) {
      setQuantidades((prev) => ({
        ...prev,
        [nome]: produto.quantidade,
      }));
      return;
    }

    setQuantidades((prev) => ({ ...prev, [nome]: numero }));
  };

  const abrirFormulario = (produto) => {
    const qtd = quantidades[produto.nome] || 1;

    if (qtd > produto.quantidade) {
      alert("Quantidade maior que o estoque disponível");
      return;
    }

    setProdutoSelecionado(produto);
    setFormAberto(true);
  };

  const handleEnviarWhatsApp = () => {
    if (!formData.nome || !formData.telefone || !formData.endereco) {
      alert("Preencha todos os campos.");
      return;
    }

    const qtd = quantidades[produtoSelecionado.nome] || 1;
    const total = (produtoSelecionado.preco * qtd).toFixed(2);

    // 🔴 EMITE COMPRA PARA O BACKEND
    socket.emit("realizarCompra", {
      produtoId: produtoSelecionado.id,
      quantidade: qtd,
    });

    const mensagem = `🛒 *Novo Pedido*

👤 *Cliente:* ${formData.nome}
📞 *Telefone:* ${formData.telefone}
🏠 *Endereço:* ${formData.endereco}

📦 *Produto:* ${produtoSelecionado.nome}
🔢 *Quantidade:* ${qtd}
💰 *Total:* R$ ${total}`;

    window.open(
      `https://wa.me/5596991624580?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );

    navigate(
      `/pagamento?valor=${total}&descricao=${encodeURIComponent(
        `${produtoSelecionado.nome} (x${qtd})`
      )}&imagem=${encodeURIComponent(produtoSelecionado.imagem)}&quantidade=${qtd}&id=${produtoSelecionado.id}`
    );

    setFormAberto(false);
  };

  return (
    <div className="home">
      <ul className="menu">
        <li>
          <a href="/">🥣 LojaReact 🍽</a>
        </li>
      </ul>

      <div className="produtos-container">
        {produtos.map((p) => {
          const qtd = quantidades[p.nome] || 1;
          const total = (p.preco * qtd).toFixed(2);

          return (
            <div key={p.id} className="produto">
              <h3>{p.nome}</h3>
              <img src={p.imagem} alt={p.nome} />

              <p className="preco">
                R$ {p.preco.toLocaleString("pt-BR")}
              </p>

              <p className="estoque">
                🏷️ Estoque disponível:{" "}
                <strong>
                  {p.quantidade > 0 ? p.quantidade : "Esgotado"}
                </strong>
              </p>

              <input
                type="text"
                placeholder="Digite"
                value={quantidades[p.nome] ?? ""}
                onChange={(e) =>
                  handleQuantidadeChange(p.nome, e.target.value)
                }
                className="input-quantidade"
              />

              <p className="total">
                Total: R$ {Number(total).toLocaleString("pt-BR")}
              </p>

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
            <h2>📝 Dados do Cliente</h2>

            <input
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />

            <input
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />

            <textarea
              placeholder="Endereço completo"
              value={formData.endereco}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
            />

            <p className="aviso-pagamento">
              ⚠️ Após o pagamento, envie o comprovante via WhatsApp.
            </p>

            <div className="botoes">
              <button onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="concluir" onClick={handleEnviarWhatsApp}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADM */}
      <button className="botao-adm" onClick={() => setAdmModal(true)}>
        ADM
      </button>

      {admModal && (
        <div className="modal-adm-overlay">
          <div className="modal-adm">
            <h3>Senha do Administrador</h3>

            <input
              type="password"
              value={senhaADM}
              onChange={(e) => setSenhaADM(e.target.value)}
            />

            <button onClick={validarSenhaADM}>Entrar</button>
            <button onClick={() => setAdmModal(false)}>Cancelar</button>
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
          className="icone-whatsapp"
          alt="WhatsApp"
        />
      </a>

      <footer className="rodape">
        <p>
          © {new Date().getFullYear()} <strong>LojaReact</strong>
        </p>
      </footer>
    </div>
  );
}

function App() {
  const [produtos, setProdutos] = useState([]);

  // 🔄 SOCKET → ATUALIZA ESTOQUE
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

  // 📦 BUSCA INICIAL
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

