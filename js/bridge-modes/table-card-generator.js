/**
 * Table Card Generator for Duplicate Bridge
 * Generates printable table movement cards (6 per A4 page)
 * Matches Bridge Modes Calculator style system
 */

class TableCardGenerator {
    constructor() {
        // Use the same color scheme from styles.css
        this.colors = {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#3498db',
            success: '#27ae60',
            danger: '#e74c3c',
            muted: '#bdc3c7',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        console.log('🎴 Table Card Generator initialized');
    }
    
    /**
     * Generate table cards for a movement
     */
    generateTableCards(movement) {
        if (movement.type === 'mitchell') {
            return this.generateMitchellInstructions(movement);
        }
        
        const html = this.buildTableCardsHTML(movement);
        this.openPrintWindow(html, `Table-Cards-${movement.pairs}-Pairs`);
    }
    
    /**
     * Build complete HTML for table cards
     */
    buildTableCardsHTML(movement) {
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table Movement Cards - ${movement.pairs} Pairs</title>
    <style>
        ${this.getTableCardCSS()}
    </style>
</head>
<body>
    <div class="print-container">
`;
        
        // Generate card for each table
        for (let table = 1; table <= Math.floor(movement.tables); table++) {
            html += this.generateSingleTableCard(movement, table);
        }
        
        html += `
    </div>
</body>
</html>`;
        
        return html;
    }
    
    /**
     * CSS for table cards - matches app style
     */
    getTableCardCSS() {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            background: white;
            padding: 0;
            margin: 0;
        }
        
        .print-container {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            margin: 0 auto;
        }
        
        .table-card {
            width: 99mm;
            height: 140mm;
            display: inline-block;
            margin: 2mm;
            border: 2px solid ${this.colors.primary};
            border-radius: 8px;
            background: white;
            page-break-inside: avoid;
            vertical-align: top;
            overflow: hidden;
        }
        
        .card-header {
            background: ${this.colors.gradient};
            color: white;
            padding: 8px 10px;
            text-align: center;
        }
        
        .movement-title {
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 4px;
            opacity: 0.95;
            letter-spacing: -0.2px;
        }
        
        .table-number {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        
        .rounds-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
        }
        
        .rounds-table th,
        .rounds-table td {
            border: 1px solid ${this.colors.muted};
            padding: 6px 4px;
            text-align: center;
            font-size: 11px;
        }
        
        .rounds-table th {
            background: ${this.colors.secondary};
            color: white;
            font-weight: 700;
            font-size: 10px;
        }
        
        .round-col {
            width: 18%;
            font-weight: 700;
        }
        
        .ns-col {
            width: 22%;
            color: ${this.colors.success};
            font-weight: 700;
        }
        
        .ew-col {
            width: 22%;
            color: ${this.colors.danger};
            font-weight: 700;
        }
        
        .boards-col {
            width: 38%;
            font-weight: 600;
            font-size: 10px;
        }
        
        .card-footer {
            text-align: center;
            padding: 6px;
            font-size: 10px;
            color: ${this.colors.primary};
            font-weight: 600;
            border-top: 1px solid ${this.colors.muted};
            background: rgba(236, 240, 241, 0.3);
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .print-container {
                width: 210mm;
                padding: 10mm;
            }
            
            @page {
                size: A4;
                margin: 0;
            }
        }
        
        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
            }
            
            .print-container {
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
        }
        `;
    }
    
    /**
     * Generate a single table card
     */
    generateSingleTableCard(movement, tableNum) {
        const tableRounds = this.getTableRounds(movement, tableNum);
        
        return `
        <div class="table-card">
            <div class="card-header">
                <div class="movement-title">${movement.description}</div>
                <div class="table-number">TABLE ${tableNum}</div>
            </div>
            
            <table class="rounds-table">
                <thead>
                    <tr>
                        <th class="round-col">Round</th>
                        <th class="ns-col">N-S</th>
                        <th class="ew-col">E-W</th>
                        <th class="boards-col">Boards</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRounds.map(round => this.generateRoundRow(round)).join('')}
                </tbody>
            </table>
            
            <div class="card-footer">
                Place this card at Table ${tableNum}
            </div>
        </div>
        `;
    }
    
    /**
     * Get all rounds for a specific table
     */
    getTableRounds(movement, tableNum) {
        return movement.movement
            .filter(entry => entry.table === tableNum)
            .sort((a, b) => a.round - b.round);
    }
    
    /**
     * Generate a single round row
     */
    generateRoundRow(round) {
        const boardRange = round.boards.length > 1 ? 
            `${round.boards[0]}-${round.boards[round.boards.length-1]}` : 
            round.boards[0];
        
        return `
        <tr>
            <td class="round-col">${round.round}</td>
            <td class="ns-col">${round.ns}</td>
            <td class="ew-col">${round.ew}</td>
            <td class="boards-col">${boardRange}</td>
        </tr>
        `;
    }
    
    /**
     * Generate Mitchell movement instructions instead of table cards
     */
    generateMitchellInstructions(movement) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mitchell Movement Instructions</title>
    <style>
        ${this.getMitchellInstructionsCSS()}
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
                <h2>🔵 North-South Pairs (1-${movement.tables})</h2>
                <p class="big-instruction">STAY AT YOUR TABLE</p>
                <p>Do not move between rounds</p>
                <ul>
                    ${Array.from({length: movement.tables}, (_, i) => 
                        `<li>Pair ${i+1} → Table ${i+1}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="instruction-box ew-box">
                <h2>🔴 East-West Pairs (${movement.tables + 1}-${movement.pairs})</h2>
                <p class="big-instruction">MOVE UP ONE TABLE</p>
                <p>After each round, move to the next higher table</p>
                <p><strong>Table ${movement.tables} → Table 1</strong></p>
            </div>
        </div>
        
        <div class="boards-section">
            <h2>📋 Board Movement</h2>
            <p>Each table plays ${movement.boardsPerRound} boards per round</p>
            <p>Boards rotate between tables automatically</p>
        </div>
        
        <div class="summary-section">
            <h2>📊 Tournament Summary</h2>
            <table class="summary-table">
                <tr>
                    <td><strong>Tables:</strong></td>
                    <td>${movement.tables}</td>
                    <td><strong>Pairs:</strong></td>
                    <td>${movement.pairs}</td>
                </tr>
                <tr>
                    <td><strong>Rounds:</strong></td>
                    <td>${movement.rounds}</td>
                    <td><strong>Boards:</strong></td>
                    <td>${movement.totalBoards}</td>
                </tr>
                <tr>
                    <td><strong>Boards/Round:</strong></td>
                    <td>${movement.boardsPerRound}</td>
                    <td><strong>Time:</strong></td>
                    <td>~${Math.round(movement.totalBoards * 7.5 / 60 * 10) / 10} hours</td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
        
        this.openPrintWindow(html, `Mitchell-Instructions-${movement.pairs}-Pairs`);
    }
    
    /**
     * CSS for Mitchell instructions
     */
    getMitchellInstructionsCSS() {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            background: white;
            padding: 20mm;
        }
        
        .mitchell-container {
            max-width: 170mm;
            margin: 0 auto;
        }
        
        .mitchell-header {
            text-align: center;
            margin-bottom: 20px;
            padding: 20px;
            background: ${this.colors.gradient};
            color: white;
            border-radius: 12px;
        }
        
        .mitchell-header h1 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 8px;
        }
        
        .subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .instructions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .instruction-box {
            border: 2px solid ${this.colors.primary};
            border-radius: 10px;
            padding: 15px;
        }
        
        .instruction-box h2 {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .ns-box {
            border-color: ${this.colors.success};
        }
        
        .ns-box h2 {
            color: ${this.colors.success};
        }
        
        .ew-box {
            border-color: ${this.colors.danger};
        }
        
        .ew-box h2 {
            color: ${this.colors.danger};
        }
        
        .big-instruction {
            font-size: 18px;
            font-weight: 800;
            margin: 10px 0;
            text-align: center;
            padding: 10px;
            background: rgba(52, 152, 219, 0.05);
            border-radius: 6px;
        }
        
        .instruction-box p {
            margin: 8px 0;
            font-size: 13px;
        }
        
        .instruction-box ul {
            margin: 10px 0 0 20px;
            font-size: 12px;
        }
        
        .instruction-box li {
            margin: 4px 0;
        }
        
        .boards-section,
        .summary-section {
            border: 2px solid ${this.colors.muted};
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .boards-section h2,
        .summary-section h2 {
            font-size: 16px;
            font-weight: 700;
            color: ${this.colors.primary};
            margin-bottom: 10px;
        }
        
        .boards-section p {
            margin: 6px 0;
            font-size: 13px;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        
        .summary-table td {
            padding: 8px;
            border: 1px solid ${this.colors.muted};
            font-size: 13px;
        }
        
        .summary-table strong {
            color: ${this.colors.primary};
        }
        
        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
        }
        `;
    }
    
    /**
     * Open print window
     */
    openPrintWindow(html, filename) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print table cards');
            return;
        }
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        
        // Auto-print after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.TableCardGenerator = TableCardGenerator;
    window.tableCardGenerator = new TableCardGenerator();
}

console.log('✅ Table Card Generator loaded');
