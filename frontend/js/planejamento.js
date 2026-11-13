const API_URL = "http://localhost:3000";
const token = sessionStorage.getItem("token");

const formPlanejamento = document.getElementById("formPlanejamento");
const seletorRefeicao = document.getElementById("refeicao");
const listaPlanejamento = document.getElementById("listaPlanejamento");
const botaoSair = document.getElementById("botaoSair");

function encerrarSessao() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
}

if (!token) {
    encerrarSessao();
}

// Carregar as refeições disponíveis
async function carregarRefeicoes() {
    try {
        const resposta = await fetch(`${API_URL}/refeicoes`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao carregar refeições.");
        }

        if (!Array.isArray(dados)) {
            throw new Error("A API não retornou uma lista de refeições.");
        }

        seletorRefeicao.innerHTML =
            '<option value="">Selecione uma refeição</option>';

        dados.forEach((refeicao) => {
            const opcao = document.createElement("option");
            opcao.value = refeicao.id_refeicao;
            opcao.textContent = refeicao.nome;
            seletorRefeicao.appendChild(opcao);
        });

    } catch (erro) {
        alert(erro.message);
    }
}

// Cadastrar planejamento
formPlanejamento.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const novoPlanejamento = {
        id_refeicao: seletorRefeicao.value,
        data_refeicao: document.getElementById("dataRefeicao").value,
        tipo_refeicao: document.getElementById("tipoRefeicao").value,
        observacoes: document.getElementById("observacoes").value
    };

    try {
        const resposta = await fetch(`${API_URL}/planejamento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(novoPlanejamento)
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao adicionar planejamento.");
        }

        alert("Refeição adicionada ao planejamento!");

        formPlanejamento.reset();
        carregarPlanejamento();

    } catch (erro) {
        alert(erro.message);
    }
});

// Listar planejamento
async function carregarPlanejamento() {
    try {
        const resposta = await fetch(`${API_URL}/planejamento`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao carregar planejamento.");
        }

        mostrarPlanejamento(dados);

    } catch (erro) {
        listaPlanejamento.textContent = erro.message;
    }
}

// Mostrar refeições planejadas
function mostrarPlanejamento(planejamentos) {
    listaPlanejamento.innerHTML = "";

    if (planejamentos.length === 0) {
        listaPlanejamento.textContent =
            "Você ainda não possui refeições planejadas.";
        return;
    }

    planejamentos.forEach((item) => {
        const card = document.createElement("article");
        card.className = "card-refeicao";

        const titulo = document.createElement("h3");
        titulo.textContent = item.nome;

        const data = document.createElement("p");

        const [ano, mes, dia] = String(item.data_refeicao).slice(0, 10).split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        data.textContent = `Data: ${dataFormatada}`;

        const horario = document.createElement("p");
        horario.textContent = `Refeição: ${item.tipo_refeicao}`;

        const observacoes = document.createElement("p");
        observacoes.textContent = item.observacoes || "Sem observações.";

        const acoes = document.createElement("div");
        acoes.className = "acoes-card";

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "botao-secundario-card";
        botaoEditar.addEventListener("click", () => editarPlanejamento(item));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Remover";
        botaoExcluir.className = "botao-remover";
        botaoExcluir.addEventListener("click", () => {
            excluirPlanejamento(item.id_planejamento);
        });

        acoes.append(botaoEditar, botaoExcluir);
        card.append(titulo, data, horario, observacoes, acoes);
        listaPlanejamento.appendChild(card);
    });
}

async function editarPlanejamento(item) {
    const data_refeicao = prompt("Data (AAAA-MM-DD):", String(item.data_refeicao).slice(0, 10));
    if (data_refeicao === null) return;
    const tipo_refeicao = prompt("Tipo de refeição:", item.tipo_refeicao);
    if (tipo_refeicao === null) return;
    const observacoes = prompt("Observações:", item.observacoes || "");
    if (observacoes === null) return;

    if (!data_refeicao.trim() || !tipo_refeicao.trim()) {
        alert("Data e tipo de refeição são obrigatórios.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/planejamento/${item.id_planejamento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                id_refeicao: item.id_refeicao,
                data_refeicao: data_refeicao.trim(),
                tipo_refeicao: tipo_refeicao.trim(),
                observacoes
            })
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível editar o planejamento.");
        await carregarPlanejamento();
    } catch (erro) {
        alert(erro.message);
    }
}

// Excluir refeição planejada
async function excluirPlanejamento(id) {
    const confirmar = confirm(
        "Deseja remover esta refeição do planejamento?"
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/planejamento/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao remover planejamento.");
        }

        alert("Refeição removida!");
        carregarPlanejamento();

    } catch (erro) {
        alert(erro.message);
    }
}

// Sair da conta
if (botaoSair) {
    botaoSair.addEventListener("click", (evento) => {
        evento.preventDefault();
        encerrarSessao();
    });
}

carregarRefeicoes();
carregarPlanejamento();
