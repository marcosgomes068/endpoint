import os
import sqlite3
import pandas as pd
from datetime import datetime

# Caminho do banco de dados
DB_PATH = '../historico_conversas.db'
# Caminho do arquivo Excel de saída
EXCEL_DIR = os.path.dirname(__file__)
EXCEL_PATH = os.path.join(EXCEL_DIR, 'vendas_confirmadas.xlsx')

def exportar_vendas_confirmadas():
    # Garante que a pasta exl/ existe
    if not os.path.exists(EXCEL_DIR):
        os.makedirs(EXCEL_DIR)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    hoje = datetime.now().strftime('%Y-%m-%d')
    # Busca mensagens marcadas como venda confirmada (exemplo: tag 'pagamento_aprovado')
    cursor.execute('''
        SELECT usuario, content, timestamp, tags
        FROM historico
        WHERE tags LIKE '%pagamento_aprovado%' AND DATE(timestamp) = ?
        ORDER BY timestamp ASC
    ''', (hoje,))
    rows = cursor.fetchall()
    vendas = []
    for usuario, content, timestamp, tags in rows:
        # Tenta extrair valor, produtos e quantidades do content (ajuste conforme seu formato)
        # Exemplo: "Pedido: Pizza Calabresa x2, Refrigerante x1 | Total: R$ 50.00"
        valor = ''
        produtos = ''
        quantidades = ''
        if 'Total:' in content:
            partes = content.split('Total:')
            produtos = partes[0].replace('Pedido:', '').strip()
            valor = partes[1].replace('R$', '').strip()
            # Extrai quantidades (opcional, depende do formato)
            quantidades = ', '.join([p.split('x')[1].strip() if 'x' in p else '1' for p in produtos.split(',')])
        vendas.append({
            'Data/Hora': timestamp,
            'Usuário': usuario,
            'Produtos': produtos,
            'Quantidades': quantidades,
            'Valor (R$)': valor
        })
    df = pd.DataFrame(vendas)
    df.to_excel(EXCEL_PATH, index=False)
    print(f'Exportação concluída: {EXCEL_PATH}')

if __name__ == '__main__':
    exportar_vendas_confirmadas()
