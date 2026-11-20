-- ==========================================================
-- BANCO DE DADOS SQLITE - TECHSTOCK (PROJETO INTEGRADOR)
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    codigo_barras TEXT UNIQUE NOT NULL
);

-- 2. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    endereco TEXT,
    contato TEXT
);

-- 3. Tabela Associativa (Relação Muitos-para-Muitos N:N)
CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    PRIMARY KEY (produto_id, fornecedor_id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
);

-- ==========================================================
-- DADOS INICIAIS DE EXEMPLO (SEED)
-- ==========================================================

INSERT OR IGNORE INTO produtos (id, nome, descricao, preco, codigo_barras) VALUES 
(1, 'SSD NVMe 1TB Kingston', 'Leitura 3500MB/s M.2', 420.00, '7891000100101'),
(2, 'Memória RAM 16GB DDR4', '3200MHz CL16', 280.50, '7891000100102'),
(3, 'Fonte 650W 80 Plus Bronze', 'PFC Ativo Bivolt', 350.00, '7891000100103');

INSERT OR IGNORE INTO fornecedores (id, nome, cnpj, endereco, contato) VALUES 
(1, 'Distribuidora TechBrasil', '11.222.333/0001-44', 'Av. Paulista, 1000 - SP', '(11) 99999-1111'),
(2, 'MegaHardware Atacado', '55.666.777/0001-88', 'Rua das Indústrias, 500 - PR', '(41) 98888-2222');

INSERT OR IGNORE INTO produto_fornecedor (produto_id, fornecedor_id) VALUES 
(1, 1),
(1, 2),
(2, 1),
(3, 2);