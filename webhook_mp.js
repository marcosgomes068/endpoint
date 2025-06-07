const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));

// Garantir que o diretório de logs existe
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir, { recursive: true });
}

// Função para registrar logs
function logEvent(data) {
    const timestamp = new Date().toISOString();
    const logFile = path.join(logsDir, `webhook-${new Date().toISOString().split('T')[0]}.log`);
    const logData = `${timestamp} - ${JSON.stringify(data)}\n`;
    
    fs.appendFile(logFile, logData, (err) => {
        if (err) console.error('Erro ao registrar log:', err);
    });
}

// Processar diferentes tipos de eventos do Mercado Pago
function processarEvento(evento) {
    const { action, data } = evento;
    
    console.log(`Processando evento: ${action}`);
    
    switch(action) {
        case 'payment.created':
            console.log('Novo pagamento criado:', data);
            // Aqui você pode adicionar lógica para novos pagamentos
            return { status: 'processed', type: 'payment_created' };
            
        case 'payment.updated':
            console.log('Pagamento atualizado:', data);
            // Aqui você pode adicionar lógica para pagamentos atualizados
            return { status: 'processed', type: 'payment_updated' };
            
        case 'merchant_order.payment':
            console.log('Ordem de pagamento recebida:', data);
            // Aqui você pode adicionar lógica para ordens de pagamento
            return { status: 'processed', type: 'merchant_order' };
            
        default:
            console.log('Evento desconhecido:', action);
            return { status: 'unknown', type: action };
    }
}

// Rota principal
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Webhook Mercado Pago</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1 { color: #009ee3; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .status { padding: 20px; background-color: #e3f2fd; border-radius: 5px; }
                    .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Servidor de Webhook Mercado Pago</h1>
                    <div class="status">
                        <p><strong>Status:</strong> Ativo</p>
                        <p><strong>Endpoint:</strong> /webhook_mp</p>
                        <p>Este servidor está pronto para receber notificações do Mercado Pago.</p>
                    </div>
                    <div class="footer">
                        <p>Servidor iniciado em: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
        </html>
    `);
});

// Endpoint do webhook Mercado Pago
app.post('/webhook_mp', (req, res) => {
    console.log('Recebido webhook do Mercado Pago:', req.body);
    
    // Registrar o evento recebido
    logEvent(req.body);
    
    // Processar o evento
    const resultado = processarEvento(req.body);
    
    // Responder ao Mercado Pago
    res.status(200).json({ 
        status: 'success', 
        message: 'Webhook recebido com sucesso',
        processed: resultado
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor de webhook rodando na porta ${PORT}`);
    console.log(`URL do webhook: http://localhost:${PORT}/webhook_mp`);
});
