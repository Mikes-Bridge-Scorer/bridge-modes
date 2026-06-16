/**
 * Duplicate Bridge Template Generator
 * Travellers: HTML table layout for reliable 4-per-page A4 portrait printing
 */
class DuplicateTemplates {
    constructor() {
        this.initializeMovements();
    }

    initializeMovements() {
        if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
            this.movements = ENHANCED_MOVEMENTS;
        } else {
            this.movements = {};
            setTimeout(() => {
                if (typeof ENHANCED_MOVEMENTS !== 'undefined') {
                    this.movements = ENHANCED_MOVEMENTS;
                }
            }, 500);
        }
    }

    _addPixelHandler(btn, action) {
        if (!btn) return;
        const handler = (e) => { e.preventDefault(); e.stopPropagation(); action(); };
        btn.addEventListener('click', handler, { passive: false });
        btn.addEventListener('touchend', handler, { passive: false });
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.style.opacity = '0.7';
            setTimeout(() => { btn.style.opacity = '1'; }, 150);
        }, { passive: false });
    }

    showBoardTemplates() {
        this._showMovementPickerPopup('boardTemplatesPopup', '🎴 Board Slips',
            'Select movement to generate slips:',
            (key, movement) => { this.downloadBoardTemplate(movement.totalBoards); });
    }

    showTravelerTemplates() {
        this._showMovementPickerPopup('travelerTemplatesPopup', '📊 Traveler Sheets',
            'Select movement to generate travelers:',
            (key, movement) => { this.downloadMovementTravelers(key, movement); });
    }

    _showMovementPickerPopup(popupId, title, subtitle, onSelect) {
        const existing = document.getElementById(popupId);
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = popupId;
        popup.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:1000;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 0;';

        const sortedEntries = Object.entries(this.movements).sort((a, b) => {
            if (a[1].pairs !== b[1].pairs) return a[1].pairs - b[1].pairs;
            return a[1].totalBoards - b[1].totalBoards;
        });
        const groups = {};
        sortedEntries.forEach(([key, mov]) => {
            if (!groups[mov.pairs]) groups[mov.pairs] = [];
            groups[mov.pairs].push({ key, mov });
        });
        const colors = ['#27ae60','#3498db','#e67e22','#9b59b6','#1abc9c','#e74c3c','#f39c12','#16a085','#8e44ad','#2980b9'];
        let colorIdx = 0, groupHTML = '';
        Object.keys(groups).sort((a,b) => a-b).forEach(pairs => {
            groupHTML += '<div style="margin-bottom:8px;"><div style="font-size:11px;color:#95a5a6;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">' + pairs + ' Pairs</div>';
            groups[pairs].forEach(({ key, mov }) => {
                const color = colors[colorIdx++ % colors.length];
                groupHTML += '<button class="tmpl-pick-btn" data-key="' + key + '" style="display:block;width:100%;padding:11px 14px;margin-bottom:6px;border:none;border-radius:7px;background:' + color + ';color:white;font-size:14px;font-weight:600;cursor:pointer;text-align:left;min-height:44px;touch-action:manipulation;">' + mov.description + (mov.hasSitOut ? ' ⚠️' : '') + '</button>';
            });
            groupHTML += '</div>';
        });

        popup.innerHTML = '<div style="background:white;border-radius:10px;width:88%;max-width:340px;padding:18px;color:#2c3e50;box-shadow:0 4px 20px rgba(0,0,0,0.4);margin:auto;"><div style="text-align:center;margin-bottom:14px;"><h3 style="margin:0 0 3px 0;color:#2c3e50;font-size:16px;">' + title + '</h3><p style="margin:0;font-size:12px;color:#7f8c8d;">' + subtitle + '</p></div>' + groupHTML + '<button id="' + popupId + '_close" style="display:block;width:100%;padding:11px;margin-top:8px;border:2px solid #bdc3c7;border-radius:7px;background:white;color:#7f8c8d;font-size:14px;font-weight:600;cursor:pointer;min-height:44px;touch-action:manipulation;">✕ Close</button></div>';

        document.body.appendChild(popup);
        popup.querySelectorAll('.tmpl-pick-btn').forEach(btn => {
            this._addPixelHandler(btn, () => {
                const key = btn.getAttribute('data-key');
                popup.remove();
                onSelect(key, this.movements[key]);
            });
        });
        this._addPixelHandler(document.getElementById(popupId + '_close'), () => popup.remove());
        popup.addEventListener('click', e => { if (e.target === popup) popup.remove(); });
    }

    _getSitOutPair(movement) {
        if (!movement.hasSitOut) return null;
        const allPairs = movement.movement.flatMap(e => [e.ns, e.ew]).filter(p => p !== '' && typeof p === 'number');
        return Math.max(...allPairs);
    }

    _getMovementDescription(movement) {
        return movement.description.replace(/\s*\(.*?\)\s*/g, '').trim();
    }

    // ─── TRAVELLER SHEETS ─────────────────────────────────────────────────────

    downloadMovementTravelers(key, movement) {
        if (!movement) movement = Object.values(this.movements).find(m => m.pairs === parseInt(key));
        if (!movement) { alert('Movement not available'); return; }
        this._showTravelerOverlay(movement);
    }

    _buildTravelerPages(movement, boardNumbers, boardPairMap, sitOutPair) {
        let html = '';
        for (let i = 0; i < boardNumbers.length; i += 6) {
            html += '<div class="traveler-page">';
            html += '<table width="100%" cellspacing="3" cellpadding="0" border="0"><tbody>';
            // 3 rows of 2 columns
            for (let row = 0; row < 3; row++) {
                const a = i + row * 2;
                const b = a + 1;
                if (!boardNumbers[a]) break;
                html += '<tr>';
                html += '<td width="50%" valign="top">' + this._generateTravelerSheet(boardNumbers[a], boardPairMap[boardNumbers[a]], movement, sitOutPair) + '</td>';
                html += '<td width="50%" valign="top">' + (boardNumbers[b] ? this._generateTravelerSheet(boardNumbers[b], boardPairMap[boardNumbers[b]], movement, sitOutPair) : '') + '</td>';
                html += '</tr>';
            }
            html += '</tbody></table>';
            html += '</div>';
        }
        return html;
    }

    _showTravelerOverlay(movement) {
        const existing = document.getElementById('traveler-overlay');
        if (existing) existing.remove();

        const sitOutPair = this._getSitOutPair(movement);
        const boardPairMap = this._getBoardPairMapping(movement, sitOutPair);
        const boardNumbers = Object.keys(boardPairMap).sort((a, b) => parseInt(a) - parseInt(b));
        const desc = this._getMovementDescription(movement);

        const travelersHTML = this._buildTravelerPages(movement, boardNumbers, boardPairMap, sitOutPair);

        const overlay = document.createElement('div');
        overlay.id = 'traveler-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f5f5f5;overflow-y:auto;font-family:Arial,sans-serif;';

        overlay.innerHTML = '<style>' + this._travelerCSS() + '#traveler-toolbar{position:sticky;top:0;z-index:10;background:#2c3e50;color:white;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.3);}#traveler-toolbar h2{font-size:16px;font-weight:700;margin:0;}.trav-btn{border:none;border-radius:6px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-left:8px;touch-action:manipulation;}#trav-print-btn{background:#27ae60;color:white;}#trav-dl-btn{background:#3498db;color:white;}#trav-close-btn{background:#e74c3c;color:white;}#traveler-content{padding:12px;}</style>'
            + '<div id="traveler-toolbar"><h2>📊 Traveler Sheets — ' + desc + '</h2><div><button class="trav-btn" id="trav-print-btn">🖨️ Print</button><button class="trav-btn" id="trav-dl-btn">💾 Download</button><button class="trav-btn" id="trav-close-btn">✕ Close</button></div></div>'
            + '<div id="traveler-content">' + travelersHTML + '</div>';

        document.body.appendChild(overlay);

        const addBtn = (id, action) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const h = (e) => { e.preventDefault(); e.stopPropagation(); action(); };
            btn.addEventListener('click', h, { passive: false });
            btn.addEventListener('touchend', h, { passive: false });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.style.opacity='0.7'; setTimeout(()=>{btn.style.opacity='1';},150); }, { passive: false });
        };

        addBtn('trav-print-btn', () => {
            const html = this._travelerHTMLDoc(movement, boardNumbers, boardPairMap, sitOutPair);
            const w = window.open('', '_blank');
            if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500); }
            else window.print();
        });

        addBtn('trav-dl-btn', () => {
            const html = this._travelerHTMLDoc(movement, boardNumbers, boardPairMap, sitOutPair);
            const safeName = (movement.description || '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
            this._downloadFile(html, 'bridge-travelers-' + safeName + '.html');
        });

        addBtn('trav-close-btn', () => overlay.remove());
    }

    _travelerCSS() {
        return '.traveler-page{page-break-after:always;break-after:page;padding:0;}'
            + '.traveler-page table{width:100%;}'
            + '.traveler-page td{width:50%;vertical-align:top;padding:3mm;}'
            + '.traveler-sheet{width:100%;border:2px solid #2c3e50;border-radius:4px;overflow:hidden;display:block;}'
            + '.traveler-header{background:white;color:#2c3e50;border-bottom:2px solid #2c3e50;padding:5px 8px;text-align:center;}'
            + '.traveler-header-brand{font-size:10pt;font-weight:800;color:#2c3e50;display:block;}'
            + '.traveler-header-url{font-size:8pt;color:#666;display:block;}'
            + '.traveler-header-title{font-size:12pt;font-weight:800;color:#2c3e50;display:block;margin:2px 0;}'
            + '.traveler-header-sub{font-size:8.5pt;color:#555;display:block;}'
            + '.vuln-badge{display:inline-block;padding:2px 8px;border-radius:8px;font-size:8pt;font-weight:700;margin-top:3px;}'
            + '.vuln-none{border:1px solid #95a5a6;color:#95a5a6;}'
            + '.vuln-ns{border:1px solid #27ae60;color:#27ae60;font-weight:800;}'
            + '.vuln-ew{border:1px solid #e74c3c;color:#e74c3c;font-weight:800;}'
            + '.vuln-both{border:1px solid #f39c12;color:#f39c12;font-weight:800;}'
            + '.traveler-table{width:100%;border-collapse:collapse;}'
            + '.traveler-table th{background:#34495e;color:white;font-size:9pt;font-weight:700;padding:5px 2px;text-align:center;border:1px solid #2c3e50;print-color-adjust:exact;-webkit-print-color-adjust:exact;}'
            + '.traveler-table td{font-size:10pt;padding:5px 2px;text-align:center;border:1px solid #bdc3c7;height:22px;}'
            + '.pair-cell{font-weight:700;background:#f8f9fa;}'
            + '.ns-pair{color:#27ae60;}.ew-pair{color:#e74c3c;}'
            + '.plus-cell{color:#27ae60;font-weight:700;}.minus-cell{color:#e74c3c;font-weight:700;}'
            + '.traveler-table tr:nth-child(even) td{background:#f9f9f9;}'
            + '.traveler-header-skip{font-size:8pt;font-weight:700;color:#664d03;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:2px 6px;display:inline-block;margin:3px 0;}';
    }

    _travelerHTMLDoc(movement, boardNumbers, boardPairMap, sitOutPair) {
        const desc = this._getMovementDescription(movement);
        const pages = this._buildTravelerPages(movement, boardNumbers, boardPairMap, sitOutPair);
        return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Traveler Sheets - ' + desc + '</title>'
            + '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;}'
            + this._travelerCSS()
            + '@media print{@page{size:A4 portrait;margin:5mm;}}</style></head><body>'
            + pages + '</body></html>';
    }

    _getBoardPairMapping(movement, sitOutPair) {
        const mapping = {};
        // For Mitchell movements, EW pairs are numbered tables+1 through pairs.
        // The movement generator uses relative positions 1-tables, so we offset.
        const isMitchell = movement.type === 'mitchell';
        const ewOffset = isMitchell ? movement.tables : 0;

        movement.movement.forEach(entry => {
            if (!entry.boards || entry.boards.length === 0) return;
            if (entry.ns === '' || entry.ns === sitOutPair || entry.ew === sitOutPair) return;
            const ewDisplay = isMitchell ? entry.ew + ewOffset : entry.ew;
            entry.boards.forEach(boardNum => {
                if (!mapping[boardNum]) mapping[boardNum] = [];
                mapping[boardNum].push({ ns: entry.ns, ew: ewDisplay });
            });
        });
        return mapping;
    }

    _generateTravelerSheet(boardNumber, pairInstances, movement, sitOutPair) {
        const vulnerability = this._getBoardVulnerability(parseInt(boardNumber));
        const vulnLabels = { 'None':'None Vulnerable','NS':'N-S Vulnerable','EW':'E-W Vulnerable','Both':'Both Vulnerable' };
        const vulnClasses = { 'None':'vuln-none','NS':'vuln-ns','EW':'vuln-ew','Both':'vuln-both' };
        const desc = this._getMovementDescription(movement);

        let rows = '';
        pairInstances.forEach(instance => {
            rows += '<tr><td class="pair-cell ns-pair">' + instance.ns + '</td><td class="pair-cell ew-pair">' + instance.ew + '</td><td></td><td></td><td></td><td></td><td class="plus-cell">+</td><td class="minus-cell">-</td><td></td><td></td></tr>';
        });
        const emptyRows = Math.max(0, 6 - pairInstances.length);
        for (let i = 0; i < emptyRows; i++) {
            rows += '<tr><td class="pair-cell"></td><td class="pair-cell"></td><td></td><td></td><td></td><td></td><td class="plus-cell">+</td><td class="minus-cell">-</td><td></td><td></td></tr>';
        }

        const skipLine = movement.skipRound
            ? '<span class="traveler-header-skip">⚠️ Skip after Rd ' + (movement.skipRound - 1) + ': EW move up TWO tables</span>'
            : '';

        return '<div class="traveler-sheet">'
            + '<div class="traveler-header">'
            + '<span class="traveler-header-brand">🃏 Bridge at Sea</span>'
            + '<span class="traveler-header-url">bridgescorer.com</span>'
            + '<span class="traveler-header-title">Board ' + boardNumber + ' of ' + movement.totalBoards + '</span>'
            + '<span class="traveler-header-sub">' + desc + '</span>'
            + skipLine
            + '<span class="vuln-badge ' + vulnClasses[vulnerability] + '">' + vulnLabels[vulnerability] + '</span>'
            + '</div>'
            + '<table class="traveler-table"><thead><tr>'
            + '<th>NS<br>Pair</th><th>EW<br>Pair</th><th>Bid</th><th>Suit</th><th>Decl</th><th>Tricks</th><th>Plus</th><th>Minus</th><th>Score<br>NS</th><th>Score<br>EW</th>'
            + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    // ─── BOARD SLIPS ───────────────────────────────────────────────────────────────────────────

    _getBoardDealer(boardNumber) {
        const dealers = ['N','E','S','W'];
        return dealers[(boardNumber - 1) % 4];
    }

    _buildCompassCard(board) {
        const vuln   = this._getBoardVulnerability(board);
        const dealer = this._getBoardDealer(board);
        const nsVul  = (vuln === 'NS'   || vuln === 'Both');
        const ewVul  = (vuln === 'EW'   || vuln === 'Both');
        const nColor = nsVul ? '#c0392b' : '#27ae60';
        const sColor = nsVul ? '#c0392b' : '#27ae60';
        const eColor = ewVul ? '#c0392b' : '#27ae60';
        const wColor = ewVul ? '#c0392b' : '#27ae60';
        const nDlr = dealer === 'N' ? '<br><span style="font-size:11pt;font-weight:700;">(DLR)</span>' : '';
        const sDlr = dealer === 'S' ? '<br><span style="font-size:11pt;font-weight:700;">(DLR)</span>' : '';
        const eDlr = dealer === 'E' ? '<br><span style="font-size:11pt;font-weight:700;">(DLR)</span>' : '';
        const wDlr = dealer === 'W' ? '<br><span style="font-size:11pt;font-weight:700;">(DLR)</span>' : '';
        return '<div class="card">' +
            '<div class="compass">' +
            '<div class="cell top-bar" style="background:' + nColor + ';">N' + nDlr + '</div>' +
            '<div class="cell left" style="background:' + wColor + ';">W' + wDlr + '</div>' +
            '<div class="cell center">' + board + '</div>' +
            '<div class="cell right" style="background:' + eColor + ';">E' + eDlr + '</div>' +
            '<div class="cell bot-bar" style="background:' + sColor + ';">S' + sDlr + '</div>' +
            '</div>' +
            '<div class="brand">🃏 bridgescorer.com</div>' +
            '</div>';
    }

    downloadBoardTemplate(numBoards) {
        const css =
            '*{box-sizing:border-box;margin:0;padding:0;}' +
            'body{font-family:Arial,sans-serif;background:#fff;}' +
            '.page{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;padding:8mm;page-break-after:always;break-after:page;}' +
            '.page:last-child{page-break-after:auto;break-after:auto;}' +
            '.card{border:2px solid #2c3e50;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;aspect-ratio:3/4;page-break-inside:avoid;break-inside:avoid;}' +
            '.compass{flex:1;display:grid;grid-template-columns:1fr 2fr 1fr;grid-template-rows:1fr 2fr 1fr;}' +
            '.cell{display:flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:22pt;text-align:center;line-height:1.1;}' +
            '.top-bar{grid-column:1/4;grid-row:1;}' +
            '.bot-bar{grid-column:1/4;grid-row:3;}' +
            '.left{grid-column:1;grid-row:2;}' +
            '.right{grid-column:3;grid-row:2;}' +
            '.center{grid-column:2;grid-row:2;background:white;color:#2c3e50;font-size:28pt;font-weight:900;}' +
            '.brand{text-align:center;font-size:8pt;font-weight:600;color:#2c3e50;padding:4px;border-top:2px solid #2c3e50;background:#f0f0f0;}' +
            '@media print{@page{size:A4 portrait;margin:0;}body{margin:0;}}';

        let pages = '';
        for (let i = 1; i <= numBoards; i += 9) {
            pages += '<div class="page">';
            for (let b = i; b < i + 9 && b <= numBoards; b++) {
                pages += this._buildCompassCard(b);
            }
            pages += '</div>';
        }

        const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
            '<title>Board Cards — ' + numBoards + ' Boards</title>' +
            '<style>' + css + '</style></head><body>' + pages + '</body></html>';

        this._downloadFile(html, 'board-cards-' + numBoards + '-boards.html');
    }
    // ─── MOVEMENT SHEET ───────────────────────────────────────────────────────

    downloadMovementSheet(movement) {
        this._downloadFile(this._buildMovementSheetHTML(movement), 'Movement-Sheet-' + movement.pairs + '-Pairs.html');
    }

    _buildMovementSheetHTML(movement) {
        if (!movement || !movement.movement) return '<html><body>No data</body></html>';
        const sitOutPair = this._getSitOutPair(movement);
        const rounds = {};
        movement.movement.forEach(entry => {
            if (!rounds[entry.round]) rounds[entry.round] = [];
            rounds[entry.round].push(entry);
        });
        const tables = [...new Set(movement.movement.map(e => e.table))].sort((a,b) => a-b);
        const desc = this._getMovementDescription(movement);

        let tableRows = '<tr><th>Round</th>';
        tables.forEach(t => { tableRows += '<th>Table ' + t + '</th>'; });
        tableRows += '</tr>';

        Object.keys(rounds).sort((a,b) => a-b).forEach(roundNum => {
            tableRows += '<tr><td><strong>Rd ' + roundNum + '</strong></td>';
            tables.forEach(tableNum => {
                const entry = rounds[roundNum].find(e => e.table === tableNum);
                if (entry) {
                    const nsIsSitOut = sitOutPair && entry.ns === sitOutPair;
                    const ewIsSitOut = sitOutPair && entry.ew === sitOutPair;
                    const boardsText = entry.boards && entry.boards.length > 0 ? entry.boards[0] + '-' + entry.boards[entry.boards.length-1] : '—';
                    const nsText = nsIsSitOut ? '<span style="color:#856404">Sit Out</span>' : '<span style="color:#27ae60">' + entry.ns + '</span>';
                    const ewText = ewIsSitOut ? '<span style="color:#856404">Sit Out</span>' : '<span style="color:#e74c3c">' + entry.ew + '</span>';
                    tableRows += '<td>NS: ' + nsText + '<br>EW: ' + ewText + '<br><small>' + boardsText + '</small></td>';
                } else { tableRows += '<td>—</td>'; }
            });
            tableRows += '</tr>';
        });

        return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Movement Sheet</title><style>body{font-family:Arial,sans-serif;margin:15mm;}.header{text-align:center;margin-bottom:15px;}.brand{font-size:11pt;font-weight:800;color:#2c3e50;}.url{font-size:9pt;color:#666;}h2{color:#2c3e50;margin:8px 0 4px;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #bdc3c7;padding:6px 8px;text-align:center;font-size:10pt;}th{background:#34495e;color:white;font-weight:700;}tr:nth-child(even) td{background:#f9f9f9;}@media print{@page{size:A4 landscape;margin:10mm;}}</style></head><body><div class="header"><div class="brand">🃏 Bridge at Sea</div><div class="url">bridgescorer.com</div><h2>' + desc + '</h2><p>' + movement.pairs + ' pairs • ' + movement.rounds + ' rounds • ' + movement.totalBoards + ' boards</p></div><table>' + tableRows + '</table></body></html>';
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None','NS','EW','Both','EW','Both','None','NS','NS','EW','Both','None','Both','None','NS','EW'];
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
        } catch (error) { alert('Download failed. Please try again.'); }
    }

    downloadHTML(html, filename) { this._downloadFile(html, filename); }
    getBoardVulnerability(b) { return this._getBoardVulnerability(b); }
}

if (typeof window !== 'undefined') {
    window.DuplicateTemplates = DuplicateTemplates;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { window.templateGenerator = new DuplicateTemplates(); });
    } else {
        window.templateGenerator = new DuplicateTemplates();
    }
    const _origEM = Object.getOwnPropertyDescriptor(window, 'ENHANCED_MOVEMENTS');
    Object.defineProperty(window, 'ENHANCED_MOVEMENTS', {
        set(value) {
            Object.defineProperty(window, 'ENHANCED_MOVEMENTS', { value, writable: true, configurable: true });
            if (window.templateGenerator) window.templateGenerator.movements = value;
        },
        get() { return _origEM ? _origEM.value : undefined; },
        configurable: true
    });
}

if (typeof module !== 'undefined' && module.exports) { module.exports = DuplicateTemplates; }
