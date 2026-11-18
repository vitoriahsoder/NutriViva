CREATE DATABASE IF NOT EXISTS nutriviva
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE nutriviva;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('comum', 'administrador') DEFAULT 'comum',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
('Ana Silva', 'ana@email.com', '$2b$10$0adtFSkVEm7QBRAl8Yiu5uPUqSaIfFw88xzn4fLwdQgRLIHhaCmae', 'comum'),
('Lucas Santos', 'lucas@email.com', '$2b$10$nXjMQXwZl5uaGNb2vtGuIeMXu/OdguZLuxZZ7OYGV1pD5mzrcq362', 'comum'),
('Administrador', 'admin@nutriviva.com', '$2b$10$dZrP0ksJk82bXthgpuycH.NlpGoQ.w27io9RK8C1cpjs4YKaLwvf6', 'administrador');


CREATE TABLE IF NOT EXISTS refeicoes (
    id_refeicao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    horario_indicado VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO refeicoes (nome, descricao, categoria, horario_indicado) VALUES
('Panqueca de banana', 'Panqueca feita com banana e aveia.', 'Café da manhã', 'Manhã'),
('Arroz com legumes', 'Arroz acompanhado de legumes variados.', 'Almoço', 'Tarde'),
('Sanduíche natural', 'Sanduíche com vegetais e recheio de sua preferência.', 'Lanche', 'Tarde'),
('Sopa de legumes', 'Sopa preparada com legumes variados.', 'Jantar', 'Noite'),
('Salada de frutas', 'Mistura de frutas frescas.', 'Lanche', 'Manhã'),
('Suco verde detox', 'Suco refrescante de couve, limão, maçã e gengibre.', 'Bebida', 'Manhã');


CREATE TABLE IF NOT EXISTS planejamentos (
    id_planejamento INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_refeicao INT NOT NULL,
    data_refeicao DATE NOT NULL,
    tipo_refeicao VARCHAR(50) NOT NULL,
    observacoes TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_refeicao)
        REFERENCES refeicoes(id_refeicao)
        ON DELETE RESTRICT
);

INSERT INTO planejamentos
(id_usuario, id_refeicao, data_refeicao, tipo_refeicao, observacoes) VALUES
(1, 1, '2026-11-02', 'Café da manhã', 'Refeição planejada para segunda-feira.'),
(1, 2, '2026-11-02', 'Almoço', 'Planejamento do almoço.'),
(2, 3, '2026-11-03', 'Lanche', 'Lanche da tarde.'),
(2, 4, '2026-11-03', 'Jantar', 'Planejamento do jantar.');


CREATE TABLE IF NOT EXISTS favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_refeicao INT NOT NULL,
    data_adicionado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_refeicao)
        REFERENCES refeicoes(id_refeicao)
        ON DELETE RESTRICT,

    UNIQUE (id_usuario, id_refeicao)
);

INSERT INTO favoritos (id_usuario, id_refeicao) VALUES
(1, 1),
(1, 5),
(2, 3),
(2, 4);


CREATE TABLE IF NOT EXISTS refeicoes_consumidas (
    id_consumo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_refeicao INT NOT NULL,
    data_consumo DATE NOT NULL,
    tipo_refeicao VARCHAR(50) NOT NULL,
    observacoes TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE RESTRICT,

    FOREIGN KEY (id_refeicao)
        REFERENCES refeicoes(id_refeicao)
        ON DELETE RESTRICT
);

INSERT INTO refeicoes_consumidas
(id_usuario, id_refeicao, data_consumo, tipo_refeicao, observacoes) VALUES
(1, 1, '2026-10-28', 'Café da manhã', 'Refeição registrada.'),
(1, 2, '2026-10-28', 'Almoço', 'Almoço registrado.'),
(2, 3, '2026-10-29', 'Lanche', 'Lanche registrado.'),
(2, 4, '2026-10-29', 'Jantar', 'Jantar registrado.');


CREATE TABLE IF NOT EXISTS sugestoes (
    id_sugestao INT AUTO_INCREMENT PRIMARY KEY,
    id_refeicao INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativa BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_refeicao)
        REFERENCES refeicoes(id_refeicao)
        ON DELETE RESTRICT
);

INSERT INTO sugestoes (id_refeicao, titulo, descricao, ativa) VALUES
(1, 'Sugestão para começar o dia', 'Experimente uma panqueca de banana no café da manhã.', TRUE),
(2, 'Ideia para o almoço', 'Confira esta opção de refeição com legumes.', TRUE),
(3, 'Opção para o lanche', 'Veja esta sugestão de sanduíche natural.', TRUE),
(5, 'Sugestão de lanche leve', 'Experimente uma salada de frutas.', TRUE);
