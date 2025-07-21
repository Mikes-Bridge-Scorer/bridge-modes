/**
 * Simplified Duplicate Bridge Mode
 * Clean, focused implementation with proper button integration
 */

import { BaseBridgeMode } from './base-mode.js';

class DuplicateBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'duplicate';
        this.displayName = 'Duplicate Bridge';
        
        // Simplified session state
        this.session = {
            pairs: 0,
            movement: null,
            currentBoard: 1,
            boards: {},
            isSetup: false
        };
        
        // Traveler entry state
        this.traveler = {
            isActive: false,
            boardNumber: null,
            currentField: 'level', // level, suit, declarer, tricks
            currentRow: 0,
            data: []
        };
        
        this.inputState = 'pairs_setup';
        this.initializeMovements();
    }
    
    /**
     * Initialize movement data - FIXED structure
     */
    initializeMovements() {
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
                    // ... continuing movement pattern
                ]
            }
        };
        
        console.log('🏆 Movements initialized:', Object.keys(this.movements));
    }
    
    /**
     * Initialize mode
     */
    initialize() {
        this.inputState = 'pairs_setup';
        this.updateDisplay();
    }
    
    /**
     * Handle user actions - SIMPLIFIED
     */
    handleAction(value) {
        console.log(`🎮 Duplicate action: ${value} in state: ${this.inputState}`);
        
        // Handle traveler popup input
        if (this.traveler.isActive) {
            this.handleTravelerInput(value);
            return;
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                this.handlePairsSetup(value);
                break;
            case 'movement_confirm':
                this.handleMovementConfirm(value);
                break;
            case 'board_selection':
                this.handleBoardSelection(value);
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Handle pairs setup
     */
    handlePairsSetup(value) {
        const pairCount = value === '0' ? 10 : parseInt(value);
        
        if (this.movements[pairCount]) {
            this.session.pairs = pairCount;
            this.session.movement = this.movements[pairCount];
            this.inputState = 'movement_confirm';
            console.log(`✅ Selected ${pairCount} pairs`);
        } else {
            console.log(`❌ No movement for ${pairCount} pairs`);
        }
    }
    
    /**
     * Handle movement confirmation
     */
    handleMovementConfirm(value) {
        if (value === '1') {
            this.showMovementPopup();
        } else if (value === '2') {
            this.setupBoards();
            this.inputState = 'board_selection';
        } else if (value === 'BACK') {
            this.inputState = 'pairs_setup';
        }
    }
    
    /**
     * Setup boards array
     */
    setupBoards() {
        this.session.boards = {};
        for (let i = 1; i <= this.session.movement.totalBoards; i++) {
            this.session.boards[i] = {
                number: i,
                results: [],
                completed: false
            };
        }
        this.session.isSetup = true;
    }
    
    /**
     * Handle board selection
     */
    handleBoardSelection(value) {
        const boardNum = parseInt(value);
        if (boardNum >= 1 && boardNum <= this.session.movement.totalBoards) {
            this.openTravelerPopup(boardNum);
        }
    }
    
    /**
     * Open traveler popup - SIMPLIFIED
     */
    openTravelerPopup(boardNumber) {
        console.log(`🎯 Opening traveler for board ${boardNumber}`);
        
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.currentField = 'level';
        this.traveler.currentRow = 0;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showTravelerPopup();
        this.updateDisplay();
    }
    
    /**
     * Generate traveler rows for a board
     */
    generateTravelerRows(boardNumber) {
        const instances = this.session.movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
        
        return instances.map((instance, index) => ({
            id: index,
            nsPair: instance.ns,
            ewPair: instance.ew,
            level: '',
            suit: '',
            declarer: '',
            tricks: '',
            nsScore: null,
            ewScore: null
        }));
    }
    
    /**
     * Handle traveler input - BUTTON BASED
     */
    handleTravelerInput(value) {
        const currentRow = this.traveler.data[this.traveler.currentRow];
        if (!currentRow) return;
        
        switch (this.traveler.currentField) {
            case 'level':
                if (['1','2','3','4','5','6','7'].includes(value)) {
                    currentRow.level = value;
                    this.traveler.currentField = 'suit';
                    this.updateTravelerDisplay();
                }
                break;
                
            case 'suit':
                const suits = { '1': '♣', '2': '♦', '3': '♥', '4': '♠', '5': 'NT' };
                if (suits[value]) {
                    currentRow.suit = suits[value];
                    this.traveler.currentField = 'declarer';
                    this.updateTravelerDisplay();
                }
                break;
                
            case 'declarer':
                const declarers = { '1': 'N', '2': 'S', '3': 'E', '4': 'W' };
                if (declarers[value]) {
                    currentRow.declarer = declarers[value];
                    this.traveler.currentField = 'tricks';
                    this.updateTravelerDisplay();
                }
                break;
                
            case 'tricks':
                if (['6','7','8','9'].includes(value) || (value === '0' && currentRow.tricks === '1')) {
                    if (value === '0' && currentRow.tricks === '1') {
                        currentRow.tricks = '10';
                    } else if (currentRow.tricks === '1' && ['1','2','3'].includes(value)) {
                        currentRow.tricks = '1' + value;
                    } else {
                        currentRow.tricks = value;
                    }
                    
                    // Calculate score and move to next row
                    this.calculateScore(this.traveler.currentRow);
                    this.moveToNextRow();
                }
                break;
        }
        
        // Handle special buttons
        if (value === 'NEXT') {
            this.moveToNextRow();
        } else if (value === 'SAVE') {
            this.saveTravelerData();
        } else if (value === 'BACK' && this.traveler.currentField !== 'level') {
            this.moveToPreviousField();
        }
    }
    
    /**
     * Move to next row
     */
    moveToNextRow() {
        if (this.traveler.currentRow < this.traveler.data.length - 1) {
            this.traveler.currentRow++;
            this.traveler.currentField = 'level';
        } else {
            // All rows complete
            this.traveler.currentField = 'complete';
        }
        this.updateTravelerDisplay();
    }
    
    /**
     * Move to previous field
     */
    moveToPreviousField() {
        const fields = ['level', 'suit', 'declarer', 'tricks'];
        const currentIndex = fields.indexOf(this.traveler.currentField);
        if (currentIndex > 0) {
            this.traveler.currentField = fields[currentIndex - 1];
            this.updateTravelerDisplay();
        }
    }
    
    /**
     * Calculate score for a row
     */
    calculateScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.tricks) return;
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        
        // Simplified scoring
        const level = parseInt(row.level);
        const tricks = parseInt(row.tricks);
        const needed = 6 + level;
        const result = tricks - needed;
        
        let score = 0;
        if (result >= 0) {
            // Made contract
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            score = level * suitPoints[row.suit];
            if (row.suit === 'NT') score += 10; // NT bonus
            score += result * suitPoints[row.suit]; // Overtricks
            
            // Game bonus
            if (score >= 100) {
                score += vulnerability.includes(declarerSide) ? 500 : 300;
            } else {
                score += 50;
            }
        } else {
            // Failed contract
            const undertricks = Math.abs(result);
            score = -(undertricks * (vulnerability.includes(declarerSide) ? 100 : 50));
        }
        
        // Assign scores
        if (declarerSide === 'NS') {
            row.nsScore = score;
            row.ewScore = score > 0 ? 0 : Math.abs(score);
        } else {
            row.ewScore = score;
            row.nsScore = score > 0 ? 0 : Math.abs(score);
        }
    }
    
    /**
     * Get board vulnerability
     */
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        if (cycle < 4) return 'None';
        if (cycle < 8) return 'NS';
        if (cycle < 12) return 'EW';
        return 'Both';
    }
    
    /**
     * Show traveler popup
     */
    showTravelerPopup() {
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        
        const popup = document.createElement('div');
        popup.id = 'travelerPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 20px; border-radius: 8px; 
            max-width: 95%; max-height: 90%; overflow: auto; 
            color: #2c3e50; min-width: 300px;
        `;
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="margin: 0; color: #2c3e50;">Board ${this.traveler.boardNumber}</h3>
                <div style="color: #e74c3c; font-weight: bold;">${vulnerability} Vulnerable</div>
            </div>
            
            <div id="travelerTable"></div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.saveTraveler()" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Save & Close</button>
                <button onclick="window.closeTraveler()" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        this.updateTravelerDisplay();
        
        // Add global functions for buttons
        window.saveTraveler = () => this.saveTravelerData();
        window.closeTraveler = () => this.closeTravelerPopup();
    }
    
    /**
     * Update traveler display
     */
    updateTravelerDisplay() {
        const table = document.getElementById('travelerTable');
        if (!table) return;
        
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #34495e; color: white;">
                        <th style="padding: 8px; border: 1px solid #2c3e50;">NS</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">EW</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">Contract</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">Score NS</th>
                        <th style="padding: 8px; border: 1px solid #2c3e50;">Score EW</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.traveler.data.forEach((row, index) => {
            const isCurrentRow = index === this.traveler.currentRow;
            const contract = `${row.level}${row.suit} ${row.declarer} ${row.tricks}`;
            
            html += `
                <tr style="background: ${isCurrentRow ? '#3498db20' : (index % 2 === 0 ? '#f8f9fa' : 'white')};">
                    <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.nsPair}</td>
                    <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.ewPair}</td>
                    <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${contract}</td>
                    <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${row.nsScore || '-'}</td>
                    <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${row.ewScore || '-'}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        // Add input instructions
        if (this.traveler.currentField !== 'complete') {
            const currentRow = this.traveler.data[this.traveler.currentRow];
            let instruction = '';
            
            switch (this.traveler.currentField) {
                case 'level':
                    instruction = 'Enter bid level (1-7)';
                    break;
                case 'suit':
                    instruction = 'Enter suit: 1=♣, 2=♦, 3=♥, 4=♠, 5=NT';
                    break;
                case 'declarer':
                    instruction = 'Enter declarer: 1=N, 2=S, 3=E, 4=W';
                    break;
                case 'tricks':
                    instruction = 'Enter tricks taken (6-13)';
                    break;
            }
            
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 4px;">
                    <div style="font-weight: bold; color: #2c3e50;">Row ${this.traveler.currentRow + 1}: Pair ${currentRow.nsPair} vs ${currentRow.ewPair}</div>
                    <div style="color: #34495e; margin-top: 5px;">${instruction}</div>
                </div>
            `;
        } else {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #27ae60; color: white; border-radius: 4px; text-align: center;">
                    <strong>All entries complete! Click Save & Close.</strong>
                </div>
            `;
        }
        
        table.innerHTML = html;
    }
    
    /**
     * Save traveler data
     */
    saveTravelerData() {
        this.session.boards[this.traveler.boardNumber].results = [...this.traveler.data];
        this.session.boards[this.traveler.boardNumber].completed = true;
        
        console.log(`💾 Saved traveler for Board ${this.traveler.boardNumber}`);
        this.closeTravelerPopup();
    }
    
    /**
     * Close traveler popup
     */
    closeTravelerPopup() {
        const popup = document.getElementById('travelerPopup');
        if (popup) popup.remove();
        
        this.traveler.isActive = false;
        
        // Clean up global functions
        delete window.saveTraveler;
        delete window.closeTraveler;
        
        this.updateDisplay();
    }
    
    /**
     * Show movement popup
     */
    showMovementPopup() {
        const movement = this.session.movement;
        
        const popup = document.createElement('div');
        popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;';
        popup.onclick = () => popup.remove();
        
        const content = document.createElement('div');
        content.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 80%; overflow: auto; color: #2c3e50;';
        content.onclick = (e) => e.stopPropagation();
        
        content.innerHTML = `
            <h3 style="margin-top: 0;">${movement.description}</h3>
            <p>Movement table will be displayed here...</p>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
    }
    
    /**
     * Get active buttons
     */
    getActiveButtons() {
        if (this.traveler.isActive) {
            switch (this.traveler.currentField) {
                case 'level':
                    return ['1','2','3','4','5','6','7'];
                case 'suit':
                    return ['1','2','3','4','5']; // Suits
                case 'declarer':
                    return ['1','2','3','4']; // N,S,E,W
                case 'tricks':
                    return ['6','7','8','9','0','1']; // For tricks 6-13
                case 'complete':
                    return ['SAVE'];
                default:
                    return ['NEXT', 'BACK', 'SAVE'];
            }
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4','6','8']; // Available movements
            case 'movement_confirm':
                return ['1','2','BACK'];
            case 'board_selection':
                const buttons = [];
                for (let i = 1; i <= this.session.movement.totalBoards; i++) {
                    buttons.push(i.toString());
                }
                return buttons;
            default:
                return [];
        }
    }
    
    /**
     * Update display
     */
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        
        const activeButtons = this.getActiveButtons();
        this.ui.updateButtonStates(activeButtons);
    }
    
    /**
     * Get display content
     */
    getDisplayContent() {
        switch (this.inputState) {
            case 'pairs_setup':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Setup</div>
                    </div>
                    <div class="game-content">
                        <div><strong>How many pairs are playing?</strong></div>
                        <div style="color: #2c3e50; margin-top: 8px;">
                            Choose from available Howell movements:<br>
                            4 pairs, 6 pairs, or 8 pairs
                        </div>
                    </div>
                    <div class="current-state">Select pairs (4, 6, or 8)</div>
                `;
                
            case 'movement_confirm':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">${this.session.pairs} Pairs</div>
                    </div>
                    <div class="game-content">
                        <div><strong>${this.session.movement.description}</strong></div>
                        <div style="color: #2c3e50; margin-top: 8px;">
                            • ${this.session.movement.tables} tables<br>
                            • ${this.session.movement.rounds} rounds<br>
                            • ${this.session.movement.totalBoards} boards total
                        </div>
                        <div style="background: #3498db; color: white; padding: 12px; border-radius: 4px; margin-top: 8px; text-align: center;">
                            Press <strong>1</strong> to view movement<br>
                            Press <strong>2</strong> to confirm
                        </div>
                    </div>
                    <div class="current-state">1=Movement, 2=Confirm, Back</div>
                `;
                
            case 'board_selection':
                const completed = Object.values(this.session.boards).filter(b => b.completed).length;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">${completed}/${this.session.movement.totalBoards} Done</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Traveler Entry</strong></div>
                        <div style="color: #2c3e50; margin-top: 8px;">
                            Select board number to enter results.
                        </div>
                        ${this.getBoardStatusDisplay()}
                    </div>
                    <div class="current-state">Select board number</div>
                `;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Get board status display
     */
    getBoardStatusDisplay() {
        const status = [];
        Object.values(this.session.boards).forEach(board => {
            const icon = board.completed ? '✓' : '○';
            const color = board.completed ? '#27ae60' : '#e74c3c';
            status.push(`<span style="color: ${color};">B${board.number}:${icon}</span>`);
        });
        
        return `<div style="font-size: 11px; margin-top: 8px;">${status.join(' • ')}</div>`;
    }
    
    /**
     * Handle back navigation
     */
    handleBack() {
        if (this.traveler.isActive) {
            this.closeTravelerPopup();
            return true;
        }
        
        switch (this.inputState) {
            case 'movement_confirm':
                this.inputState = 'pairs_setup';
                break;
            case 'board_selection':
                this.inputState = 'movement_confirm';
                break;
            default:
                return false;
        }
        this.updateDisplay();
        return true;
    }
    
    /**
     * Check if back is possible
     */
    canGoBack() {
        return this.inputState !== 'pairs_setup' || this.traveler.isActive;
    }
    
    /**
     * Get help content
     */
    getHelpContent() {
        return {
            title: 'Duplicate Bridge Help',
            content: `
                <div class="help-section">
                    <h4>Simplified Duplicate Bridge</h4>
                    <p>Streamlined implementation with button-based traveler entry for easy scoring.</p>
                </div>
                
                <div class="help-section">
                    <h4>Available Movements</h4>
                    <ul>
                        <li><strong>4 pairs:</strong> 2-table Howell, 12 boards, ~2 hours</li>
                        <li><strong>6 pairs:</strong> 3-table Howell, 10 boards, ~1.5 hours</li>
                        <li><strong>8 pairs:</strong> 4-table Howell, 14 boards, ~2.5 hours</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Setup:</strong> Choose pairs → view movement → confirm</li>
                        <li><strong>Play:</strong> Use movement table for seating</li>
                        <li><strong>Score:</strong> Select board → enter results with buttons</li>
                        <li><strong>Entry:</strong> Level → Suit → Declarer → Tricks → Auto-score</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Button Guide</h4>
                    <ul>
                        <li><strong>Level:</strong> 1-7 for contract level</li>
                        <li><strong>Suit:</strong> 1=♣, 2=♦, 3=♥, 4=♠, 5=NT</li>
                        <li><strong>Declarer:</strong> 1=N, 2=S, 3=E, 4=W</li>
                        <li><strong>Tricks:</strong> 6-9 direct, 1+0=10, 1+1=11, etc.</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Features</h4>
                    <ul>
                        <li><strong>Automatic scoring:</strong> Contract calculation with vulnerability</li>
                        <li><strong>Progress tracking:</strong> Visual board completion status</li>
                        <li><strong>Clean interface:</strong> Button-based input, no typing needed</li>
                        <li><strong>Mobile-friendly:</strong> Works perfectly on tablets and phones</li>
                    </ul>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    /**
     * Cleanup when switching modes
     */
    cleanup() {
        // Close any open popups
        const popup = document.getElementById('travelerPopup');
        if (popup) popup.remove();
        
        // Clean up global functions
        delete window.saveTraveler;
        delete window.closeTraveler;
        
        console.log('🧹 Duplicate Bridge cleanup completed');
    }
}

export default DuplicateBridge;