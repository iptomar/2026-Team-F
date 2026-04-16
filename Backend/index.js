// importar o Express framework backend
const express = require('express');

// Permite pedidos de outros domínios (frontend e backend)
const cors = require('cors');

// importar a base de dados 
const db = require('./database');

// Criar uma aplicação Express
const app = express();

// Permite usar JSON no body das requests
app.use(express.json());

// Habilitar CORS
app.use(cors());


// ==========================
// ROTA TESTE
// ==========================
app.get('/api/test', (req, res) => {
    res.send('API funcionando!');
});


// ==========================
// CRIAR FORMULÁRIO
// ==========================
app.post('/forms', (req, res) => {

    const { name, description } = req.body;

    db.run(
        `INSERT INTO forms (name, description, status) VALUES (?, ?, ?)`,
        [name, description, 'draft'],
        function (err) {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                id: this.lastID,
                name,
                description,
                status: 'draft'
            });
        }
    );
});


// ==========================
// LISTAR FORMULÁRIOS
// ==========================
app.get('/forms', (req, res) => {

    db.all(`SELECT * FROM forms`, [], (err, rows) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// ==========================
// FILTRAR FORMULÁRIOS POR ESTADO
// ==========================
app.get('/forms/status/:status', (req, res) => {

    // Extrai o estado da URL (ex: draft, published)
    const { status } = req.params;

    // Query para buscar formulários com esse estado
    db.all(
        `SELECT * FROM forms WHERE status = ?`,
        [status], // valor seguro (evita SQL injection)
        (err, rows) => {

            // Se houver erro na base de dados
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Retorna os resultados filtrados
            res.json(rows);
        }
    );
});





// ==========================
// REMOVER FORMULÁRIO
// ==========================
app.delete('/forms/:id', (req, res) => {

    // FALTAVA ISTO
    const { id } = req.params;

    db.run(`DELETE FROM forms WHERE id = ?`, [id], function (err) {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Formulário não encontrado' });
        }

        res.json({ message: 'Formulário removido com sucesso' });
    });
});


app.get('/', (req, res) => {
    res.send('API a funcionar ');
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
    console.log('Servidor a correr em http://localhost:3000');
});