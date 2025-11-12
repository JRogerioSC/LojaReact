import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./pagamento.css";

function Pagamento() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);

    const valorParam = params.get("valor") || "";
    const descricaoParam = params.get("descricao") || "";
    const imagemParam = params.get("imagem") || "";

    const [tipo, setTipo] = useState("pix");
    const [valor, setValor] = useState(valorParam);
    const [descricao, setDescricao] = useState(descricaoParam);
    const [imagem, setImagem] = useState(imagemParam);
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [qrBase64, setQrBase64] = useState("");
    const [pixCode, setPixCode] = useState("");

    const [numero, setNumero] = useState("");
    const [expMes, setExpMes] = useState("");
    const [expAno, setExpAno] = useState("");
    const [cvv, setCvv] = useState("");
    const [titular, setTitular] = useState("");
    const [mp, setMp] = useState(null);

    useEffect(() => {
        const mpInstance = new window.MercadoPago("TEST-9f970731-cbee-4a81-9e7f-60313d40cca3");
        setMp(mpInstance);
    }, []);

    const gerarPagamento = async () => {
        if (!valor || !descricao || !email) {
            setMensagem("⚠️ Preencha todos os campos!");
            return;
        }

        setMensagem("🔄 Gerando pagamento...");

        try {
            let url, body;

            if (tipo === "pix") {
                url = "https://sevidorlojareact.onrender.com/api/pagar/pix";
                body = { valor, descricao, email };
            } else {
                const cardData = {
                    cardNumber: numero,
                    cardholderName: titular,
                    cardExpirationMonth: expMes,
                    cardExpirationYear: expAno,
                    securityCode: cvv,
                };

                const token = await mp.createCardToken(cardData);
                url = "https://sevidorlojareact.onrender.com/api/pagar/cartao";
                body = { token: token.id, valor, descricao, email };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (tipo === "pix") {
                if (data.qr_base64) {
                    setQrBase64(data.qr_base64);
                    setPixCode(data.qr_code);
                    setMensagem("✅ PIX gerado com sucesso!");
                } else {
                    setMensagem("❌ Erro ao gerar PIX.");
                }
            } else {
                if (data.status === "approved") {
                    setMensagem("✅ Pagamento aprovado!");
                } else {
                    setMensagem(`💬 Status: ${data.status}`);
                }
            }
        } catch (error) {
            console.error(error);
            setMensagem("❌ Erro ao conectar com o servidor.");
        }
    };

    // 🔧 BOTÃO DE TESTE - SIMULA PAGAMENTO APROVADO E ATUALIZA ESTOQUE
    const simularAprovacao = async () => {
        setMensagem("✅ Pagamento aprovado!");
        try {
            // chama sua API de estoque para reduzir a quantidade do produto
            const res = await fetch("https://servidorestoque-1.onrender.com/api/estoque/atualizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ produto: descricao, quantidadeVendida: 1 }),
            });
            const data = await res.json();
            console.log("Estoque atualizado:", data);
        } catch (err) {
            console.error("Erro ao atualizar estoque:", err);
        }
    };

    return (
        <div className="pagamento">
            <button className="voltar" onClick={() => navigate("/")}>⬅ Voltar à Loja</button>

            <h2>💳 Checkout Seguro</h2>

            {imagem && (
                <div className="produto-resumo">
                    <img src={imagem} alt={descricao} className="imagem-produto" />
                    <h3>{descricao}</h3>
                    <p className="valor-produto">R$ {valor}</p>
                </div>
            )}

            <input
                type="email"
                placeholder="Digite seu e-mail para receber o comprovante"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-email"
            />

            <div className="tipos">
                <label>
                    <input
                        type="radio"
                        value="pix"
                        checked={tipo === "pix"}
                        onChange={() => setTipo("pix")}
                    />
                    PIX
                </label>
                <label>
                    <input
                        type="radio"
                        value="cartao"
                        checked={tipo === "cartao"}
                        onChange={() => setTipo("cartao")}
                    />
                    Cartão
                </label>
            </div>

            {tipo === "cartao" && (
                <div className="cartao">
                    <input
                        type="text"
                        placeholder="Número do cartão"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Nome do titular"
                        value={titular}
                        onChange={(e) => setTitular(e.target.value)}
                    />
                    <div className="duplo">
                        <input
                            type="text"
                            placeholder="Mês"
                            value={expMes}
                            onChange={(e) => setExpMes(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Ano"
                            value={expAno}
                            onChange={(e) => setExpAno(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <button className="btn-pagar" onClick={gerarPagamento}>
                {tipo === "pix" ? "Gerar PIX" : "Pagar com Cartão"}
            </button>

            {/* 🔘 BOTÃO DE TESTE - PAGAMENTO APROVADO */}
            <button className="btn-aprovado" onClick={simularAprovacao}>
                ✅ PAGAMENTO APROVADO (TESTE)
            </button>

            {qrBase64 && (
                <div className="pix-area">
                    <img
                        src={`data:image/png;base64,${qrBase64}`}
                        alt="QR Code PIX"
                        className="qrcode"
                    />
                    <p><strong>Código Copia e Cola:</strong></p>
                    <textarea readOnly value={pixCode} className="pixtext" />
                </div>
            )}

            {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
    );
}

export default Pagamento;
