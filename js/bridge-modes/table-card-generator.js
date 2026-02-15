/**
 * Table Card Generator - 3 CARDS PER ROW + COLOR PRINTING
 * Purple gradient headers + Movement instructions + Smaller size for A4 landscape
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
        
        console.log('🎴 Table Card Generator (3 per row) loaded');
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
            padding: 15px;
            background: #f5f5f5;
        }
        
        .no-print {
            margin-bottom: 15px;
            padding: 12px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .no-print h2 {
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 18px;
        }
        
        .no-print p {
            margin: 4px 0;
            color: #666;
            font-size: 13px;
        }
        
        .cards-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: flex-start;
        }
        
        .table-card {
            width: 240px;
            background: white;
            border: 2px solid #2c3e50;
            border-radius: 10px;
            overflow: hidden;
            page-break-inside: avoid;
            box-shadow: 0 3px 10px rgba(0,0,0,0.12);
            /* Force color printing */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            text-align: center;
            /* Force color printing */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        
        .movement-title {
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 6px;
            opacity: 0.95;
            letter-spacing: 0.5px;
        }
        
        .table-number {
            font-size: 40px;
            font-weight: 800;
            letter-spacing: -1px;
            margin: 4px 0;
        }
        
        .card-body {
            padding: 14px;
        }
        
        .rounds-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        
        .rounds-table th {
            background: #34495e;
            color: white;
            padding: 8px 4px;
            font-size: 11px;
            font-weight: 700;
            border: 1px solid #bdc3c7;
            text-align: center;
            /* Force color printing */
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        
        .rounds-table td {
            padding: 8px 6px;
            text-align: center;
            border: 1px solid #bdc3c7;
            font-size: 12px;
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
            padding-top: 10px;
            font-size: 9px;
            line-height: 1.4;
            color: #555;
        }
        
        .instructions-title {
            font-weight: 700;
            margin-bottom: 4px;
            font-size: 10px;
            color: #2c3e50;
        }
        
        .card-footer {
            text-align: center;
            padding: 10px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            font-size: 10px;
            color: #666;
            font-weight: 600;
        }
        
        @media print {
            @page {
                size: A4 landscape;
                margin: 10mm;
            }
            
            body { 
                padding: 0;
                background: white;
            }
            
            .no-print { 
                display: none; 
            }
            
            .cards-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8mm;
                justify-content: flex-start;
            }
            
            .table-card {
                width: 88mm;
                margin: 0;
                box-shadow: none;
                page-break-inside: avoid;
                /* Force color printing */
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .card-header {
                /* Force color printing */
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .rounds-table th {
                /* Force color printing */
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <h2>📋 Movement Cards - ${movement.description}</h2>
        <p><strong>Print Instructions:</strong> Make sure "Colour" is selected in print dialog</p>
        <p><strong>Layout:</strong> 3 cards per row on A4 landscape</p>
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
                            <th>Rd</th>
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
                    <div class="instructions-title">Movement Info</div>
                    ${movementInstructions}
                </div>
            </div>
            
            <div class="card-footer">
                Place at Table ${tableNum}
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
            return 'N/S stay. E/W move up one table.';
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
                    `R${currentRound.round}: ` +
                    `NS→T${nsNext.table}${nsPos}, ` +
                    `EW→T${ewNext.table}${ewPos}`
                );
            }
        }
        
        return movements.length > 0 ? 
            movements.join('<br>') : 
            'See director';
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
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
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
        @media print {
            @page { size: A4; margin: 15mm; }
            .mitchell-header {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
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
            </div>
            
            <div class="instruction-box ew-box">
                <h2>🔴 East-West (${movement.tables + 1}-${movement.pairs})</h2>
                <p class="big-instruction">MOVE UP ONE TABLE</p>
            </div>
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
    
    /**
     * Download table cards as HTML file
     */
    downloadTableCardsHTML(movement) {
        if (movement.type === 'mitchell') {
            // Build Mitchell instructions HTML
            const html = this.buildMitchellInstructionsHTML(movement);
            this.downloadHTML(html, `Mitchell-${movement.pairs}-Pairs-TableCards.html`);
        } else {
            // Build regular table cards HTML
            const html = this.buildTableCardsHTML(movement);
            this.downloadHTML(html, `Table-Cards-${movement.pairs}-Pairs.html`);
        }
    }
    
    /**
     * Build Mitchell instructions HTML (same as generateMitchellInstructions but returns HTML)
     */
    buildMitchellInstructionsHTML(movement) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description} - Movement Instructions</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 800px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 10px;
            font-size: 32px;
        }
        .subtitle {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 40px;
            font-size: 16px;
        }
        .instructions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .instruction-box {
            padding: 30px;
            border-radius: 8px;
            text-align: center;
        }
        .ns-box {
            background: linear-gradient(135deg, #e8f4f8 0%, #d4e9f2 100%);
            border: 3px solid #3498db;
        }
        .ew-box {
            background: linear-gradient(135deg, #fde8e8 0%, #fbd4d4 100%);
            border: 3px solid #e74c3c;
        }
        .instruction-box h2 {
            margin-bottom: 20px;
            font-size: 24px;
        }
        .big-instruction {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin: 15px 0;
        }
        @media print {
            body { padding: 20px; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${movement.description}</h1>
        <p class="subtitle">${movement.pairs} pairs • ${movement.tables} tables • ${movement.rounds} rounds</p>
        
        <div class="instructions-grid">
            <div class="instruction-box ns-box">
                <h2>🔵 North-South (1-${movement.tables})</h2>
                <p class="big-instruction">STAY AT YOUR TABLE</p>
            </div>
            
            <div class="instruction-box ew-box">
                <h2>🔴 East-West (${movement.tables + 1}-${movement.pairs})</h2>
                <p class="big-instruction">MOVE UP ONE TABLE</p>
            </div>
        </div>
    </div>
</body>
</html>`;
    }
    
    /**
     * Download HTML string as file
     */
    downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

if (typeof window !== 'undefined') {
    window.TableCardGenerator = TableCardGenerator;
    window.tableCardGenerator = new TableCardGenerator();
}

console.log('✅ Table Card Generator (3 per row + color) loaded');
