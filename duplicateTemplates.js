/**
 * Duplicate Bridge Template Generator - Complete Standalone Version
 * Handles all PDF/HTML template downloads for duplicate bridge
 */
class DuplicateTemplates {
    constructor() {
        this.initializeMovements();
    }

    initializeMovements() {
        if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
            this.movements = ENHANCED_MOVEMENTS;
            console.log('✅ DuplicateTemplates: using enhanced movements -', Object.keys(this.movements).length, 'movements');
        } else {
            console.warn('⚠️ DuplicateTemplates: enhanced movements not yet loaded, using fallback');
            this.movements = {
                '4_howell_12': { pairs: 4, tables: 2, rounds: 6, totalBoards: 12, boardsPerRound: 2, type: 'howell', description: "2-table Howell, 12 boards, ~1.5 hrs", movement: [ { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] }, { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] }, { round: 2, table: 1, ns: 2, ew: 4, boards: [5,6] }, { round: 2, table: 2, ns: 3, ew: 1, boards: [7,8] }, { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10] }, { round: 3, table: 2, ns: 2, ew: 3, boards: [11,12] }, { round: 4, table: 1, ns: 4, ew: 3, boards: [1,2] }, { round: 4, table: 2, ns: 2, ew: 1, boards: [3,4] }, { round: 5, table: 1, ns: 1, ew: 3, boards: [5,6] }, { round: 5, table: 2, ns: 4, ew: 2, boards: [7,8] }, { round: 6, table: 1, ns: 3, ew: 2, boards: [9,10] }, { round: 6, table: 2, ns: 4, ew: 1, boards: [11,12] } ] },
                '6_howell_15': { pairs: 6, tables: 3, rounds: 5, totalBoards: 15, boardsPerRound: 3, type: 'howell', description: "3-table Howell, 15 boards, ~2 hrs", movement: [ { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] }, { round: 1, table: 2, ns: 3, ew: 4, boards: [10,11,12] }, { round: 1, table: 3, ns: 5, ew: 6, boards: [4,5,6] }, { round: 2, table: 1, ns: 1, ew: 4, boards: [4,5,6] }, { round: 2, table: 2, ns: 2, ew: 6, boards: [10,11,12] }, { round: 2, table: 3, ns: 3, ew: 5, boards: [7,8,9] }, { round: 3, table: 1, ns: 1, ew: 6, boards: [7,8,9] }, { round: 3, table: 2, ns: 4, ew: 5, boards: [1,2,3] }, { round: 3, table: 3, ns: 2, ew: 3, boards: [4,5,6] }, { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] }, { round: 4, table: 2, ns: 6, ew: 3, boards: [1,2,3] }, { round: 4, table: 3, ns: 4, ew: 2, boards: [7,8,9] }, { round: 5, table: 1, ns: 1, ew: 3, boards: [13,14,15] }, { round: 5, table: 2, ns: 5, ew: 2, boards: [13,14,15] }, { round: 5, table: 3, ns: 6, ew: 4, boards: [13,14,15] } ] },
                '8_howell_14': { pairs: 8, tables: 4, rounds: 7, totalBoards: 14, boardsPerRound: 2, type: 'howell', description: "4-table Howell, 14 boards, ~2 hrs", movement: [ { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] }, { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] }, { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] }, { round: 1, table: 4, ns: 7, ew: 8, boards: [9,10] }, { round: 2, table: 1, ns: 1, ew: 6, boards: [3,4] }, { round: 2, table: 2, ns: 7, ew: 3, boards: [5,6] }, { round: 2, table: 3, ns: 4, ew: 8, boards: [7,8] }, { round: 2, table: 4, ns: 2, ew: 5, boards: [11,12] }, { round: 3, table: 1, ns: 1, ew: 8, boards: [5,6] }, { round: 3, table: 2, ns: 2, ew: 7, boards: [7,8] }, { round: 3, table: 3, ns: 3, ew: 5, boards: [9,10] }, { round: 3, table: 4, ns: 6, ew: 4, boards: [13,14] }, { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] }, { round: 4, table: 2, ns: 6, ew: 2, boards: [9,10] }, { round: 4, table: 3, ns: 7, ew: 4, boards: [11,12] }, { round: 4, table: 4, ns: 8, ew: 3, boards: [1,2] }, { round: 5, table: 1, ns: 1, ew: 4, boards: [9,10] }, { round: 5, table: 2, ns: 8, ew: 6, boards: [11,12] }, { round: 5, table: 3, ns: 2, ew: 3, boards: [13,14] }, { round: 5, table: 4, ns: 5, ew: 7, boards: [3,4] }, { round: 6, table: 1, ns: 1, ew: 3, boards: [11,12] }, { round: 6, table: 2, ns: 5, ew: 8, boards: [13,14] }, { round: 6, table: 3, ns: 7, ew: 2, boards: [1,2] }, { round: 6, table: 4, ns: 4, ew: 6, boards: [5,6] }, { round: 7, table: 1, ns: 1, ew: 7, boards: [13,14] }, { round: 7, table: 2, ns: 4, ew: 5, boards: [1,2] }, { round: 7, table: 3, ns: 8, ew: 2, boards: [3,4] }, { round: 7, table: 4, ns: 3, ew: 6, boards: [7,8] } ] }
            };
            // Retry after scripts finish loading
            setTimeout(() => {
                if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
                    this.movements = ENHANCED_MOVEMENTS;
                    console.log('✅ DuplicateTemplates: movements reloaded on retry -', Object.keys(this.movements).length);
                }
            }, 500);
        }
    }

    /**
     * Show board templates popup - mobile friendly, uses all movements
     */
    showBoardTemplates() {
        this._showMovementPickerPopup(
            'boardTemplatesPopup',
            '🎴 Board Slips',
            'Select movement to generate slips:',
            (key, movement) => {
                this.downloadBoardTemplate(movement.totalBoards);
            }
        );
    }

    /**
     * Show traveler templates popup - mobile friendly, uses all movements
     */
    showTravelerTemplates() {
        this._showMovementPickerPopup(
            'travelerTemplatesPopup',
            '📊 Traveler Sheets',
            'Select movement to generate travelers:',
            (key, movement) => {
                this.downloadMovementTravelers(key, movement);
            }
        );
    }

    /**
     * Shared mobile-friendly movement picker popup
     */
    _showMovementPickerPopup(popupId, title, subtitle, onSelect) {
        const existing = document.getElementById(popupId);
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = popupId;
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000;
            display: flex; align-items: flex-start; justify-content: center;
            overflow-y: auto; -webkit-overflow-scrolling: touch;
            padding: 20px 0;
        `;

        // Sort by pair count then board count
        const sortedEntries = Object.entries(this.movements).sort((a, b) => {
            if (a[1].pairs !== b[1].pairs) return a[1].pairs - b[1].pairs;
            return a[1].totalBoards - b[1].totalBoards;
        });

        // Group by pair count
        const groups = {};
        sortedEntries.forEach(([key, mov]) => {
            if (!groups[mov.pairs]) groups[mov.pairs] = [];
            groups[mov.pairs].push({ key, mov });
        });

        const colors = ['#27ae60','#3498db','#e67e22','#9b59b6','#1abc9c',
                        '#e74c3c','#f39c12','#16a085','#8e44ad','#2980b9'];
        let colorIdx = 0;
        let groupHTML = '';

        Object.keys(groups).sort((a,b) => a-b).forEach(pairs => {
            groupHTML += `
                <div style="margin-bottom: 8px;">
                    <div style="font-size: 11px; color: #95a5a6; text-transform: uppercase;
                        letter-spacing: 1px; margin-bottom: 4px; padding-left: 2px;">
                        ${pairs} Pairs
                    </div>`;
            groups[pairs].forEach(({ key, mov }) => {
                const color = colors[colorIdx++ % colors.length];
                const sitOut = mov.hasSitOut ? ' ⚠️' : '';
                groupHTML += `
                    <button class="tmpl-pick-btn" data-key="${key}"
                        style="display:block; width:100%; padding:11px 14px;
                            margin-bottom:6px; border:none; border-radius:7px;
                            background:${color}; color:white;
                            font-size:14px; font-weight:600; cursor:pointer;
                            text-align:left; line-height:1.3;">
                        ${mov.description}${sitOut}
                    </button>`;
            });
            groupHTML += `</div>`;
        });

        popup.innerHTML = `
            <div style="background:white; border-radius:10px; width:88%; max-width:340px;
                padding:18px; color:#2c3e50; box-shadow:0 4px 20px rgba(0,0,0,0.4); margin:auto;">
                <div style="text-align:center; margin-bottom:14px;">
                    <h3 style="margin:0 0 3px 0; color:#2c3e50; font-size:16px;">${title}</h3>
                    <p style="margin:0; font-size:12px; color:#7f8c8d;">${subtitle}</p>
                </div>
                ${groupHTML}
                <button id="${popupId}_close" style="display:block; width:100%; padding:11px;
                    margin-top:8px; border:2px solid #bdc3c7; border-radius:7px;
                    background:white; color:#7f8c8d; font-size:14px; font-weight:600; cursor:pointer;">
                    ✕ Close
                </button>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelectorAll('.tmpl-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                popup.remove();
                onSelect(key, this.movements[key]);
            });
        });

        document.getElementById(`${popupId}_close`).addEventListener('click', () => popup.remove());
        popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
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
    downloadMovementTravelers(key, movement) {
        if (!movement) {
            // Legacy call with just pairCount number - try to find first matching movement
            movement = Object.values(this.movements).find(m => m.pairs === parseInt(key));
        }
        if (!movement) {
            alert(`Movement not available`);
            return;
        }

        let htmlContent = this.getHTMLHeader('Traveler Sheets - ' + movement.description);
        htmlContent += this.getTravelerStyles();
        
        const boardPairMap = this.getBoardPairMapping(movement);
        
        Object.keys(boardPairMap).sort((a,b) => parseInt(a) - parseInt(b)).forEach(boardNum => {
            const pairs = boardPairMap[boardNum];
            htmlContent += this.generateTravelerSheet(boardNum, pairs, movement.totalBoards);
        });
        
        htmlContent += '</body></html>';
        const safeName = (movement.description || key).replace(/[^a-z0-9]/gi, '-').toLowerCase();
        this.downloadFile(htmlContent, `bridge-travelers-${safeName}.html`);
    }

    /**
     * Generate a single traveler sheet with pre-filled pairs - Clean table format
     */
    generateTravelerSheet(boardNumber, pairInstances, totalBoards) {
        const vulnerability = this.getBoardVulnerability(boardNumber);
        const vulnDisplay = {
            'None': 'None Vulnerable',
            'NS': 'N-S Vulnerable', 
            'EW': 'E-W Vulnerable',
            'Both': 'Both Vulnerable'
        };
        
        const maxPair = Math.max(...pairInstances.flatMap(p => [p.ns, p.ew]));
        const tables = Math.ceil(maxPair / 2);
        const boardsTotal = totalBoards || this.getTotalBoardsForMovement(maxPair);
        
        let html = `
            <div class="traveler-sheet">
                <div class="header-title">${tables} table Bridge &bull; Board ${boardNumber} of ${boardsTotal} &bull; ${vulnDisplay[vulnerability]}</div>
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
     * Get total boards for a movement - uses actual movement data when available
     */
    getTotalBoardsForMovement(maxPair) {
        // Try to find a matching movement
        const match = Object.values(this.movements).find(m => m.pairs === maxPair);
        if (match) return match.totalBoards;
        // Basic fallback
        return maxPair * 2;
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
            container.remove();
        });
        
        console.log('Test buttons created. Click to test template generation.');
    }
    downloadMovementSheet(m){this.downloadHTML(this.buildMovementSheetHTML(m),`Movement-Sheet-${m.pairs}-Pairs.html`)}buildMovementSheetHTML(m){if(!m||!m.movement)return"<html><body>No data</body></html>";const r={};m.movement.forEach(e=>{if(!r[e.round])r[e.round]=[];r[e.round].push(e)});const t=[...new Set(m.movement.map(e=>e.table))].sort((a,b)=>a-b);let h="<tr><th>Round</th>";t.forEach(x=>h+=`<th>Table ${x}</th>`);h+="</tr>";Object.keys(r).sort((a,b)=>a-b).forEach(n=>{h+=`<tr><td>${n}</td>`;t.forEach(x=>{const e=r[n].find(y=>y.table===x);h+=e?`<td>NS:${e.ns}<br>EW:${e.ew}<br>${e.boards.join(",")}</td>`:"<td></td>"});h+="</tr>"});return`<html><head><title>${m.description}</title><style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#34495e;color:white}</style></head><body><h2>${m.description}</h2><table>${h}</table></body></html>`}downloadHTML(h,f){const b=new Blob([h],{type:"text/html"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=f;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
}

// Auto-create instance for standalone testing
if (typeof window !== 'undefined') {
    window.DuplicateTemplates = DuplicateTemplates;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.templateGenerator = new DuplicateTemplates();
            console.log('DuplicateTemplates ready.');
        });
    } else {
        window.templateGenerator = new DuplicateTemplates();
        console.log('DuplicateTemplates ready.');
    }

    // If enhanced-movements loads after us, reload our movements
    const _origEM = Object.getOwnPropertyDescriptor(window, 'ENHANCED_MOVEMENTS');
    Object.defineProperty(window, 'ENHANCED_MOVEMENTS', {
        set(value) {
            Object.defineProperty(window, 'ENHANCED_MOVEMENTS', { value, writable: true, configurable: true });
            if (window.templateGenerator) {
                window.templateGenerator.movements = value;
                console.log('✅ DuplicateTemplates: movements updated via setter');
            }
        },
        get() { return _origEM ? _origEM.value : undefined; },
        configurable: true
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateTemplates;
}