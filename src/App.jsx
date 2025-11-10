import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";
import carro1 from "./assets/carro1.png";
import carro2 from "./assets/carro2.png";
import carro3 from "./assets/carro3.png";

function Home({ produtos, atualizarEstoque }) {
  const navigate = useNavigate();
  const [quantidades, setQuantidades] = useState({});
  const [formAberto, setFormAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [formData, setFormData] = useState({ nome: "", telefone: "", endereco: "" });

  const handleQuantidadeChange = (nome, valor, estoque) => {
    const numero = Number(valor);
    if (!isNaN(numero) && numero > 0) {
      const qtd = Math.min(numero, estoque);
      setQuantidades((prev) => ({ ...prev, [nome]: qtd }));
    } else if (valor === "") {
      setQuantidades((prev) => ({ ...prev, [nome]: "" }));
    }
  };

  const abrirFormulario = (produto) => {
    setProdutoSelecionado(produto);
    setFormAberto(true);
  };

  const handleEnviarWhatsApp = () => {
    if (!formData.nome || !formData.telefone || !formData.endereco) {
      alert("Por favor, preencha todos os campos antes de concluir.");
      return;
    }

    const qtd = quantidades[produtoSelecionado.nome] || 1;
    const total = (produtoSelecionado.preco * qtd).toFixed(2);
    const mensagem = `🛒 *Novo Pedido*\n\n👤 *Cliente:* ${formData.nome}\n📞 *Telefone:* ${formData.telefone}\n🏠 *Endereço:* ${formData.endereco}\n\n📦 *Produto:* ${produtoSelecionado.nome}\n🔢 *Quantidade:* ${qtd}\n💰 *Total:* R$ ${total}`;

    // Substitua pelo número do vendedor com DDI (exemplo: 55 para Brasil)
    const numeroVendedor = "5596991624580"; // 👉 coloque seu número do WhatsApp aqui
    const urlWhatsApp = `https://wa.me/${numeroVendedor}?text=${encodeURIComponent(mensagem)}`;

    // Abre o WhatsApp e redireciona para pagamento
    window.open(urlWhatsApp, "_blank");

    navigate(
      `/pagamento?valor=${total}&descricao=${encodeURIComponent(
        `${produtoSelecionado.nome} (x${qtd})`
      )}&imagem=${encodeURIComponent(produtoSelecionado.imagem)}&quantidade=${qtd}`
    );

    setFormAberto(false);
  };

  return (
    <div className="home">
      <ul className="menu">
        <li><a href="/">MENU</a></li>
        <li><a href="/contato">CONTATO</a></li>
        <li><a href="/sobre">SOBRE</a></li>
        <li><a href="/app">APP</a></li>
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
                🏷️ Estoque disponível: <strong>{p.estoque}</strong>
              </p>

              <div className="quantidade-container">
                <label>Quantidade:</label>
                <input
                  type="text"
                  placeholder="Digite"
                  value={quantidades[p.nome] ?? ""}
                  onChange={(e) => handleQuantidadeChange(p.nome, e.target.value, p.estoque)}
                  className="input-quantidade"
                />
              </div>

              <p className="total">Total: R$ {Number(total).toLocaleString("pt-BR")}</p>

              <button
                className="comprar"
                disabled={p.estoque === 0}
                onClick={() => abrirFormulario(p)}
              >
                {p.estoque === 0 ? "ESGOTADO" : "COMPRAR"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 🔹 Modal de Formulário */}
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
            <div className="botoes">
              <button onClick={() => setFormAberto(false)}>Cancelar</button>
              <button className="concluir" onClick={handleEnviarWhatsApp}>
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="rodape">
        <div className="rodape-conteudo">
          <p>© {new Date().getFullYear()} <strong>LojaReact</strong> — Todos os direitos reservados.</p>
          <p className="rodape-site">
            Desenvolvido por{" "}
            <a href="https://w.app/joserogerio" target="_blank" rel="noreferrer">
              José Rogerio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [produtos, setProdutos] = useState([
    { nome: "Fox", imagem: carro1, preco: 1.0, estoque: 0 },
    { nome: "Argo", imagem: carro2, preco: 1.0, estoque: 3 },
    { nome: "Onix", imagem: carro3, preco: 1.0, estoque: 8 },
  ]);

  const atualizarEstoque = (nomeProduto, quantidadeVendida) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.nome === nomeProduto ? { ...p, estoque: Math.max(0, p.estoque - quantidadeVendida) } : p
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home produtos={produtos} atualizarEstoque={atualizarEstoque} />} />
        <Route path="/pagamento" element={<Pagamento atualizarEstoque={atualizarEstoque} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
