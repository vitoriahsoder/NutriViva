import { pool } from "../database/conexao.js";

export async function cadastrarRefeicao(req, res) {
    try {
        const corpo = req.body && typeof req.body === "object" ? req.body : {};
        const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
        const descricao = typeof corpo.descricao === "string" ? corpo.descricao.trim() : "";
        const categoria = typeof corpo.categoria === "string" ? corpo.categoria.trim() : "";
        const horario_indicado = typeof corpo.horario_indicado === "string" ? corpo.horario_indicado.trim() : "";

        if (!nome || nome.length > 100 || descricao.length > 5000 || !categoria || categoria.length > 50 || horario_indicado.length > 50) {
            return res.status(400).json({
                mensagem: "Confira os limites: nome até 100, descrição até 5.000, categoria até 50 e horário até 50 caracteres."
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
        const corpo = req.body && typeof req.body === "object" ? req.body : {};
        const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
        const descricao = typeof corpo.descricao === "string" ? corpo.descricao.trim() : "";
        const categoria = typeof corpo.categoria === "string" ? corpo.categoria.trim() : "";
        const horario_indicado = typeof corpo.horario_indicado === "string" ? corpo.horario_indicado.trim() : "";

        if (!nome || nome.length > 100 || descricao.length > 5000 || !categoria || categoria.length > 50 || horario_indicado.length > 50) {
            return res.status(400).json({
                mensagem: "Confira os limites: nome até 100, descrição até 5.000, categoria até 50 e horário até 50 caracteres."
            });
        }

        const [existentes] = await pool.query(
            "SELECT id_refeicao FROM refeicoes WHERE id_refeicao = ?",
            [id]
        );

        if (existentes.length === 0) {
            return res.status(404).json({ mensagem: "Refeição não encontrada." });
        }

        await pool.query(
            `UPDATE refeicoes
            SET nome = ?, descricao = ?, categoria = ?, horario_indicado = ?
            WHERE id_refeicao = ?`,
            [nome, descricao || null, categoria, horario_indicado || null, id]
        );

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
    let conexao;
    let transacaoIniciada = false;

    try {
        const { id } = req.params;

        conexao = await pool.getConnection();
        await conexao.beginTransaction();
        transacaoIniciada = true;

        const [refeicoes] = await conexao.query(
            "SELECT id_refeicao FROM refeicoes WHERE id_refeicao = ? FOR UPDATE",
            [id]
        );

        if (refeicoes.length === 0) {
            await conexao.rollback();
            transacaoIniciada = false;
            return res.status(404).json({ mensagem: "Refeição não encontrada." });
        }

        const [vinculos] = await conexao.query(
            `SELECT
                EXISTS(SELECT 1 FROM planejamentos WHERE id_refeicao = ?) AS em_planejamento,
                EXISTS(SELECT 1 FROM favoritos WHERE id_refeicao = ?) AS em_favoritos,
                EXISTS(SELECT 1 FROM refeicoes_consumidas WHERE id_refeicao = ?) AS no_historico,
                EXISTS(SELECT 1 FROM sugestoes WHERE id_refeicao = ?) AS em_sugestoes`,
            [id, id, id, id]
        );

        if (Object.values(vinculos[0]).some(Boolean)) {
            await conexao.rollback();
            transacaoIniciada = false;
            return res.status(409).json({
                mensagem: "Esta refeição está vinculada a planejamento, favorito, histórico ou sugestão. Remova os vínculos antes de excluí-la."
            });
        }

        const [resultado] = await conexao.query(
            "DELETE FROM refeicoes WHERE id_refeicao = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            await conexao.rollback();
            transacaoIniciada = false;
            return res.status(404).json({
                mensagem: "Refeição não encontrada."
            });
        }

        await conexao.commit();
        transacaoIniciada = false;

        return res.status(200).json({
            mensagem: "Refeição excluída com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir refeição:", erro);

        if (transacaoIniciada) await conexao.rollback();

        if (erro.code === "ER_ROW_IS_REFERENCED_2" || erro.code === "ER_ROW_IS_REFERENCED") {
            return res.status(409).json({
                mensagem: "Esta refeição possui registros vinculados e não pode ser excluída."
            });
        }

        return res.status(500).json({
            mensagem: "Não foi possível excluir a refeição."
        });
    } finally {
        conexao?.release();
    }
}
