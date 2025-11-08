import React, { useEffect, useState } from "react";
import "./pagamento.css";

function Pagamento() {
    const [tipo, setTipo] = useState("pix");
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");
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
        // Inicializa SDK do Mercado Pago
        const mpInstance = new window.MercadoPago("APP_USR-c4a1f460-54a7-45c4-a883-df06f161aab2");
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
                // Cria token do cartão via SDK
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

    return (
        <div className="pagamento">
            <h2>💳 Checkout API - Mercado Pago</h2>

            <input
                type="text"
                placeholder="Descrição do produto"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
            />
            <input
                type="number"
                placeholder="Valor (R$)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
            />
            <input
                type="email"
                placeholder="E-mail do cliente"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button onClick={gerarPagamento}>
                {tipo === "pix" ? "Gerar PIX" : "Pagar com Cartão"}
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

