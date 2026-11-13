const API_URL = "http://localhost:3000/usuarios/login";

const formulario = document.getElementById("formLogin");
const mensagem = document.getElementById("mensagemLogin");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        mensagem.textContent = "Entrando...";

        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Não foi possível entrar.");
        }

        // Guarda o token para usar nas próximas páginas
        sessionStorage.setItem("token", dados.token);

        // Guarda os dados básicos do usuário
        sessionStorage.setItem("usuario", JSON.stringify(dados.usuario));

        mensagem.textContent = "Login realizado com sucesso!";

        // Direciona para a página inicial
        window.location.href = "refeicoes.html";

    } catch (erro) {
        mensagem.textContent = erro.message;
    }
});
