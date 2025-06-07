// server.js
// Endpoint fixo para webhook Mercado Pago
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// Endpoint para receber notificações do Mercado Pago
app.post('/webhook-mp', (req, res) => {
    // Apenas loga o body recebido (você pode adaptar para salvar/processar)
    console.log('Recebido webhook Mercado Pago:', req.body);
    // Opcional: salva o log em arquivo
    fs.appendFileSync(path.join(__dirname, 'webhook_log.txt'), JSON.stringify(req.body) + '\n');
    res.sendStatus(200);
});

// Endpoint de teste
app.get('/', (req, res) => {
    res.send('Webhook Mercado Pago ativo!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor webhook rodando na porta ${PORT}`);
});
