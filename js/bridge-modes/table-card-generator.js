/**
 * Table Card Generator - MOBILE COMPATIBLE
 * Uses inline overlay instead of window.open() - works on Pixel/mobile Chrome
 * Purple gradient headers + Movement instructions + A4 landscape print
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
        // Remove any existing overlay
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
                .cards-container {
                    display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start;
                }
                .table-card {
                    width: 240px; background: white;
                    border: 2px solid #2c3e50; border-radius: 10px;
                    overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.12);
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .card-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; padding: 16px; text-align: center;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .movement-title { font-size: 10px; font-weight: 600; margin-bottom: 6px; opacity: .95; letter-spacing: .5px; }
                .table-number { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin: 4px 0; }
                .card-body { padding: 14px; }
                .rounds-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                .rounds-table th {
                    background: #34495e; color: white;
                    padding: 8px 4px; font-size: 11px; font-weight: 700;
                    border: 1px solid #bdc3c7; text-align: center;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .rounds-table td { padding: 8px 6px; text-align: center; border: 1px solid #bdc3c7; font-size: 12px; }
                .rounds-table tr:nth-child(even) { background: #f9f9f9; }
                .round-col { font-weight: 700; color: #2c3e50; }
                .ns-col { color: #27ae60; font-weight: 700; }
                .ew-col { color: #e74c3c; font-weight: 700; }
                .movement-instructions { border-top: 2px solid #e0e0e0; padding-top: 10px; font-size: 9px; line-height: 1.4; color: #555; }
                .instructions-title { font-weight: 700; margin-bottom: 4px; font-size: 10px; color: #2c3e50; }
                .card-footer { text-align: center; padding: 10px; background: #f8f9fa; border-top: 1px solid #e0e0e0; font-size: 10px; color: #666; font-weight: 600; }

                /* ── Mitchell styles ── */
                .mitchell-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; border-radius: 12px; padding: 20px; text-align: center;
                    margin-bottom: 20px;
                    print-color-adjust: exact; -webkit-print-color-adjust: exact;
                }
                .mitchell-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
                .mitchell-header p { font-size: 13px; opacity: .9; }
                .instructions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
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
                    .cards-container { gap: 8mm; }
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

        document.getElementById('tcg-print-btn').addEventListener('click', () => window.print());
        document.getElementById('tcg-close-btn').addEventListener('click', () => overlay.remove());
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

        // Find total rounds in this movement
        const totalRounds = Math.max(...movement.movement.map(e => e.round));
        const roundsAtTable = new Map(tableRounds.map(r => [r.round, r]));

        // Build rows for ALL rounds, inserting sit-out where table has no entry
        let rows = '';
        for (let r = 1; r <= totalRounds; r++) {
            if (roundsAtTable.has(r)) {
                const round = roundsAtTable.get(r);
                rows += `
            <tr>
                <td class="round-col">${round.round}</td>
                <td class="ns-col">${round.ns}</td>
                <td class="ew-col">${round.ew}</td>
                <td>${this._formatBoards(round.boards)}</td>
            </tr>`;
            } else {
                rows += `
            <tr style="background: #fff3cd;">
                <td class="round-col">${r}</td>
                <td colspan="3" style="text-align:center; font-weight:700; color:#856404; font-size:11px;">
                    SIT OUT
                </td>
            </tr>`;
            }
        }

        const instructions = this._movementInstructions(movement, tableNum, tableRounds);

        return `
        <div class="table-card">
            <div class="card-header">
                <div class="movement-title">${movement.description}</div>
                <div class="table-number">TABLE ${tableNum}</div>
            </div>
            <div class="card-body">
                <table class="rounds-table">
                    <thead><tr><th>Rd</th><th>N-S</th><th>E-W</th><th>Boards</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="movement-instructions">
                    <div class="instructions-title">Movement Info</div>
                    ${instructions}
                </div>
            </div>
            <div class="card-footer">Place at Table ${tableNum}</div>
        </div>`;
    }

    _buildMitchellHTML(movement) {
        return `
        <div class="mitchell-header">
            <h1>${movement.description}</h1>
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

    _movementInstructions(movement, tableNum, tableRounds) {
        if (movement.type === 'mitchell') return 'N/S stay. E/W move up one table.';

        const moves = [];
        for (let i = 0; i < tableRounds.length - 1; i++) {
            const cur = tableRounds[i];
            if (cur.ns === 'Sit out' || cur.ew === 'Sit out') continue;
            const next = cur.round + 1;
            const nsNext = movement.movement.find(e => e.round === next && (e.ns === cur.ns || e.ew === cur.ns));
            const ewNext = movement.movement.find(e => e.round === next && (e.ns === cur.ew || e.ew === cur.ew));
            if (nsNext && ewNext) {
                const nsPos = nsNext.ns === cur.ns ? 'N/S' : 'E/W';
                const ewPos = ewNext.ns === cur.ew ? 'N/S' : 'E/W';
                moves.push(`R${cur.round}: NS&rarr;T${nsNext.table}${nsPos}, EW&rarr;T${ewNext.table}${ewPos}`);
            }
        }
        return moves.length > 0 ? moves.join('<br>') : 'See director';
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

console.log('✅ Table Card Generator (mobile-compatible overlay) loaded');
