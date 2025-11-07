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

    // 🔹 GERAR PAGAMENTO (PIX ou Cartão)
    const gerarPagamento = async () => {
        if (!valor || !descricao || !email) {
            setMensagem("⚠️ Preencha todos os campos!");
            return;
        }

        setMensagem("🔄 Gerando pagamento...");

        try {
            const res = await fetch("https://sevidorlojareact.onrender.com/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo, valor, descricao, email }),
            });

            const data = await res.json();

            if (tipo === "pix") {
                if (data.point_of_interaction?.transaction_data) {
                    setQrBase64(data.point_of_interaction.transaction_data.qr_code_base64);
                    setPixCode(data.point_of_interaction.transaction_data.qr_code);
                    setMensagem("✅ PIX gerado com sucesso!");
                } else {
                    setMensagem("❌ Erro ao gerar PIX.");
                }
            } else if (data.status === "approved") {
                setMensagem("✅ Pagamento aprovado!");
            } else {
                setMensagem(`💬 Status: ${data.status}`);
            }
        } catch (err) {
            console.error(err);
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
                    Cartão (simulação)
                </label>
            </div>

            <button onClick={gerarPagamento}>
                {tipo === "pix" ? "Gerar PIX" : "Pagar com Cartão"}
            </button>

            {/* Mostra QR Code se for PIX */}
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
