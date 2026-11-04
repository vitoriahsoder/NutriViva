
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function testarConexao() {
    try {
        const conexao = await pool.getConnection();

        console.log("Banco de dados conectado com sucesso!");

        conexao.release();
    } catch (erro) {
        console.error("Erro ao conectar ao banco:", erro.message);
    }
}
