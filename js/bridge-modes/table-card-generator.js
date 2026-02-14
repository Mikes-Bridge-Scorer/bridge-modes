/**
 * Table Card Generator V2 for Duplicate Bridge
 * Based on director.html template + Bridge Modes Calculator styling
 * Generates professional table cards matching your existing design
 */

class TableCardGenerator {
    constructor() {
        // Use Bridge Modes color scheme
        this.colors = {
            primary: '#2c3e50',
            secondary: '#34495e',
            accent: '#3498db',
            success: '#27ae60',
            danger: '#e74c3c',
            muted: '#bdc3c7',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        
        console.log('🎴 Table Card Generator V2 initialized');
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
        const physicalTables = Math.ceil(movement.tables);
        
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description} - Table Cards</title>
    <style>
        ${this.getTableCardCSS()}
    </style>
</head>
<body>
    <div class="no-print">
        <h2>Movement Cards - ${movement.description}</h2>
        <p><strong>Print Instructions:</strong> Use your browser's print function (Ctrl+P / Cmd+P)</p>
        <p><strong>Movement:</strong> ${movement.tables} tables × ${movement.rounds} rounds = ${movement.totalBoards} boards (${movement.boardsPerRound || 2} per round)</p>
        <p><strong>Tip:</strong> Print one card per table and place at each table for easy reference</p>
    </div>
    
    <div class="cards-container">
`;
        
        // Generate card for each table
        for (let tableNum = 1; tableNum <= physicalTables; tableNum++) {
            html += this.generateSingleTableCard(movement, tableNum);
        }
        
        html += `
    </div>
</body>
</html>`;
        
        return html;
    }
    
    /**
     * CSS for table cards - combines director.html layout with Bridge Modes colors
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
            padding: 20px;
            background: #f5f5f5;
        }
        
        .no-print {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .no-print h2 {
            color: ${this.colors.primary};
            margin-bottom: 10px;
        }
        
        .cards-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
        }
        
        .table-card {
            width: 280px;
            background: white;
            border: 3px solid ${this.colors.primary};
            border-radius: 10px;
            padding: 20px;
            page-break-inside: avoid;
            page-break-after: always;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid ${this.colors.primary};
        }
        
        .table-number {
            font-size: 72px;
            font-weight: bold;
            line-height: 1;
            color: ${this.colors.primary};
            margin-bottom: 10px;
        }
        
        .movement-info {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        
        .rounds-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .rounds-table th {
            background: ${this.colors.secondary};
            color: white;
            padding: 8px 4px;
            font-size: 12px;
            font-weight: bold;
            border: 1px solid ${this.colors.muted};
            text-align: center;
        }
        
        .rounds-table td {
            padding: 10px 6px;
            text-align: center;
            border: 1px solid ${this.colors.muted};
            font-size: 14px;
        }
        
        .rounds-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .round-number {
            font-weight: bold;
            font-size: 16px;
        }
        
        .ns-pair {
            color: ${this.colors.success};
            font-weight: 700;
        }
        
        .ew-pair {
            color: ${this.colors.danger};
            font-weight: 700;
        }
        
        .movement-instructions {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid ${this.colors.muted};
            font-size: 11px;
            line-height: 1.4;
        }
        
        .instructions-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 12px;
            color: ${this.colors.primary};
        }
        
        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid ${this.colors.muted};
            font-size: 10px;
            color: #999;
        }
        
        @media print {
            body { 
                padding: 0;
                background: white;
            }
            .no-print { display: none; }
            .cards-container {
                display: block;
            }
            .table-card {
                margin: 0 auto 20px;
                box-shadow: none;
                page-break-after: always;
            }
            .table-card:last-child {
                page-break-after: auto;
            }
        }
        
        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
            }
        }
        `;
    }
    
    /**
     * Generate a single table card
     */
    generateSingleTableCard(movement, tableNum) {
        const movementInstructions = this.generateMovementInstructions(movement, tableNum);
        
        let card = `
        <div class="table-card">
            <div class="card-header">
                <div class="table-number">${tableNum}</div>
                <div class="movement-info">
                    ${movement.description}<br>
                    Table ${tableNum}
                </div>
            </div>
            
            <table class="rounds-table">
                <thead>
                    <tr>
                        <th>Round</th>
                        <th>N/S</th>
                        <th>E/W</th>
                        <th>Boards</th>
                    </tr>
                </thead>
                <tbody>
`;
        
        // Get all rounds for this table
        const tableRounds = movement.movement
            .filter(entry => entry.table === tableNum)
            .sort((a, b) => a.round - b.round);
        
        tableRounds.forEach(round => {
            const boardsDisplay = this.formatBoardRange(round.boards);
            const nsClass = round.ns === 'Sit out' ? '' : 'ns-pair';
            const ewClass = round.ew === 'Sit out' ? '' : 'ew-pair';
            
            card += `
                    <tr>
                        <td class="round-number">${round.round}</td>
                        <td class="${nsClass}">${round.ns}</td>
                        <td class="${ewClass}">${round.ew}</td>
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
`;
        
        return card;
    }
    
    /**
     * Format board range for display
     */
    formatBoardRange(boards) {
        if (!boards || boards.length === 0) {
            return '—';
        }
        
        if (boards.length === 1) {
            return boards[0].toString();
        }
        
        // Check if consecutive
        const isConsecutive = boards.every((val, i, arr) => 
            i === 0 || val === arr[i-1] + 1
        );
        
        if (isConsecutive) {
            return `${boards[0]}-${boards[boards.length-1]}`;
        }
        
        return boards.join(', ');
    }
    
    /**
     * Generate movement instructions for Howell movements
     */
    generateMovementInstructions(movement, tableNum) {
        if (movement.type === 'mitchell') {
            return 'E/W move to next higher table. N/S remain stationary.';
        }
        
        // For Howell, track pair movements from this table
        const movements = [];
        const tableRounds = movement.movement
            .filter(entry => entry.table === tableNum)
            .sort((a, b) => a.round - b.round);
        
        for (let i = 0; i < tableRounds.length - 1; i++) {
            const currentRound = tableRounds[i];
            const nextRoundNum = currentRound.round + 1;
            
            // Find where NS pair goes next
            const nsNext = movement.movement.find(entry => 
                entry.round === nextRoundNum && 
                (entry.ns === currentRound.ns || entry.ew === currentRound.ns)
            );
            
            // Find where EW pair goes next
            const ewNext = movement.movement.find(entry => 
                entry.round === nextRoundNum && 
                (entry.ns === currentRound.ew || entry.ew === currentRound.ew)
            );
            
            if (nsNext && ewNext && currentRound.ns !== 'Sit out' && currentRound.ew !== 'Sit out') {
                const nsDestination = nsNext.ns === currentRound.ns ? 
                    `Table ${nsNext.table} N/S` : `Table ${nsNext.table} E/W`;
                const ewDestination = ewNext.ns === currentRound.ew ? 
                    `Table ${ewNext.table} N/S` : `Table ${ewNext.table} E/W`;
                
                movements.push(`Round ${currentRound.round}: N/S→${nsDestination}, E/W→${ewDestination}`);
            }
        }
        
        if (movements.length > 0) {
            return movements.join('<br>');
        }
        
        return 'See director for movement instructions';
    }
    
    /**
     * Generate Mitchell movement instructions
     */
    generateMitchellInstructions(movement) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description} - Instructions</title>
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

console.log('✅ Table Card Generator V2 loaded');
