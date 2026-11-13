import { pool } from "../database/conexao.js";

export async function cadastrarRefeicao(req, res) {
    try {
        const nome = typeof req.body.nome === "string" ? req.body.nome.trim() : "";
        const descricao = typeof req.body.descricao === "string" ? req.body.descricao.trim() : "";
        const categoria = typeof req.body.categoria === "string" ? req.body.categoria.trim() : "";
        const horario_indicado = typeof req.body.horario_indicado === "string" ? req.body.horario_indicado.trim() : "";

        if (!nome || !categoria) {
            return res.status(400).json({
                mensagem: "Nome e categoria são obrigatórios!"
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO refeicoes
            (nome, descricao, categoria, horario_indicado)
            VALUES (?, ?, ?, ?)`,
            [nome, descricao || null, categoria, horario_indicado || null]
        );

        return res.status(201).json({
            mensagem: "Refeição cadastrada com sucesso!",
            id_refeicao: resultado.insertId
        });

    } catch (erro) {
        console.error("Erro ao cadastrar refeição:", erro);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar refeição."
        });
    }
}

export async function listarRefeicoes(req, res) {
    try {
        const [refeicoes] = await pool.query(
            "SELECT * FROM refeicoes ORDER BY id_refeicao DESC"
        );

        return res.status(200).json(refeicoes);

    } catch (erro) {
        console.error("Erro ao listar refeições:", erro);
        return res.status(500).json({
            mensagem: "Erro ao buscar refeições."
        });
    }
}

export async function buscarRefeicaoPorId(req, res) {
    try {
        const { id } = req.params;

        const [refeicoes] = await pool.query(
            "SELECT * FROM refeicoes WHERE id_refeicao = ?",
            [id]
        );

        if (refeicoes.length === 0) {
            return res.status(404).json({
                mensagem: "Refeição não encontrada."
            });
        }

        return res.status(200).json(refeicoes[0]);

    } catch (erro) {
        console.error("Erro ao buscar refeição:", erro);
        return res.status(500).json({
            mensagem: "Erro ao buscar refeição."
        });
    }
}

export async function editarRefeicao(req, res) {
    try {
        const { id } = req.params;
        const nome = typeof req.body.nome === "string" ? req.body.nome.trim() : "";
        const descricao = typeof req.body.descricao === "string" ? req.body.descricao.trim() : "";
        const categoria = typeof req.body.categoria === "string" ? req.body.categoria.trim() : "";
        const horario_indicado = typeof req.body.horario_indicado === "string" ? req.body.horario_indicado.trim() : "";

        if (!nome || !categoria) {
            return res.status(400).json({
                mensagem: "Nome e categoria são obrigatórios!"
            });
        }

        const [resultado] = await pool.query(
            `UPDATE refeicoes
            SET nome = ?, descricao = ?, categoria = ?, horario_indicado = ?
            WHERE id_refeicao = ?`,
            [nome, descricao || null, categoria, horario_indicado || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Refeição não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Refeição atualizada com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao editar refeição:", erro);
        return res.status(500).json({
            mensagem: "Erro ao atualizar refeição."
        });
    }
}

export async function excluirRefeicao(req, res) {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "DELETE FROM refeicoes WHERE id_refeicao = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Refeição não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Refeição excluída com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir refeição:", erro);

        return res.status(500).json({
            mensagem: "Não foi possível excluir. Verifique se a refeição está sendo utilizada em planejamentos, favoritos ou registros."
        });
    }
}
