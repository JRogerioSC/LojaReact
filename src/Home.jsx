import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

// Imagens de exemplo
import carro1 from "./assets/carro.volkswagen.png";
import carro2 from "./assets/carro.fiat.png";
import carro3 from "./assets/carro.chevrolet.png";

function Home() {
    const navigate = useNavigate();

    // Lista de produtos (você pode adicionar quantos quiser)
    const produtos = [
        { id: 1, nome: "Volkswagen Fox", preco: 1.0, imagem: carro1 },
        { id: 2, nome: "Fiat Argo", preco: 1.0, imagem: carro2 },
        { id: 3, nome: "Chevrolet Onix", preco: 1.0, imagem: carro3 },
    ];

    // Função ao clicar em comprar
    const handleComprar = (produto) => {
        navigate("/pagamento", { state: { produto } });
    };

    return (
        <div className="home-container">
            <ul className="menu">
                <li><a href="/">MENU</a></li>
                <li><a href="/contato">CONTATO</a></li>
                <li><a href="/sobre">SOBRE</a></li>
                <li><a href="/app">APP</a></li>
            </ul>

            <div className="produtos">
                {produtos.map((p) => (
                    <div key={p.id} className="produto-card">
                        <h3>{p.nome}</h3>
                        <img className="carro" src={p.imagem} alt={p.nome} />
                        <p>Preço: R$ {p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <button className="comprar" onClick={() => handleComprar(p)}>
                            COMPRAR
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
