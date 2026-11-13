const API_URL = "http://localhost:3000/usuarios/cadastro";

const formulario = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagemCadastro");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    try {
        mensagem.textContent = "Cadastrando...";

        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao realizar cadastro.");
        }

        mensagem.textContent = "Conta criada com sucesso!";

        formulario.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (erro) {
        mensagem.textContent = erro.message;
    }
});
