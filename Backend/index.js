// Importar módulo do Node para trabalhar com ficheiros (ler/escrever JSON)
//const fs = require('fs');

// importar o Express framework backend
const express = require('express');

// Permite pedidos de outros domínios (frontend e backend)
const cors = require('cors');

// importar a base de dados 
const db = require('./database');

// Criar uma aplicação Express
const app = express();

//função para guardar historico de submissões em JSON (submissions.json)
const fs = require("fs");

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






//Criar endpoint
app.post("/status-history", (req, res) => {

  const newHistory = req.body;

  const filePath = "./statusHistory.json";

  let histories = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    histories = JSON.parse(data);
  }

  histories.push({
    ...newHistory,
    changedAt: new Date().toISOString()
  });

  fs.writeFileSync(
    filePath,
    JSON.stringify(histories, null, 2)
  );

  res.json({
    success: true,
    message: "Histórico guardado"
  });

});


// ==========================
// CONSULTAR HISTÓRICO
// ==========================
app.get("/status-history", (req, res) => {

  const filePath = "./statusHistory.json";

  // Se não existir
  if (!fs.existsSync(filePath)) {
    return res.json([]);
  }

  // Ler ficheiro
  const data = fs.readFileSync(filePath);

  // Converter JSON
  const histories = JSON.parse(data);

  // devolver histórico
  res.json(histories);

});









// ==========================
// SUBMETER FORMULÁRIO (GUARDAR EM JSON)
// ==========================
app.post('/submit', (req, res) => {

    // Este Json representa uma submissão de formulário, onde formId é o id do formulário submetido e answers é um array de respostas (fieldId e value)
    const { formId, answers } = req.body;

    // ==========================
    //  VALIDAÇÃO (ANTES DE GUARDAR)
    // ==========================

    // Verificar se existem respostas
    if (!answers || answers.length === 0) {
        return res.status(400).json({
            error: 'Respostas são obrigatórias'
        });
    }

    // Verificar cada resposta
    for (let answer of answers) {

        // Se valor estiver vazio ou undefined
        if (!answer.value || answer.value.trim() === '') {
            return res.status(400).json({
                error: `Campo ${answer.fieldId} é obrigatório`
            });
        }
    }

    // ==========================
    // CRIAR OBJETO DA SUBMISSÃO
    // ==========================
    const data = {
        formId: formId,
        answers: answers
    };

    // Array onde vamos guardar todas as submissões
    let existingData = [];

    // ==========================
    // VERIFICAR SE O FICHEIRO EXISTE
    // ==========================
    if (fs.existsSync('submissions.json')) {

        const file = fs.readFileSync('submissions.json');
        existingData = JSON.parse(file);
    }

    // ==========================
    // ADICIONAR NOVA SUBMISSÃO
    // ==========================
    existingData.push(data);

    // ==========================
    // GUARDAR NO JSON
    // ==========================
    fs.writeFileSync(
        'submissions.json',
        JSON.stringify(existingData, null, 2)
    );

    // ==========================
    // RESPOSTA
    // ==========================
    res.json({
        message: 'Submissão guardada no JSON com sucesso'
    });
});

// ==========================
// INICIAR SERVIDOR
// ==========================
app.listen(3000, () => {
    console.log('Servidor a correr em http://localhost:3000');
});
