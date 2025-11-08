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

  const handleQuantidadeChange = (nome, valor, estoque) => {
    const qtd = Math.max(1, Math.min(Number(valor), estoque)); // evita ultrapassar estoque
    setQuantidades((prev) => ({
      ...prev,
      [nome]: qtd,
    }));
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
                  type="number"
                  min="1"
                  max={p.estoque}
                  value={qtd}
                  onChange={(e) =>
                    handleQuantidadeChange(p.nome, e.target.value, p.estoque)
                  }
                  className="input-quantidade"
                />
              </div>

              <p className="total">Total: R$ {Number(total).toLocaleString("pt-BR")}</p>

              <button
                className="comprar"
                disabled={p.estoque === 0}
                onClick={() =>
                  navigate(
                    `/pagamento?valor=${total}&descricao=${encodeURIComponent(
                      `${p.nome} (x${qtd})`
                    )}&imagem=${encodeURIComponent(p.imagem)}&quantidade=${qtd}`
                  )
                }
              >
                {p.estoque === 0 ? "ESGOTADO" : "COMPRAR"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  // 🧮 Agora o estoque é controlado globalmente
  const [produtos, setProdutos] = useState([
    { nome: "Fox", imagem: carro1, preco: 1.0, estoque: 0 },
    { nome: "Argo", imagem: carro2, preco: 1.0, estoque: 3 },
    { nome: "Onix", imagem: carro3, preco: 1.0, estoque: 8 },
  ]);

  const atualizarEstoque = (nomeProduto, quantidadeVendida) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.nome === nomeProduto
          ? { ...p, estoque: Math.max(0, p.estoque - quantidadeVendida) }
          : p
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home produtos={produtos} atualizarEstoque={atualizarEstoque} />} />
        <Route
          path="/pagamento"
          element={<Pagamento atualizarEstoque={atualizarEstoque} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

