import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";
import Açai from "./assets/Açai.jpg";
import BandaDeFrango from "./assets/BandaDeFrango.jpg";
import Espetinho from "./assets/Espetinho.jpg";

// 🔗 URL do servidor de estoque (mude quando publicar)
const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";

function Home({ produtos, atualizarEstoque }) {
  const navigate = useNavigate();
  const [quantidades, setQuantidades] = useState({});
  const [formAberto, setFormAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "" });

  // 🔥 STATES DO BOTÃO ADM
  const [admModal, setAdmModal] = useState(false);
  const [senhaADM, setSenhaADM] = useState("");

  // 🔥 Função que valida senha
  const validarSenhaADM = () => {
    const senhaCorreta = "689033rogerio"; // ALTERE AQUI

    if (senhaADM === senhaCorreta) {
      window.location.href = "https://painelprodutoslojareact.netlify.app/"; // SUA URL DO PAINEL
    } else {
      alert("❌ Senha incorreta!");
    }
  };

  // ================================
  // |     CONTROLE DE QUANTIDADE   |
  // ================================
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

  const handleEnviarWhatsApp = async () => {
    if (!formData.nome || !formData.telefone || !formData.endereco) {
      alert("Por favor, preencha todos os campos antes de concluir.");
      return;
    }

    const qtd = quantidades[produtoSelecionado.nome] || 1;
    const total = (produtoSelecionado.preco * qtd).toFixed(2);

    const mensagem = `🛒 *Novo Pedido*\n\n👤 *Cliente:* ${formData.nome}\n📞 *Telefone:* ${formData.telefone}\n🏠 *Endereço:* ${formData.endereco}\n\n📦 *Produto:* ${produtoSelecionado.nome}\n🔢 *Quantidade:* ${qtd}\n💰 *Total:* R$ ${total}`;

    const numeroVendedor = "5596991624580";
    const urlWhatsApp = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, "_blank");

    navigate(
      `/pagamento?valor=${total}&descricao=${encodeURIComponent(
        `${produtoSelecionado.nome} (x${qtd})`
      )}&imagem=${encodeURIComponent(produtoSelecionado.imagem)}&quantidade=${qtd}&id=${produtoSelecionado.id
      }`
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
        {produtos.map((p, i) => {
          const qtd = quantidades[p.nome] || 1;
          const total = (p.preco * qtd).toFixed(2);

          return (
            <div key={i} className="produto">
              <h3>{p.nome}</h3>
              <img src={p.imagem} alt={p.nome} />
              <p className="preco">R$ {p.preco.toLocaleString("pt-BR")}</p>

              <p className="estoque">
                🏷️ Estoque disponível:{" "}
                <strong>{p.quantidade > 0 ? p.quantidade : "Esgotado"}</strong>
              </p>

              <div className="quantidade-container">
                <label>Quantidade:</label>
                <input
                  type="text"
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

      {/* ==================== */}
      {/*   MODAL DO CLIENTE   */}
      {/* ==================== */}
      {formAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>📝 Dados do Cliente</h2>

            <input
              type="text"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />

            <input
              type="tel"
              placeholder="Telefone (com DDD)"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />

            <textarea
              placeholder="Endereço completo"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />

            <p
              style={{
                backgroundColor: "#fff3cd",
                color: "#856404",
                border: "1px solid #ffeeba",
                borderRadius: "8px",
                padding: "10px",
                marginTop: "10px",
                fontSize: "0.9rem",
              }}
            >
              ⚠️ <strong>Atenção:</strong> Após realizar o pagamento, envie o comprovante ao
              vendedor via WhatsApp.
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

      {/* ====================== */}
      {/*   BOTÃO ADM + MODAL    */}
      {/* ====================== */}
      <button
        className="botao-adm"
        onClick={() => setAdmModal(true)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          background: "black",
          color: "white",
          padding: "12px 18px",
          borderRadius: "50px",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 9999,
        }}
      >
        ADM
      </button>

      {admModal && (
        <div
          className="modal-adm-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(11, 12, 11, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            className="modal-adm"
            style={{
              background: "white",
              padding: "25px",
              width: "300px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>Senha do Administrador</h3>

            <input
              type="password"
              placeholder="Digite a senha"
              value={senhaADM}
              onChange={(e) => setSenhaADM(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "15px",
                borderRadius: "8px",
                border: "1px solid #aaa",
              }}
            />

            <button
              onClick={validarSenhaADM}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "15px",
                borderRadius: "8px",
                border: "none",
                background: "#222",
                color: "white",
                cursor: "pointer",
              }}
            >
              Entrar
            </button>

            <button
              onClick={() => setAdmModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "8px",
                border: "none",
                background: "#777",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botão WhatsApp */}
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

      <footer className="rodape">
        <div className="rodape-conteudo">
          <p>
            © {new Date().getFullYear()} <strong>LojaReact</strong> — Todos os direitos
            reservados.
          </p>
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

function App() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(API_ESTOQUE)
      .then((res) => res.json())
      .then((dados) => {
        const produtosComImagens = dados.map((p) => {
          let imagem = p.imagem;

          if (!imagem || imagem.trim() === "") {
            if (p.nome.includes("Açai")) imagem = Açai;
            else if (p.nome.includes("Banda")) imagem = BandaDeFrango;
            else if (p.nome.includes("Espet")) imagem = Espetinho;
          }

          return {
            ...p,
            id: p._id,
            imagem,
          };
        });

        setProdutos(produtosComImagens);
      })
      .catch((err) => console.error("Erro ao carregar estoque:", err));
  }, []);

  const atualizarEstoque = (nomeProduto, quantidadeVendida) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.nome === nomeProduto
          ? { ...p, quantidade: Math.max(0, p.quantidade - quantidadeVendida) }
          : p
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home produtos={produtos} atualizarEstoque={atualizarEstoque} />}
        />
        <Route path="/pagamento" element={<Pagamento atualizarEstoque={atualizarEstoque} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
