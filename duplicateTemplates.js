/**
 * Duplicate Bridge Template Generator - Complete Standalone Version
 * Handles all PDF/HTML template downloads for duplicate bridge
 */
class DuplicateTemplates {
    constructor() {
        this.movements = {
            4: {
                pairs: 4, tables: 2, rounds: 6, totalBoards: 12,
                description: "2-table Howell, 12 boards, ~2 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 2, table: 1, ns: 2, ew: 4, boards: [5,6] },
                    { round: 2, table: 2, ns: 3, ew: 1, boards: [7,8] },
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10] },
                    { round: 3, table: 2, ns: 2, ew: 3, boards: [11,12] },
                    { round: 4, table: 1, ns: 4, ew: 3, boards: [1,2] },
                    { round: 4, table: 2, ns: 2, ew: 1, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 3, boards: [5,6] },
                    { round: 5, table: 2, ns: 4, ew: 2, boards: [7,8] },
                    { round: 6, table: 1, ns: 3, ew: 2, boards: [9,10] },
                    { round: 6, table: 2, ns: 4, ew: 1, boards: [11,12] }
                ]
            },
            6: {
                pairs: 6, tables: 3, rounds: 5, totalBoards: 10,
                description: "3-table Howell, 10 boards, ~1.5 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [7,8] },
                    { round: 2, table: 2, ns: 5, ew: 2, boards: [9,10] },
                    { round: 2, table: 3, ns: 4, ew: 6, boards: [1,2] },
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [3,4] },
                    { round: 3, table: 2, ns: 6, ew: 3, boards: [5,6] },
                    { round: 3, table: 3, ns: 2, ew: 5, boards: [7,8] },
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [9,10] },
                    { round: 4, table: 2, ns: 2, ew: 4, boards: [1,2] },
                    { round: 4, table: 3, ns: 3, ew: 6, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 6, boards: [5,6] },
                    { round: 5, table: 2, ns: 3, ew: 5, boards: [7,8] },
                    { round: 5, table: 3, ns: 4, ew: 2, boards: [9,10] }
                ]
            },
            8: {
                pairs: 8, tables: 4, rounds: 7, totalBoards: 14,
                description: "4-table Howell, 14 boards, ~2.5 hours",
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [7,8] },
                    { round: 2, table: 1, ns: 1, ew: 6, boards: [9,10] },
                    { round: 2, table: 2, ns: 7, ew: 3, boards: [11,12] },
                    { round: 2, table: 3, ns: 4, ew: 8, boards: [13,14] },
                    { round: 2, table: 4, ns: 2, ew: 5, boards: [1,2] },
                    { round: 3, table: 1, ns: 1, ew: 8, boards: [3,4] },
                    { round: 3, table: 2, ns: 2, ew: 6, boards: [5,6] },
                    { round: 3, table: 3, ns: 3, ew: 5, boards: [7,8] },
                    { round: 3, table: 4, ns: 4, ew: 7, boards: [9,10] },
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [11,12] },
                    { round: 4, table: 2, ns: 8, ew: 4, boards: [13,14] },
                    { round: 4, table: 3, ns: 6, ew: 7, boards: [1,2] },
                    { round: 4, table: 4, ns: 2, ew: 3, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 7, boards: [5,6] },
                    { round: 5, table: 2, ns: 3, ew: 8, boards: [7,8] },
                    { round: 5, table: 3, ns: 5, ew: 4, boards: [9,10] },
                    { round: 5, table: 4, ns: 6, ew: 2, boards: [11,12] },
                    { round: 6, table: 1, ns: 1, ew: 4, boards: [13,14] },
                    { round: 6, table: 2, ns: 5, ew: 8, boards: [1,2] },
                    { round: 6, table: 3, ns: 7, ew: 2, boards: [3,4] },
                    { round: 6, table: 4, ns: 3, ew: 6, boards: [5,6] },
                    { round: 7, table: 1, ns: 1, ew: 3, boards: [7,8] },
                    { round: 7, table: 2, ns: 4, ew: 6, boards: [9,10] },
                    { round: 7, table: 3, ns: 8, ew: 5, boards: [11,12] },
                    { round: 7, table: 4, ns: 2, ew: 7, boards: [13,14] }
                ]
            }
        };
    }

    /**
     * Show board templates popup
     */
    showBoardTemplates() {
        const popup = this.createPopup('boardTemplatesPopup', 'Board Templates');
        popup.innerHTML = `
            <div class="popup-content">
                <h3 style="text-align: center; margin: 0 0 15px 0;">Board Templates</h3>
                <div style="text-align: center; margin: 15px 0;">
                    <button class="template-btn" data-action="download12Boards" style="background: #27ae60;">12 Boards (4 pairs)</button>
                    <button class="template-btn" data-action="download10Boards" style="background: #3498db;">10 Boards (6 pairs)</button>
                    <button class="template-btn" data-action="download14Boards" style="background: #e67e22;">14 Boards (8 pairs)</button>
                    <br><br>
                    <button class="template-btn" data-action="downloadMovement4" style="background: #9b59b6;">Movement (4 pairs)</button>
                    <button class="template-btn" data-action="downloadMovement6" style="background: #9b59b6;">Movement (6 pairs)</button>
                    <button class="template-btn" data-action="downloadMovement8" style="background: #9b59b6;">Movement (8 pairs)</button>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="template-btn" data-action="close" style="background: #e74c3c;">Close</button>
                </div>
            </div>
        `;
        
        this.setupEventDelegation(popup, this.handleBoardTemplateAction.bind(this));
    }

    /**
     * Show traveler templates popup
     */
    showTravelerTemplates() {
        const popup = this.createPopup('travelerTemplatesPopup', 'Traveler Sheets');
        popup.innerHTML = `
            <div class="popup-content">
                <h3 style="text-align: center; margin: 0 0 15px 0;">Movement-Specific Traveler Sheets</h3>
                <p style="text-align: center; margin-bottom: 20px; font-size: 13px; color: #7f8c8d;">
                    Pre-filled with correct pair numbers for each movement
                </p>
                <div style="text-align: center; margin: 15px 0;">
                    <button class="template-btn" data-action="downloadTraveler4" style="background: #27ae60;">4-Pair Travelers</button>
                    <button class="template-btn" data-action="downloadTraveler6" style="background: #3498db;">6-Pair Travelers</button>
                    <button class="template-btn" data-action="downloadTraveler8" style="background: #e67e22;">8-Pair Travelers</button>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="template-btn" data-action="close" style="background: #e74c3c;">Close</button>
                </div>
            </div>
        `;
        
        this.setupEventDelegation(popup, this.handleTravelerTemplateAction.bind(this));
    }

    /**
     * Generate board slips for printing
     */
    downloadBoardTemplate(numBoards) {
        let htmlContent = this.getHTMLHeader('Board Templates');
        htmlContent += `
            <style>
                .slip { 
                    border: 2px solid black; 
                    width: 200px; 
                    height: 120px; 
                    display: inline-block; 
                    margin: 5px; 
                    text-align: center; 
                    padding: 20px; 
                    vertical-align: top;
                    page-break-inside: avoid;
                }
                .vuln { color: red; font-weight: bold; }
                .not-vuln { color: blue; font-weight: bold; }
                .position { font-size: 24px; margin: 10px; }
            </style>
        `;
        
        for (let board = 1; board <= numBoards; board++) {
            const positions = ['N', 'E', 'S', 'W'];
            positions.forEach(position => {
                const isVuln = this.isPositionVulnerable(board, position);
                const vulnText = isVuln ? 'Vulnerable' : 'Not Vulnerable';
                const vulnClass = isVuln ? 'vuln' : 'not-vuln';
                
                htmlContent += `
                    <div class="slip">
                        <div style="font-size: 16px; font-weight: bold;">Board ${board}</div>
                        <div class="position ${vulnClass}">${position}</div>
                        <div class="${vulnClass}">${vulnText}</div>
                    </div>
                `;
            });
        }
        
        htmlContent += '</body></html>';
        this.downloadFile(htmlContent, `bridge-board-slips-${numBoards}boards.html`);
        this.closePopup('boardTemplatesPopup');
    }

    /**
     * Generate movement sheets for table directors
     */
    downloadMovementSheets(pairCount) {
        const movement = this.movements[pairCount];
        if (!movement) {
            alert(`Movement for ${pairCount} pairs not available`);
            return;
        }

        let htmlContent = this.getHTMLHeader('Movement Sheets');
        htmlContent += `
            <style>
                .table-sheet { 
                    border: 2px solid black; 
                    margin: 20px; 
                    page-break-after: always; 
                }
                .header { 
                    background: #2c3e50; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    font-size: 18pt; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 10px 0; 
                }
                th, td { 
                    border: 1px solid black; 
                    padding: 10px; 
                    text-align: center; 
                }
                th { 
                    background: #34495e; 
                    color: white; 
                }
                .ns { color: #27ae60; font-weight: bold; }
                .ew { color: #e74c3c; font-weight: bold; }
            </style>
        `;

        for (let tableNum = 1; tableNum <= movement.tables; tableNum++) {
            const tableMovement = movement.movement.filter(entry => entry.table === tableNum);
            
            htmlContent += `
                <div class="table-sheet">
                    <div class="header">TABLE ${tableNum} MOVEMENT GUIDE</div>
                    <p style="text-align: center;"><strong>Post this sheet at Table ${tableNum}</strong></p>
                    <table>
                        <tr>
                            <th>Round</th>
                            <th>North-South</th>
                            <th>East-West</th>
                            <th>Boards</th>
                            <th>Next Movement</th>
                        </tr>
            `;
            
            tableMovement.forEach((entry, index) => {
                const boardRange = entry.boards.length > 1 ? 
                    `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : 
                    entry.boards[0];
                
                let nextMove = 'Tournament Complete!';
                if (index < tableMovement.length - 1) {
                    const nsNext = this.findNextTable(movement, entry.ns, entry.round + 1);
                    const ewNext = this.findNextTable(movement, entry.ew, entry.round + 1);
                    nextMove = `NS ${entry.ns} → Table ${nsNext} | EW ${entry.ew} → Table ${ewNext}`;
                }
                
                htmlContent += `
                    <tr>
                        <td><strong>Round ${entry.round}</strong></td>
                        <td class="ns">Pair ${entry.ns}</td>
                        <td class="ew">Pair ${entry.ew}</td>
                        <td>Boards ${boardRange}</td>
                        <td style="font-size: 10pt">${nextMove}</td>
                    </tr>
                `;
            });
            
            htmlContent += '</table></div>';
        }
        
        htmlContent += '</body></html>';
        this.downloadFile(htmlContent, `bridge-movement-sheets-${pairCount}pairs.html`);
        this.closePopup('boardTemplatesPopup');
    }

    /**
     * Generate movement-specific traveler sheets
     */
    downloadMovementTravelers(pairCount) {
        const movement = this.movements[pairCount];
        if (!movement) {
            alert(`Movement for ${pairCount} pairs not available`);
            return;
        }

        let htmlContent = this.getHTMLHeader('Movement-Specific Traveler Sheets');
        htmlContent += this.getTravelerStyles();
        
        // Group boards by which pairs play them
        const boardPairMap = this.getBoardPairMapping(movement);
        
        Object.keys(boardPairMap).sort((a,b) => parseInt(a) - parseInt(b)).forEach(boardNum => {
            const pairs = boardPairMap[boardNum];
            htmlContent += this.generateTravelerSheet(boardNum, pairs);
        });
        
        htmlContent += '</body></html>';
        this.downloadFile(htmlContent, `bridge-travelers-${pairCount}pairs.html`);
        this.closePopup('travelerTemplatesPopup');
    }

    /**
     * Generate a single traveler sheet with pre-filled pairs - Clean table format
     */
    generateTravelerSheet(boardNumber, pairInstances) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        const vulnDisplay = {
            'None': 'None Vulnerable',
            'NS': 'N S Vulnerable', 
            'EW': 'E W Vulnerable',
            'Both': 'Both Vulnerable'
        };
        
        // Calculate total pairs for this movement to determine table count
        const maxPair = Math.max(...pairInstances.flatMap(p => [p.ns, p.ew]));
        const tables = Math.ceil(maxPair / 2);
        
        let html = `
            <div class="traveler-sheet">
                <div class="header-title">${tables} table Bridge Board number ${boardNumber} of ${this.getTotalBoardsForMovement(maxPair)} (${vulnDisplay[vulnerability]})</div>
                <table class="traveler-table">
                    <thead>
                        <tr>
                            <th>NS<br>pair</th>
                            <th>EW<br>pair</th>
                            <th>Bid</th>
                            <th>Suit</th>
                            <th>Declarer</th>
                            <th>Tricks</th>
                            <th>Plus</th>
                            <th>Minus</th>
                            <th>Score<br>NS</th>
                            <th>Score<br>EW</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Pre-fill with actual pair numbers from movement
        pairInstances.forEach(instance => {
            html += `
                <tr>
                    <td class="pair-cell">${instance.ns}</td>
                    <td class="pair-cell">${instance.ew}</td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="plus-cell">+</td>
                    <td class="minus-cell">-</td>
                    <td class="score-cell"></td>
                    <td class="score-cell"></td>
                </tr>
            `;
        });
        
        // Add empty rows to match standard traveler sheet length
        const emptyRowsNeeded = Math.max(0, 6 - pairInstances.length);
        for (let i = 0; i < emptyRowsNeeded; i++) {
            html += `
                <tr>
                    <td class="pair-cell"></td>
                    <td class="pair-cell"></td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="input-cell"></td>
                    <td class="plus-cell">+</td>
                    <td class="minus-cell">-</td>
                    <td class="score-cell"></td>
                    <td class="score-cell"></td>
                </tr>
            `;
        }
        
        html += '</tbody></table></div>';
        return html;
    }

    /**
     * Get mapping of boards to pair instances
     */
    getBoardPairMapping(movement) {
        const mapping = {};
        
        movement.movement.forEach(entry => {
            entry.boards.forEach(boardNum => {
                if (!mapping[boardNum]) mapping[boardNum] = [];
                mapping[boardNum].push({ ns: entry.ns, ew: entry.ew });
            });
        });
        
        return mapping;
    }

    /**
     * Generate button HTML for different input types
     */
    generateLevelButtons() {
        return Array.from({length: 7}, (_, i) => 
            `<span class="button">${i + 1}</span>`
        ).join('');
    }

    generateSuitButtons() {
        return ['♣', '♦', '♥', '♠', 'NT'].map(suit => 
            `<span class="button">${suit}</span>`
        ).join('');
    }

    generateDeclarerButtons() {
        return ['N', 'S', 'E', 'W'].map(pos => 
            `<span class="button">${pos}</span>`
        ).join('');
    }

    generateDoubleButtons() {
        return ['—', 'X', 'XX'].map(dbl => 
            `<span class="button">${dbl}</span>`
        ).join('');
    }

    generateResultButtons() {
        return ['=', '+', '−'].map(res => 
            `<span class="button">${res}</span>`
        ).join('');
    }

    generateNumberButtons() {
        return ['—', ...Array.from({length: 7}, (_, i) => `${i + 1}`)].map(num => 
            `<span class="button">${num}</span>`
        ).join('');
    }

    /**
     * Get board vulnerability using standard duplicate cycle
     */
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None', 'NS', 'EW', 'Both', 'EW', 'Both', 'None', 'NS', 
                      'NS', 'EW', 'Both', 'None', 'Both', 'None', 'NS', 'EW'];
        return vulns[cycle];
    }

    /**
     * Check if a position is vulnerable
     */
    isPositionVulnerable(boardNumber, position) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        
        if (vulnerability === 'None') return false;
        if (vulnerability === 'Both') return true;
        
        const isNS = position === 'N' || position === 'S';
        
        if (vulnerability === 'NS') return isNS;
        if (vulnerability === 'EW') return !isNS;
        
        return false;
    }

    /**
     * Find next table for a pair in movement
     */
    findNextTable(movement, pairNum, nextRound) {
        const nextEntry = movement.movement.find(entry => 
            entry.round === nextRound && (entry.ns === pairNum || entry.ew === pairNum)
        );
        return nextEntry ? nextEntry.table : '?';
    }

    /**
     * Get HTML header with common styles
     */
    getHTMLHeader(title) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bridge-Modes ${title}</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 10pt; 
                        margin: 20px; 
                    }
                    @media print {
                        body { margin: 10px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Bridge-Modes ${title}</h1>
                <p class="no-print">© 2025 Bridge-Modes App | <strong>Right-click → Print → Save as PDF</strong></p>
        `;
    }

    /**
     * Get traveler-specific styles - Clean table format
     */
    getTravelerStyles() {
        return `
            <style>
                .traveler-sheet { 
                    border: 2px solid black; 
                    margin: 20px 0; 
                    page-break-after: always;
                    width: 100%;
                    box-sizing: border-box;
                }
                .header-title { 
                    border: 1px solid black;
                    padding: 10px; 
                    text-align: center; 
                    font-weight: bold; 
                    font-size: 14pt;
                    background: white;
                    margin: 0;
                }
                .traveler-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 0;
                }
                .traveler-table th, .traveler-table td { 
                    border: 1px solid black; 
                    padding: 8px 4px; 
                    text-align: center; 
                    vertical-align: middle;
                    font-size: 11pt;
                    height: 25px;
                }
                .traveler-table th { 
                    background: white; 
                    color: black; 
                    font-size: 10pt; 
                    font-weight: bold;
                    line-height: 1.2;
                }
                .pair-cell {
                    font-weight: bold;
                    background: white;
                    width: 40px;
                }
                .input-cell {
                    background: white;
                    width: 60px;
                    min-height: 25px;
                }
                .plus-cell {
                    background: white;
                    width: 30px;
                    font-weight: bold;
                }
                .minus-cell {
                    background: white;
                    width: 30px;
                    font-weight: bold;
                }
                .score-cell {
                    width: 50px;
                    background: white;
                    min-height: 25px;
                }
                @media print {
                    .traveler-sheet { 
                        margin: 10px 0; 
                        page-break-after: always;
                    }
                    .header-title {
                        font-size: 12pt;
                    }
                    .traveler-table th, .traveler-table td {
                        font-size: 10pt;
                        padding: 6px 3px;
                    }
                }
            </style>
        `;
    }

    /**
     * Get total boards for a movement based on pair count
     */
    getTotalBoardsForMovement(maxPair) {
        if (maxPair <= 4) return 12;
        if (maxPair <= 6) return 10;
        if (maxPair <= 8) return 14;
        return 16; // Default fallback
    }

    /**
     * Handle board template actions
     */
    handleBoardTemplateAction(action) {
        const actionMap = {
            'download12Boards': () => this.downloadBoardTemplate(12),
            'download10Boards': () => this.downloadBoardTemplate(10),
            'download14Boards': () => this.downloadBoardTemplate(14),
            'downloadMovement4': () => this.downloadMovementSheets(4),
            'downloadMovement6': () => this.downloadMovementSheets(6),
            'downloadMovement8': () => this.downloadMovementSheets(8),
            'close': () => this.closePopup('boardTemplatesPopup')
        };

        if (actionMap[action]) {
            actionMap[action]();
        }
    }

    /**
     * Handle traveler template actions
     */
    handleTravelerTemplateAction(action) {
        const actionMap = {
            'downloadTraveler4': () => this.downloadMovementTravelers(4),
            'downloadTraveler6': () => this.downloadMovementTravelers(6),
            'downloadTraveler8': () => this.downloadMovementTravelers(8),
            'close': () => this.closePopup('travelerTemplatesPopup')
        };

        if (actionMap[action]) {
            actionMap[action]();
        }
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename) {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`Downloaded: ${filename}`);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    /**
     * Create popup element
     */
    createPopup(id, title) {
        // Remove existing popup if present
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = id;
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popupContent.style.cssText = `
            background: white; padding: 20px; border-radius: 8px; 
            max-width: 90%; max-height: 85%; overflow-y: auto; 
            color: #2c3e50; min-width: 300px;
        `;
        
        popup.appendChild(popupContent);
        document.body.appendChild(popup);
        
        // Add common button styles
        const style = document.createElement('style');
        style.textContent = `
            .template-btn {
                color: white; 
                border: none; 
                padding: 12px 16px; 
                border-radius: 4px; 
                margin: 5px;
                cursor: pointer; 
                font-size: 13px; 
                font-weight: bold;
                min-height: 44px; 
                min-width: 120px;
                touch-action: manipulation; 
                user-select: none;
            }
            .template-btn:hover { opacity: 0.9; }
            .template-btn:active { transform: scale(0.98); }
        `;
        document.head.appendChild(style);
        
        return popupContent;
    }

    /**
     * Setup event delegation for popup buttons
     */
    setupEventDelegation(popup, handler) {
        popup.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action) {
                e.preventDefault();
                e.stopPropagation();
                
                // Visual feedback
                e.target.style.opacity = '0.7';
                setTimeout(() => {
                    e.target.style.opacity = '';
                    handler(action);
                }, 100);
            }
        });

        // Enhanced mobile support
        popup.addEventListener('touchend', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action) {
                e.preventDefault();
                e.stopPropagation();
                handler(action);
            }
        }, { passive: false });
    }

    /**
     * Close popup by ID
     */
    closePopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.remove();
            console.log(`Closed popup: ${popupId}`);
        }
    }

    /**
     * Test function to create demo buttons for standalone testing
     */
    createTestButtons() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed; 
            top: 20px; 
            right: 20px; 
            z-index: 2000;
            background: rgba(255,255,255,0.9);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        container.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Template Test</h4>
            <button id="testBoardBtn" style="display: block; margin: 5px 0; padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">Board Templates</button>
            <button id="testTravelerBtn" style="display: block; margin: 5px 0; padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Traveler Sheets</button>
            <button id="closeTestBtn" style="display: block; margin: 5px 0; padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Close Test</button>
        `;
        
        document.body.appendChild(container);
        
        // Add event listeners
        document.getElementById('testBoardBtn').addEventListener('click', () => {
            this.showBoardTemplates();
        });
        
        document.getElementById('testTravelerBtn').addEventListener('click', () => {
            this.showTravelerTemplates();
        });
        
        document.getElementById('closeTestBtn').addEventListener('click', () => {
        document.getElementById('closeTestBtn').addEventListener('click', () => {
            container.remove();
        });
        
        console.log('Test buttons created. Click to test template generation.');
    }
    
    /**
     * Download movement sheet as HTML
     */
    downloadMovementSheet(movement) {
        const html = this.buildMovementSheetHTML(movement);
        this.downloadHTML(html, `Movement-Sheet-${movement.pairs}-Pairs.html`);
    }
    /**
     * Download movement sheet as HTML
     * This is a placeholder - movement generation is done in duplicate.js
     */
    downloadMovementSheet(movement) {
        const html = this.buildMovementSheetHTML(movement);
        this.downloadHTML(html, `Movement-Sheet-${movement.pairs}-Pairs.html`);
    }
    
    /**
     * Build movement sheet HTML
     */
    buildMovementSheetHTML(movement) {
        if (!movement || !movement.movement) {
            return '<html><body><p>Movement data not available</p></body></html>';
        }
        
        // Group by round
        const rounds = {};
        movement.movement.forEach(entry => {
            if (!rounds[entry.round]) {
                rounds[entry.round] = [];
            }
            rounds[entry.round].push(entry);
        });
        
        // Get all table numbers
        const tableNumbers = [...new Set(movement.movement.map(e => e.table))].sort((a, b) => a - b);
        
        // Build table HTML
        let tableHTML = '<tr style="background: #34495e; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">Round</th>';
        tableNumbers.forEach(table => {
            tableHTML += `<th style="padding: 10px; border: 1px solid #ddd;">Table ${table}</th>`;
        });
        tableHTML += '</tr>';
        
        // Add rows for each round
        Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
            const roundEntries = rounds[round];
            tableHTML += `<tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: center;">${round}</td>`;
            
            tableNumbers.forEach(table => {
                const entry = roundEntries.find(e => e.table === table);
                if (entry) {
                    const boards = entry.boards.join(', ');
                    tableHTML += `
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                            <div style="color: #27ae60; font-weight: 600;">NS: ${entry.ns}</div>
                            <div style="color: #e74c3c; font-weight: 600;">EW: ${entry.ew}</div>
                            <div style="color: #7f8c8d; font-size: 12px;">Boards: ${boards}</div>
                        </td>
                    `;
                } else {
                    tableHTML += '<td style="padding: 10px; border: 1px solid #ddd;"></td>';
                }
            });
            tableHTML += '</tr>';
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${movement.description} - Movement Sheet</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            padding: 30px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        @media print {
            body { padding: 10px; background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${movement.description}</h1>
        <p class="subtitle">${movement.pairs} pairs • ${movement.tables} tables • ${movement.rounds} rounds</p>
        
        <table>
            ${tableHTML}
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background: #e8f4f8; border-radius: 6px;">
            <strong>Movement Summary:</strong>
            <ul style="margin: 10px 0 0 20px;">
                <li>Each pair plays ${movement.totalBoards} boards</li>
                <li>${movement.rounds} rounds of ${movement.boardsPerRound} boards each</li>
                <li>Estimated time: ${movement.description.match(/~(.+)/)?.[1] || '2 hours'}</li>
            </ul>
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

// Auto-create instance for standalone testing
if (typeof window !== "undefined") {
    window.DuplicateTemplates = DuplicateTemplates;
    
    // Create test instance when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            window.templateGenerator = new DuplicateTemplates();
            console.log("DuplicateTemplates ready. Use templateGenerator.createTestButtons() to test.");
        });
    } else {
        window.templateGenerator = new DuplicateTemplates();
        console.log("DuplicateTemplates ready. Use templateGenerator.createTestButtons() to test.");
    }
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
    module.exports = DuplicateTemplates;
}
