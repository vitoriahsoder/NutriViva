const API_URL = "http://localhost:3000/favoritos";

const token = sessionStorage.getItem("token");

const listaFavoritos = document.getElementById("listaFavoritos");
const botaoSair = document.getElementById("botaoSair");

function encerrarSessao() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
}

if (!token) {
    encerrarSessao();
}

// LISTAR FAVORITOS
async function carregarFavoritos() {
    try {
        const resposta = await fetch(API_URL, {
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
            throw new Error(dados.mensagem || "Erro ao carregar favoritos.");
        }

        mostrarFavoritos(dados);

    } catch (erro) {
        listaFavoritos.textContent = erro.message;
    }
}

// MOSTRAR FAVORITOS NA TELA
function mostrarFavoritos(favoritos) {
    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        listaFavoritos.textContent =
            "Você ainda não possui refeições favoritas.";
        return;
    }

    favoritos.forEach((refeicao) => {
        const card = document.createElement("article");
        card.className = "card-refeicao";

        const titulo = document.createElement("h3");
        titulo.textContent = refeicao.nome;

        const descricao = document.createElement("p");
        descricao.textContent = refeicao.descricao || "Sem descrição.";

        const categoria = document.createElement("span");
        categoria.textContent = refeicao.categoria;

        const acoes = document.createElement("div");
        acoes.className = "acoes-card";

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover dos favoritos";
        botaoRemover.className = "botao-remover";

        botaoRemover.addEventListener("click", () => {
            removerFavorito(refeicao.id_refeicao);
        });

        acoes.append(botaoRemover);
        card.append(titulo, descricao, categoria, acoes);

        listaFavoritos.appendChild(card);
    });
}

// REMOVER FAVORITO
async function removerFavorito(id_refeicao) {
    const confirmar = confirm(
        "Deseja remover esta refeição dos favoritos?"
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(
            `${API_URL}/${id_refeicao}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao remover favorito.");
        }

        alert("Refeição removida dos favoritos!");
        carregarFavoritos();

    } catch (erro) {
        alert(erro.message);
    }
}

// SAIR DA CONTA
botaoSair?.addEventListener("click", (evento) => {
    evento.preventDefault();
    encerrarSessao();
});

// INICIAR
carregarFavoritos();
