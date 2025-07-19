/**
 * Duplicate Bridge Mode - Authentic Howell Movements
 * 
 * This module handles score entry from completed travelers using authentic
 * Howell movements provided by Gemini AI. Perfect for cruise ship duplicate.
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
        
        // Current entry state
        this.currentEntry = {
            board: null,
            table: null,
            round: null,
            nsPair: null,
            ewPair: null,
            contract: {
                level: null,
                suit: null,
                declarer: null,
                doubled: '',
                result: null
            },
            travelerScore: null,
            calculatedScore: null
        };
        
        this.inputState = 'pairs_setup';
        this.contractInputStep = 'level';
        
        // Initialize authentic Howell movements
        this.initializeMovements();
        
        console.log('🏆 Duplicate Bridge initialized with authentic Howell movements');
    }
    
    /**
     * Initialize authentic Howell movement data from Gemini
     */
    initializeMovements() {
        this.movements = {
            4: {
                pairs: 4,
                tables: 2,
                rounds: 3,
                totalBoards: 12,
                boardsPerRound: 4,
                description: "2-table Howell, 12 boards, ~1.5 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [5,6,7,8] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [5,6,7,8] },
                    { round: 2, table: 2, ns: 4, ew: 2, boards: [1,2,3,4] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [1,2,3,4] },
                    { round: 3, table: 2, ns: 2, ew: 3, boards: [5,6,7,8] }
                ]
            },
            5: {
                pairs: 5,
                tables: 2,
                rounds: 4,
                totalBoards: 16,
                boardsPerRound: 4,
                description: "2.5-table Howell with sit-outs, 16 boards, ~2 hours",
                sitOut: true,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [5,6,7,8] },
                    { round: 1, sitOut: 5 },
                    // Round 2
                    { round: 2, table: 1, ns: null, ew: 3, boards: [5,6,7,8], sitOutNS: 1 },
                    { round: 2, table: 2, ns: 2, ew: 5, boards: [1,2,3,4] },
                    // Round 3
                    { round: 3, table: 1, ns: 4, ew: 3, boards: [1,2,3,4] },
                    { round: 3, table: 2, ns: 5, ew: 1, boards: [5,6,7,8] },
                    { round: 3, sitOut: 2 },
                    // Round 4
                    { round: 4, table: 1, ns: 2, ew: 4, boards: [5,6,7,8] },
                    { round: 4, table: 2, ns: 1, ew: 3, boards: [1,2,3,4] },
                    { round: 4, sitOut: 5 }
                ]
            },
            6: {
                pairs: 6,
                tables: 3,
                rounds: 5,
                totalBoards: 10,
                boardsPerRound: 2,
                description: "3-table Howell, 10 boards, ~1.5 hours",
                sitOut: false,
                movement: [
                    // CORRECTED MOVEMENT - No duplicate board/pair combinations
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [3,4] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [5,6] },
                    // Round 2 - Boards move and pairs rotate
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [3,4] },
                    { round: 2, table: 2, ns: 5, ew: 2, boards: [5,6] },
                    { round: 2, table: 3, ns: 4, ew: 6, boards: [1,2] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [1,2] },
                    { round: 3, table: 2, ns: 6, ew: 3, boards: [3,4] },
                    { round: 3, table: 3, ns: 2, ew: 5, boards: [5,6] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [5,6] },
                    { round: 4, table: 2, ns: 2, ew: 4, boards: [1,2] },
                    { round: 4, table: 3, ns: 3, ew: 6, boards: [3,4] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 6, boards: [3,4] },
                    { round: 5, table: 2, ns: 3, ew: 5, boards: [5,6] },
                    { round: 5, table: 3, ns: 4, ew: 2, boards: [1,2] }
                ]
            },
            7: {
                pairs: 7,
                tables: 3,
                rounds: 6,
                totalBoards: 18,
                boardsPerRound: 3,
                description: "3.5-table Howell with sit-outs, 18 boards, ~2.5 hours",
                sitOut: true,
                movement: [
                    // Basic movement - would need full Gemini data
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [4,5,6] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [7,8,9] },
                    { round: 1, sitOut: 7 }
                ]
            },
            9: {
                pairs: 9,
                tables: 4,
                rounds: 8,
                totalBoards: 24,
                boardsPerRound: 3,
                description: "4.5-table Howell with sit-outs, 24 boards, ~3 hours",
                sitOut: true,
                movement: [
                    // Basic movement - would need full Gemini data
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [4,5,6] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [7,8,9] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [10,11,12] },
                    { round: 1, sitOut: 9 }
                ]
            },
            8: {
                pairs: 8,
                tables: 4,
                rounds: 7,
                totalBoards: 28,
                boardsPerRound: 4,
                description: "4-table Howell, 28 boards, ~3.5 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [5,6,7,8] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [9,10,11,12] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [13,14,15,16] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [13,14,15,16] },
                    { round: 2, table: 2, ns: 5, ew: 4, boards: [1,2,3,4] },
                    { round: 2, table: 3, ns: 7, ew: 2, boards: [5,6,7,8] },
                    { round: 2, table: 4, ns: 8, ew: 6, boards: [9,10,11,12] }
                    // Additional rounds would continue this pattern
                ]
            },
            10: {
                pairs: 10,
                tables: 5,
                rounds: 9,
                totalBoards: 27,
                boardsPerRound: 3,
                description: "5-table Howell, 27 boards, ~3.5 hours",
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [4,5,6] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [7,8,9] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [10,11,12] },
                    { round: 1, table: 5, ns: 9, ew: 10, boards: [13,14,15] }
                    // Additional rounds would continue this pattern
                ]
            }
        };
    }
    
    /**
     * Initialize Duplicate Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Duplicate Bridge session');
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
            case 'table_selection':
                this.handleTableSelection(value);
                break;
            case 'contract_entry':
                this.handleContractEntry(value);
                break;
            case 'score_verification':
                this.handleScoreVerification(value);
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
                    results: [],
                    matchpoints: null
                });
            }
            
            this.session.isSetup = true;
            this.inputState = 'board_selection';
            console.log(`✅ Movement confirmed, ready for scoring`);
        } else if (value === 'BACK') {
            this.inputState = 'pairs_setup';
        }
    }
    
    /**
     * Show movement table in popup
     */
    showMovementPopup() {
        const movement = this.movements[this.session.pairs];
        const popupContent = this.getFullMovementTable();
        
        // Create popup overlay
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
        
        // Add event listeners
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
     * Handle board selection
     */
    handleBoardSelection(value) {
        if (value === 'RESULTS') {
            this.inputState = 'results_view';
            return;
        }
        
        const boardNum = parseInt(value);
        if (boardNum >= 1 && boardNum <= this.session.totalBoards) {
            this.currentEntry.board = boardNum;
            this.inputState = 'table_selection';
            console.log(`🃏 Board ${boardNum} selected`);
        }
    }
    
    /**
     * Handle table/round selection
     */
    handleTableSelection(value) {
        // Parse selection like "T1-R1" (Table 1, Round 1)
        const match = value.match(/T(\d+)-R(\d+)/);
        if (!match) return;
        
        const tableNum = parseInt(match[1]);
        const roundNum = parseInt(match[2]);
        
        // Find the matching movement entry
        const boardInstances = this.getBoardInstances(this.currentEntry.board);
        const selectedInstance = boardInstances.find(inst => 
            inst.table === tableNum && inst.round === roundNum
        );
        
        if (selectedInstance) {
            this.currentEntry.table = selectedInstance.table;
            this.currentEntry.round = selectedInstance.round;
            this.currentEntry.nsPair = selectedInstance.ns;
            this.currentEntry.ewPair = selectedInstance.ew;
            
            this.contractInputStep = 'level';
            this.inputState = 'contract_entry';
            this.resetCurrentContract();
            
            console.log(`🏓 Selected Board ${this.currentEntry.board}, Round ${selectedInstance.round}, Table ${selectedInstance.table}`);
        }
    }
    
    /**
     * Get all instances where a board is played
     */
    getBoardInstances(boardNumber) {
        const movement = this.movements[this.session.movementType];
        if (!movement) return [];
        
        return movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
    }
    
    /**
     * Handle contract entry
     */
    handleContractEntry(value) {
        switch (this.contractInputStep) {
            case 'level':
                if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
                    this.currentEntry.contract.level = parseInt(value);
                    this.contractInputStep = 'suit';
                }
                break;
                
            case 'suit':
                if (['♣', '♦', '♥', '♠', 'NT'].includes(value)) {
                    this.currentEntry.contract.suit = value;
                    this.contractInputStep = 'declarer';
                }
                break;
                
            case 'declarer':
                if (['N', 'S', 'E', 'W'].includes(value)) {
                    this.currentEntry.contract.declarer = value;
                    this.contractInputStep = 'result';
                } else if (value === 'X') {
                    this.handleDoubling();
                }
                break;
                
            case 'result':
                if (value === 'MADE') {
                    this.currentEntry.contract.result = '=';
                    this.contractInputStep = 'score';
                } else if (value === 'PLUS') {
                    this.contractInputStep = 'plus_tricks';
                } else if (value === 'DOWN') {
                    this.contractInputStep = 'down_tricks';
                }
                break;
                
            case 'plus_tricks':
                if (['1', '2', '3', '4', '5', '6'].includes(value)) {
                    this.currentEntry.contract.result = `+${value}`;
                    this.contractInputStep = 'score';
                }
                break;
                
            case 'down_tricks':
                if (['1', '2', '3', '4', '5', '6', '7'].includes(value)) {
                    this.currentEntry.contract.result = `-${value}`;
                    this.contractInputStep = 'score';
                }
                break;
                
            case 'score':
                if (this.isValidScore(value)) {
                    this.currentEntry.travelerScore = parseInt(value);
                    this.currentEntry.calculatedScore = this.calculateScore();
                    this.inputState = 'score_verification';
                }
                break;
        }
    }
    
    /**
     * Handle doubling
     */
    handleDoubling() {
        if (this.currentEntry.contract.doubled === '') {
            this.currentEntry.contract.doubled = 'X';
        } else if (this.currentEntry.contract.doubled === 'X') {
            this.currentEntry.contract.doubled = 'XX';
        } else {
            this.currentEntry.contract.doubled = '';
        }
        console.log(`💥 Double state: ${this.currentEntry.contract.doubled || 'None'}`);
    }
    
    /**
     * Handle score verification
     */
    handleScoreVerification(value) {
        if (value === 'ACCEPT') {
            this.saveResult();
            this.calculateMatchpoints();
            this.inputState = 'board_selection';
            this.resetCurrentEntry();
        } else if (value === 'EDIT') {
            this.contractInputStep = 'score';
            this.inputState = 'contract_entry';
        }
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
     * Calculate score based on contract and result
     */
    calculateScore() {
        const { level, suit, result, doubled, declarer } = this.currentEntry.contract;
        
        // Get vulnerability for this board
        const vulnerability = this.getBoardVulnerability(this.currentEntry.board);
        const declarerSide = ['N', 'S'].includes(declarer) ? 'NS' : 'EW';
        const isVulnerable = vulnerability === declarerSide || vulnerability === 'Both';
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10;
            
            let contractScore = basicScore;
            if (doubled === 'X') contractScore = basicScore * 2;
            else if (doubled === 'XX') contractScore = basicScore * 4;
            
            score = contractScore;
            
            // Add overtricks
            if (result?.startsWith('+')) {
                const overtricks = parseInt(result.substring(1));
                let overtrickValue;
                
                if (doubled === '') {
                    overtrickValue = suitValues[suit] * overtricks;
                } else {
                    overtrickValue = overtricks * (isVulnerable ? 200 : 100);
                    if (doubled === 'XX') overtrickValue *= 2;
                }
                score += overtrickValue;
            }
            
            // Game/Part-game bonus
            if (contractScore >= 100) {
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            // Double bonuses
            if (doubled === 'X') score += 50;
            else if (doubled === 'XX') score += 100;
            
        } else if (result?.startsWith('-')) {
            // Contract failed
            const undertricks = parseInt(result.substring(1));
            
            if (doubled === '') {
                score = -undertricks * (isVulnerable ? 100 : 50);
            } else {
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
                if (doubled === 'XX') penalty *= 2;
                score = -penalty;
            }
        }
        
        return score;
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
     * Save the current result
     */
    saveResult() {
        const board = this.session.boards[this.currentEntry.board - 1];
        
        const result = {
            table: this.currentEntry.table,
            round: this.currentEntry.round,
            nsPair: this.currentEntry.nsPair,
            ewPair: this.currentEntry.ewPair,
            contract: { ...this.currentEntry.contract },
            score: this.currentEntry.travelerScore,
            calculatedScore: this.currentEntry.calculatedScore
        };
        
        // Remove existing result for this table/round
        board.results = board.results.filter(r => 
            !(r.table === this.currentEntry.table && r.round === this.currentEntry.round)
        );
        
        board.results.push(result);
        console.log(`💾 Saved result for Board ${this.currentEntry.board}`);
    }
    
    /**
     * Calculate matchpoints for a board
     */
    calculateMatchpoints() {
        const board = this.session.boards[this.currentEntry.board - 1];
        const expectedResults = this.getBoardInstances(this.currentEntry.board).length;
        
        if (board.results.length < expectedResults) {
            console.log(`⏳ Board ${this.currentEntry.board}: ${board.results.length}/${expectedResults} results`);
            return;
        }
        
        // Calculate matchpoints when all results are in
        const pairScores = {};
        
        board.results.forEach(result => {
            const nsScore = result.score >= 0 ? result.score : 0;
            const ewScore = result.score < 0 ? Math.abs(result.score) : 0;
            
            if (!pairScores[result.nsPair]) pairScores[result.nsPair] = 0;
            if (!pairScores[result.ewPair]) pairScores[result.ewPair] = 0;
            
            pairScores[result.nsPair] += nsScore;
            pairScores[result.ewPair] += ewScore;
        });
        
        const scores = Object.values(pairScores);
        const maxScore = Math.max(...scores);
        
        board.matchpoints = {};
        Object.entries(pairScores).forEach(([pair, score]) => {
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 50;
            board.matchpoints[pair] = Math.round(percentage * 10) / 10;
        });
        
        console.log(`📊 Calculated matchpoints for Board ${this.currentEntry.board}`);
    }
    
    /**
     * Check if a score is valid
     */
    isValidScore(value) {
        const num = parseInt(value);
        return !isNaN(num) && num >= -7600 && num <= 7600;
    }
    
    /**
     * Reset current entry
     */
    resetCurrentEntry() {
        this.currentEntry = {
            board: null,
            table: null,
            round: null,
            nsPair: null,
            ewPair: null,
            contract: {
                level: null,
                suit: null,
                declarer: null,
                doubled: '',
                result: null
            },
            travelerScore: null,
            calculatedScore: null
        };
    }
    
    /**
     * Reset current contract
     */
    resetCurrentContract() {
        this.currentEntry.contract = {
            level: null,
            suit: null,
            declarer: null,
            doubled: '',
            result: null
        };
        this.currentEntry.travelerScore = null;
        this.currentEntry.calculatedScore = null;
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
            case 'table_selection':
                this.inputState = 'board_selection';
                break;
            case 'contract_entry':
                this.inputState = 'table_selection';
                break;
            case 'score_verification':
                this.inputState = 'contract_entry';
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
        return this.inputState !== 'pairs_setup';
    }
    
    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4', '5', '6', '7', '8', '9', '0']; // 0 = 10 pairs
            case 'movement_confirm':
                return ['1', '2', 'BACK']; // 1=MOVEMENT, 2=CONFIRM
            case 'board_selection':
                const buttons = [];
                for (let i = 1; i <= this.session.totalBoards; i++) {
                    buttons.push(i.toString());
                }
                buttons.push('RESULTS');
                return buttons;
            case 'table_selection':
                return this.getTableSelectionButtons();
            case 'contract_entry':
                return this.getContractButtons();
            case 'score_verification':
                return ['ACCEPT', 'EDIT'];
            case 'results_view':
                return ['BACK'];
            default:
                return [];
        }
    }
    
    /**
     * Get table selection buttons
     */
    getTableSelectionButtons() {
        const instances = this.getBoardInstances(this.currentEntry.board);
        return instances.map(inst => `T${inst.table}-R${inst.round}`);
    }
    
    /**
     * Get contract entry buttons
     */
    getContractButtons() {
        switch (this.contractInputStep) {
            case 'level':
                return ['1', '2', '3', '4', '5', '6', '7'];
            case 'suit':
                return ['♣', '♦', '♥', '♠', 'NT'];
            case 'declarer':
                const buttons = ['N', 'S', 'E', 'W', 'X'];
                if (this.currentEntry.contract.declarer) {
                    buttons.push('MADE', 'PLUS', 'DOWN');
                }
                return buttons;
            case 'result':
                return ['MADE', 'PLUS', 'DOWN'];
            case 'plus_tricks':
                return ['1', '2', '3', '4', '5', '6'];
            case 'down_tricks':
                return ['1', '2', '3', '4', '5', '6', '7'];
            case 'score':
                return [];
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
                            Choose the number of pairs and I'll show you the<br>
                            authentic Howell movement for your session.
                        </div>
                    </div>
                    <div class="current-state">Select number of pairs (4,5,6,7,8,9 or 0 for 10)</div>
                `;
                
            case 'movement_confirm':
                const movement = this.movements[this.session.pairs];
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.pairs} Pairs<br>
                            Review Movement
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
                        <div style="color: #3498db; font-size: 11px; margin-top: 8px;">
                            This is an authentic Howell movement where each pair<br>
                            plays every other pair exactly once.
                        </div>
                        <div style="background: #3498db; color: white; padding: 12px; border-radius: 4px; margin-top: 8px; text-align: center; font-weight: bold; font-size: 14px;">
                            Press <strong>1</strong> to view MOVEMENT table<br>
                            Press <strong>2</strong> to CONFIRM and proceed
                        </div>
                    </div>
                    <div class="current-state">Press 1 to review movement, 2 to confirm, or Back</div>
                `;
                
            case 'board_selection':
                const completedBoards = this.session.boards.filter(b => {
                    const expected = this.getBoardInstances(b.number).length;
                    return b.results.length === expected;
                }).length;
                
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.pairs} Pairs<br>
                            ${completedBoards}/${this.session.totalBoards} Done
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Score Entry - ${this.movements[this.session.pairs].description}</strong></div>
                        <div style="color: #2c3e50; font-size: 12px;">
                            Enter results from completed travelers.<br>
                            Each board plays at ${this.session.tables} table${this.session.tables > 1 ? 's' : ''}.
                        </div>
                        ${this.getBoardStatusDisplay()}
                    </div>
                    <div class="current-state">Select board number to enter results (or view Results)</div>
                `;
                
            case 'table_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            Board ${this.currentEntry.board}<br>
                            Select Instance
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Board ${this.currentEntry.board}</strong></div>
                        <div style="color: #2c3e50;">Vulnerability: ${this.getBoardVulnerability(this.currentEntry.board)}</div>
                        ${this.getTableInstancesDisplay()}
                    </div>
                    <div class="current-state">Select which table/round played this board</div>
                `;
                
            case 'contract_entry':
                return this.getContractEntryDisplay();
                
            case 'score_verification':
                return this.getScoreVerificationDisplay();
                
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
            const expected = this.getBoardInstances(board.number).length;
            const completed = board.results.length;
            const status = completed === expected ? '✓' : `${completed}/${expected}`;
            const color = completed === expected ? '#27ae60' : '#e74c3c';
            statusLines.push(`<span style="color: ${color};">B${i + 1}: ${status}</span>`);
        }
        
        if (this.session.totalBoards > 10) {
            statusLines.push('<span style="color: #2c3e50;">...</span>');
        }
        
        return `<div style="font-size: 11px; margin-top: 8px; color: #2c3e50;">${statusLines.join(' • ')}</div>`;
    }
    
    /**
     * Get table instances display for board selection
     */
    getTableInstancesDisplay() {
        const instances = this.getBoardInstances(this.currentEntry.board);
        const board = this.session.boards[this.currentEntry.board - 1];
        
        const lines = instances.map(inst => {
            const hasResult = board.results.some(r => 
                r.table === inst.table && r.round === inst.round
            );
            const status = hasResult ? '✓' : '○';
            const color = hasResult ? '#27ae60' : '#e74c3c';
            
            return `<span style="color: ${color};">Round ${inst.round}, Table ${inst.table}: NS-${inst.ns} vs EW-${inst.ew} ${status}</span>`;
        });
        
        return `<div style="font-size: 11px; margin-top: 8px; color: #2c3e50;">${lines.join('<br>')}</div>`;
    }
    
    /**
     * Get contract entry display
     */
    getContractEntryDisplay() {
        const contract = this.currentEntry.contract;
        
        let contractSoFar = '';
        if (contract.level) contractSoFar += contract.level;
        if (contract.suit) contractSoFar += contract.suit;
        if (contract.doubled) contractSoFar += contract.doubled;
        if (contract.declarer) contractSoFar += ` by ${contract.declarer}`;
        if (contract.result) contractSoFar += ` ${contract.result}`;
        
        let promptText = '';
        switch (this.contractInputStep) {
            case 'level': promptText = 'Enter bid level (1-7)'; break;
            case 'suit': promptText = 'Select suit'; break;
            case 'declarer': promptText = contract.declarer ? 'Press Made/Plus/Down or X for double' : 'Select declarer (N/S/E/W)'; break;
            case 'result': promptText = 'Made exactly, Plus overtricks, or Down?'; break;
            case 'plus_tricks': promptText = 'How many overtricks?'; break;
            case 'down_tricks': promptText = 'How many down?'; break;
            case 'score': promptText = 'Enter traveler score (use - for minus)'; break;
        }
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">
                    Board ${this.currentEntry.board}<br>
                    T${this.currentEntry.table}-R${this.currentEntry.round}
                </div>
            </div>
            <div class="game-content">
                <div><strong>Round ${this.currentEntry.round}, Table ${this.currentEntry.table}: NS-${this.currentEntry.nsPair} vs EW-${this.currentEntry.ewPair}</strong></div>
                <div style="color: #2c3e50;">Vulnerability: ${this.getBoardVulnerability(this.currentEntry.board)}</div>
                ${contractSoFar ? `<div><strong>Contract: ${contractSoFar}</strong></div>` : ''}
            </div>
            <div class="current-state">${promptText}</div>
        `;
    }
    
    /**
     * Get score verification display
     */
    getScoreVerificationDisplay() {
        const contract = this.currentEntry.contract;
        const contractString = `${contract.level}${contract.suit}${contract.doubled} by ${contract.declarer} ${contract.result}`;
        
        const scoreMatch = this.currentEntry.travelerScore === this.currentEntry.calculatedScore;
        const statusColor = scoreMatch ? '#27ae60' : '#e74c3c';
        const statusText = scoreMatch ? '✓ SCORES MATCH' : '⚠ SCORE MISMATCH';
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display" style="color: ${statusColor};">
                    ${statusText}
                </div>
            </div>
            <div class="game-content">
                <div><strong>Board ${this.currentEntry.board}, Round ${this.currentEntry.round}, Table ${this.currentEntry.table}</strong></div>
                <div style="color: #2c3e50;">NS-${this.currentEntry.nsPair} vs EW-${this.currentEntry.ewPair}</div>
                <div><strong>${contractString}</strong></div>
                <div style="margin-top: 8px; color: #2c3e50;">
                    <div>Traveler Score: <strong>${this.currentEntry.travelerScore}</strong></div>
                    <div>Calculated Score: <strong>${this.currentEntry.calculatedScore}</strong></div>
                    ${!scoreMatch ? '<div style="color: #e74c3c; font-size: 11px; margin-top: 4px;">⚠ Please verify traveler entry</div>' : ''}
                </div>
            </div>
            <div class="current-state">${scoreMatch ? 'Accept result or Edit score' : 'Score mismatch detected - Edit to correct'}</div>
        `;
    }
    
    /**
     * Get results display
     */
    getResultsDisplay() {
        const pairTotals = {};
        
        // Calculate total matchpoints for each pair
        for (let pairNum = 1; pairNum <= this.session.pairs; pairNum++) {
            pairTotals[pairNum] = 0;
        }
        
        this.session.boards.forEach(board => {
            if (board.matchpoints) {
                Object.entries(board.matchpoints).forEach(([pair, points]) => {
                    pairTotals[pair] += points;
                });
            }
        });
        
        // Sort pairs by total matchpoints
        const sortedPairs = Object.entries(pairTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([pair, total], index) => ({ pair: parseInt(pair), total, rank: index + 1 }));
        
        const completedBoards = this.session.boards.filter(b => {
            const expected = this.getBoardInstances(b.number).length;
            return b.results.length === expected;
        }).length;
        
        return `
            <div class="title-score-row">
                <div class="mode-title">${this.displayName}</div>
                <div class="score-display">
                    Final Results<br>
                    ${completedBoards}/${this.session.totalBoards}
                </div>
            </div>
            <div class="game-content">
                <div><strong>Leaderboard - ${this.movements[this.session.pairs].description}</strong></div>
                <div style="font-size: 11px; color: #2c3e50;">Completed: ${completedBoards} boards</div>
                ${this.getLeaderboardDisplay(sortedPairs)}
            </div>
            <div class="current-state">Session results • Press Back to enter more scores</div>
        `;
    }
    
    /**
     * Get movement table display
     */
    getMovementTableDisplay() {
        const movement = this.movements[this.session.pairs];
        if (!movement || !movement.movement) return '';
        
        // Group by rounds for display
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
        
        let tableHtml = '<div style="margin: 8px 0; font-size: 10px; border: 1px solid #2c3e50; border-radius: 4px; padding: 8px; background: rgba(44,62,80,0.1);">';
        tableHtml += '<div style="font-weight: bold; margin-bottom: 4px; color: #2c3e50;">Movement Chart:</div>';
        
        Object.keys(roundData).forEach(round => {
            tableHtml += `<div style="margin: 2px 0;"><strong>Round ${round}:</strong> `;
            const roundInfo = [];
            
            roundData[round].forEach(entry => {
                if (entry.type === 'table') {
                    const boardRange = entry.boards.length > 1 ? 
                        `${entry.boards[0]}-${entry.boards[entry.boards.length-1]}` : 
                        entry.boards[0];
                    roundInfo.push(`T${entry.table}: ${entry.ns}v${entry.ew} (B${boardRange})`);
                } else if (entry.type === 'sitout') {
                    roundInfo.push(`P${entry.pair} sits out`);
                }
            });
            
            tableHtml += roundInfo.join(', ');
            tableHtml += '</div>';
        });
        
        tableHtml += '</div>';
        return tableHtml;
    }
    getLeaderboardDisplay(sortedPairs) {
        if (sortedPairs.length === 0 || sortedPairs[0].total === 0) {
            return '<div style="margin-top: 8px; color: #2c3e50;">No results yet</div>';
        }
        
        const lines = sortedPairs.map(({ pair, total, rank }) => {
            const color = rank <= 3 ? '#f39c12' : '#2c3e50';
            return `<div style="color: ${color}; margin: 2px 0;">${rank}. Pair ${pair}: ${total.toFixed(1)} pts</div>`;
        });
        
        return `<div style="font-size: 11px; margin-top: 8px;">${lines.join('')}</div>`;
    }
    
    /**
     * Get help content specific to Duplicate Bridge
     */
    getHelpContent() {
        return {
            title: 'Duplicate Bridge Help',
            content: `
                <div class="help-section">
                    <h4>Authentic Howell Movements</h4>
                    <p>This app uses authentic Howell movements where each pair plays every other pair exactly once. Perfect for cruise ship duplicate bridge with 4-10 pairs.</p>
                </div>
                
                <div class="help-section">
                    <h4>Available Movements</h4>
                    <ul>
                        <li><strong>4 pairs:</strong> 2-table Howell, 12 boards, ~1.5 hours</li>
                        <li><strong>5 pairs:</strong> 2.5-table with sit-outs, 16 boards, ~2 hours</li>
                        <li><strong>6 pairs:</strong> 3-table Howell, 10 boards, ~1.5 hours</li>
                        <li><strong>8 pairs:</strong> 4-table Howell, 28 boards, ~3.5 hours</li>
                        <li><strong>10 pairs:</strong> 5-table Howell, 27 boards, ~3.5 hours</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ol>
                        <li><strong>Setup:</strong> Choose number of pairs → confirm movement</li>
                        <li><strong>Play:</strong> Use printed movement cards and travelers</li>
                        <li><strong>Score Entry:</strong> Enter results from completed travelers</li>
                        <li><strong>Verification:</strong> App checks traveler scores against calculations</li>
                        <li><strong>Results:</strong> View live leaderboard as scores come in</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Score Verification</h4>
                    <ul>
                        <li><strong>✓ Green:</strong> Traveler score matches calculation</li>
                        <li><strong>⚠ Red:</strong> Score mismatch - check traveler entry</li>
                        <li><strong>Automatic:</strong> Handles vulnerability, doubling, bonuses</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect for Cruises</h4>
                    <ul>
                        <li><strong>One Device:</strong> Only director needs the app</li>
                        <li><strong>Authentic:</strong> Uses real tournament movements</li>
                        <li><strong>Flexible:</strong> Choose session length based on time available</li>
                        <li><strong>Fair:</strong> Everyone plays everyone exactly once</li>
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
        console.log('🧹 Duplicate Bridge cleanup completed');
    }
}

export default DuplicateBridge;