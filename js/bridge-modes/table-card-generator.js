/**
 * Table Card Generator - FINAL VERSION
 * Purple gradient headers + Movement instructions + Bridge Modes styling
 */

class TableCardGenerator {
    constructor() {
        this.colors = {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#3498db',
            success: '#27ae60',
            danger: '#e74c3c',
            muted: '#bdc3c7',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        console.log('🎴 Table Card Generator FINAL loaded');
    }
    
    generateTableCards(movement) {
        if (movement.type === 'mitchell') {
            return this.generateMitchellInstructions(movement);
        }
        
        const html = this.buildTableCardsHTML(movement);
        this.openPrintWindow(html, `Table-Cards-${movement.pairs}-Pairs`);
    }
    
    buildTableCardsHTML(movement) {
        const physicalTables = Math.ceil(movement.tables);
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description} - Table Cards</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .no-print {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .no-print h2 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 20px;
        }
        
        .no-print p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        
        .cards-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
        }
        
        .table-card {
            width: 340px;
            background: white;
            border: 2px solid #2c3e50;
            border-radius: 12px;
            overflow: hidden;
            page-break-inside: avoid;
            page-break-after: always;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .movement-title {
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 8px;
            opacity: 0.95;
            letter-spacing: 0.5px;
        }
        
        .table-number {
            font-size: 48px;
            font-weight: 800;
            letter-spacing: -1px;
            margin: 5px 0;
        }
        
        .card-body {
            padding: 20px;
        }
        
        .rounds-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .rounds-table th {
            background: #34495e;
            color: white;
            padding: 10px 6px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid #bdc3c7;
            text-align: center;
        }
        
        .rounds-table td {
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #bdc3c7;
            font-size: 13px;
        }
        
        .rounds-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .round-col {
            font-weight: 700;
            color: #2c3e50;
        }
        
        .ns-col {
            color: #27ae60;
            font-weight: 700;
        }
        
        .ew-col {
            color: #e74c3c;
            font-weight: 700;
        }
        
        .movement-instructions {
            border-top: 2px solid #e0e0e0;
            padding-top: 12px;
            font-size: 10px;
            line-height: 1.5;
            color: #555;
        }
        
        .instructions-title {
            font-weight: 700;
            margin-bottom: 6px;
            font-size: 11px;
            color: #2c3e50;
        }
        
        .card-footer {
            text-align: center;
            padding: 12px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            font-size: 11px;
            color: #666;
            font-weight: 600;
        }
        
        @media print {
            body { 
                padding: 0;
                background: white;
            }
            .no-print { display: none; }
            .cards-container { display: block; }
            .table-card {
                margin: 0 auto 20px;
                box-shadow: none;
                page-break-after: always;
            }
            .table-card:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <h2>📋 Movement Cards - ${movement.description}</h2>
        <p><strong>Print Instructions:</strong> Use Ctrl+P (Windows) or Cmd+P (Mac)</p>
        <p><strong>Movement:</strong> ${movement.tables} tables × ${movement.rounds} rounds = ${movement.totalBoards} boards</p>
        <p><strong>Tip:</strong> Print one card per table and place at each table</p>
    </div>
    
    <div class="cards-container">
`;
        
        for (let tableNum = 1; tableNum <= physicalTables; tableNum++) {
            html += this.generateSingleTableCard(movement, tableNum);
        }
        
        html += `
    </div>
</body>
</html>`;
        
        return html;
    }
    
    generateSingleTableCard(movement, tableNum) {
        const movementInstructions = this.generateMovementInstructions(movement, tableNum);
        const tableRounds = movement.movement
            .filter(entry => entry.table === tableNum)
            .sort((a, b) => a.round - b.round);
        
        let card = `
        <div class="table-card">
            <div class="card-header">
                <div class="movement-title">${movement.description}</div>
                <div class="table-number">TABLE ${tableNum}</div>
            </div>
            
            <div class="card-body">
                <table class="rounds-table">
                    <thead>
                        <tr>
                            <th>Round</th>
                            <th>N-S</th>
                            <th>E-W</th>
                            <th>Boards</th>
                        </tr>
                    </thead>
                    <tbody>
`;
        
        tableRounds.forEach(round => {
            const boardsDisplay = this.formatBoardRange(round.boards);
            
            card += `
                        <tr>
                            <td class="round-col">${round.round}</td>
                            <td class="ns-col">${round.ns}</td>
                            <td class="ew-col">${round.ew}</td>
                            <td>${boardsDisplay}</td>
                        </tr>
`;
        });
        
        card += `
                    </tbody>
                </table>
                
                <div class="movement-instructions">
                    <div class="instructions-title">Movement Information</div>
                    ${movementInstructions}
                </div>
            </div>
            
            <div class="card-footer">
                Place this card at Table ${tableNum}
            </div>
        </div>
`;
        
        return card;
    }
    
    formatBoardRange(boards) {
        if (!boards || boards.length === 0) return '—';
        if (boards.length === 1) return boards[0].toString();
        
        const isConsecutive = boards.every((val, i, arr) => 
            i === 0 || val === arr[i-1] + 1
        );
        
        return isConsecutive ? 
            `${boards[0]}-${boards[boards.length-1]}` : 
            boards.join(', ');
    }
    
    generateMovementInstructions(movement, tableNum) {
        if (movement.type === 'mitchell') {
            return 'N/S pairs remain at this table. E/W pairs move up one table each round.';
        }
        
        // Howell - detailed movement tracking
        const movements = [];
        const tableRounds = movement.movement
            .filter(entry => entry.table === tableNum)
            .sort((a, b) => a.round - b.round);
        
        for (let i = 0; i < tableRounds.length - 1; i++) {
            const currentRound = tableRounds[i];
            const nextRoundNum = currentRound.round + 1;
            
            if (currentRound.ns === 'Sit out' || currentRound.ew === 'Sit out') {
                continue;
            }
            
            // Find next positions for both pairs
            const nsNext = movement.movement.find(entry => 
                entry.round === nextRoundNum && 
                (entry.ns === currentRound.ns || entry.ew === currentRound.ns)
            );
            
            const ewNext = movement.movement.find(entry => 
                entry.round === nextRoundNum && 
                (entry.ns === currentRound.ew || entry.ew === currentRound.ew)
            );
            
            if (nsNext && ewNext) {
                const nsPos = nsNext.ns === currentRound.ns ? 'N/S' : 'E/W';
                const ewPos = ewNext.ns === currentRound.ew ? 'N/S' : 'E/W';
                
                movements.push(
                    `Round ${currentRound.round}: ` +
                    `N/S→Table ${nsNext.table} ${nsPos}, ` +
                    `E/W→Table ${ewNext.table} ${ewPos}`
                );
            }
        }
        
        return movements.length > 0 ? 
            movements.join('<br>') : 
            'See director for movement details';
    }
    
    generateMitchellInstructions(movement) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            background: white;
            padding: 20mm;
        }
        .mitchell-container { max-width: 170mm; margin: 0 auto; }
        .mitchell-header {
            text-align: center;
            margin-bottom: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
        }
        .mitchell-header h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .subtitle { font-size: 14px; opacity: 0.9; }
        .instructions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .instruction-box {
            border: 2px solid #2c3e50;
            border-radius: 10px;
            padding: 15px;
        }
        .instruction-box h2 { font-size: 16px; font-weight: 700; margin-bottom: 10px; }
        .ns-box { border-color: #27ae60; }
        .ns-box h2 { color: #27ae60; }
        .ew-box { border-color: #e74c3c; }
        .ew-box h2 { color: #e74c3c; }
        .big-instruction {
            font-size: 18px;
            font-weight: 800;
            margin: 10px 0;
            text-align: center;
            padding: 10px;
            background: rgba(52, 152, 219, 0.05);
            border-radius: 6px;
        }
        .boards-section, .summary-section {
            border: 2px solid #bdc3c7;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .summary-table td {
            padding: 8px;
            border: 1px solid #bdc3c7;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="mitchell-container">
        <div class="mitchell-header">
            <h1>${movement.description}</h1>
            <p class="subtitle">${movement.pairs} Pairs • ${movement.tables} Tables • ${movement.totalBoards} Boards</p>
        </div>
        
        <div class="instructions-grid">
            <div class="instruction-box ns-box">
                <h2>🔵 North-South (1-${movement.tables})</h2>
                <p class="big-instruction">STAY AT YOUR TABLE</p>
                <p>Do not move between rounds</p>
            </div>
            
            <div class="instruction-box ew-box">
                <h2>🔴 East-West (${movement.tables + 1}-${movement.pairs})</h2>
                <p class="big-instruction">MOVE UP ONE TABLE</p>
                <p>Table ${movement.tables} → Table 1</p>
            </div>
        </div>
        
        <div class="summary-section">
            <h2>Tournament Summary</h2>
            <table class="summary-table">
                <tr><td><strong>Tables:</strong> ${movement.tables}</td><td><strong>Pairs:</strong> ${movement.pairs}</td></tr>
                <tr><td><strong>Rounds:</strong> ${movement.rounds}</td><td><strong>Boards:</strong> ${movement.totalBoards}</td></tr>
            </table>
        </div>
    </div>
</body>
</html>`;
        
        this.openPrintWindow(html, `Mitchell-${movement.pairs}-Pairs`);
    }
    
    openPrintWindow(html, filename) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print table cards');
            return;
        }
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => printWindow.print(), 500);
    }
}

if (typeof window !== 'undefined') {
    window.TableCardGenerator = TableCardGenerator;
    window.tableCardGenerator = new TableCardGenerator();
}

console.log('✅ Table Card Generator FINAL loaded');
