
const API_URL = "http://localhost:3000";

const token = sessionStorage.getItem("token");

const formulario = document.getElementById("formHistorico");
const seletorRefeicao = document.getElementById("refeicao");
const listaHistorico = document.getElementById("listaHistorico");
const mensagem = document.getElementById("mensagemHistorico");
const botaoSair = document.getElementById("botaoSair");

async function lerResposta(resposta) {
    if (resposta.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");
        window.location.replace("login.html");
        throw new Error("Sua sessão expirou. Entre novamente.");
    }

    const texto = await resposta.text();
    const tipo = resposta.headers.get("content-type") || "";

    if (!tipo.includes("application/json")) {
        throw new Error(
            `A API respondeu com conteúdo inesperado (HTTP ${resposta.status}) ` +
            `em ${resposta.url}. Confira se o backend está rodando em http://localhost:3000.`
        );
    }

    try {
        return texto ? JSON.parse(texto) : null;
    } catch {
        throw new Error(`A API retornou JSON inválido (HTTP ${resposta.status}) em ${resposta.url}.`);
    }
}

function formatarData(data) {
    const parteData = String(data).slice(0, 10);
    const [ano, mes, dia] = parteData.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : parteData;
}

if (!token) {
    alert("Você precisa entrar na sua conta.");
    window.location.href = "login.html";
}

botaoSair?.addEventListener("click", (evento) => {
    evento.preventDefault();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
});

// Carregar refeições disponíveis
async function carregarRefeicoes() {
    try {
        const resposta = await fetch(`${API_URL}/refeicoes`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const dados = await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao carregar refeições.");
        }

        const refeicoes = Array.isArray(dados) ? dados : dados.refeicoes;

        seletorRefeicao.innerHTML = '<option value="">Selecione uma refeição</option>';

        refeicoes.forEach(refeicao => {
            const opcao = document.createElement("option");
            opcao.value = refeicao.id_refeicao;
            opcao.textContent = refeicao.nome;
            seletorRefeicao.appendChild(opcao);
        });

    } catch (erro) {
        seletorRefeicao.innerHTML = '<option value="">Erro ao carregar refeições</option>';
        mensagem.textContent = erro.message;
    }
}

// Cadastrar refeição consumida
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = {
        id_refeicao: seletorRefeicao.value,
        data_consumo: document.getElementById("dataConsumo").value,
        tipo_refeicao: document.getElementById("tipoRefeicao").value,
        observacoes: document.getElementById("observacoes").value
    };

    try {
        const resposta = await fetch(`${API_URL}/historico`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        const resultado = await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(resultado.mensagem || "Erro ao registrar refeição.");
        }

        mensagem.textContent = "Refeição registrada com sucesso!";
        mensagem.style.color = "#65752E";

        formulario.reset();

        await carregarHistorico();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = "#B23B32";
    }
});

// Listar histórico
async function carregarHistorico() {
    try {
        const resposta = await fetch(`${API_URL}/historico`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const historico = await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(historico.mensagem || "Erro ao carregar histórico.");
        }

        listaHistorico.innerHTML = "";

        if (historico.length === 0) {
            listaHistorico.innerHTML = "<p>Você ainda não registrou nenhuma refeição.</p>";
            return;
        }

        let dataAtual = null;
        let listaDoDia = null;

        historico.forEach(item => {
            const chaveData = String(item.data_consumo).slice(0, 10);
            if (chaveData !== dataAtual) {
                dataAtual = chaveData;
                const grupo = document.createElement("section");
                grupo.className = "grupo-historico";
                const tituloData = document.createElement("h3");
                tituloData.textContent = formatarData(item.data_consumo);
                listaDoDia = document.createElement("div");
                grupo.append(tituloData, listaDoDia);
                listaHistorico.appendChild(grupo);
            }

            const card = document.createElement("article");
            card.className = "card-historico";

            const titulo = document.createElement("h4");
            titulo.textContent = item.nome;

            const tipo = document.createElement("p");
            tipo.textContent = `Tipo: ${item.tipo_refeicao}`;

            const data = document.createElement("p");
            data.textContent = `Data: ${formatarData(item.data_consumo)}`;

            const observacoes = document.createElement("p");
            observacoes.textContent = `Observações: ${item.observacoes || "Nenhuma"}`;

            const botao = document.createElement("button");
            botao.textContent = "Excluir registro";
            botao.className = "botao-excluir-historico";
            botao.addEventListener("click", () => excluirHistorico(item.id_consumo));

            card.append(titulo, tipo, data, observacoes, botao);
            listaDoDia.appendChild(card);
        });

    } catch (erro) {
        listaHistorico.textContent = erro.message;
    }
}

// Excluir registro
async function excluirHistorico(id) {
    if (!confirm("Deseja excluir este registro do histórico?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/historico/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const dados = await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao excluir registro.");
        }

        mensagem.textContent = "Registro excluído com sucesso!";
        mensagem.style.color = "#65752E";

        await carregarHistorico();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = "#B23B32";
    }
}

// Iniciar página
if (token) {
    carregarRefeicoes();
    carregarHistorico();
}
