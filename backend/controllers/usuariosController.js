import { pool } from "../database/conexao.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// CADASTRAR USUÁRIO
export async function cadastrarUsuario(req, res) {
    try {
        const corpo = req.body && typeof req.body === "object" ? req.body : {};
        const nomeInformado = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
        const email = typeof corpo.email === "string" ? corpo.email.trim().toLowerCase() : "";
        const senha = typeof corpo.senha === "string" ? corpo.senha : "";

        if (!nomeInformado || !email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos!"
            });
        }

        if (nomeInformado.length < 2 || nomeInformado.length > 100 || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 6) {
            return res.status(400).json({
                mensagem: "Informe um nome válido, um e-mail válido e uma senha com pelo menos 6 caracteres."
            });
        }

        const [usuarioExistente] = await pool.query(
            "SELECT id_usuario FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado!"
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        await pool.query(
            `INSERT INTO usuarios (nome, email, senha)
             VALUES (?, ?, ?)`,
            [nomeInformado, email, senhaCriptografada]
        );

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao cadastrar usuário."
        });
    }
}

// LISTAR USUÁRIOS
export async function listarUsuarios(req, res) {
    try {
        const [usuarios] = await pool.query(
            `SELECT id_usuario, nome, email, tipo_usuario, data_cadastro
             FROM usuarios`
        );

        return res.status(200).json(usuarios);

    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar usuários."
        });
    }
}

// FAZER LOGIN
export async function fazerLogin(req, res) {
    try {
        const corpo = req.body && typeof req.body === "object" ? req.body : {};
        const email = typeof corpo.email === "string" ? corpo.email.trim().toLowerCase() : "";
        const senha = typeof corpo.senha === "string" ? corpo.senha : "";

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha!"
            });
        }

        const [usuarios] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos!"
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos!"
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                tipo_usuario: usuario.tipo_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token: token,
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo_usuario: usuario.tipo_usuario
            }
        });

    } catch (erro) {
        console.error("Erro ao fazer login:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao fazer login."
        });
    }
}

// CONSULTAR PERFIL DO USUÁRIO
export async function consultarPerfil(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;

        const [usuarios] = await pool.query(
            `SELECT id_usuario, nome, email, tipo_usuario, data_cadastro
             FROM usuarios
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json(usuarios[0]);

    } catch (erro) {
        console.error("Erro ao consultar perfil:", erro);

        return res.status(500).json({
            mensagem: "Erro ao carregar perfil."
        });
    }
}

// EDITAR PERFIL DO USUÁRIO
export async function atualizarPerfil(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const corpo = req.body && typeof req.body === "object" ? req.body : {};
        const nomeInformado = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
        const email = typeof corpo.email === "string" ? corpo.email.trim().toLowerCase() : "";

        if (!nomeInformado || !email) {
            return res.status(400).json({
                mensagem: "Informe o nome e o e-mail."
            });
        }

        if (nomeInformado.length < 2 || nomeInformado.length > 100 || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ mensagem: "Informe um nome e um e-mail válidos." });
        }

        const [emailExistente] = await pool.query(
            `SELECT id_usuario FROM usuarios
             WHERE email = ? AND id_usuario != ?`,
            [email, id_usuario]
        );

        if (emailExistente.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está sendo utilizado."
            });
        }

        await pool.query(
            `UPDATE usuarios
             SET nome = ?, email = ?
             WHERE id_usuario = ?`,
            [nomeInformado, email, id_usuario]
        );

        const [usuariosAtualizados] = await pool.query(
            `SELECT id_usuario, nome, email, tipo_usuario, data_cadastro
             FROM usuarios
             WHERE id_usuario = ?`,
            [id_usuario]
        );

        return res.status(200).json({
            mensagem: "Perfil atualizado com sucesso!",
            usuario: usuariosAtualizados[0]
        });

    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar perfil."
        });
    }
}
