// endpoint/api/webhook-mp.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Recebido webhook Mercado Pago:', req.body);
    res.status(200).json({ ok: true });
  } else {
    res.status(200).send('Webhook Mercado Pago ativo!');
  }
}
