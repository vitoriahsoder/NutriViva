const API_URL = "http://localhost:3000";
const token = sessionStorage.getItem("token");
const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");

const listaRefeicoes = document.getElementById("listaRefeicoes");
const pesquisaRefeicao = document.getElementById("pesquisaRefeicao");
const filtroCategoria = document.getElementById("filtroCategoria");
const areaAdministrador = document.getElementById("areaAdministrador");
const formRefeicao = document.getElementById("formRefeicao");
const botaoSair = document.getElementById("botaoSair");
const linkAdmin = document.getElementById("linkAdmin");

let refeicoes = [];

function encerrarSessao() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
}

if (!token || !usuario) {
    encerrarSessao();
}

// Mostra o formulário somente para administradores
if (usuario?.tipo_usuario === "administrador" && areaAdministrador) {
    areaAdministrador.hidden = false;
    areaAdministrador.style.display = "block";
    if (linkAdmin) linkAdmin.hidden = false;
}

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

        refeicoes = dados;
        mostrarRefeicoes(refeicoes);

    } catch (erro) {
        listaRefeicoes.textContent = erro.message;
    }
}

function mostrarRefeicoes(lista) {
    listaRefeicoes.innerHTML = "";

    if (lista.length === 0) {
        listaRefeicoes.textContent = "Nenhuma refeição encontrada.";
        return;
    }

    lista.forEach((refeicao) => {
        const card = document.createElement("article");
        card.className = "card-refeicao";

        const imagem = document.createElement("img");
        imagem.className = "imagem-card-refeicao";
        imagem.alt = `Sugestão de ${refeicao.nome}`;
        const imagensPorCategoria = {
            "Café da manhã": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
            "Almoço": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
            "Lanche": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
            "Jantar": "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80",
            "Bebida": "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=800&auto=format&fit=crop&q=80"
        };
        imagem.src = imagensPorCategoria[refeicao.categoria] || imagensPorCategoria.Lanche;
        imagem.loading = "lazy";
        imagem.addEventListener("error", () => imagem.remove());

        const titulo = document.createElement("h3");
        titulo.textContent = refeicao.nome;

        const descricao = document.createElement("p");
        descricao.textContent = refeicao.descricao || "Sem descrição.";

        const categoria = document.createElement("span");
        categoria.textContent = refeicao.categoria;

        const horario = document.createElement("p");
        horario.textContent = `Horário: ${refeicao.horario_indicado || "Não informado"}`;

        const detalhes = document.createElement("details");
        const resumo = document.createElement("summary");
        resumo.textContent = "Ver detalhes";
        detalhes.append(resumo, descricao, horario);

        const acoes = document.createElement("div");
        acoes.className = "acoes-card";

        const botaoFavoritar = document.createElement("button");
        botaoFavoritar.type = "button";
        botaoFavoritar.textContent = "♡ Adicionar aos favoritos";
        botaoFavoritar.className = "botao-favoritar";
        botaoFavoritar.addEventListener("click", () => {
            adicionarFavorito(refeicao.id_refeicao);
        });
        acoes.append(botaoFavoritar);

        if (usuario?.tipo_usuario === "administrador") {
            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "botao-secundario-card";
            editar.textContent = "Editar refeição";
            editar.addEventListener("click", () => editarRefeicao(refeicao));

            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.className = "botao-excluir-card";
            excluir.textContent = "Excluir refeição";
            excluir.addEventListener("click", () => excluirRefeicao(refeicao.id_refeicao));
            acoes.append(editar, excluir);
        }

        card.append(imagem, titulo, categoria, detalhes, acoes);
        listaRefeicoes.appendChild(card);
    });
}

// Adiciona uma refeição aos favoritos
async function adicionarFavorito(id_refeicao) {
    try {
        const resposta = await fetch(`${API_URL}/favoritos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                id_refeicao: id_refeicao
            })
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao favoritar refeição.");
        }

        alert("Refeição adicionada aos favoritos!");

    } catch (erro) {
        alert(erro.message);
    }
}

// Pesquisa e filtro por categoria
function filtrarRefeicoes() {
    const pesquisa = pesquisaRefeicao.value.toLowerCase();
    const categoriaSelecionada = filtroCategoria.value;

    const resultado = refeicoes.filter((refeicao) => {
        const correspondeNome = refeicao.nome.toLowerCase().includes(pesquisa);
        const correspondeCategoria =
            categoriaSelecionada === "" ||
            refeicao.categoria === categoriaSelecionada;

        return correspondeNome && correspondeCategoria;
    });

    mostrarRefeicoes(resultado);
}

pesquisaRefeicao.addEventListener("input", filtrarRefeicoes);
filtroCategoria.addEventListener("change", filtrarRefeicoes);

// Cadastro de refeições para administradores
if (formRefeicao) {
    formRefeicao.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const novaRefeicao = {
            nome: document.getElementById("nome").value.trim(),
            descricao: document.getElementById("descricao").value.trim(),
            categoria: document.getElementById("categoria").value,
            horario_indicado: document.getElementById("horario_indicado").value.trim()
        };

        try {
            const resposta = await fetch(`${API_URL}/refeicoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(novaRefeicao)
            });

            if (resposta.status === 401) {
                encerrarSessao();
                return;
            }

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || "Erro ao cadastrar refeição.");
            }

            alert("Refeição cadastrada com sucesso!");
            formRefeicao.reset();
            await carregarRefeicoes();

        } catch (erro) {
            alert(erro.message);
        }
    });
}

async function editarRefeicao(refeicao) {
    const nome = prompt("Nome da refeição:", refeicao.nome);
    if (nome === null) return;
    const descricao = prompt("Descrição:", refeicao.descricao || "");
    if (descricao === null) return;
    const categoria = prompt("Categoria (Café da manhã, Almoço, Lanche, Jantar, Bebida):", refeicao.categoria);
    if (categoria === null) return;
    const horario_indicado = prompt("Horário indicado:", refeicao.horario_indicado || "");
    if (horario_indicado === null) return;

    if (!nome.trim() || !categoria.trim()) {
        alert("Nome e categoria são obrigatórios.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/refeicoes/${refeicao.id_refeicao}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                nome: nome.trim(),
                descricao: descricao.trim(),
                categoria: categoria.trim(),
                horario_indicado: horario_indicado.trim()
            })
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível editar a refeição.");
        await carregarRefeicoes();
    } catch (erro) {
        alert(erro.message);
    }
}

async function excluirRefeicao(id) {
    if (!confirm("Excluir esta refeição? Ela também será removida de planejamentos, favoritos e histórico associados.")) return;
    try {
        const resposta = await fetch(`${API_URL}/refeicoes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível excluir a refeição.");
        await carregarRefeicoes();
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
