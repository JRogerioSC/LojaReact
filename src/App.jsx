import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";
import Açai from "./assets/Açai.jpg";
import BandaDeFrango from "./assets/BandaDeFrango.jpg";
import Espetinho from "./assets/Espetinho.jpg";

// 🔗 API REST
const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";

// 🔌 SOCKET.IO
const socket = io("https://servidorestoque.onrender.com");

function Home({ produtos }) {
  const navigate = useNavigate();
  const [quantidades, setQuantidades] = useState({});
  const [formAberto, setFormAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "" });

  const [admModal, setAdmModal] = useState(false);
  const [senhaADM, setSenhaADM] = useState("");

  const validarSenhaADM = () => {
    const senhaCorreta = "689033rogerio";
    if (senhaADM === senhaCorreta) {
      window.location.href = "https://painelprodutoslojareact.netlify.app/";
    } else {
      alert("❌ Senha incorreta!");
    }
  };

  const handleQuantidadeChange = (nome, valorDigitado) => {
    const numero = Number(valorDigitado);
    const produto = produtos.find((p) => p.nome === nome);
    if (!produto) return;

    if (valorDigitado === "") {
      setQuantidades((prev) => ({ ...prev, [nome]: "" }));
      return;
    }

    if (isNaN(numero) || numero < 1) {
      setQuantidades((prev) => ({ ...prev, [nome]: 1 }));
      return;
    }

    if (numero > produto.quantidade) {
      setQuantidades((prev) => ({ ...prev, [nome]: produto.quantidade }));
      return;
    }

    setQuantidades((prev) => ({ ...prev, [nome]: numero }));
  };

  const abrirFormulario = (produto) => {
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

    const mensagem = `🛒 *Novo Pedido*
👤 ${formData.nome}
📞 ${formData.telefone}
🏠 ${formData.endereco}

📦 ${produtoSelecionado.nome}
🔢 Quantidade: ${qtd}
💰 Total: R$ ${total}`;

    window.open(
      `https://wa.me/5596991624580?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );

    navigate(
      `/pagamento?valor=${total}&descricao=${produtoSelecionado.nome}&quantidade=${qtd}&id=${produtoSelecionado.id}`
    );

    setFormAberto(false);
  };

  return (
    <div className="home">
      <div className="produtos-container">
        {produtos.map((p) => {
          const qtd = quantidades[p.nome] || 1;
          const total = (p.preco * qtd).toFixed(2);

          return (
            <div key={p.id} className="produto">
              <h3>{p.nome}</h3>
              <img src={p.imagem} alt={p.nome} />
              <p>R$ {p.preco}</p>
              <p>
                🏷️ Estoque:{" "}
                <strong>{p.quantidade > 0 ? p.quantidade : "Esgotado"}</strong>
              </p>

              <input
                type="number"
                value={quantidades[p.nome] ?? ""}
                onChange={(e) => handleQuantidadeChange(p.nome, e.target.value)}
              />

              <p>Total: R$ {total}</p>

              <button disabled={p.quantidade === 0} onClick={() => abrirFormulario(p)}>
                {p.quantidade === 0 ? "ESGOTADO" : "COMPRAR"}
              </button>
            </div>
          );
        })}
      </div>

      {formAberto && (
        <div className="modal">
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
          <button onClick={handleEnviarWhatsApp}>Concluir</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [produtos, setProdutos] = useState([]);

  // 🔄 CARREGA ESTOQUE INICIAL
  useEffect(() => {
    fetch(API_ESTOQUE)
      .then((res) => res.json())
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

  // 📡 WEBSOCKET → ATUALIZA EM TEMPO REAL
  useEffect(() => {
    socket.on("estoqueAtualizado", ({ id, quantidade }) => {
      setProdutos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, quantidade } : p))
      );
    });

    socket.on("produtoNovo", (produto) => {
      setProdutos((prev) => [...prev, { ...produto, id: produto._id }]);
    });

    socket.on("produtoRemovido", (id) => {
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    });

    return () => socket.disconnect();
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
