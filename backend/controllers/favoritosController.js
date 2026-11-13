import { pool } from "../database/conexao.js";

// LISTAR FAVORITOS
export async function listarFavoritos(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;

        const [favoritos] = await pool.query(
            `SELECT
                f.id_favorito,
                f.id_usuario,
                f.id_refeicao,
                f.data_adicionado,
                r.nome,
                r.descricao,
                r.categoria,
                r.horario_indicado
            FROM favoritos f
            INNER JOIN refeicoes r
                ON f.id_refeicao = r.id_refeicao
            WHERE f.id_usuario = ?
            ORDER BY f.data_adicionado DESC`,
            [id_usuario]
        );

        return res.status(200).json(favoritos);

    } catch (erro) {
        return res.status(500).json({
            mensagem: "Erro ao listar favoritos."
        });
    }
}

// ADICIONAR FAVORITO
export async function adicionarFavorito(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_refeicao } = req.body;

        if (!id_refeicao) {
            return res.status(400).json({
                mensagem: "Informe a refeição."
            });
        }

        await pool.query(
            `INSERT INTO favoritos (id_usuario, id_refeicao)
             VALUES (?, ?)`,
            [id_usuario, id_refeicao]
        );

        return res.status(201).json({
            mensagem: "Refeição adicionada aos favoritos!"
        });

    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Essa refeição já está nos favoritos."
            });
        }

        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                mensagem: "Refeição não encontrada."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao adicionar favorito."
        });
    }
}

// REMOVER FAVORITO
export async function removerFavorito(req, res) {
    try {
        const id_usuario = req.usuario.id_usuario;
        const { id_refeicao } = req.params;

        const [resultado] = await pool.query(
            `DELETE FROM favoritos
             WHERE id_usuario = ? AND id_refeicao = ?`,
            [id_usuario, id_refeicao]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Favorito não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Favorito removido com sucesso!"
        });

    } catch (erro) {
        return res.status(500).json({
            mensagem: "Erro ao remover favorito."
        });
    }
}
