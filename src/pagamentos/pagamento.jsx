import React, { useEffect, useState } from "react";
import "./pagamento.css";

function Pagamento() {
    const PUBLIC_KEY = "APP_USR-c4a1f460-54a7-45c4-a883-df06f161aab2"; // 🔑 SUA PUBLIC KEY DO MERCADO PAGO

    const [tipo, setTipo] = useState("pix");
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");
    const [email, setEmail] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [qrBase64, setQrBase64] = useState("");
    const [pixCode, setPixCode] = useState("");

    // Cartão
    const [numero, setNumero] = useState("");
    const [nomeCartao, setNomeCartao] = useState("");
    const [validade, setValidade] = useState("");
    const [cvv, setCvv] = useState("");

    // 🔹 Inicializa o Mercado Pago SDK no frontend
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.onload = () => {
            if (!window.MercadoPago) return;
            window.mp = new window.MercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
        };
        document.body.appendChild(script);
    }, []);

    // 🟣 PIX
    const gerarPix = async () => {
        setMensagem("🔄 Gerando PIX...");

        try {
            const res = await fetch("https://sevidorlojareact.onrender.com/api/pagar/pix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ valor, descricao, email }),
            });

            const data = await res.json();

            if (data.qr_base64) {
                setQrBase64(data.qr_base64);
                setPixCode(data.qr_code);
                setMensagem("✅ PIX gerado com sucesso!");
            } else {
                setMensagem("❌ Erro ao gerar PIX.");
            }
        } catch (err) {
            setMensagem("⚠️ Erro de conexão com o servidor.");
        }
    };

    // 💳 CARTÃO
    const pagarCartao = async () => {
        if (!window.mp) return alert("SDK do Mercado Pago não carregou!");

        setMensagem("💳 Gerando token do cartão...");

        try {
            // Cria o token com os dados do cartão
            const cardFormData = {
                cardNumber: numero.replace(/\s/g, ""),
                cardholderName: nomeCartao,
                cardExpirationMonth: validade.split("/")[0],
                cardExpirationYear: `20${validade.split("/")[1]}`,
                securityCode: cvv,
            };

            const tokenResult = await window.mp.createCardToken(cardFormData);

            if (tokenResult.error) {
                console.error(tokenResult);
                setMensagem("❌ Erro ao gerar token do cartão.");
                return;
            }

            const token = tokenResult.id;
            setMensagem("🔄 Processando pagamento...");

            const res = await fetch("https://sevidorlojareact.onrender.com/api/pagar/cartao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    valor,
                    descricao,
                    email,
                }),
            });

            const data = await res.json();

            if (data.status === "approved") {
                setMensagem("✅ Pagamento aprovado!");
            } else {
                setMensagem(`❌ Pagamento: ${data.status}`);
            }
        } catch (error) {
            console.error(error);
            setMensagem("⚠️ Erro ao processar pagamento.");
        }
    };

    return (
        <div className="pagamento">
            <h2>💰 Checkout API - Mercado Pago</h2>

            <input
                type="text"
                placeholder="Descrição do produto"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
            />
            <input
                type="number"
                placeholder="Valor"
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

            {/* PAGAMENTO PIX */}
            {tipo === "pix" && (
                <div className="pix-area">
                    <button onClick={gerarPix}>Gerar PIX</button>
                    {qrBase64 && (
                        <>
                            <img
                                src={`data:image/png;base64,${qrBase64}`}
                                alt="QR Code PIX"
                                className="qrcode"
                            />
                            <p>
                                <strong>Código copia e cola:</strong>
                            </p>
                            <textarea readOnly value={pixCode} className="pixtext" />
                        </>
                    )}
                </div>
            )}

            {/* PAGAMENTO CARTÃO */}
            {tipo === "cartao" && (
                <div className="cartao">
                    <input
                        placeholder="Número do cartão"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                    />
                    <input
                        placeholder="Nome no cartão"
                        value={nomeCartao}
                        onChange={(e) => setNomeCartao(e.target.value)}
                    />
                    <input
                        placeholder="Validade (MM/AA)"
                        value={validade}
                        onChange={(e) => setValidade(e.target.value)}
                    />
                    <input
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                    />
                    <button onClick={pagarCartao}>Pagar com Cartão</button>
                </div>
            )}

            {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
    );
}

export default Pagamento;
