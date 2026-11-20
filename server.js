// ==========================================================
// BACKEND NODE.JS + EXPRESS + SQLITE (PROJETO INTEGRADOR)
// Para rodar: npm init -y && npm install express cors sqlite3
// Depois execute: node server.js
// ==========================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conecta ao SQLite e executa o script database.sql
const db = new sqlite3.Database('./banco.sqlite', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco SQLite:', err.message);
    } else {
        console.log('Conectado ao SQLite com sucesso!');
        if (fs.existsSync('./database.sql')) {
            const sqlScript = fs.readFileSync('./database.sql', 'utf8');
            db.exec(sqlScript, (execErr) => {
                if (execErr) console.error('Erro ao executar database.sql:', execErr.message);
                else console.log('Tabelas e dados iniciais verificados via database.sql.');
            });
        }
    }
});

// ==========================================================
// 1. CONTROLADOR DE PRODUTO (CRUD)
// ==========================================================
const ProdutoController = {
    listar: (req, res) => {
        db.all('SELECT * FROM produtos', [], (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        });
    },
    criar: (req, res) => {
        const { nome, descricao, preco, codigo_barras } = req.body;
        const sql = 'INSERT INTO produtos (nome, descricao, preco, codigo_barras) VALUES (?, ?, ?, ?)';
        db.run(sql, [nome, descricao, preco, codigo_barras], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.status(201).json({ id: this.lastID, nome, descricao, preco, codigo_barras });
        });
    },
    atualizar: (req, res) => {
        const { nome, descricao, preco, codigo_barras } = req.body;
        const sql = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, codigo_barras = ? WHERE id = ?';
        db.run(sql, [nome, descricao, preco, codigo_barras, req.params.id], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.json({ mensagem: 'Produto atualizado com sucesso.' });
        });
    },
    deletar: (req, res) => {
        db.run('DELETE FROM produtos WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.json({ mensagem: 'Produto deletado com sucesso.' });
        });
    }
};

// ==========================================================
// 2. CONTROLADOR DE FORNECEDOR (CRUD)
// ==========================================================
const FornecedorController = {
    listar: (req, res) => {
        db.all('SELECT * FROM fornecedores', [], (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        });
    },
    criar: (req, res) => {
        const { nome, cnpj, endereco, contato } = req.body;
        const sql = 'INSERT INTO fornecedores (nome, cnpj, endereco, contato) VALUES (?, ?, ?, ?)';
        db.run(sql, [nome, cnpj, endereco, contato], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.status(201).json({ id: this.lastID, nome, cnpj, endereco, contato });
        });
    },
    atualizar: (req, res) => {
        const { nome, cnpj, endereco, contato } = req.body;
        const sql = 'UPDATE fornecedores SET nome = ?, cnpj = ?, endereco = ?, contato = ? WHERE id = ?';
        db.run(sql, [nome, cnpj, endereco, contato, req.params.id], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.json({ mensagem: 'Fornecedor atualizado com sucesso.' });
        });
    },
    deletar: (req, res) => {
        db.run('DELETE FROM fornecedores WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.json({ mensagem: 'Fornecedor deletado com sucesso.' });
        });
    }
};

// ==========================================================
// 3. CONTROLADOR DE ASSOCIAÇÃO PRODUTO / FORNECEDOR (N:N)
// ==========================================================
const AssociacaoController = {
    associar: (req, res) => {
        const { produto_id, fornecedor_id } = req.body;
        const sql = 'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)';
        db.run(sql, [produto_id, fornecedor_id], function (err) {
            if (err) return res.status(400).json({ erro: 'Associação já existe ou IDs inválidos.' });
            res.status(201).json({ mensagem: 'Associação criada com sucesso.' });
        });
    },
    desassociar: (req, res) => {
        const { produto_id, fornecedor_id } = req.params;
        const sql = 'DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?';
        db.run(sql, [produto_id, fornecedor_id], function (err) {
            if (err) return res.status(400).json({ erro: err.message });
            res.json({ mensagem: 'Associação removida com sucesso.' });
        });
    },
    fornecedoresPorProduto: (req, res) => {
        const sql = `
            SELECT f.* FROM fornecedores f
            INNER JOIN produto_fornecedor pf ON f.id = pf.fornecedor_id
            WHERE pf.produto_id = ?
        `;
        db.all(sql, [req.params.produto_id], (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        });
    },
    produtosPorFornecedor: (req, res) => {
        const sql = `
            SELECT p.* FROM produtos p
            INNER JOIN produto_fornecedor pf ON p.id = pf.produto_id
            WHERE pf.fornecedor_id = ?
        `;
        db.all(sql, [req.params.fornecedor_id], (err, rows) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(rows);
        });
    }
};

// ==========================================================
// ROTAS DA API REST
// ==========================================================
app.get('/', (req, res) => res.send('Servidor Node.js TechStock ativo!'));

// Rotas Produto
app.get('/produtos', ProdutoController.listar);
app.post('/produtos', ProdutoController.criar);
app.put('/produtos/:id', ProdutoController.atualizar);
app.delete('/produtos/:id', ProdutoController.deletar);

// Rotas Fornecedor
app.get('/fornecedores', FornecedorController.listar);
app.post('/fornecedores', FornecedorController.criar);
app.put('/fornecedores/:id', FornecedorController.atualizar);
app.delete('/fornecedores/:id', FornecedorController.deletar);

// Rotas Associação
app.post('/associacoes', AssociacaoController.associar);
app.delete('/associacoes/:produto_id/:fornecedor_id', AssociacaoController.desassociar);
app.get('/produtos/:produto_id/fornecedores', AssociacaoController.fornecedoresPorProduto);
app.get('/fornecedores/:fornecedor_id/produtos', AssociacaoController.produtosPorFornecedor);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/`);
});