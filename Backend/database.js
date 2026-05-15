//Importar a biblioteca mqlite3 modo verbose dá mais detalhes de erros
const sqlite3 = require('sqlite3').verbose();

// Criar ou ligar a base de dados 
const db = new sqlite3.Database('./database.sqlite');

//executar comandos em sequência
db.serialize(() => {
    //Tabela de formulários
    db.run(`CREATE TABLE IF NOT EXISTS forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        status TEXT
    )
        
    `);

    //Tabela de campos de formulário
    db.run(`CREATE TABLE IF NOT EXISTS FormFields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        formId INTEGER, --Fk para FormTemplate
        type TEXT, -- Tipo do campo (label, radio, checkbox)
        label TEXT, -- Texto do campo;
        options TEXT, -- Opções para campos de escolha (JSON string)
        fieldOrder INTEGER, -- Ordem do campo no formulário
        required BOOLEAN,  -- 1 para obrigatório, 0 para opcional
         FOREIGN KEY (formId) REFERENCES forms(id)
        
    )
        
    `);

    //Tabela de submissões de formulários
    db.run(`CREATE TABLE IF NOT EXISTS FormSubmission (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        formId INTEGER, --Fk para submissão
        fieldId INTEGER, --Fk para campo
        value TEXT, -- Valor submetido (pode ser texto ou JSON string para campos de escolha)
        FOREIGN KEY (formId) REFERENCES forms(id)
     
    )
        `);

});


// Exportar a conexão com a base de dados para uso em outros arquivos
module.exports = db;