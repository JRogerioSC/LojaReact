import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "./pagamento.css";

const API_ESTOQUE = "https://servidorestoque.onrender.com/api/estoque";

function Pagamento() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const valorParam = Number(params.get("valor") || 0);
    const descricaoParam = params.get("descricao") || "";
    const imagemParam = params.get("imagem") || "";
    const idParam = params.get("id");
    const quantidadeParam = Number(params.get("quantidade") || 1);

    const [tipo, setTipo] = useState("pix");
    const [quantidadeFinal, setQuantidadeFinal] = useState(quantidadeParam);
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

    // =====================================================
    // Mercado Pago
    // =====================================================
    useEffect(() => {
        const mpInstance = new window.MercadoPago("TEST-9f970731-cbee-4a81-9e7f-60313d40cca3");
        setMp(mpInstance);
    }, []);

    // =====================================================
    // 🔥 BUSCAR PRODUTO + VALIDAR QUANTIDADE
    // =====================================================
    useEffect(() => {
        const validarQuantidade = async () => {
            try {
                const res = await fetch(`${API_ESTOQUE}/${idParam}`);
                const produto = await res.json();

                if (!produto || produto.erro) {
                    setMensagem("❌ Produto não encontrado no estoque.");
                    return;
                }

                if (quantidadeParam > produto.quantidade) {
                    setQuantidadeFinal(produto.quantidade);
                    setValor(produto.quantidade * (valorParam / quantidadeParam));
                    setMensagem(`⚠️ Só temos ${produto.quantidade} unidades no estoque. Quantidade ajustada.`);
                }
            } catch (err) {
                console.error(err);
                setMensagem("❌ Erro ao validar estoque.");
            }
        };

        validarQuantidade();
    }, [idParam, quantidadeParam, valorParam]);


    // =====================================================
    // 🔥 DESCONTAR ESTOQUE
    // =====================================================
    const descontarEstoque = async () => {
        try {
            const res = await fetch(`${API_ESTOQUE}/confirma-pagamento`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: idParam,
                    quantidadeVendida: quantidadeFinal
                })
            });

            const data = await res.json();

            if (data.sucesso) {
                setMensagem("🟢 Estoque atualizado!");
            } else {
                setMensagem("⚠️ " + data.erro);
            }
        } catch (err) {
            console.error(err);
            setMensagem("❌ Erro ao atualizar estoque.");
        }
    };

    // =====================================================
    // 🔥 GERAR PAGAMENTO
    // =====================================================
    const gerarPagamento = async () => {
        if (!email) {
            setMensagem("⚠️ Digite seu e-mail antes de pagar!");
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

            // PIX
            if (tipo === "pix") {
                if (data.qr_base64) {
                    setQrBase64(data.qr_base64);
                    setPixCode(data.qr_code);
                    setMensagem("📲 Escaneie o QR Code para pagar!");
                } else {
                    setMensagem("❌ Erro ao gerar PIX.");
                }
            }

            // CARTÃO
            else {
                if (data.status === "approved") {
                    setMensagem("✅ Pagamento aprovado!");
                    await descontarEstoque();
                } else {
                    setMensagem(`💬 Status: ${data.status}`);
                }
            }

        } catch (error) {
            console.error(error);
            setMensagem("❌ Erro ao conectar ao servidor.");
        }
    };

    // =====================================================
    // 🔥 SIMULAR APROVADO (DESCONTA ESTOQUE)
    // =====================================================
    const simularAprovacao = async () => {
        setMensagem("🧪 Simulando pagamento aprovado...");
        await descontarEstoque();
    };

    // =====================================================
    // 🔥 RENDER
    // =====================================================
    return (
        <div className="pagamento">
            <button className="voltar" onClick={() => navigate("/")}>⬅ Voltar à Loja</button>

            <h2>💳 Checkout Seguro</h2>

            {imagem && (
                <div className="produto-resumo">
                    <img src={imagem} alt={descricao} className="imagem-produto" />
                    <h3>{descricao}</h3>
                    <p className="valor-produto">R$ {valor.toFixed(2)}</p>
                </div>
            )}

            <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-email"
            />

            <div className="tipos">
                <label>
                    <input type="radio" value="pix" checked={tipo === "pix"} onChange={() => setTipo("pix")} />
                    PIX
                </label>
                <label>
                    <input type="radio" value="cartao" checked={tipo === "cartao"} onChange={() => setTipo("cartao")} />
                    Cartão
                </label>
            </div>

            {tipo === "cartao" && (
                <div className="cartao">
                    <input type="text" placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
                    <input type="text" placeholder="Titular" value={titular} onChange={(e) => setTitular(e.target.value)} />

                    <div className="duplo">
                        <input type="text" placeholder="Mês" value={expMes} onChange={(e) => setExpMes(e.target.value)} />
                        <input type="text" placeholder="Ano" value={expAno} onChange={(e) => setExpAno(e.target.value)} />
                        <input type="text" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                    </div>
                </div>
            )}

            <button className="btn-pagar" onClick={gerarPagamento}>
                {tipo === "pix" ? "Gerar PIX" : "Pagar com Cartão"}
            </button>

            <button className="btn-aprovado" onClick={simularAprovacao}>
                🟢 PAGAMENTO APROVADO (TESTE)
            </button>

            {qrBase64 && (
                <div className="pix-area">
                    <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code PIX" className="qrcode" />
                    <p><strong>Código Copia e Cola:</strong></p>
                    <textarea readOnly value={pixCode} className="pixtext" />
                </div>
            )}

            {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
    );
}

export default Pagamento;
