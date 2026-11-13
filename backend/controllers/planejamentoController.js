import { pool } from "../database/conexao.js";

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Cadastrar uma refeição no planejamento
export async function cadastrarPlanejamento(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const {
            id_refeicao,
            data_refeicao,
            tipo_refeicao,
            observacoes
        } = req.body;

        if (!id_refeicao || !data_refeicao || !tipo_refeicao) {
            return res.status(400).json({
                mensagem: "Preencha a refeição, a data e o horário."
            });
        }

        if (!DATA_REGEX.test(String(data_refeicao))) {
            return res.status(400).json({
                mensagem: "Informe a data no formato AAAA-MM-DD."
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO planejamentos
            (id_usuario, id_refeicao, data_refeicao, tipo_refeicao, observacoes)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_usuario,
                id_refeicao,
                data_refeicao,
                tipo_refeicao.trim(),
                observacoes ? observacoes.trim() : null
            ]
        );

        return res.status(201).json({
            mensagem: "Refeição adicionada ao planejamento!",
            id_planejamento: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                mensagem: "A refeição selecionada não existe."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao cadastrar planejamento."
        });
    }
}

// Listar o planejamento do usuário
export async function listarPlanejamento(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;

        const [planejamentos] = await pool.query(
            `SELECT
                p.id_planejamento,
                p.id_refeicao,
                p.data_refeicao,
                p.tipo_refeicao,
                p.observacoes,
                r.nome,
                r.descricao,
                r.categoria
            FROM planejamentos p
            INNER JOIN refeicoes r
                ON p.id_refeicao = r.id_refeicao
            WHERE p.id_usuario = ?
            ORDER BY p.data_refeicao ASC`,
            [id_usuario]
        );

        return res.status(200).json(planejamentos);

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao listar planejamento."
        });
    }
}

// Editar uma refeição planejada
export async function editarPlanejamento(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id } = req.params;

        const {
            id_refeicao,
            data_refeicao,
            tipo_refeicao,
            observacoes
        } = req.body;

        if (!id_refeicao || !data_refeicao || !tipo_refeicao) {
            return res.status(400).json({
                mensagem: "Preencha a refeição, a data e o horário."
            });
        }

        if (!DATA_REGEX.test(String(data_refeicao))) {
            return res.status(400).json({
                mensagem: "Informe a data no formato AAAA-MM-DD."
            });
        }

        const [resultado] = await pool.query(
            `UPDATE planejamentos
            SET id_refeicao = ?,
                data_refeicao = ?,
                tipo_refeicao = ?,
                observacoes = ?
            WHERE id_planejamento = ?
            AND id_usuario = ?`,
            [
                id_refeicao,
                data_refeicao,
                tipo_refeicao.trim(),
                observacoes ? observacoes.trim() : null,
                id,
                id_usuario
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Planejamento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Planejamento atualizado com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                mensagem: "A refeição selecionada não existe."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao editar planejamento."
        });
    }
}

// Excluir uma refeição planejada
export async function excluirPlanejamento(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id } = req.params;

        const [resultado] = await pool.query(
            `DELETE FROM planejamentos
            WHERE id_planejamento = ?
            AND id_usuario = ?`,
            [id, id_usuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Planejamento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Refeição removida do planejamento!"
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir planejamento."
        });
    }
}
