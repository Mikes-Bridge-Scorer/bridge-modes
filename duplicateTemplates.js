/**
 * Duplicate Bridge Template Generator - Complete Standalone Version
 * Handles all PDF/HTML template downloads for duplicate bridge
 * PIXEL FIX: All popups use touchend + click handlers
 * SIT-OUT FIX: Correctly handles half-table Howell movements
 * TRAVELLER FIX: A4 landscape, 2 per page, much larger
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
            this.movements = {};
            setTimeout(() => {
                if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
                    this.movements = ENHANCED_MOVEMENTS;
                    console.log('✅ DuplicateTemplates: movements reloaded on retry -', Object.keys(this.movements).length);
                }
            }, 500);
        }
    }

    // ─── SHARED PIXEL-COMPATIBLE HANDLER ─────────────────────────────────────

    _addPixelHandler(btn, action) {
        if (!btn) return;
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            action();
        };
        btn.addEventListener('click', handler, { passive: false });
        btn.addEventListener('touchend', handler, { passive: false });
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.style.opacity = '0.7';
            setTimeout(() => { btn.style.opacity = '1'; }, 150);
        }, { passive: false });
    }

    // ─── POPUP ENTRY POINTS ───────────────────────────────────────────────────

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

    // ─── SHARED MOVEMENT PICKER ───────────────────────────────────────────────

    _showMovementPickerPopup(popupId, title, subtitle, onSelect) {
        const existing = document.getElementById(popupId);
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = popupId;
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 1000;
            display: flex; align-items: flex-start; justify-content: center;
            overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 20px 0;
        `;

        const sortedEntries = Object.entries(this.movements).sort((a, b) => {
            if (a[1].pairs !== b[1].pairs) return a[1].pairs - b[1].pairs;
            return a[1].totalBoards - b[1].totalBoards;
        });

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
            groupHTML += `<div style="margin-bottom:8px;">
                <div style="font-size:11px;color:#95a5a6;text-transform:uppercase;
                    letter-spacing:1px;margin-bottom:4px;">${pairs} Pairs</div>`;
            groups[pairs].forEach(({ key, mov }) => {
                const color = colors[colorIdx++ % colors.length];
                const sitOut = mov.hasSitOut ? ' ⚠️' : '';
                groupHTML += `
                    <button class="tmpl-pick-btn" data-key="${key}"
                        style="display:block;width:100%;padding:11px 14px;
                            margin-bottom:6px;border:none;border-radius:7px;
                            background:${color};color:white;font-size:14px;
                            font-weight:600;cursor:pointer;text-align:left;
                            line-height:1.3;min-height:44px;touch-action:manipulation;">
                        ${mov.description}${sitOut}
                    </button>`;
            });
            groupHTML += `</div>`;
        });

        popup.innerHTML = `
            <div style="background:white;border-radius:10px;width:88%;max-width:340px;
                padding:18px;color:#2c3e50;box-shadow:0 4px 20px rgba(0,0,0,0.4);margin:auto;">
                <div style="text-align:center;margin-bottom:14px;">
                    <h3 style="margin:0 0 3px 0;color:#2c3e50;font-size:16px;">${title}</h3>
                    <p style="margin:0;font-size:12px;color:#7f8c8d;">${subtitle}</p>
                </div>
                ${groupHTML}
                <button id="${popupId}_close" style="display:block;width:100%;padding:11px;
                    margin-top:8px;border:2px solid #bdc3c7;border-radius:7px;
                    background:white;color:#7f8c8d;font-size:14px;font-weight:600;
                    cursor:pointer;min-height:44px;touch-action:manipulation;">
                    ✕ Close
                </button>
            </div>
        `;

        document.body.appendChild(popup);

        // Pixel-compatible handlers for movement buttons
        popup.querySelectorAll('.tmpl-pick-btn').forEach(btn => {
            this._addPixelHandler(btn, () => {
                const key = btn.getAttribute('data-key');
                popup.remove();
                onSelect(key, this.movements[key]);
            });
        });

        this._addPixelHandler(
            document.getElementById(`${popupId}_close`),
            () => popup.remove()
        );
        popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
    }

    // ─── SIT-OUT DETECTION ────────────────────────────────────────────────────

    _getSitOutPair(movement) {
        if (!movement.hasSitOut) return null;
        const allPairs = movement.movement
            .flatMap(e => [e.ns, e.ew])
            .filter(p => p !== '' && typeof p === 'number');
        return Math.max(...allPairs); // pairs+1, e.g. 10 for 9-pair movement
    }

    _getMovementDescription(movement) {
        // Use actual table count from description, not Math.ceil(movement.tables)
        return movement.description.replace(/\s*\(.*?\)\s*/g, '').trim();
    }

    // ─── TRAVELLER SHEETS ─────────────────────────────────────────────────────

    downloadMovementTravelers(key, movement) {
        if (!movement) {
            movement = Object.values(this.movements).find(m => m.pairs === parseInt(key));
        }
        if (!movement) { alert('Movement not available'); return; }
        this._showTravelerOverlay(movement);
    }

    _showTravelerOverlay(movement) {
        const existing = document.getElementById('traveler-overlay');
        if (existing) existing.remove();

        const sitOutPair = this._getSitOutPair(movement);
        const boardPairMap = this._getBoardPairMapping(movement, sitOutPair);
        const boardNumbers = Object.keys(boardPairMap).sort((a, b) => parseInt(a) - parseInt(b));
        const desc = this._getMovementDescription(movement);

        // Build all traveler content
        let travelersHTML = '';
        for (let i = 0; i < boardNumbers.length; i += 2) {
            travelersHTML += '<div class="traveler-row">';
            travelersHTML += this._generateTravelerSheet(boardNumbers[i], boardPairMap[boardNumbers[i]], movement, sitOutPair);
            if (boardNumbers[i + 1]) {
                travelersHTML += this._generateTravelerSheet(boardNumbers[i + 1], boardPairMap[boardNumbers[i + 1]], movement, sitOutPair);
            }
            travelersHTML += '</div>';
        }

        const overlay = document.createElement('div');
        overlay.id = 'traveler-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f5f5f5;overflow-y:auto;font-family:Arial,sans-serif;';

        overlay.innerHTML = `
            <style>
                ${this._travelerInlineStyles()}
                #traveler-toolbar {
                    position: sticky; top: 0; z-index: 10;
                    background: #2c3e50; color: white;
                    padding: 12px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                #traveler-toolbar h2 { font-size: 16px; font-weight: 700; margin: 0; }
                .trav-btn {
                    border: none; border-radius: 6px; padding: 8px 14px;
                    font-size: 13px; font-weight: 600; cursor: pointer; margin-left: 8px;
                    touch-action: manipulation;
                }
                #trav-print-btn { background: #27ae60; color: white; }
                #trav-dl-btn    { background: #3498db; color: white; }
                #trav-close-btn { background: #e74c3c; color: white; }
                #traveler-content { padding: 12px; }
                @media print {
                    #traveler-toolbar { display: none !important; }
                    #traveler-overlay { position: static; overflow: visible; }
                    #traveler-content { padding: 0; }
                    @page { size: A4 landscape; margin: 8mm; }
                }
            </style>
            <div id="traveler-toolbar">
                <h2>📊 Traveler Sheets — ${desc}</h2>
                <div>
                    <button class="trav-btn" id="trav-print-btn">🖨️ Print</button>
                    <button class="trav-btn" id="trav-dl-btn">💾 Download</button>
                    <button class="trav-btn" id="trav-close-btn">✕ Close</button>
                </div>
            </div>
            <div id="traveler-content">${travelersHTML}</div>
        `;

        document.body.appendChild(overlay);

        const addPixelHandler = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const handler = (e) => { e.preventDefault(); e.stopPropagation(); action(); };
            btn.addEventListener('click', handler, { passive: false });
            btn.addEventListener('touchend', handler, { passive: false });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.style.opacity='0.7'; setTimeout(()=>{btn.style.opacity='1';},150); }, { passive: false });
        };

        addPixelHandler('trav-print-btn', () => window.print());
        addPixelHandler('trav-dl-btn', () => {
            let html = this._travelerHTMLHeader(movement);
            for (let i = 0; i < boardNumbers.length; i += 2) {
                html += '<div class="traveler-row">';
                html += this._generateTravelerSheet(boardNumbers[i], boardPairMap[boardNumbers[i]], movement, sitOutPair);
                if (boardNumbers[i + 1]) html += this._generateTravelerSheet(boardNumbers[i + 1], boardPairMap[boardNumbers[i + 1]], movement, sitOutPair);
                html += '</div>';
            }
            html += '</body></html>';
            const safeName = (movement.description || '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
            this._downloadFile(html, `bridge-travelers-${safeName}.html`);
        });
        addPixelHandler('trav-close-btn', () => overlay.remove());
    }

    _getBoardPairMapping(movement, sitOutPair) {
        const mapping = {};
        movement.movement.forEach(entry => {
            // Skip sit-out entries
            if (!entry.boards || entry.boards.length === 0) return;
            if (entry.ns === '' || entry.ns === sitOutPair || entry.ew === sitOutPair) return;

            entry.boards.forEach(boardNum => {
                if (!mapping[boardNum]) mapping[boardNum] = [];
                mapping[boardNum].push({ ns: entry.ns, ew: entry.ew });
            });
        });
        return mapping;
    }

    _travelerInlineStyles() {
        return `
            .traveler-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8mm;
                padding: 8mm;
                page-break-after: always;
                page-break-inside: avoid;
            }
            .traveler-sheet {
                border: 2px solid #2c3e50;
                border-radius: 4px;
                overflow: hidden;
            }
            .traveler-header {
                background: #2c3e50;
                color: white;
                padding: 6px 10px;
                text-align: center;
            }
            .traveler-header-brand { font-size: 11pt; font-weight: 800; }
            .traveler-header-url { font-size: 8.5pt; opacity: 0.85; margin-bottom: 3px; }
            .traveler-header-title { font-size: 13pt; font-weight: 800; margin: 2px 0; }
            .traveler-header-sub { font-size: 9pt; opacity: 0.9; }
            .vuln-badge {
                display: inline-block; padding: 2px 10px;
                border-radius: 10px; font-size: 8.5pt; font-weight: 700; margin-top: 3px;
            }
            .vuln-none { background: #95a5a6; color: white; }
            .vuln-ns   { background: #27ae60; color: white; }
            .vuln-ew   { background: #e74c3c; color: white; }
            .vuln-both { background: #f39c12; color: white; }
            .traveler-table { width: 100%; border-collapse: collapse; }
            .traveler-table th {
                background: #34495e; color: white; font-size: 9pt;
                font-weight: 700; padding: 6px 2px; text-align: center;
                border: 1px solid #2c3e50;
            }
            .traveler-table td {
                font-size: 11pt; padding: 6px 2px; text-align: center;
                border: 1px solid #bdc3c7; height: 32px;
            }
            .pair-cell { font-weight: 700; color: #2c3e50; background: #f8f9fa; }
            .ns-pair { color: #27ae60; }
            .ew-pair { color: #e74c3c; }
            .plus-cell { color: #27ae60; font-weight: 700; }
            .minus-cell { color: #e74c3c; font-weight: 700; }
            .traveler-table tr:nth-child(even) td { background: #f9f9f9; }
        `;
    }

    _travelerHTMLHeader(movement) {
        const desc = this._getMovementDescription(movement);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Traveler Sheets — ${desc}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: white; }

        .traveler-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8mm;
            padding: 8mm;
            page-break-after: always;
            page-break-inside: avoid;
        }

        .traveler-sheet {
            border: 2px solid #2c3e50;
            border-radius: 4px;
            overflow: hidden;
        }

        .traveler-header {
            background: #2c3e50;
            color: white;
            padding: 6px 10px;
            text-align: center;
        }
        .traveler-header-brand {
            font-size: 9pt;
            font-weight: 800;
            letter-spacing: 0.3px;
        }
        .traveler-header-url {
            font-size: 7.5pt;
            opacity: 0.85;
            margin-bottom: 3px;
        }
        .traveler-header-title {
            font-size: 11pt;
            font-weight: 800;
            margin: 2px 0;
        }
        .traveler-header-sub {
            font-size: 8.5pt;
            opacity: 0.9;
        }
        .vuln-badge {
            display: inline-block;
            padding: 1px 8px;
            border-radius: 10px;
            font-size: 8pt;
            font-weight: 700;
            margin-top: 3px;
        }
        .vuln-none { background: #95a5a6; color: white; }
        .vuln-ns   { background: #27ae60; color: white; }
        .vuln-ew   { background: #e74c3c; color: white; }
        .vuln-both { background: #f39c12; color: white; }

        .traveler-table {
            width: 100%;
            border-collapse: collapse;
        }
        .traveler-table th {
            background: #34495e;
            color: white;
            font-size: 9pt;
            font-weight: 700;
            padding: 6px 2px;
            text-align: center;
            border: 1px solid #2c3e50;
        }
        .traveler-table td {
            font-size: 11pt;
            padding: 6px 2px;
            text-align: center;
            border: 1px solid #bdc3c7;
            height: 32px;
        }
        .pair-cell { font-weight: 700; color: #2c3e50; background: #f8f9fa; }
        .ns-pair { color: #27ae60; }
        .ew-pair { color: #e74c3c; }
        .plus-cell { color: #27ae60; font-weight: 700; }
        .minus-cell { color: #e74c3c; font-weight: 700; }
        .traveler-table tr:nth-child(even) td { background: #f9f9f9; }

        @media print {
            @page { size: A4 landscape; margin: 8mm; }
            body { padding: 0; }
            .traveler-row { padding: 0; gap: 8mm; page-break-after: always; }
        }
    </style>
</head>
<body>`;
    }

    _generateTravelerSheet(boardNumber, pairInstances, movement, sitOutPair) {
        const vulnerability = this._getBoardVulnerability(parseInt(boardNumber));
        const vulnLabels = {
            'None': 'None Vulnerable',
            'NS': 'N-S Vulnerable',
            'EW': 'E-W Vulnerable',
            'Both': 'Both Vulnerable'
        };
        const vulnClasses = { 'None': 'vuln-none', 'NS': 'vuln-ns', 'EW': 'vuln-ew', 'Both': 'vuln-both' };
        const desc = this._getMovementDescription(movement);

        let rows = '';
        pairInstances.forEach(instance => {
            rows += `
                <tr>
                    <td class="pair-cell ns-pair">${instance.ns}</td>
                    <td class="pair-cell ew-pair">${instance.ew}</td>
                    <td></td><td></td><td></td><td></td>
                    <td class="plus-cell">+</td>
                    <td class="minus-cell">-</td>
                    <td></td><td></td>
                </tr>`;
        });

        // Pad to at least 6 rows
        const emptyRows = Math.max(0, 6 - pairInstances.length);
        for (let i = 0; i < emptyRows; i++) {
            rows += `<tr>
                <td class="pair-cell"></td><td class="pair-cell"></td>
                <td></td><td></td><td></td><td></td>
                <td class="plus-cell">+</td>
                <td class="minus-cell">-</td>
                <td></td><td></td>
            </tr>`;
        }

        return `
        <div class="traveler-sheet">
            <div class="traveler-header">
                <div class="traveler-header-brand">🃏 Bridge at Sea</div>
                <div class="traveler-header-url">bridgescorer.com</div>
                <div class="traveler-header-title">Board ${boardNumber} of ${movement.totalBoards}</div>
                <div class="traveler-header-sub">${desc}</div>
                <span class="vuln-badge ${vulnClasses[vulnerability]}">${vulnLabels[vulnerability]}</span>
            </div>
            <table class="traveler-table">
                <thead>
                    <tr>
                        <th>NS<br>Pair</th>
                        <th>EW<br>Pair</th>
                        <th>Bid</th>
                        <th>Suit</th>
                        <th>Decl</th>
                        <th>Tricks</th>
                        <th>Plus</th>
                        <th>Minus</th>
                        <th>Score<br>NS</th>
                        <th>Score<br>EW</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    }

    // ─── BOARD SLIPS ─────────────────────────────────────────────────────────

    downloadBoardTemplate(numBoards) {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Board Slips — ${numBoards} Boards</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 10mm; }
        .slips-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; }
        .slip {
            border: 2px solid #2c3e50; border-radius: 6px; padding: 8px;
            text-align: center; page-break-inside: avoid;
        }
        .slip-brand { font-size: 7pt; color: #666; margin-bottom: 3px; }
        .slip-board { font-size: 14pt; font-weight: 800; color: #2c3e50; }
        .slip-vuln { font-size: 9pt; font-weight: 700; margin: 4px 0; padding: 2px 6px; border-radius: 8px; display: inline-block; }
        .vuln-none { background: #95a5a6; color: white; }
        .vuln-ns   { background: #27ae60; color: white; }
        .vuln-ew   { background: #e74c3c; color: white; }
        .vuln-both { background: #f39c12; color: white; }
        @media print { @page { size: A4; margin: 10mm; } }
    </style>
</head>
<body>
<div class="slips-grid">`;

        for (let board = 1; board <= numBoards; board++) {
            const vuln = this._getBoardVulnerability(board);
            const vulnLabels = { 'None': 'None Vul', 'NS': 'N-S Vul', 'EW': 'E-W Vul', 'Both': 'Both Vul' };
            const vulnClasses = { 'None': 'vuln-none', 'NS': 'vuln-ns', 'EW': 'vuln-ew', 'Both': 'vuln-both' };
            html += `
            <div class="slip">
                <div class="slip-brand">🃏 Bridge at Sea • bridgescorer.com</div>
                <div class="slip-board">Board ${board}</div>
                <span class="slip-vuln ${vulnClasses[vuln]}">${vulnLabels[vuln]}</span>
            </div>`;
        }

        html += '</div></body></html>';
        this._downloadFile(html, `board-slips-${numBoards}-boards.html`);
    }

    // ─── MOVEMENT SHEET ───────────────────────────────────────────────────────

    downloadMovementSheet(movement) {
        this._downloadFile(this._buildMovementSheetHTML(movement),
            `Movement-Sheet-${movement.pairs}-Pairs.html`);
    }

    _buildMovementSheetHTML(movement) {
        if (!movement || !movement.movement) return '<html><body>No data</body></html>';

        const sitOutPair = this._getSitOutPair(movement);
        const rounds = {};
        movement.movement.forEach(entry => {
            if (!rounds[entry.round]) rounds[entry.round] = [];
            rounds[entry.round].push(entry);
        });
        const tables = [...new Set(movement.movement.map(e => e.table))].sort((a, b) => a - b);
        const desc = this._getMovementDescription(movement);

        let tableRows = '<tr><th>Round</th>';
        tables.forEach(t => { tableRows += `<th>Table ${t}</th>`; });
        tableRows += '</tr>';

        Object.keys(rounds).sort((a, b) => a - b).forEach(roundNum => {
            tableRows += `<tr><td><strong>Rd ${roundNum}</strong></td>`;
            tables.forEach(tableNum => {
                const entry = rounds[roundNum].find(e => e.table === tableNum);
                if (entry) {
                    const nsIsSitOut = sitOutPair && entry.ns === sitOutPair;
                    const ewIsSitOut = sitOutPair && entry.ew === sitOutPair;
                    const boardsText = entry.boards && entry.boards.length > 0
                        ? `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}`
                        : '—';
                    const nsText = nsIsSitOut ? '<span style="color:#856404">Sit Out</span>' : `<span style="color:#27ae60">${entry.ns}</span>`;
                    const ewText = ewIsSitOut ? '<span style="color:#856404">Sit Out</span>' : `<span style="color:#e74c3c">${entry.ew}</span>`;
                    tableRows += `<td>NS: ${nsText}<br>EW: ${ewText}<br><small>${boardsText}</small></td>`;
                } else {
                    tableRows += '<td>—</td>';
                }
            });
            tableRows += '</tr>';
        });

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Movement Sheet — ${desc}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 15mm; }
        .header { text-align: center; margin-bottom: 15px; }
        .brand { font-size: 11pt; font-weight: 800; color: #2c3e50; }
        .url { font-size: 9pt; color: #666; }
        h2 { color: #2c3e50; margin: 8px 0 4px; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #bdc3c7; padding: 6px 8px; text-align: center; font-size: 10pt; }
        th { background: #34495e; color: white; font-weight: 700; }
        tr:nth-child(even) td { background: #f9f9f9; }
        @media print { @page { size: A4 landscape; margin: 10mm; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">🃏 Bridge at Sea</div>
        <div class="url">bridgescorer.com</div>
        <h2>${desc}</h2>
        <p>${movement.pairs} pairs • ${movement.rounds} rounds • ${movement.totalBoards} boards</p>
    </div>
    <table>${tableRows}</table>
</body>
</html>`;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None','NS','EW','Both','EW','Both','None','NS',
                       'NS','EW','Both','None','Both','None','NS','EW'];
        return vulns[cycle];
    }

    _downloadFile(content, filename) {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.style.display = 'none';
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    // Legacy compatibility methods
    downloadHTML(html, filename) { this._downloadFile(html, filename); }
    getBoardVulnerability(b) { return this._getBoardVulnerability(b); }
}

if (typeof window !== 'undefined') {
    window.DuplicateTemplates = DuplicateTemplates;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.templateGenerator = new DuplicateTemplates();
        });
    } else {
        window.templateGenerator = new DuplicateTemplates();
    }

    // Update movements when ENHANCED_MOVEMENTS loads after us
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DuplicateTemplates;
}
