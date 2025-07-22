/**
 * Simplified Duplicate Bridge Mode - Fixed with Dropdown Interface
 * Uses dropdown fields in popup for easy data entry
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
                    { round: 3, table: 1, ns: 1, ew: 8, boards: [3,4] },
                    { round: 3, table: 2, ns: 2, ew: 7, boards: [5,6] },
                    { round: 3, table: 3, ns: 3, ew: 5, boards: [7,8] },
                    { round: 3, table: 4, ns: 6, ew: 4, boards: [9,10] },
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [11,12] },
                    { round: 4, table: 2, ns: 6, ew: 2, boards: [13,14] },
                    { round: 4, table: 3, ns: 7, ew: 4, boards: [1,2] },
                    { round: 4, table: 4, ns: 8, ew: 3, boards: [3,4] },
                    { round: 5, table: 1, ns: 1, ew: 4, boards: [5,6] },
                    { round: 5, table: 2, ns: 8, ew: 6, boards: [7,8] },
                    { round: 5, table: 3, ns: 2, ew: 3, boards: [9,10] },
                    { round: 5, table: 4, ns: 5, ew: 7, boards: [11,12] },
                    { round: 6, table: 1, ns: 1, ew: 3, boards: [13,14] },
                    { round: 6, table: 2, ns: 5, ew: 8, boards: [1,2] },
                    { round: 6, table: 3, ns: 6, ew: 7, boards: [3,4] },
                    { round: 6, table: 4, ns: 4, ew: 2, boards: [5,6] },
                    { round: 7, table: 1, ns: 1, ew: 7, boards: [7,8] },
                    { round: 7, table: 2, ns: 4, ew: 5, boards: [9,10] },
                    { round: 7, table: 3, ns: 8, ew: 2, boards: [11,12] },
                    { round: 7, table: 4, ns: 3, ew: 6, boards: [13,14] }
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
        // Set up global reference for button callbacks
        window.duplicateBridge = this;
        this.updateDisplay();
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Duplicate action: ${value} in state: ${this.inputState}`);
        
        // Don't handle buttons when traveler popup is active
        if (this.traveler.isActive) {
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
            case 'results':
                this.handleResults(value);
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
        if (value === 'BACK') {
            this.inputState = 'movement_confirm';
            return;
        }
        
        if (value === 'RESULTS') {
            this.inputState = 'results';
            return;
        }
        
        // All board selection now handled by dropdown
        // No direct button handling needed
    }
    
    /**
     * Handle results actions
     */
    handleResults(value) {
        if (value === 'BACK') {
            this.inputState = 'board_selection';
        }
    }
    
    /**
     * Open traveler popup
     */
    openTravelerPopup(boardNumber) {
        console.log(`🎯 Opening traveler for board ${boardNumber}`);
        
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showTravelerPopup();
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
            double: '', // Added double field
            tricks: '',
            nsScore: null,
            ewScore: null
        }));
    }
    
    /**
     * Open traveler popup - now opens board selector first
     */
    openTravelerPopup(boardNumber = null) {
        if (boardNumber) {
            // Direct board access - open traveler immediately
            this.openSpecificTraveler(boardNumber);
        } else {
            // Open board selector popup first
            this.showBoardSelectorPopup();
        }
    }
    
    /**
     * Show board selector popup
     */
    showBoardSelectorPopup() {
        const popup = document.createElement('div');
        popup.id = 'boardSelectorPopup';
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
            color: #2c3e50; min-width: 320px; box-sizing: border-box;
        `;
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #34495e; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #2c3e50;">Board Selection</h3>
                <div style="color: #e74c3c; font-weight: bold; font-size: 14px;">Choose board to enter traveler results</div>
            </div>
            
            <div style="margin-bottom: 20px; text-align: center;">
                <select id="boardDropdown" style="
                    width: 80%; 
                    max-width: 300px;
                    padding: 12px 16px; 
                    border: 2px solid #3498db; 
                    border-radius: 8px; 
                    font-size: 14px; 
                    background: white; 
                    color: #2c3e50;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                ">
                    <option value="">Select Board...</option>
                    ${this.getBoardDropdownOptions()}
                </select>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.selectBoardFromDropdown()" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Open Traveler</button>
                <button onclick="window.closeBoardSelector()" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        // Set up global functions
        window.selectBoardFromDropdown = () => this.selectBoardFromDropdown();
        window.closeBoardSelector = () => this.closeBoardSelector();
    }
    
    /**
     * Get board dropdown options
     */
    getBoardDropdownOptions() {
        let options = '';
        
        Object.values(this.session.boards).forEach(board => {
            const status = board.completed ? '✅' : '⭕';
            const vulnerability = this.getBoardVulnerability(board.number);
            const vulnColor = vulnerability === 'None' ? '#95a5a6' : 
                            vulnerability === 'NS' ? '#e74c3c' : 
                            vulnerability === 'EW' ? '#f39c12' : '#8e44ad';
            
            options += `<option value="${board.number}" style="color: ${vulnColor};">
                Board ${board.number} ${status} (${vulnerability})
            </option>`;
        });
        
        return options;
    }
    
    /**
     * Select board from dropdown
     */
    selectBoardFromDropdown() {
        const dropdown = document.getElementById('boardDropdown');
        if (dropdown && dropdown.value) {
            const boardNum = parseInt(dropdown.value);
            this.closeBoardSelector();
            this.openSpecificTraveler(boardNum);
        } else {
            alert('Please select a board first!');
        }
    }
    
    /**
     * Close board selector
     */
    closeBoardSelector() {
        const popup = document.getElementById('boardSelectorPopup');
        if (popup) popup.remove();
        
        delete window.selectBoardFromDropdown;
        delete window.closeBoardSelector;
    }
    
    /**
     * Open specific traveler popup
     */
    openSpecificTraveler(boardNumber) {
        console.log(`🎯 Opening traveler for board ${boardNumber}`);
        
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showSpecificTravelerPopup();
    }
    
    /**
     * Show specific traveler popup
     */
    showSpecificTravelerPopup() {
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
            color: #2c3e50; min-width: 320px; box-sizing: border-box;
        `;
        
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #34495e; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #2c3e50;">Board ${this.traveler.boardNumber}</h3>
                <div style="color: #e74c3c; font-weight: bold; font-size: 14px;">${vulnerability} Vulnerable</div>
            </div>
            
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 600px;">
                    <thead>
                        <tr style="background: #34495e; color: white;">
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 60px;">NS</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 60px;">EW</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 70px; background: #e74c3c;">Bid</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 70px; background: #e74c3c;">Suit</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 50px; background: #e74c3c;">By</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 70px; background: #e74c3c;">Dbl</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 70px; background: #e74c3c;">Tricks</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 80px; background: #3498db;">Score NS</th>
                            <th style="padding: 8px; border: 1px solid #2c3e50; width: 80px; background: #3498db;">Score EW</th>
                        </tr>
                    </thead>
                    <tbody id="travelerTableBody">
                        ${this.getTravelerRowsHTML()}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 4px; font-size: 12px;">
                <strong>Instructions:</strong> 
                <br>• Fill in the <span style="color: #e74c3c; font-weight: bold;">red columns</span> with contract details
                <br>• <span style="color: #3498db; font-weight: bold;">Blue columns</span> will calculate automatically when you click Calculate
                <br>• Use dropdowns: Bid (1-7), Suit (♣♦♥♠NT), By (NSEW), Dbl (X/XX), Tricks (0-13)
                <br>• Doubling affects scoring: X = doubled, XX = redoubled
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.calculateAllScores()" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Calculate All Scores</button>
                <button onclick="window.saveTravelerData()" style="background: #3498db; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Save & Close</button>
                <button onclick="window.closeTravelerPopup()" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        // Set up global functions for the traveler popup
        this.setupTravelerGlobals();
        
        // Add change listeners to all dropdowns
        this.setupDropdownListeners();
    }
    
    /**
     * Get traveler rows HTML with dropdowns
     */
    getTravelerRowsHTML() {
        return this.traveler.data.map((row, index) => `
            <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.nsPair}</td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.ewPair}</td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="level" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="1" ${row.level === '1' ? 'selected' : ''}>1</option>
                        <option value="2" ${row.level === '2' ? 'selected' : ''}>2</option>
                        <option value="3" ${row.level === '3' ? 'selected' : ''}>3</option>
                        <option value="4" ${row.level === '4' ? 'selected' : ''}>4</option>
                        <option value="5" ${row.level === '5' ? 'selected' : ''}>5</option>
                        <option value="6" ${row.level === '6' ? 'selected' : ''}>6</option>
                        <option value="7" ${row.level === '7' ? 'selected' : ''}>7</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="suit" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 14px; font-weight: bold;">
                        <option value="">-</option>
                        <option value="♣" ${row.suit === '♣' ? 'selected' : ''}>♣</option>
                        <option value="♦" ${row.suit === '♦' ? 'selected' : ''}>♦</option>
                        <option value="♥" ${row.suit === '♥' ? 'selected' : ''}>♥</option>
                        <option value="♠" ${row.suit === '♠' ? 'selected' : ''}>♠</option>
                        <option value="NT" ${row.suit === 'NT' ? 'selected' : ''}>NT</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="declarer" style="width: 40px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="N" ${row.declarer === 'N' ? 'selected' : ''}>N</option>
                        <option value="S" ${row.declarer === 'S' ? 'selected' : ''}>S</option>
                        <option value="E" ${row.declarer === 'E' ? 'selected' : ''}>E</option>
                        <option value="W" ${row.declarer === 'W' ? 'selected' : ''}>W</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="double" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="X" ${row.double === 'X' ? 'selected' : ''}>X</option>
                        <option value="XX" ${row.double === 'XX' ? 'selected' : ''}>XX</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="tricks" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="0" ${row.tricks === '0' ? 'selected' : ''}>0</option>
                        <option value="1" ${row.tricks === '1' ? 'selected' : ''}>1</option>
                        <option value="2" ${row.tricks === '2' ? 'selected' : ''}>2</option>
                        <option value="3" ${row.tricks === '3' ? 'selected' : ''}>3</option>
                        <option value="4" ${row.tricks === '4' ? 'selected' : ''}>4</option>
                        <option value="5" ${row.tricks === '5' ? 'selected' : ''}>5</option>
                        <option value="6" ${row.tricks === '6' ? 'selected' : ''}>6</option>
                        <option value="7" ${row.tricks === '7' ? 'selected' : ''}>7</option>
                        <option value="8" ${row.tricks === '8' ? 'selected' : ''}>8</option>
                        <option value="9" ${row.tricks === '9' ? 'selected' : ''}>9</option>
                        <option value="10" ${row.tricks === '10' ? 'selected' : ''}>10</option>
                        <option value="11" ${row.tricks === '11' ? 'selected' : ''}>11</option>
                        <option value="12" ${row.tricks === '12' ? 'selected' : ''}>12</option>
                        <option value="13" ${row.tricks === '13' ? 'selected' : ''}>13</option>
                    </select>
                </td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; background: #ecf0f1;">
                    <span id="nsScore_${index}" style="font-weight: bold; color: #2c3e50; font-size: 12px;">
                        ${row.nsScore !== null ? row.nsScore : '-'}
                    </span>
                </td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; background: #ecf0f1;">
                    <span id="ewScore_${index}" style="font-weight: bold; color: #2c3e50; font-size: 12px;">
                        ${row.ewScore !== null ? row.ewScore : '-'}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * Setup dropdown change listeners
     */
    setupDropdownListeners() {
        const selects = document.querySelectorAll('#travelerPopup select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const rowIndex = parseInt(e.target.dataset.row);
                const field = e.target.dataset.field;
                const value = e.target.value;
                
                this.traveler.data[rowIndex][field] = value;
                
                // Auto-calculate if row is complete
                const row = this.traveler.data[rowIndex];
                if (row.level && row.suit && row.declarer && row.tricks) {
                    this.calculateScore(rowIndex);
                }
            });
        });
    }
    
    /**
     * Setup global functions for popup buttons
     */
    setupTravelerGlobals() {
        window.calculateAllScores = () => {
            this.traveler.data.forEach((_, index) => {
                this.calculateScore(index);
            });
        };
        
        window.saveTravelerData = () => {
            this.saveTravelerData();
        };
        
        window.closeTravelerPopup = () => {
            this.closeTravelerPopup();
        };
    }
    
    /**
     * Calculate score for a row
     */
    calculateScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.tricks) return;
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        
        // Determine if declarer's side is vulnerable
        let isVulnerable = false;
        if (vulnerability === 'Both') isVulnerable = true;
        else if (vulnerability === 'NS' && declarerSide === 'NS') isVulnerable = true;
        else if (vulnerability === 'EW' && declarerSide === 'EW') isVulnerable = true;
        
        // Calculate score with double/redouble
        const level = parseInt(row.level);
        const tricks = parseInt(row.tricks);
        const needed = 6 + level;
        const result = tricks - needed;
        const isDoubled = row.double === 'X';
        const isRedoubled = row.double === 'XX';
        const doubleMultiplier = isRedoubled ? 4 : (isDoubled ? 2 : 1);
        
        let score = 0;
        if (result >= 0) {
            // Contract made
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10; // NT bonus
            
            // Double the basic score if doubled/redoubled
            if (isDoubled || isRedoubled) {
                basicScore *= doubleMultiplier;
            }
            
            score = basicScore;
            
            // Add overtricks
            if (result > 0) {
                if (isDoubled || isRedoubled) {
                    // Doubled overtricks: 100/200 non-vul, 200/400 vul
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += result * overtrickValue * (isRedoubled ? 2 : 1);
                } else {
                    // Normal overtricks
                    score += result * suitPoints[row.suit];
                }
            }
            
            // Game bonus
            if (basicScore >= 100) {
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            // Double bonus: +50 for double, +100 for redouble
            if (isDoubled) score += 50;
            if (isRedoubled) score += 100;
            
        } else {
            // Contract failed
            const undertricks = Math.abs(result);
            
            if (isDoubled || isRedoubled) {
                // Doubled penalties
                let penalty = 0;
                for (let i = 1; i <= undertricks; i++) {
                    if (i === 1) {
                        penalty += isVulnerable ? 200 : 100;
                    } else if (i <= 3) {
                        penalty += isVulnerable ? 300 : 200;
                    } else {
                        penalty += 300;
                    }
                }
                score = -penalty * (isRedoubled ? 2 : 1);
            } else {
                // Normal penalties
                score = -(undertricks * (isVulnerable ? 100 : 50));
            }
        }
        
        // Assign scores - NO NEGATIVE SCORES IN DUPLICATE
        if (declarerSide === 'NS') {
            if (score > 0) {
                row.nsScore = score;
                row.ewScore = 0;
            } else {
                row.nsScore = 0;
                row.ewScore = Math.abs(score);
            }
        } else {
            if (score > 0) {
                row.ewScore = score;
                row.nsScore = 0;
            } else {
                row.ewScore = 0;
                row.nsScore = Math.abs(score);
            }
        }
        
        // Update display
        const nsSpan = document.getElementById(`nsScore_${rowIndex}`);
        const ewSpan = document.getElementById(`ewScore_${rowIndex}`);
        if (nsSpan) nsSpan.textContent = row.nsScore;
        if (ewSpan) ewSpan.textContent = row.ewScore;
    }
    
    /**
     * Get board vulnerability - FIXED CYCLE
     */
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        if (cycle === 0) return 'None';        // Board 1, 17, 33...
        if (cycle === 1) return 'NS';          // Board 2, 18, 34...
        if (cycle === 2) return 'EW';          // Board 3, 19, 35...
        if (cycle === 3) return 'Both';        // Board 4, 20, 36...
        if (cycle === 4) return 'EW';          // Board 5, 21, 37...
        if (cycle === 5) return 'Both';        // Board 6, 22, 38...
        if (cycle === 6) return 'None';        // Board 7, 23, 39...
        if (cycle === 7) return 'NS';          // Board 8, 24, 40...
        if (cycle === 8) return 'NS';          // Board 9, 25, 41...
        if (cycle === 9) return 'EW';          // Board 10, 26, 42...
        if (cycle === 10) return 'Both';       // Board 11, 27, 43...
        if (cycle === 11) return 'None';       // Board 12, 28, 44...
        if (cycle === 12) return 'Both';       // Board 13, 29, 45...
        if (cycle === 13) return 'None';       // Board 14, 30, 46...
        if (cycle === 14) return 'NS';         // Board 15, 31, 47...
        if (cycle === 15) return 'EW';         // Board 16, 32, 48...
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
        delete window.calculateAllScores;
        delete window.saveTravelerData;
        delete window.closeTravelerPopup;
        
        this.updateDisplay();
    }
    
    /**
     * Show movement popup - FIXED
     */
    showMovementPopup() {
        const movement = this.session.movement;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 20px; border-radius: 8px; 
            max-width: 90%; max-height: 80%; overflow: auto; 
            color: #2c3e50; min-width: 300px;
        `;
        
        content.innerHTML = `
            <h3 style="margin-top: 0; text-align: center;">${movement.description}</h3>
            ${this.getMovementTableHTML()}
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Close</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); window.duplicateBridge.handleAction('2');" 
                        style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">Confirm Movement</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        // Store reference for dropdown callback
        window.duplicateBridge = this;
    }
    
    /**
     * Get movement table HTML
     */
    getMovementTableHTML() {
        const movement = this.session.movement;
        if (!movement || !movement.movement) return '<p>Movement data not available</p>';
        
        // Group by rounds
        const roundData = {};
        movement.movement.forEach(entry => {
            if (!roundData[entry.round]) {
                roundData[entry.round] = [];
            }
            roundData[entry.round].push(entry);
        });
        
        let html = `
            <div style="overflow-x: auto; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 400px;">
                    <thead>
                        <tr style="background: #34495e; color: white;">
                            <th style="padding: 8px; border: 1px solid #2c3e50;">Round</th>
        `;
        
        // Add table headers
        for (let t = 1; t <= movement.tables; t++) {
            html += `<th style="padding: 8px; border: 1px solid #2c3e50;">Table ${t}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        // Add round data
        Object.keys(roundData).sort((a,b) => parseInt(a) - parseInt(b)).forEach(round => {
            html += `<tr><td style="padding: 8px; border: 1px solid #2c3e50; font-weight: bold; background: #ecf0f1; text-align: center;">${round}</td>`;
            
            const roundEntries = roundData[round];
            
            // Add table data
            for (let t = 1; t <= movement.tables; t++) {
                const entry = roundEntries.find(e => e.table === t);
                if (entry) {
                    const boardRange = entry.boards.length > 1 ? 
                        `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : 
                        entry.boards[0];
                    
                    // Get vulnerability for boards
                    const vulnInfo = entry.boards.map(boardNum => {
                        const vuln = this.getBoardVulnerability(boardNum);
                        const vulnColor = vuln === 'None' ? '#95a5a6' : 
                                        vuln === 'NS' ? '#e74c3c' : 
                                        vuln === 'EW' ? '#f39c12' : '#8e44ad';
                        return `<span style="color: ${vulnColor}; font-weight: bold;">${boardNum}(${vuln})</span>`;
                    }).join(' ');
                    
                    html += `
                        <td style="padding: 8px; border: 1px solid #2c3e50; text-align: center; font-size: 11px;">
                            <div><strong>NS: ${entry.ns}</strong></div>
                            <div><strong>EW: ${entry.ew}</strong></div>
                            <div style="color: #666; margin-top: 4px;">${vulnInfo}</div>
                        </td>`;
                } else {
                    html += '<td style="padding: 8px; border: 1px solid #2c3e50; text-align: center;">-</td>';
                }
            }
            
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        html += `
            <div style="background: #ecf0f1; padding: 15px; border-radius: 4px; margin-top: 15px; font-size: 12px;">
                <strong>How to use this movement:</strong>
                <br>• Each round, pairs move to their assigned table and position (NS or EW)
                <br>• Play the boards shown for that table in that round
                <br>• <strong>Vulnerability Legend:</strong> <span style="color: #95a5a6; font-weight: bold;">None</span>, <span style="color: #e74c3c; font-weight: bold;">NS</span>, <span style="color: #f39c12; font-weight: bold;">EW</span>, <span style="color: #8e44ad; font-weight: bold;">Both</span>
                <br>• Use this app to enter results after each session
                <br>• Total playing time: approximately ${movement.description.split('~')[1] || '2-3 hours'}
            </div>
        `;
        
        return html;
    }
    
    /**
     * Get active buttons
     */
    getActiveButtons() {
        // Don't update buttons when traveler popup is active
        if (this.traveler.isActive) {
            return [];
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4','6','8']; // Available movements
            case 'movement_confirm':
                return ['1','2','BACK'];
            case 'board_selection':
                // Always use dropdown - simpler and scalable
                const buttons = [];
                const allComplete = this.areAllBoardsComplete();
                if (allComplete) {
                    buttons.push('RESULTS');
                }
                buttons.push('BACK');
                return buttons;
            case 'results':
                return ['BACK'];
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
                            • <strong>4 pairs:</strong> 2 tables, 12 boards, ~2 hours<br>
                            • <strong>6 pairs:</strong> 3 tables, 10 boards, ~1.5 hours<br>
                            • <strong>8 pairs:</strong> 4 tables, 14 boards, ~2.5 hours
                        </div>
                    </div>
                    <div class="current-state">Select pairs: 4, 6, or 8</div>
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
                        <div style="background: #3498db; color: white; padding: 12px; border-radius: 4px; margin-top: 8px; text-align: center; font-weight: bold;">
                            Press <strong>1</strong> to view MOVEMENT table<br>
                            Press <strong>2</strong> to CONFIRM and start scoring
                        </div>
                        <div style="color: #666; font-size: 11px; margin-top: 8px; text-align: center;">
                            Traveler entry uses dropdown menus for easy data input
                        </div>
                    </div>
                    <div class="current-state">1=View Movement, 2=Confirm, Back</div>
                `;
                
            case 'board_selection':
                const completed = Object.values(this.session.boards).filter(b => b.completed).length;
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">${completed}/${this.session.movement.totalBoards} Done</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Traveler Entry - ${this.session.movement.description}</strong></div>
                        <div style="color: #2c3e50; margin-top: 8px;">
                            Select board to enter results from travelers.<br>
                            Use dropdown menus to enter: Bid, Suit, Declarer, Double, Tricks.
                        </div>
                        ${this.getBoardStatusDisplay()}
                        
                        <div style="text-align: center; margin: 15px 0;">
                            <button onclick="window.duplicateBridge.openTravelerPopup()" 
                                    style="background: #3498db; color: white; border: none; padding: 15px 25px; border-radius: 8px; font-size: 16px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                📋 Select Board to Enter Results
                            </button>
                        </div>
                        ${this.areAllBoardsComplete() ? 
                            '<div style="background: #27ae60; color: white; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: center; font-weight: bold;">🏆 All boards complete! Press RESULTS to see final rankings.</div>' : 
                            '<div style="background: #ecf0f1; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 11px; color: #2c3e50;"><strong>💡 Tip:</strong> Fill red columns (Bid, Suit, By, Dbl, Tricks) and scores calculate automatically. Blue columns show the calculated NS and EW scores.</div>'
                        }
                    </div>
                    <div class="current-state">Use dropdown to select board${this.areAllBoardsComplete() ? ' or RESULTS for final rankings' : ''}</div>
                `;
                
            case 'results':
                return this.getResultsDisplay();
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Check if all boards are complete
     */
    areAllBoardsComplete() {
        return Object.values(this.session.boards).every(board => board.completed);
    }
    
    /**
     * Calculate final results with matchpoints
     */
    calculateFinalResults() {
        const pairs = [];
        for (let p = 1; p <= this.session.pairs; p++) {
            pairs.push({
                pair: p,
                totalMatchpoints: 0,
                maxPossible: 0,
                percentage: 0,
                boardResults: {}
            });
        }
        
        // Calculate matchpoints for each board
        Object.values(this.session.boards).forEach(board => {
            if (!board.completed || !board.results.length) return;
            
            const boardResults = board.results.filter(result => 
                result.nsScore !== null && result.ewScore !== null
            );
            
            if (boardResults.length === 0) return;
            
            // Calculate matchpoints for NS scores
            boardResults.forEach(result => {
                const nsPair = result.nsPair;
                const nsScore = result.nsScore;
                
                let matchpoints = 0;
                let maxPossible = (boardResults.length - 1) * 2;
                
                boardResults.forEach(otherResult => {
                    if (otherResult.nsPair !== nsPair) {
                        const otherNsScore = otherResult.nsScore;
                        if (nsScore > otherNsScore) {
                            matchpoints += 2;
                        } else if (nsScore === otherNsScore) {
                            matchpoints += 1;
                        }
                    }
                });
                
                const pairIndex = pairs.findIndex(p => p.pair === nsPair);
                if (pairIndex !== -1) {
                    pairs[pairIndex].totalMatchpoints += matchpoints;
                    pairs[pairIndex].maxPossible += maxPossible;
                    pairs[pairIndex].boardResults[board.number] = {
                        score: nsScore,
                        matchpoints: matchpoints,
                        maxPossible: maxPossible
                    };
                }
            });
            
            // Calculate matchpoints for EW scores
            boardResults.forEach(result => {
                const ewPair = result.ewPair;
                const ewScore = result.ewScore;
                
                let matchpoints = 0;
                let maxPossible = (boardResults.length - 1) * 2;
                
                boardResults.forEach(otherResult => {
                    if (otherResult.ewPair !== ewPair) {
                        const otherEwScore = otherResult.ewScore;
                        if (ewScore > otherEwScore) {
                            matchpoints += 2;
                        } else if (ewScore === otherEwScore) {
                            matchpoints += 1;
                        }
                    }
                });
                
                const pairIndex = pairs.findIndex(p => p.pair === ewPair);
                if (pairIndex !== -1) {
                    pairs[pairIndex].totalMatchpoints += matchpoints;
                    pairs[pairIndex].maxPossible += maxPossible;
                    pairs[pairIndex].boardResults[board.number] = {
                        score: ewScore,
                        matchpoints: matchpoints,
                        maxPossible: maxPossible
                    };
                }
            });
        });
        
        // Calculate percentages and sort
        pairs.forEach(pair => {
            if (pair.maxPossible > 0) {
                pair.percentage = (pair.totalMatchpoints / pair.maxPossible * 100).toFixed(1);
            }
        });
        
        pairs.sort((a, b) => b.totalMatchpoints - a.totalMatchpoints);
        
        return pairs;
    }
    getBoardStatusDisplay() {
        const status = [];
        Object.values(this.session.boards).forEach(board => {
            const icon = board.completed ? '✅' : '⭕';
            const color = board.completed ? '#27ae60' : '#e74c3c';
            status.push(`<span style="color: ${color}; font-weight: bold;">B${board.number}${icon}</span>`);
        });
        
        return `<div style="font-size: 12px; margin-top: 10px; text-align: center;">${status.join(' ')}</div>`;
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
            case 'results':
                this.inputState = 'board_selection';
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
                    <p>Easy-to-use duplicate bridge scoring with dropdown interface for entering traveler results.</p>
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
                        <li><strong>Setup:</strong> Choose pairs → view movement table → confirm</li>
                        <li><strong>Play session:</strong> Print/display movement table for seating</li>
                        <li><strong>Score entry:</strong> Select board → traveler popup opens</li>
                        <li><strong>Fill data:</strong> Use dropdowns for Bid, Suit, Declarer, Tricks</li>
                        <li><strong>Calculate:</strong> Scores auto-calculate or click Calculate All</li>
                        <li><strong>Save:</strong> Click Save & Close when complete</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Traveler Interface</h4>
                    <ul>
                        <li><strong>Red columns:</strong> Manual entry required (Bid, Suit, By, Tricks)</li>
                        <li><strong>Blue columns:</strong> Auto-calculated scores (NS Score, EW Score)</li>
                        <li><strong>Dropdown menus:</strong> No typing needed, just select from options</li>
                        <li><strong>Vulnerability:</strong> Automatically displayed and calculated</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Scoring Features</h4>
                    <ul>
                        <li><strong>Automatic calculation:</strong> Bridge scoring with vulnerability</li>
                        <li><strong>Progress tracking:</strong> Visual indicators for completed boards</li>
                        <li><strong>Error prevention:</strong> Dropdown validation prevents invalid entries</li>
                        <li><strong>Mobile friendly:</strong> Works perfectly on tablets and phones</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect for Clubs & Cruises</h4>
                    <ul>
                        <li><strong>Easy setup:</strong> Choose movement and start playing</li>
                        <li><strong>Director friendly:</strong> One device handles all scoring</li>
                        <li><strong>No typing:</strong> All input via dropdown menus</li>
                        <li><strong>Professional results:</strong> Accurate duplicate bridge scoring</li>
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
        delete window.calculateAllScores;
        delete window.saveTravelerData;
        delete window.closeTravelerPopup;
        delete window.selectBoardFromDropdown;
        delete window.closeBoardSelector;
        delete window.duplicateBridge;
        
        console.log('🧹 Duplicate Bridge cleanup completed');
    }
}

export default DuplicateBridge;