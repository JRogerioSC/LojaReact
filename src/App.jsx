import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Pagamento from "./pagamentos/pagamento";
import "./App.css";
import carro1 from "./assets/carro1.png";
import carro2 from "./assets/carro2.png";
import carro3 from "./assets/carro3.png";

function Home() {
  const navigate = useNavigate();

  const produtos = [
    { nome: "Fox", imagem: carro1, preco: 1.0 },
    { nome: "Argo", imagem: carro2, preco: 1.0 },
    { nome: "Onix", imagem: carro3, preco: 1.0 },
  ];

  return (
    <div className="home">
      <ul className="menu">
        <li><a href="/">MENU</a></li>
        <li><a href="/contato">CONTATO</a></li>
        <li><a href="/sobre">SOBRE</a></li>
        <li><a href="/app">APP</a></li>
      </ul>

      <div className="produtos-container">
        {produtos.map((p, i) => (
          <div key={i} className="produto">
            <h3>{p.nome}</h3>
            <img src={p.imagem} alt={p.nome} />
            <p className="preco">R$ {p.preco.toLocaleString("pt-BR")}</p>
            <button
              className="comprar"
              onClick={() => navigate(`/pagamento?valor=${p.preco}&nome=${p.nome}`)}
            >
              COMPRAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pagamento" element={<Pagamento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
