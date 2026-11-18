import { pool } from "../database/conexao.js";
import { dataCalendarioValida } from "../utils/validarData.js";

// Registrar uma refeição consumida
export async function cadastrarHistorico(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;

        const {
            id_refeicao,
            data_consumo,
            tipo_refeicao,
            observacoes
        } = req.body || {};

        const idRefeicao = Number(id_refeicao);
        const tipoNormalizado = typeof tipo_refeicao === "string" ? tipo_refeicao.trim() : "";

        if (!Number.isSafeInteger(idRefeicao) || idRefeicao < 1 || !tipoNormalizado) {
            return res.status(400).json({
                mensagem: "Preencha a refeição, a data e o tipo."
            });
        }

        if (!dataCalendarioValida(data_consumo)) {
            return res.status(400).json({
                mensagem: "Informe a data no formato AAAA-MM-DD."
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO refeicoes_consumidas
            (id_usuario, id_refeicao, data_consumo, tipo_refeicao, observacoes)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_usuario,
                idRefeicao,
                data_consumo,
                tipoNormalizado,
                typeof observacoes === "string" ? observacoes.trim() || null : null
            ]
        );

        return res.status(201).json({
            mensagem: "Refeição registrada no histórico!",
            id_consumo: resultado.insertId
        });

    } catch (erro) {
        console.error("Erro ao registrar refeição:", erro);

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                mensagem: "A refeição selecionada não existe."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao registrar refeição."
        });
    }
}

// Listar histórico do usuário
export async function listarHistorico(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;

        const [historico] = await pool.query(
            `SELECT
                c.id_consumo,
                c.id_refeicao,
                c.data_consumo,
                c.tipo_refeicao,
                c.observacoes,
                r.nome,
                r.descricao,
                r.categoria
            FROM refeicoes_consumidas c
            INNER JOIN refeicoes r
                ON c.id_refeicao = r.id_refeicao
            WHERE c.id_usuario = ?
            ORDER BY c.data_consumo DESC, c.id_consumo DESC`,
            [id_usuario]
        );

        return res.status(200).json(historico);

    } catch (erro) {
        console.error("Erro ao listar histórico:", erro);

        return res.status(500).json({
            mensagem: "Erro ao carregar histórico."
        });
    }
}

// Excluir registro do histórico
export async function excluirHistorico(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id } = req.params;

        const [resultado] = await pool.query(
            `DELETE FROM refeicoes_consumidas
            WHERE id_consumo = ?
            AND id_usuario = ?`,
            [id, id_usuario]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Registro não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Registro removido do histórico!"
        });

    } catch (erro) {
        console.error("Erro ao excluir histórico:", erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir registro."
        });
    }
}
