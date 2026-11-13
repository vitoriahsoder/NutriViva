
const API_URL = "http://localhost:3000/refeicoes";

// ELEMENTOS HTML
const formulario = document.getElementById("formRefeicao");
const listaRefeicoes = document.getElementById("listaRefeicoes");
const campoToken = document.getElementById("token");

// BUSCAR REFEIÇÕES
async function listarRefeicoes() {
    try {
        const resposta = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${campoToken.value}`
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao buscar refeições.");
        }

        listaRefeicoes.innerHTML = "";

        if (dados.length === 0) {
            listaRefeicoes.textContent = "Nenhuma refeição cadastrada.";
            return;
        }

        dados.forEach(refeicao => {
            const card = document.createElement("div");
            card.className = "card-refeicao";

            const titulo = document.createElement("h3");
            titulo.textContent = refeicao.nome;

            const descricao = document.createElement("p");
            descricao.textContent = "Descrição: " + (refeicao.descricao || "Não informada");

            const categoria = document.createElement("p");
            categoria.textContent = "Categoria: " + refeicao.categoria;

            const horario = document.createElement("p");
            horario.textContent = "Horário: " + (refeicao.horario_indicado || "Não informado");

            const botaoEditar = document.createElement("button");
            botaoEditar.textContent = "Editar";
            botaoEditar.onclick = () => editarRefeicao(refeicao);

            const botaoExcluir = document.createElement("button");
            botaoExcluir.textContent = "Excluir";
            botaoExcluir.className = "botao-excluir";
            botaoExcluir.onclick = () => excluirRefeicao(refeicao.id_refeicao);

            const acoes = document.createElement("div");
            acoes.className = "acoes";

            acoes.append(botaoEditar, botaoExcluir);
            card.append(titulo, descricao, categoria, horario, acoes);

            listaRefeicoes.appendChild(card);
        });

    } catch (erro) {
        listaRefeicoes.textContent = erro.message;
    }
}

// CADASTRAR REFEIÇÃO
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const refeicao = {
        nome: document.getElementById("nome").value,
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        horario_indicado: document.getElementById("horario_indicado").value
    };

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${campoToken.value}`
            },
            body: JSON.stringify(refeicao)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao cadastrar.");
        }

        alert("Refeição cadastrada com sucesso!");

        formulario.reset();
        await listarRefeicoes();

    } catch (erro) {
        alert(erro.message);
    }
});

// EDITAR REFEIÇÃO
async function editarRefeicao(refeicao) {
    const nome = prompt("Novo nome:", refeicao.nome);

    if (nome === null) return;

    const descricao = prompt("Nova descrição:", refeicao.descricao || "");

    if (descricao === null) return;

    const categoria = prompt("Nova categoria:", refeicao.categoria);

    if (categoria === null) return;

    const horario = prompt("Novo horário:", refeicao.horario_indicado || "");

    if (horario === null) return;

    if (!nome.trim() || !categoria.trim()) {
        alert("Nome e categoria são obrigatórios!");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${refeicao.id_refeicao}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${campoToken.value}`
            },
            body: JSON.stringify({
                nome,
                descricao,
                categoria,
                horario_indicado: horario
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao editar.");
        }

        alert("Refeição atualizada!");
        await listarRefeicoes();

    } catch (erro) {
        alert(erro.message);
    }
}

// EXCLUIR REFEIÇÃO
async function excluirRefeicao(id) {
    const confirmar = confirm("Deseja realmente excluir esta refeição?");

    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${campoToken.value}`
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao excluir.");
        }

        alert("Refeição excluída com sucesso!");
        await listarRefeicoes();

    } catch (erro) {
        alert(erro.message);
    }
}

// ATUALIZAR LISTA AO INFORMAR O TOKEN
campoToken.addEventListener("change", listarRefeicoes);
