
import { pool } from "../database/conexao.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos!"
            });
        }

        const [usuarioExistente] = await pool.query(
            "SELECT * FROM usuarios WHERE email = ?",
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
            [nome, email, senhaCriptografada]
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


export async function fazerLogin(req, res) {
    try {
        const { email, senha } = req.body;

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

