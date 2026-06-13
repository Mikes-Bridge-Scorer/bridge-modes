/**
 * Table Card Generator - MOBILE COMPATIBLE + FULL SIT-OUT SUPPORT
 * Uses inline overlay instead of window.open() - works on Pixel/mobile Chrome
 * Shows sit-out rounds for all half-table Howell movements
 * Expanded movement instructions + Bridge at Sea branding
 */

class TableCardGenerator {
    constructor() {
        console.log('🎴 Table Card Generator (mobile-compatible) loaded');
    }

    // ─── MAIN ENTRY POINTS ───────────────────────────────────────────────────

    generateTableCards(movement) {
        if (movement.type === 'mitchell') {
            this._showOverlay(this._buildMitchellHTML(movement), 'Movement Instructions');
        } else {
            this._showOverlay(this._buildTableCardsHTML(movement), 'Table Movement Cards');
        }
    }

    downloadTableCardsHTML(movement) {
        const html = movement.type === 'mitchell'
            ? this._buildMitchellHTML(movement)
            : this._buildTableCardsHTML(movement);
        const filename = movement.type === 'mitchell'
            ? `Mitchell-${movement.pairs}-Pairs-Instructions.html`
            : `Table-Cards-${movement.pairs}-Pairs.html`;
        this._downloadHTML(html, filename);
    }

    // ─── OVERLAY RENDERER ────────────────────────────────────────────────────

    _showOverlay(innerHTML, title) {
        const existing = document.getElementById('tcg-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tcg-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            background: #f5f5f5; overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        `;

        overlay.innerHTML = `
            <style>
                #tcg-toolbar {
                    position: sticky; top: 0; z-index: 10;
                    background: #2c3e50; color: white;
                    padding: 12px 16px;
                    display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                #tcg-toolbar h2 { font-size: 16px; font-weight: 700; margin: 0; }
                #tcg-toolbar .tcg-btn {
                    border: none; border-radius: 6px; padding: 8px 14px;
                    font-size: 13px; font-weight: 600; cursor: pointer; margin-left: 8px;
                }
                #tcg-print-btn { background: #27ae60; color: white; }
                #tcg-close-btn { background: #e74c3c; color: white; }
                #tcg-content { padding: 16px; }

                /* ── Card styles ── */
                .cards-container { display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start; }
                .table-card {
                    width: 260px; background: white;
                    border: 2px solid #2c3e50; border-radius: 10px;
                    overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.12);
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .card-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 12px 16px; text-align: center;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .card-branding {
                    font-size: 12px; font-weight: 800; opacity: 1;
                    letter-spacing: 0.3px; margin-bottom: 5px;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                }
                .card-branding-url {
                    font-size: 10px; opacity: 0.9; letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }
                .movement-title {
                    font-size: 11px; font-weight: 800; margin-bottom: 6px;
                    opacity: 0.95; letter-spacing: 0.2px;
                }
                .table-number { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin: 4px 0; }
                .card-body { padding: 12px; }
                .rounds-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .rounds-table th {
                    background: #34495e; color: white;
                    padding: 7px 4px; font-size: 11px; font-weight: 700;
                    border: 1px solid #bdc3c7; text-align: center;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .rounds-table td { padding: 7px 5px; text-align: center; border: 1px solid #bdc3c7; font-size: 12px; }
                .rounds-table tr:nth-child(even) { background: #f9f9f9; }
                .sitout-row td { background: #fff3cd !important; }
                .round-col { font-weight: 700; color: #2c3e50; }
                .ns-col { color: #27ae60; font-weight: 700; }
                .ew-col { color: #e74c3c; font-weight: 700; }
                .sitout-cell { font-weight: 700; color: #856404; font-size: 11px; }
                .movement-instructions {
                    border-top: 2px solid #e0e0e0; padding-top: 8px;
                    font-size: 10px; line-height: 1.7; color: #444;
                }
                .instructions-title { font-weight: 800; margin-bottom: 5px; font-size: 11px; color: #2c3e50; }
                .instruction-line { margin: 2px 0; }
                .ns-inst { color: #27ae60; font-weight: 700; }
                .ew-inst { color: #e74c3c; font-weight: 700; }
                .sitout-note { color: #856404; font-size: 9px; margin-top: 4px; }
                .card-footer {
                    text-align: center; padding: 8px; background: #f8f9fa;
                    border-top: 1px solid #e0e0e0; font-size: 10px; color: #666; font-weight: 600;
                }

                /* ── Mitchell styles ── */
                .mitchell-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; border-radius: 12px; padding: 20px; text-align: center;
                    margin-bottom: 20px;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .mitchell-branding { font-size: 13px; font-weight: 800; margin-bottom: 3px; }
                .mitchell-url { font-size: 11px; opacity: 0.85; margin-bottom: 8px; }
                .mitchell-header h1 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
                .mitchell-header p { font-size: 13px; opacity: .9; margin: 2px 0; }
                .instructions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
                .instruction-box { border: 2px solid #2c3e50; border-radius: 10px; padding: 15px; }
                .instruction-box h2 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
                .ns-box { border-color: #27ae60; }
                .ns-box h2 { color: #27ae60; }
                .ew-box { border-color: #e74c3c; }
                .ew-box h2 { color: #e74c3c; }
                .big-instruction { font-size: 16px; font-weight: 800; text-align: center; padding: 10px; background: rgba(52,152,219,.05); border-radius: 6px; }

                /* ── Print ── */
                @media print {
                    #tcg-toolbar { display: none !important; }
                    #tcg-overlay { position: static; overflow: visible; }
                    #tcg-content { padding: 0; }
                    @page { size: A4 landscape; margin: 10mm; }
                    .table-card { width: 88mm; box-shadow: none; page-break-inside: avoid; }
                    .cards-container { gap: 6mm; }
                }
            </style>
            <div id="tcg-toolbar">
                <h2>🖨️ ${title}</h2>
                <div>
                    <button class="tcg-btn" id="tcg-print-btn">🖨️ Print</button>
                    <button class="tcg-btn" id="tcg-close-btn">✕ Close</button>
                </div>
            </div>
            <div id="tcg-content">${innerHTML}</div>
        `;

        document.body.appendChild(overlay);

        // Pixel-compatible handlers for Print and Close buttons
        const addPixelHandler = (id, action) => {
            const btn = document.getElementById(id);
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
        };

        addPixelHandler('tcg-print-btn', () => {
            // Build standalone print HTML for multi-page support
            const printCSS = `
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: white; padding: 10mm; }
                .cards-container { display: flex; flex-wrap: wrap; gap: 6mm; justify-content: flex-start; }
                .table-card { width: 88mm; background: white; border: 2px solid #2c3e50; border-radius: 10px; overflow: hidden; page-break-inside: avoid; break-inside: avoid; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                .card-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; text-align: center; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                .card-branding { font-size: 12px; font-weight: 800; margin-bottom: 5px; }
                .card-branding-url { font-size: 10px; opacity: 0.9; margin-bottom: 6px; }
                .movement-title { font-size: 11px; font-weight: 800; margin-bottom: 6px; }
                .table-number { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin: 4px 0; }
                .card-body { padding: 12px; }
                .rounds-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .rounds-table th { background: #34495e; color: white; padding: 7px 4px; font-size: 11px; font-weight: 700; border: 1px solid #bdc3c7; text-align: center; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                .rounds-table td { padding: 7px 5px; text-align: center; border: 1px solid #bdc3c7; font-size: 12px; }
                .rounds-table tr:nth-child(even) { background: #f9f9f9; }
                .sitout-row td { background: #fff3cd !important; }
                .round-col { font-weight: 700; color: #2c3e50; }
                .ns-col { color: #27ae60; font-weight: 700; }
                .ew-col { color: #e74c3c; font-weight: 700; }
                .sitout-cell { font-weight: 700; color: #856404; font-size: 11px; }
                .movement-instructions { border-top: 2px solid #e0e0e0; padding-top: 8px; font-size: 10px; line-height: 1.7; color: #444; }
                .instructions-title { font-weight: 800; margin-bottom: 5px; font-size: 11px; color: #2c3e50; }
                .instruction-line { margin: 2px 0; }
                .ns-inst { color: #27ae60; font-weight: 700; }
                .ew-inst { color: #e74c3c; font-weight: 700; }
                .sitout-note { color: #856404; font-size: 9px; margin-top: 4px; }
                .card-footer { text-align: center; padding: 8px; background: #f8f9fa; border-top: 1px solid #e0e0e0; font-size: 10px; color: #666; font-weight: 600; }
                @page { size: A4 landscape; margin: 10mm; }
            `;
            const contentEl = document.getElementById('tcg-content');
            const cardHTML = contentEl ? contentEl.innerHTML : innerHTML;
            const printHTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Table Movement Cards</title><style>${printCSS}</style></head><body>${cardHTML}</body></html>`;

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printHTML);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => printWindow.print(), 500);
            } else {
                window.print();
            }
        });
        addPixelHandler('tcg-close-btn', () => overlay.remove());
    }

    // ─── HTML BUILDERS ───────────────────────────────────────────────────────

    _buildTableCardsHTML(movement) {
        const physicalTables = Math.ceil(movement.tables);
        let cards = '';
        for (let t = 1; t <= physicalTables; t++) {
            cards += this._buildSingleCard(movement, t);
        }
        return `<div class="cards-container">${cards}</div>`;
    }

    _buildSingleCard(movement, tableNum) {
        const tableRounds = movement.movement
            .filter(e => e.table === tableNum)
            .sort((a, b) => a.round - b.round);

        const totalRounds = Math.max(...movement.movement.map(e => e.round));
        const roundsAtTable = new Map(tableRounds.map(r => [r.round, r]));

        // Detect sit-out pair: it's pairs+1 (the ghost pair in the underlying even movement)
        // e.g. 7-pair uses 8-pair movement, sit-out = pair 8 = pairs+1
        // Fall back to max pair number detected in data
        const allPairNums = movement.movement
            .flatMap(e => [e.ns, e.ew])
            .filter(p => p !== '' && p !== 'Sit out' && p !== 'Sit Out' && typeof p === 'number');
        const maxPair = Math.max(...allPairNums);
        const sitOutPairNum = movement.hasSitOut ? maxPair : null;
        // sitOutPairNum will be pairs+1 (e.g. 8 for 7-pair, 10 for 9-pair, 6 for 5-pair)

        const formatPair = (p) => {
            if (sitOutPairNum && p === sitOutPairNum) return 'Sit Out';
            return p;
        };

        // Build rows for ALL rounds
        let rows = '';
        for (let r = 1; r <= totalRounds; r++) {
            if (roundsAtTable.has(r)) {
                const round = roundsAtTable.get(r);
                const nsDisplay = formatPair(round.ns);
                const ewDisplay = formatPair(round.ew);
                const isSitOutRound = nsDisplay === 'Sit Out' || ewDisplay === 'Sit Out';

                if (isSitOutRound) {
                    rows += `
            <tr class="sitout-row">
                <td class="round-col">${round.round}</td>
                <td class="sitout-cell" style="color:#27ae60;font-weight:700;">${nsDisplay === 'Sit Out' ? 'Sit Out' : nsDisplay}</td>
                <td class="sitout-cell" style="color:#e74c3c;font-weight:700;">${ewDisplay === 'Sit Out' ? 'Sit Out' : ewDisplay}</td>
                <td class="sitout-cell">—</td>
            </tr>`;
                } else {
                    rows += `
            <tr>
                <td class="round-col">${round.round}</td>
                <td class="ns-col">${nsDisplay}</td>
                <td class="ew-col">${ewDisplay}</td>
                <td>${this._formatBoards(round.boards)}</td>
            </tr>`;
                }
            }
        }

        const instructions = this._buildMovementInstructions(movement, tableNum, sitOutPairNum);
        const titleText = this._formatTitle(movement.description);

        return `
        <div class="table-card">
            <div class="card-header">
                <div class="card-branding">🃏 Bridge at Sea</div>
                <div class="card-branding-url">bridgescorer.com</div>
                <div class="movement-title">${titleText}</div>
                <div class="table-number">TABLE ${tableNum}</div>
            </div>
            <div class="card-body">
                <table class="rounds-table">
                    <thead><tr><th>Rd</th><th>N-S</th><th>E-W</th><th>Boards</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="movement-instructions">
                    <div class="instructions-title">After each round:</div>
                    ${instructions}
                </div>
            </div>
            <div class="card-footer">Place at Table ${tableNum}</div>
        </div>`;
    }

    _formatTitle(description) {
        // Bold, strip sit-out note, replace commas with dashes
        // "4.5-table Howell, 18 boards, ~2.5 hrs (1 sit-out)" 
        // -> "<strong>4.5-table Howell — 18 boards — ~2.5 hrs</strong>"
        const clean = description.replace(/\s*\(.*?\)\s*/g, '').trim();
        return `<strong>${clean.replace(/,\s*/g, ' — ')}</strong>`;
    }

    _buildMovementInstructions(movement, tableNum, sitOutPairNum) {
        if (movement.type === 'mitchell') {
            return `
                <div class="instruction-line"><span class="ns-inst">N/S</span> — Stay at your table</div>
                <div class="instruction-line"><span class="ew-inst">E/W</span> — Move up one table</div>
            `;
        }

        // For Howell: find a typical playing round to derive movement pattern
        const tableRounds = movement.movement
            .filter(e => e.table === tableNum)
            .sort((a, b) => a.round - b.round);

        const totalRounds = Math.max(...movement.movement.map(e => e.round));
        let nsInstruction = null;
        let ewInstruction = null;

        for (const cur of tableRounds) {
            // Skip sit-out rounds
            if (cur.ns === sitOutPairNum || cur.ew === sitOutPairNum) continue;
            if (cur.round >= totalRounds) continue;

            const nextRound = cur.round + 1;

            // Find where NS pair goes next round (must be a non-sit-out round for them)
            const nsNext = movement.movement.find(e =>
                e.round === nextRound &&
                (e.ns === cur.ns || e.ew === cur.ns) &&
                e.ns !== sitOutPairNum && e.ew !== sitOutPairNum
            );
            const ewNext = movement.movement.find(e =>
                e.round === nextRound &&
                (e.ns === cur.ew || e.ew === cur.ew) &&
                e.ns !== sitOutPairNum && e.ew !== sitOutPairNum
            );

            if (nsNext && ewNext) {
                const nsRole = nsNext.ns === cur.ns ? 'N/S' : 'E/W';
                const ewRole = ewNext.ns === cur.ew ? 'N/S' : 'E/W';
                nsInstruction = `<span class="ns-inst">N/S</span> — Go to Table ${nsNext.table} as ${nsRole}`;
                ewInstruction = `<span class="ew-inst">E/W</span> — Go to Table ${ewNext.table} as ${ewRole}`;
                break;
            }
        }

        if (nsInstruction && ewInstruction) {
            const sitOutNote = movement.hasSitOut
                ? `<div class="sitout-note">⚠️ When your card shows SIT OUT — rest that round</div>`
                : '';
            return `
                <div class="instruction-line">${nsInstruction}</div>
                <div class="instruction-line">${ewInstruction}</div>
                ${sitOutNote}
            `;
        }

        return '<div class="instruction-line">See director for movement</div>';
    }

    _buildMitchellHTML(movement) {
        const titleText = this._formatTitle(movement.description);
        return `
        <div class="mitchell-header">
            <div class="mitchell-branding">🃏 Bridge at Sea</div>
            <div class="mitchell-url">bridgescorer.com</div>
            <h1>${titleText}</h1>
            <p>${movement.pairs} Pairs &bull; ${movement.tables} Tables &bull; ${movement.totalBoards || movement.rounds} Boards</p>
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
        </div>`;
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    _formatBoards(boards) {
        if (!boards || boards.length === 0) return '—';
        if (boards.length === 1) return boards[0].toString();
        const consecutive = boards.every((v, i, a) => i === 0 || v === a[i - 1] + 1);
        return consecutive ? `${boards[0]}-${boards[boards.length - 1]}` : boards.join(', ');
    }

    _downloadHTML(html, filename) {
        const fullHTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${filename}</title></head><body>${html}</body></html>`;
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

if (typeof window !== 'undefined') {
    window.TableCardGenerator = TableCardGenerator;
    window.tableCardGenerator = new TableCardGenerator();
}

console.log('✅ Table Card Generator (mobile-compatible + sit-out + branding) loaded');
