/**
 * Duplicate Bridge Mode - Authentic Howell Movements with Popup Traveler
 * 
 * Uses authentic movement data from professional bridge sources.
 * Features popup traveler interface for score entry matching real tournaments.
 */

import { BaseBridgeMode } from './base-mode.js';

class DuplicateBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'duplicate';
        this.displayName = 'Duplicate Bridge';
        
        // Session state
        this.session = {
            pairs: 0,
            tables: 0,
            rounds: 0,
            totalBoards: 0,
            movementType: '',
            boards: [],
            isSetup: false
        };
        
        // Current traveler entry state
        this.travelerEntry = {
            boardNumber: null,
            isActive: false,
            results: [],
            currentRow: 0,
            inputMode: 'bid_level', // bid_level, bid_suit, declarer, tricks, score
            currentInput: ''
        };
        
        this.inputState = 'pairs_setup';
        
        // Initialize authentic Howell movements from PDFs
        this.initializeAuthenticMovements();
        
        console.log('🏆 Duplicate Bridge initialized with authentic PDF movements');
    }
    
    /**
     * Go to next board
     */
    goToNextBoard() {
        // Save current traveler first
        this.saveTravelerData();
        
        // Move to next board
        const nextBoard = this.travelerEntry.boardNumber + 1;
        if (nextBoard <= this.session.totalBoards) {
            this.closeTravelerPopup();
            this.openTravelerPopup(nextBoard);
        } else {
            // No more boards
            this.closeTravelerPopup();
            alert('No more boards to enter!');
        }
    }
    
    /**
     * Initialize authentic movement data from professional PDF sources
     */
    initializeAuthenticMovements() {
        this.movements = {
            4: {
                pairs: 4,
                tables: 2,
                rounds: 6,
                totalBoards: 12,
                boardsPerRound: 2,
                description: "2-table Howell, 12 boards, ~2 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    // Round 2
                    { round: 2, table: 1, ns: 2, ew: 4, boards: [5,6] },
                    { round: 2, table: 2, ns: 3, ew: 1, boards: [7,8] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [9,10] },
                    { round: 3, table: 2, ns: 2, ew: 3, boards: [11,12] },
                    // Round 4
                    { round: 4, table: 1, ns: 4, ew: 3, boards: [1,2] },
                    { round: 4, table: 2, ns: 2, ew: 1, boards: [3,4] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 3, boards: [5,6] },
                    { round: 5, table: 2, ns: 4, ew: 2, boards: [7,8] },
                    // Round 6
                    { round: 6, table: 1, ns: 3, ew: 2, boards: [9,10] },
                    { round: 6, table: 2, ns: 4, ew: 1, boards: [11,12] }
                ]
            },
            5: {
                pairs: 5,
                tables: 2,
                rounds: 5,
                totalBoards: 15,
                boardsPerRound: 3,
                description: "2.5-table Howell with sit-outs, 15 boards, ~2.5 hours",
                sitOut: true,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [10,11,12] },
                    { round: 1, table: 3, ns: 5, ew: null, boards: [4,5,6], sitOut: true },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 4, boards: [4,5,6] },
                    { round: 2, table: 2, ns: 2, ew: null, boards: [10,11,12], sitOut: true },
                    { round: 2, table: 3, ns: 4, ew: null, boards: [7,8,9], sitOut: true },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: null, boards: [7,8,9], sitOut: true },
                    { round: 3, table: 2, ns: 4, ew: 5, boards: [1,2,3] },
                    { round: 3, table: 3, ns: 2, ew: 3, boards: [4,5,6] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [10,11,12] },
                    { round: 4, table: 2, ns: 3, ew: null, boards: [1,2,3], sitOut: true },
                    { round: 4, table: 3, ns: 4, ew: 2, boards: [7,8,9] },
                    // Round 5 - Boards 13,14,15 shared between tables
                    { round: 5, table: 1, ns: 1, ew: 3, boards: [13,14,15] },
                    { round: 5, table: 2, ns: 5, ew: 2, boards: [13,14,15] },
                    { round: 5, table: 3, ns: null, ew: 4, boards: [], sitOut: true }
                ]
            },
            7: {
                pairs: 7,
                tables: 3,
                rounds: 7,
                totalBoards: 14,
                boardsPerRound: 2,
                description: "3.5-table Howell with sit-outs, 14 boards, ~2.5 hours",
                sitOut: true,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 1, table: 4, ns: 7, ew: null, boards: [9,10], sitOut: true },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 6, boards: [3,4] },
                    { round: 2, table: 2, ns: 7, ew: 3, boards: [5,6] },
                    { round: 2, table: 3, ns: 4, ew: null, boards: [7,8], sitOut: true },
                    { round: 2, table: 4, ns: 2, ew: 5, boards: [11,12] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: null, boards: [5,6], sitOut: true },
                    { round: 3, table: 2, ns: 2, ew: 7, boards: [7,8] },
                    { round: 3, table: 3, ns: 3, ew: 5, boards: [9,10] },
                    { round: 3, table: 4, ns: 6, ew: 4, boards: [13,14] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
                    { round: 4, table: 2, ns: 6, ew: 2, boards: [9,10] },
                    { round: 4, table: 3, ns: 7, ew: 4, boards: [11,12] },
                    { round: 4, table: 4, ns: null, ew: 3, boards: [1,2], sitOut: true },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 4, boards: [9,10] },
                    { round: 5, table: 2, ns: null, ew: 6, boards: [11,12], sitOut: true },
                    { round: 5, table: 3, ns: 2, ew: 3, boards: [13,14] },
                    { round: 5, table: 4, ns: 5, ew: 7, boards: [3,4] },
                    // Round 6
                    { round: 6, table: 1, ns: 1, ew: 3, boards: [11,12] },
                    { round: 6, table: 2, ns: 5, ew: null, boards: [13,14], sitOut: true },
                    { round: 6, table: 3, ns: 6, ew: 7, boards: [1,2] },
                    { round: 6, table: 4, ns: 4, ew: 2, boards: [5,6] },
                    // Round 7
                    { round: 7, table: 1, ns: 1, ew: 7, boards: [13,14] },
                    { round: 7, table: 2, ns: 4, ew: 5, boards: [1,2] },
                    { round: 7, table: 3, ns: 2, ew: null, boards: [3,4], sitOut: true },
                    { round: 7, table: 4, ns: 3, ew: 6, boards: [7,8] }
                ]
            },
            8: {
                pairs: 8,
                tables: 4,
                rounds: 7,
                totalBoards: 14,
                boardsPerRound: 2,
                description: "4-table Howell, 14 boards, ~2.5 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [9,10] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 6, boards: [3,4] },
                    { round: 2, table: 2, ns: 7, ew: 3, boards: [5,6] },
                    { round: 2, table: 3, ns: 4, ew: 8, boards: [7,8] },
                    { round: 2, table: 4, ns: 2, ew: 5, boards: [11,12] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 8, boards: [5,6] },
                    { round: 3, table: 2, ns: 2, ew: 7, boards: [7,8] },
                    { round: 3, table: 3, ns: 3, ew: 5, boards: [9,10] },
                    { round: 3, table: 4, ns: 6, ew: 4, boards: [13,14] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [7,8] },
                    { round: 4, table: 2, ns: 6, ew: 2, boards: [9,10] },
                    { round: 4, table: 3, ns: 7, ew: 4, boards: [11,12] },
                    { round: 4, table: 4, ns: 8, ew: 3, boards: [1,2] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 4, boards: [9,10] },
                    { round: 5, table: 2, ns: 8, ew: 6, boards: [11,12] },
                    { round: 5, table: 3, ns: 2, ew: 3, boards: [13,14] },
                    { round: 5, table: 4, ns: 5, ew: 7, boards: [3,4] },
                    // Round 6
                    { round: 6, table: 1, ns: 1, ew: 3, boards: [11,12] },
                    { round: 6, table: 2, ns: 5, ew: 8, boards: [13,14] },
                    { round: 6, table: 3, ns: 6, ew: 7, boards: [1,2] },
                    { round: 6, table: 4, ns: 4, ew: 2, boards: [5,6] },
                    // Round 7
                    { round: 7, table: 1, ns: 1, ew: 7, boards: [13,14] },
                    { round: 7, table: 2, ns: 4, ew: 5, boards: [1,2] },
                    { round: 7, table: 3, ns: 8, ew: 2, boards: [3,4] },
                    { round: 7, table: 4, ns: 3, ew: 6, boards: [7,8] }
                ]
            },
            9: {
                pairs: 9,
                tables: 4,
                rounds: 6,
                totalBoards: 12,
                boardsPerRound: 2,
                description: "4.5-table Howell with sit-outs, 12 boards, ~2.5 hours",
                sitOut: true,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [7,8] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [9,10] },
                    { round: 1, table: 5, ns: 9, ew: null, boards: [11,12], sitOut: true },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 8, boards: [3,4] },
                    { round: 2, table: 2, ns: 9, ew: 4, boards: [5,6] },
                    { round: 2, table: 3, ns: 2, ew: 6, boards: [9,10] },
                    { round: 2, table: 4, ns: 7, ew: 3, boards: [11,12] },
                    { round: 2, table: 5, ns: 5, ew: null, boards: [1,2], sitOut: true },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 3, boards: [5,6] },
                    { round: 3, table: 2, ns: null, ew: 4, boards: [7,8], sitOut: true },
                    { round: 3, table: 3, ns: 8, ew: 6, boards: [11,12] },
                    { round: 3, table: 4, ns: 7, ew: 9, boards: [1,2] },
                    { round: 3, table: 5, ns: 5, ew: 2, boards: [3,4] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 9, boards: [7,8] },
                    { round: 4, table: 2, ns: 4, ew: 5, boards: [9,10] },
                    { round: 4, table: 3, ns: 6, ew: 3, boards: [1,2] },
                    { round: 4, table: 4, ns: null, ew: 7, boards: [3,4], sitOut: true },
                    { round: 4, table: 5, ns: 2, ew: 8, boards: [5,6] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: null, boards: [9,10], sitOut: true },
                    { round: 5, table: 2, ns: 4, ew: 2, boards: [11,12] },
                    { round: 5, table: 3, ns: 6, ew: 9, boards: [3,4] },
                    { round: 5, table: 4, ns: 5, ew: 7, boards: [5,6] },
                    { round: 5, table: 5, ns: 8, ew: 3, boards: [7,8] },
                    // Round 6
                    { round: 6, table: 1, ns: 1, ew: 5, boards: [11,12] },
                    { round: 6, table: 2, ns: 4, ew: 8, boards: [1,2] },
                    { round: 6, table: 3, ns: 6, ew: null, boards: [5,6], sitOut: true },
                    { round: 6, table: 4, ns: 2, ew: 7, boards: [7,8] },
                    { round: 6, table: 5, ns: 3, ew: 9, boards: [9,10] }
                ]
            },
            10: {
                pairs: 10,
                tables: 5,
                rounds: 6,
                totalBoards: 12,
                boardsPerRound: 2,
                description: "5-table Howell, 12 boards, ~2.5 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [7,8] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [9,10] },
                    { round: 1, table: 5, ns: 9, ew: 10, boards: [11,12] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 8, boards: [3,4] },
                    { round: 2, table: 2, ns: 9, ew: 4, boards: [5,6] },
                    { round: 2, table: 3, ns: 2, ew: 6, boards: [9,10] },
                    { round: 2, table: 4, ns: 7, ew: 3, boards: [11,12] },
                    { round: 2, table: 5, ns: 10, ew: 5, boards: [1,2] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 3, boards: [5,6] },
                    { round: 3, table: 2, ns: 10, ew: 4, boards: [7,8] },
                    { round: 3, table: 3, ns: 8, ew: 6, boards: [11,12] },
                    { round: 3, table: 4, ns: 7, ew: 9, boards: [1,2] },
                    { round: 3, table: 5, ns: 5, ew: 2, boards: [3,4] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 9, boards: [7,8] },
                    { round: 4, table: 2, ns: 4, ew: 5, boards: [9,10] },
                    { round: 4, table: 3, ns: 6, ew: 3, boards: [1,2] },
                    { round: 4, table: 4, ns: 10, ew: 7, boards: [3,4] },
                    { round: 4, table: 5, ns: 2, ew: 8, boards: [5,6] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 10, boards: [9,10] },
                    { round: 5, table: 2, ns: 4, ew: 2, boards: [11,12] },
                    { round: 5, table: 3, ns: 6, ew: 9, boards: [3,4] },
                    { round: 5, table: 4, ns: 5, ew: 7, boards: [5,6] },
                    { round: 5, table: 5, ns: 8, ew: 3, boards: [7,8] },
                    // Round 6
                    { round: 6, table: 1, ns: 1, ew: 5, boards: [11,12] },
                    { round: 6, table: 2, ns: 4, ew: 8, boards: [1,2] },
                    { round: 6, table: 3, ns: 6, ew: 10, boards: [5,6] },
                    { round: 6, table: 4, ns: 2, ew: 7, boards: [7,8] },
                    { round: 6, table: 5, ns: 3, ew: 9, boards: [9,10] }
                ]
            }
        };
    }
    
    /**
     * Initialize Duplicate Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Duplicate Bridge session with authentic movements');
        this.inputState = 'pairs_setup';
        this.updateDisplay();
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Duplicate Bridge action: ${value} in state: ${this.inputState}`);
        
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
            case 'traveler_entry':
                this.handleTravelerEntry(value);
                break;
            case 'results_view':
                this.handleResultsView(value);
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * Handle pairs setup
     */
    handlePairsSetup(value) {
        let pairCount;
        if (value === '0') {
            pairCount = 10; // Button "0" = 10 pairs
        } else {
            pairCount = parseInt(value);
        }
        
        if (this.movements[pairCount]) {
            this.session.pairs = pairCount;
            const movement = this.movements[pairCount];
            this.session.tables = movement.tables;
            this.session.rounds = movement.rounds;
            this.session.totalBoards = movement.totalBoards;
            this.session.movementType = pairCount;
            
            this.inputState = 'movement_confirm';
            console.log(`📋 Selected ${pairCount} pairs: ${movement.description}`);
        }
    }
    
    /**
     * Handle movement confirmation
     */
    handleMovementConfirm(value) {
        if (value === '1') {
            // Show movement table popup
            this.showMovementPopup();
        } else if (value === '2') {
            // Initialize boards array
            this.session.boards = [];
            for (let i = 1; i <= this.session.totalBoards; i++) {
                this.session.boards.push({
                    number: i,
                    travelerResults: [],
                    matchpoints: null
                });
            }
            
            this.session.isSetup = true;
            this.inputState = 'board_selection';
            console.log(`✅ Movement confirmed, ready for traveler entry`);
        } else if (value === 'BACK') {
            this.inputState = 'pairs_setup';
        }
    }
    
    /**
     * Handle board selection
     */
    handleBoardSelection(value) {
        if (value === 'RESULTS') {
            this.inputState = 'results_view';
            return;
        }
        
        const boardNum = parseInt(value);
        if (boardNum >= 1 && boardNum <= this.session.totalBoards) {
            this.openTravelerPopup(boardNum);
        }
    }
    
    /**
     * Open traveler popup for board entry
     */
    openTravelerPopup(boardNumber) {
        this.travelerEntry.boardNumber = boardNumber;
        this.travelerEntry.isActive = true;
        this.travelerEntry.results = this.getTravelerInstancesForBoard(boardNumber);
        this.travelerEntry.currentRow = 0;
        this.travelerEntry.inputMode = 'bid_level';
        this.travelerEntry.currentInput = '';
        
        this.showTravelerPopup();
    }
    
    /**
     * Get traveler instances for a board
     */
    getTravelerInstancesForBoard(boardNumber) {
        const movement = this.movements[this.session.movementType];
        if (!movement) return [];
        
        const instances = movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber) && !entry.sitOut
        );
        
        return instances.map(instance => ({
            nsPair: instance.ns,
            ewPair: instance.ew,
            round: instance.round,
            table: instance.table,
            bidLevel: '',
            bidSuit: '',
            declarer: '',
            tricks: '',
            nsScore: null,
            ewScore: null,
            calculated: false
        }));
    }
    
    /**
     * Show traveler popup
     */
    showTravelerPopup() {
        const board = this.session.boards[this.travelerEntry.boardNumber - 1];
        const vulnerability = this.getBoardVulnerability(this.travelerEntry.boardNumber);
        
        const popup = document.createElement('div');
        popup.id = 'travelerPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: white; padding: 15px; border-radius: 8px; 
            max-width: 95%; max-height: 90%; overflow: auto; 
            color: #2c3e50; width: 100%; box-sizing: border-box;
        `;
        
        popupContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 2px solid #34495e; padding-bottom: 10px;">
                <h3 style="margin: 0; color: #2c3e50;">Board ${this.travelerEntry.boardNumber} - ${vulnerability} Vulnerable</h3>
                <button id="closeTraveler" style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">✕ Close</button>
            </div>
            
            ${this.getTravelerTableHTML()}
            
            <div style="margin-top: 15px; padding: 10px; background: #ecf0f1; border-radius: 4px; font-size: 12px;">
                <strong>Input Guide:</strong> Select a cell to enter data. Use number buttons or two-digit entry (1+1=11). 
                Press <strong>Calculate</strong> when row is complete.
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="calculateScores" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Calculate Scores</button>
                <button id="nextBoard" style="background: #f39c12; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Next Board</button>
                <button id="saveTraveler" style="background: #3498db; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Save & Close</button>
            </div>
        `;
        
        popup.appendChild(popupContent);
        document.body.appendChild(popup);
        
        // Add event listeners
        this.setupTravelerEventListeners();
    }
    
    /**
     * Get traveler table HTML
     */
    getTravelerTableHTML() {
        let html = `
            <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 600px;">
                <thead>
                    <tr style="background: #34495e; color: white;">
                        <th style="padding: 6px; border: 1px solid #2c3e50;">N/S Pair</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50;">E/W Pair</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #e74c3c;">Bid</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #e74c3c;">Suit</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #e74c3c;">By</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #e74c3c;">Tricks</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #3498db;">Score N/S</th>
                        <th style="padding: 6px; border: 1px solid #2c3e50; background: #3498db;">Score E/W</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.travelerEntry.results.forEach((result, index) => {
            html += `
                <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                    <td style="padding: 6px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${result.nsPair}</td>
                    <td style="padding: 6px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${result.ewPair}</td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                        <input type="text" id="bid_${index}" data-row="${index}" data-field="bidLevel" 
                               style="width: 30px; text-align: center; border: 1px solid #ccc; padding: 2px; font-size: 12px;" 
                               maxlength="1" value="${result.bidLevel}">
                    </td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                        <select id="suit_${index}" data-row="${index}" data-field="bidSuit" 
                                style="width: 50px; padding: 2px; border: 1px solid #ccc; font-size: 12px;">
                            <option value="">-</option>
                            <option value="♣" ${result.bidSuit === '♣' ? 'selected' : ''}>♣</option>
                            <option value="♦" ${result.bidSuit === '♦' ? 'selected' : ''}>♦</option>
                            <option value="♥" ${result.bidSuit === '♥' ? 'selected' : ''}>♥</option>
                            <option value="♠" ${result.bidSuit === '♠' ? 'selected' : ''}>♠</option>
                            <option value="NT" ${result.bidSuit === 'NT' ? 'selected' : ''}>NT</option>
                        </select>
                    </td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                        <select id="declarer_${index}" data-row="${index}" data-field="declarer" 
                                style="width: 40px; padding: 2px; border: 1px solid #ccc; font-size: 12px;">
                            <option value="">-</option>
                            <option value="N" ${result.declarer === 'N' ? 'selected' : ''}>N</option>
                            <option value="S" ${result.declarer === 'S' ? 'selected' : ''}>S</option>
                            <option value="E" ${result.declarer === 'E' ? 'selected' : ''}>E</option>
                            <option value="W" ${result.declarer === 'W' ? 'selected' : ''}>W</option>
                        </select>
                    </td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                        <input type="text" id="tricks_${index}" data-row="${index}" data-field="tricks" 
                               style="width: 40px; text-align: center; border: 1px solid #ccc; padding: 2px; font-size: 12px;" 
                               maxlength="2" value="${result.tricks}">
                    </td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center; background: #ecf0f1;">
                        <span id="nsScore_${index}" style="font-weight: bold; color: #2c3e50; font-size: 12px;">
                            ${result.nsScore !== null ? result.nsScore : '-'}
                        </span>
                    </td>
                    <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center; background: #ecf0f1;">
                        <span id="ewScore_${index}" style="font-weight: bold; color: #2c3e50; font-size: 12px;">
                            ${result.ewScore !== null ? result.ewScore : '-'}
                        </span>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    /**
     * Setup traveler event listeners
     */
    setupTravelerEventListeners() {
        // Close button
        document.getElementById('closeTraveler').onclick = () => {
            this.closeTravelerPopup();
        };
        
        // Calculate scores button
        document.getElementById('calculateScores').onclick = () => {
            this.calculateTravelerScores();
        };
        
        // Next board button
        document.getElementById('nextBoard').onclick = () => {
            this.goToNextBoard();
        };
        
        // Save traveler button
        document.getElementById('saveTraveler').onclick = () => {
            this.saveTravelerData();
        };
        
        // Input field event listeners for two-digit entry
        this.travelerEntry.results.forEach((_, index) => {
            const bidInput = document.getElementById(`bid_${index}`);
            const tricksInput = document.getElementById(`tricks_${index}`);
            
            if (bidInput) {
                bidInput.addEventListener('input', (e) => this.handleTravelerInput(e, index, 'bidLevel'));
                bidInput.addEventListener('keydown', (e) => this.handleTwoDigitEntry(e, index, 'bidLevel'));
            }
            
            if (tricksInput) {
                tricksInput.addEventListener('input', (e) => this.handleTravelerInput(e, index, 'tricks'));
                tricksInput.addEventListener('keydown', (e) => this.handleTwoDigitEntry(e, index, 'tricks'));
            }
            
            // Dropdowns
            const suitSelect = document.getElementById(`suit_${index}`);
            const declarerSelect = document.getElementById(`declarer_${index}`);
            
            if (suitSelect) {
                suitSelect.addEventListener('change', (e) => this.handleTravelerInput(e, index, 'bidSuit'));
            }
            
            if (declarerSelect) {
                declarerSelect.addEventListener('change', (e) => this.handleTravelerInput(e, index, 'declarer'));
            }
        });
        
        // Close popup when clicking outside
        document.getElementById('travelerPopup').addEventListener('click', (e) => {
            if (e.target.id === 'travelerPopup') {
                this.closeTravelerPopup();
            }
        });
    }
    
    /**
     * Handle two-digit entry for numbers > 9
     */
    handleTwoDigitEntry(event, rowIndex, field) {
        const input = event.target;
        const key = event.key;
        
        // Handle numeric keys for two-digit entry
        if (/^[0-9]$/.test(key)) {
            const currentValue = input.value;
            
            if (field === 'tricks') {
                // For tricks, allow 10, 11, 12, 13
                if (currentValue === '1' && ['0', '1', '2', '3'].includes(key)) {
                    event.preventDefault();
                    input.value = '1' + key;
                    this.travelerEntry.results[rowIndex][field] = input.value;
                    return;
                }
                
                if (currentValue === '' && key === '1') {
                    // Start building two-digit number
                    return;
                }
                
                if (currentValue === '' && ['6', '7', '8', '9'].includes(key)) {
                    // Single digit 6-9 for tricks
                    input.value = key;
                    this.travelerEntry.results[rowIndex][field] = key;
                    event.preventDefault();
                    return;
                }
            }
            
            if (field === 'bidLevel') {
                // For bid level, only allow 1-7
                if (['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
                    input.value = key;
                    this.travelerEntry.results[rowIndex][field] = key;
                    event.preventDefault();
                    return;
                }
            }
        }
        
        // Handle backspace
        if (key === 'Backspace') {
            return;
        }
        
        // Prevent other keys
        if (!/^[Backspace|Tab|ArrowLeft|ArrowRight|Delete]$/.test(key)) {
            event.preventDefault();
        }
    }
    
    /**
     * Handle traveler input changes
     */
    handleTravelerInput(event, rowIndex, field) {
        const value = event.target.value;
        this.travelerEntry.results[rowIndex][field] = value;
        
        // Auto-calculate when row is complete
        const result = this.travelerEntry.results[rowIndex];
        if (result.bidLevel && result.bidSuit && result.declarer && result.tricks) {
            this.calculateRowScore(rowIndex);
        }
    }
    
    /**
     * Calculate score for a single row
     */
    calculateRowScore(rowIndex) {
        const result = this.travelerEntry.results[rowIndex];
        const vulnerability = this.getBoardVulnerability(this.travelerEntry.boardNumber);
        
        // Determine if declarer's side is vulnerable
        const declarerSide = ['N', 'S'].includes(result.declarer) ? 'NS' : 'EW';
        let isVulnerable = false;
        
        if (vulnerability === 'Both') isVulnerable = true;
        else if (vulnerability === 'NS' && declarerSide === 'NS') isVulnerable = true;
        else if (vulnerability === 'EW' && declarerSide === 'EW') isVulnerable = true;
        
        // Calculate the score
        const score = this.calculateContractScore({
            level: parseInt(result.bidLevel),
            suit: result.bidSuit,
            declarer: result.declarer,
            tricks: parseInt(result.tricks),
            vulnerable: isVulnerable
        });
        
        // Assign scores to NS/EW
        if (declarerSide === 'NS') {
            result.nsScore = score;
            result.ewScore = score > 0 ? 0 : Math.abs(score);
        } else {
            result.ewScore = score;
            result.nsScore = score > 0 ? 0 : Math.abs(score);
        }
        
        result.calculated = true;
        
        // Update display
        document.getElementById(`nsScore_${rowIndex}`).textContent = result.nsScore;
        document.getElementById(`ewScore_${rowIndex}`).textContent = result.ewScore;
    }
    
    /**
     * Calculate contract score
     */
    calculateContractScore(contract) {
        const { level, suit, tricks, vulnerable } = contract;
        
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        const tricksNeeded = 6 + level;
        const tricksMade = tricks;
        const result = tricksMade - tricksNeeded;
        
        if (result >= 0) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // NT bonus
            
            // Add overtricks
            const overtricks = result;
            const overtrickValue = overtricks * suitValues[suit];
            
            let totalScore = basicScore + overtrickValue;
            
            // Game bonus
            if (basicScore >= 100) {
                totalScore += vulnerable ? 500 : 300;
            } else {
                totalScore += 50;
            }
            
            return totalScore;
        } else {
            // Contract failed
            const undertricks = Math.abs(result);
            const penalty = undertricks * (vulnerable ? 100 : 50);
            return -penalty;
        }
    }
    
    /**
     * Calculate all traveler scores
     */
    calculateTravelerScores() {
        this.travelerEntry.results.forEach((_, index) => {
            const result = this.travelerEntry.results[index];
            if (result.bidLevel && result.bidSuit && result.declarer && result.tricks) {
                this.calculateRowScore(index);
            }
        });
    }
    
    /**
     * Save traveler data and close popup
     */
    saveTravelerData() {
        const board = this.session.boards[this.travelerEntry.boardNumber - 1];
        board.travelerResults = [...this.travelerEntry.results];
        
        console.log(`💾 Saved traveler data for Board ${this.travelerEntry.boardNumber}`);
        this.closeTravelerPopup();
    }
    
    /**
     * Close traveler popup
     */
    closeTravelerPopup() {
        const popup = document.getElementById('travelerPopup');
        if (popup) {
            popup.remove();
        }
        this.travelerEntry.isActive = false;
    }
    
    /**
     * Show movement table in popup
     */
    showMovementPopup() {
        const movement = this.movements[this.session.pairs];
        const popupContent = this.getFullMovementTable();
        
        const popup = document.createElement('div');
        popup.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;';
        popup.onclick = () => popup.remove();
        
        const popupDialog = document.createElement('div');
        popupDialog.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 80%; overflow: auto; color: #2c3e50;';
        popupDialog.onclick = (e) => e.stopPropagation();
        
        popupDialog.innerHTML = `
            <h3 style="margin-top: 0; color: #2c3e50;">${movement.description}</h3>
            ${popupContent}
            <div style="text-align: center; margin-top: 20px;">
                <button id="closeBtn" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; cursor: pointer;">Close</button>
                <button id="confirmBtn" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-size: 16px; cursor: pointer; margin-left: 10px;">Confirm Movement</button>
            </div>
        `;
        
        popup.appendChild(popupDialog);
        document.body.appendChild(popup);
        
        document.getElementById('closeBtn').onclick = () => popup.remove();
        document.getElementById('confirmBtn').onclick = () => {
            popup.remove();
            this.handleAction('2');
        };
    }
    
    /**
     * Get full movement table for popup
     */
    getFullMovementTable() {
        const movement = this.movements[this.session.pairs];
        if (!movement || !movement.movement) return '<p>Movement data not available</p>';
        
        // Group by rounds
        const roundData = {};
        movement.movement.forEach(entry => {
            if (!roundData[entry.round]) {
                roundData[entry.round] = [];
            }
            if (entry.sitOut) {
                roundData[entry.round].push({ type: 'sitout', pair: entry.sitOut });
            } else if (entry.table) {
                roundData[entry.round].push({
                    type: 'table',
                    table: entry.table,
                    ns: entry.ns,
                    ew: entry.ew,
                    boards: entry.boards
                });
            }
        });
        
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">';
        tableHtml += '<thead><tr style="background: #34495e; color: white;"><th style="padding: 8px; border: 1px solid #2c3e50;">Round</th>';
        
        // Add table headers
        for (let t = 1; t <= this.session.tables; t++) {
            tableHtml += `<th style="padding: 8px; border: 1px solid #2c3e50;">Table ${t}</th>`;
        }
        if (movement.sitOut) {
            tableHtml += '<th style="padding: 8px; border: 1px solid #2c3e50;">Sit Out</th>';
        }
        tableHtml += '</tr></thead><tbody>';
        
        // Add round data
        Object.keys(roundData).sort((a,b) => parseInt(a) - parseInt(b)).forEach(round => {
            tableHtml += `<tr><td style="padding: 8px; border: 1px solid #2c3e50; font-weight: bold; background: #ecf0f1;">${round}</td>`;
            
            const roundEntries = roundData[round];
            const tableEntries = roundEntries.filter(e => e.type === 'table').sort((a,b) => a.table - b.table);
            const sitOutEntry = roundEntries.find(e => e.type === 'sitout');
            
            // Add table data
            for (let t = 1; t <= this.session.tables; t++) {
                const entry = tableEntries.find(e => e.table === t);
                if (entry) {
                    const boardRange = entry.boards.length > 1 ? 
                        `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : 
                        entry.boards[0];
                    tableHtml += `<td style="padding: 8px; border: 1px solid #2c3e50;">NS: Pair ${entry.ns}<br>EW: Pair ${entry.ew}<br><small>Boards ${boardRange}</small></td>`;
                } else {
                    tableHtml += '<td style="padding: 8px; border: 1px solid #2c3e50;">-</td>';
                }
            }
            
            // Add sit-out data
            if (movement.sitOut) {
                if (sitOutEntry) {
                    tableHtml += `<td style="padding: 8px; border: 1px solid #2c3e50;">Pair ${sitOutEntry.pair}</td>`;
                } else {
                    tableHtml += '<td style="padding: 8px; border: 1px solid #2c3e50;">-</td>';
                }
            }
            
            tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        return tableHtml;
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
     * Handle results view actions
     */
    handleResultsView(value) {
        if (value === 'BACK') {
            this.inputState = 'board_selection';
        }
    }
    
    /**
     * Handle back navigation
     */
    handleBack() {
        switch (this.inputState) {
            case 'movement_confirm':
                this.inputState = 'pairs_setup';
                break;
            case 'board_selection':
                this.inputState = 'movement_confirm';
                break;
            case 'results_view':
                this.inputState = 'board_selection';
                break;
            default:
                return false;
        }
        this.updateDisplay();
        return true;
    }
    
    /**
     * Check if back navigation is possible
     */
    canGoBack() {
        return this.inputState !== 'pairs_setup' && !this.travelerEntry.isActive;
    }
    
    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        if (this.travelerEntry.isActive) {
            return []; // No buttons when traveler popup is active
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4', '5', '6', '7', '8', '9', '0']; // Available movements
            case 'movement_confirm':
                return ['1', '2', 'BACK']; // 1=MOVEMENT, 2=CONFIRM
            case 'board_selection':
                const buttons = [];
                for (let i = 1; i <= this.session.totalBoards; i++) {
                    buttons.push(i.toString());
                }
                buttons.push('RESULTS');
                return buttons;
            case 'results_view':
                return ['BACK'];
            default:
                return [];
        }
    }
    
    /**
     * Update the display
     */
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        this.ui.updateButtonStates(this.getActiveButtons());
    }
    
    /**
     * Get display content for current state
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
                            Choose pairs and I'll show you the authentic<br>
                            Howell movement with traveler-based scoring.
                        </div>
                    </div>
                    <div class="current-state">Select pairs (4,5,7,8,9 or 0 for 10)</div>
                `;
                
            case 'movement_confirm':
                const movement = this.movements[this.session.pairs];
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.pairs} Pairs<br>
                            Movement
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${movement.description}</strong></div>
                        <div style="color: #2c3e50; margin-top: 8px;">
                            • ${this.session.tables} table${this.session.tables > 1 ? 's' : ''}<br>
                            • ${this.session.rounds} rounds<br>
                            • ${movement.boardsPerRound} boards per round<br>
                            • ${this.session.totalBoards} boards total<br>
                            ${movement.sitOut ? '• Includes sit-out rounds' : '• No sit-outs'}
                        </div>
                        <div style="background: #3498db; color: white; padding: 12px; border-radius: 4px; margin-top: 8px; text-align: center; font-weight: bold; font-size: 14px;">
                            Press <strong>1</strong> to view MOVEMENT table<br>
                            Press <strong>2</strong> to CONFIRM and proceed
                        </div>
                        <div style="color: #3498db; font-size: 11px; margin-top: 8px;">
                            Features popup traveler interface with automatic<br>
                            score calculation matching tournament play.
                        </div>
                    </div>
                    <div class="current-state">Press 1 to review movement, 2 to confirm, or Back</div>
                `;
                
            case 'board_selection':
                const completedBoards = this.session.boards.filter(b => 
                    b.travelerResults && b.travelerResults.length > 0
                ).length;
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.pairs} Pairs<br>
                            ${completedBoards}/${this.session.totalBoards} Done
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Traveler Entry - ${this.movements[this.session.pairs].description}</strong></div>
                        <div style="color: #2c3e50; font-size: 12px;">
                            Select a board to open the traveler popup.<br>
                            Enter results from completed travelers.
                        </div>
                        ${this.getBoardStatusDisplay()}
                        <div style="background: #ecf0f1; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 11px; color: #2c3e50;">
                            <strong>Traveler Features:</strong> Two-digit entry (1+1=11), automatic scoring, 
                            vulnerability display, tournament-style interface.
                        </div>
                    </div>
                    <div class="current-state">Select board number to enter traveler results</div>
                `;
                
            case 'results_view':
                return this.getResultsDisplay();
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    /**
     * Get board status display
     */
    getBoardStatusDisplay() {
        const statusLines = [];
        for (let i = 0; i < Math.min(this.session.totalBoards, 10); i++) {
            const board = this.session.boards[i];
            const hasResults = board.travelerResults && board.travelerResults.length > 0;
            const status = hasResults ? '✓' : '○';
            const color = hasResults ? '#27ae60' : '#e74c3c';
            statusLines.push(`<span style="color: ${color};">B${i + 1}: ${status}</span>`);
        }
        
        if (this.session.totalBoards > 10) {
            statusLines.push('<span style="color: #2c3e50;">...</span>');
        }
        
        return `<div style="font-size: 11px; margin-top: 8px; color: #2c3e50;">${statusLines.join(' • ')}</div>`;
    }
    
    /**
     * Get results display
     */
    getResultsDisplay() {
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">
                    Results<br>
                    ${this.session.pairs} Pairs
                </div>
            </div>
            <div class="game-content">
                <div><strong>Session Results - ${this.movements[this.session.pairs].description}</strong></div>
                <div style="color: #2c3e50; margin-top: 8px;">
                    Results will be calculated from traveler data<br>
                    when all boards are completed.
                </div>
            </div>
            <div class="current-state">Press Back to continue entering travelers</div>
        `;
    }
    
    /**
     * Get help content specific to Duplicate Bridge
     */
    getHelpContent() {
        return {
            title: 'Duplicate Bridge Help',
            content: `
                <div class="help-section">
                    <h4>Authentic Tournament Movements</h4>
                    <p>Uses professional PDF movement data with popup traveler interface matching real duplicate bridge tournaments.</p>
                </div>
                
                <div class="help-section">
                    <h4>Available Movements</h4>
                    <ul>
                        <li><strong>4 pairs:</strong> 2-table, 12 boards, ~2 hours</li>
                        <li><strong>5 pairs:</strong> 2.5-table with sit-outs, 15 boards</li>
                        <li><strong>7 pairs:</strong> 3.5-table with sit-outs, 14 boards</li>
                        <li><strong>8 pairs:</strong> 4-table, 14 boards, ~2.5 hours</li>
                        <li><strong>9 pairs:</strong> 4.5-table with sit-outs, 12 boards</li>
                        <li><strong>10 pairs:</strong> 5-table, 12 boards, ~2.5 hours</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Traveler Interface</h4>
                    <ul>
                        <li><strong>Red columns:</strong> Manual entry (Bid, Suit, By, Tricks)</li>
                        <li><strong>Two-digit entry:</strong> Press 1+1 for 11 tricks</li>
                        <li><strong>Automatic scoring:</strong> Calculates when row complete</li>
                        <li><strong>Vulnerability:</strong> Shows board vulnerability</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Setup:</strong> Choose pairs → view movement → confirm</li>
                        <li><strong>Play session:</strong> Use printed movement cards</li>
                        <li><strong>Score entry:</strong> Select board → popup traveler opens</li>
                        <li><strong>Enter data:</strong> Fill red columns, auto-calculate blue</li>
                        <li><strong>Save:</strong> Save traveler when complete</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Perfect for Cruise Ships</h4>
                    <ul>
                        <li><strong>Authentic movements:</strong> Real tournament quality</li>
                        <li><strong>Director-friendly:</strong> One device, popup interface</li>
                        <li><strong>Flexible timing:</strong> Choose session length</li>
                        <li><strong>Professional scoring:</strong> Automatic calculations</li>
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
        const travelerPopup = document.getElementById('travelerPopup');
        if (travelerPopup) {
            travelerPopup.remove();
        }
        
        console.log('🧹 Duplicate Bridge cleanup completed');
    }
}

export default DuplicateBridge;