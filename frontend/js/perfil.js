const API_URL = "http://localhost:3000";

const token = sessionStorage.getItem("token");

const nomeExibido = document.getElementById("nomeExibido");
const emailExibido = document.getElementById("emailExibido");
const tipoUsuario = document.getElementById("tipoUsuario");
const dataCadastro = document.getElementById("dataCadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const mensagem = document.getElementById("mensagemPerfil");

let usuarioAtual = null;

function sairDaConta(evento) {
    if (evento) evento.preventDefault();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// Verifica se existe um usuário conectado
if (!token) {
    window.location.href = "login.html";
}

// Busca os dados do usuário
async function carregarPerfil() {
    try {
        const resposta = await fetch(`${API_URL}/usuarios/perfil`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            sairDaConta();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Não foi possível carregar o perfil.");
        }

        usuarioAtual = dados.usuario || dados;

        nomeExibido.textContent = usuarioAtual.nome;
        emailExibido.textContent = usuarioAtual.email;

        campoNome.value = usuarioAtual.nome;
        campoEmail.value = usuarioAtual.email;

        tipoUsuario.textContent =
            usuarioAtual.tipo_usuario === "administrador"
                ? "Administrador"
                : "Usuário";

        dataCadastro.textContent = usuarioAtual.data_cadastro
            ? new Date(usuarioAtual.data_cadastro).toLocaleDateString("pt-BR")
            : "Não informado";

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = "#B23B32";

        nomeExibido.textContent = "Não foi possível carregar";
        emailExibido.textContent = "Verifique sua conexão com o servidor.";
    }
}

// Salva as alterações do perfil
document.getElementById("formPerfil").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();

    try {
        const resposta = await fetch(`${API_URL}/usuarios/perfil`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email })
        });

        if (resposta.status === 401) {
            sairDaConta();
            return;
        }

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao atualizar perfil.");
        }

        usuarioAtual = dados.usuario || {
            ...usuarioAtual,
            nome,
            email
        };

        nomeExibido.textContent = usuarioAtual.nome;
        emailExibido.textContent = usuarioAtual.email;

        sessionStorage.setItem("usuario", JSON.stringify(usuarioAtual));

        mensagem.textContent = "Perfil atualizado com sucesso!";
        mensagem.style.color = "#65752E";

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = "#B23B32";
    }
});

// Sair da conta
document.getElementById("botaoSair")?.addEventListener("click", sairDaConta);
document.getElementById("botaoSairTopo")?.addEventListener("click", sairDaConta);

// Inicia o carregamento
if (token) {
    carregarPerfil();
}
