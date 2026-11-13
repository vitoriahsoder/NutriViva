import { pool } from "../database/conexao.js";

export async function listarSugestoes(req, res) {
    try {
        const [sugestoes] = await pool.query(
            `SELECT
                s.id_sugestao,
                s.id_refeicao,
                s.titulo,
                s.descricao,
                s.ativa,
                r.nome AS nome_refeicao,
                r.categoria,
                r.horario_indicado
            FROM sugestoes s
            INNER JOIN refeicoes r
                ON s.id_refeicao = r.id_refeicao
            WHERE s.ativa = TRUE
            ORDER BY s.id_sugestao DESC`
        );

        return res.status(200).json(sugestoes);
    } catch (erro) {
        console.error("Erro ao listar sugestões:", erro);
        return res.status(500).json({
            mensagem: "Erro ao carregar sugestões."
        });
    }
}
