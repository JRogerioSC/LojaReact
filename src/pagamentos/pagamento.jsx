import React, { useState } from "react";
import "./pagamento.css";

function Pagamento() {
    const [tipo, setTipo] = useState("pix");
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [qrBase64, setQrBase64] = useState("");
    const [pixCode, setPixCode] = useState("");
    const [tokenCartao, setTokenCartao] = useState(""); // token simulado do cartão

    const gerarPagamento = async () => {
        if (!valor || !descricao || !email) {
            setMensagem("⚠️ Preencha todos os campos!");
            return;
        }

        setMensagem("🔄 Gerando pagamento...");

        try {
            // ✅ Endpoint correto conforme o tipo de pagamento
            const url =
                tipo === "pix"
                    ? "https://sevidorlojareact.onrender.com/api/pagar/pix"
                    : "https://sevidorlojareact.onrender.com/api/pagar/cartao";

            // ✅ Corpo da requisição conforme tipo
            const body =
                tipo === "pix"
                    ? { valor, descricao, email }
                    : {
                        token: tokenCartao || "fake-token-teste", // token simulado
                        valor,
                        descricao,
                        email,
                    };

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
                    console.error(data);
                }
            } else {
                // 💳 Resposta do pagamento com cartão
                if (data.status === "approved") {
                    setMensagem("✅ Pagamento aprovado!");
                } else if (data.status === "in_process") {
                    setMensagem("⏳ Pagamento em análise...");
                } else {
                    setMensagem(`💬 Status: ${data.status || "erro"}`);
                }
            }
        } catch (err) {
            console.error("Erro de conexão:", err);
            setMensagem("⚠️ Erro ao conectar com o servidor.");
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

            {/* Campos adicionais para cartão */}
            {tipo === "cartao" && (
                <div className="cartao-area">
                    <input
                        type="text"
                        placeholder="Token do cartão (simulação)"
                        value={tokenCartao}
                        onChange={(e) => setTokenCartao(e.target.value)}
                    />
                </div>
            )}

            <button onClick={gerarPagamento}>
                {tipo === "pix" ? "Gerar PIX" : "Pagar com Cartão"}
            </button>

            {/* Exibir QR Code PIX */}
            {qrBase64 && (
                <div className="pix-area">
                    <img
                        src={`data:image/png;base64,${qrBase64}`}
                        alt="QR Code PIX"
                        className="qrcode"
                    />
                    <p>
                        <strong>Código Copia e Cola:</strong>
                    </p>
                    <textarea readOnly value={pixCode} className="pixtext" />
                </div>
            )}

            {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
    );
}

export default Pagamento;
