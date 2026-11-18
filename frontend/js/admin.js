const API_URL = "http://localhost:3000";
const token = sessionStorage.getItem("token");
let usuario = null;

try {
    usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");
} catch {
    sessionStorage.removeItem("usuario");
}
const mensagemAdmin = document.getElementById("mensagemAdmin");

function encerrarSessao() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.replace("login.html");
}

async function verificarAcessoAdmin() {
    if (!token || !usuario) {
        encerrarSessao();
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/usuarios/administradores`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.status === 401) {
            encerrarSessao();
            return;
        }

        if (!resposta.ok) {
            mensagemAdmin.textContent = "Sua conta não tem permissão para acessar esta área.";
            return;
        }

        mensagemAdmin.textContent = "Acesso autorizado.";
        document.getElementById("abrirCatalogo").hidden = false;
    } catch {
        mensagemAdmin.textContent = "Não foi possível validar o acesso com o servidor.";
    }
}

document.getElementById("botaoSair")?.addEventListener("click", (evento) => {
    evento.preventDefault();
    encerrarSessao();
});

verificarAcessoAdmin();
