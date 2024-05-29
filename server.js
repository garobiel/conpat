const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Amoskate123*',
  database: 'conpat'
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');

  // Verifica se a tabela 'patrimonios' existe
  const checkTableQuery = `
    SELECT COUNT(*) AS count 
    FROM information_schema.tables 
    WHERE table_schema = 'conpat' 
    AND table_name = 'patrimonios'
  `;

  db.query(checkTableQuery, (err, results) => {
    if (err) {
      console.error('Erro ao verificar a tabela patrimonios:', err);
      return;
    }

    const tableExists = results[0].count > 0;

    if (tableExists) {
      console.log('Tabela patrimonios existente');
    } else {
      // Cria a tabela se não existir
      const createTableQuery = `
        CREATE TABLE patrimonios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          responsavel VARCHAR(255),
          usuario VARCHAR(255),
          dataCadastro DATE,
          matricula VARCHAR(255),
          matriculaAntiga VARCHAR(255),
          modelo VARCHAR(255),
          tipo VARCHAR(255),
          movimentacao VARCHAR(255),
          secretaria VARCHAR(255)
        )
      `;

      db.query(createTableQuery, (err, result) => {
        if (err) {
          console.error('Erro ao criar a tabela patrimonios:', err);
          return;
        }
        console.log('Tabela patrimonios criada com sucesso');
      });
    }
  });
});

// Middleware de autenticação básica
const authenticate = (req, res, next) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    next();
  } else {
    res.status(401).json({ message: 'Acesso negado' });
  }
};

// Rota para o login
app.post('/login', authenticate, (req, res) => {
  res.redirect('/index.html');
});

// Rota básica para a raiz do servidor
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login/tela', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login', 'tela.html'));
});

// Rota para cadastrar um novo patrimônio
app.post('/api/patrimonios', (req, res) => {
  const { responsavel, usuario, dataCadastro, matricula, matriculaAntiga, modelo, tipo, movimentacao, secretaria } = req.body;
  const query = 'INSERT INTO patrimonios (responsavel, usuario, dataCadastro, matricula, matriculaAntiga, modelo, tipo, movimentacao, secretaria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [responsavel, usuario, dataCadastro, matricula, matriculaAntiga, modelo, tipo, movimentacao, secretaria], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar patrimônio:', err);
      return res.status(500).send(err);
    }
    res.send('Patrimônio cadastrado com sucesso');
  });
});

// Rota para obter os patrimônios cadastrados
app.get('/api/patrimonios', (req, res) => {
  const query = 'SELECT * FROM patrimonios';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao obter patrimônios:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.use(express.static(path.join(__dirname, 'public')));

// Iniciar o servidor
if (require.main === module) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
