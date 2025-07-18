/**
 * Duplicate Bridge Mode - Traveler Score Entry and Matchpoint Calculation
 * 
 * This module handles score entry from completed travelers with automatic
 * score validation and real-time matchpoint calculation for cruise ship
 * or casual duplicate bridge sessions using exact Howell movements.
 */

import { BaseBridgeMode } from './base-mode.js';

class DuplicateBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'duplicate';
        this.displayName = 'Duplicate Bridge';
        
        // Duplicate session state
        this.session = {
            tables: 0,
            pairs: 0,
            totalBoards: 18,
            currentBoard: 1,
            isSetup: false,
            movementType: '',
            boards: []
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
        
        this.inputState = 'session_setup';
        this.contractInputStep = 'level';
        
        // Initialize movement data
        this.initializeMovements();
        
        console.log('🏆 Duplicate Bridge mode initialized with Howell movements');
    }
    
    /**
     * Initialize all Howell movement data
     */
    initializeMovements() {
        this.movements = {
            '2tables': {
                pairs: 4,
                tables: 2,
                rounds: 3,
                sitOut: false,
                movement: [
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5,6] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [7,8,9,10,11,12] },
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [13,14,15,16,17,18] },
                    { round: 2, table: 2, ns: 2, ew: 4, boards: [1,2,3,4,5,6] },
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [7,8,9,10,11,12] },
                    { round: 3, table: 2, ns: 2, ew: 3, boards: [13,14,15,16,17,18] }
                ]
            },
            '3tables': {
                pairs: 6,
                tables: 3,
                rounds: 9,
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5,6] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [7,8,9,10,11,12] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [13,14,15,16,17,18] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [7,8,9,10,11,12] },
                    { round: 2, table: 2, ns: 2, ew: 5, boards: [13,14,15,16,17,18] },
                    { round: 2, table: 3, ns: 4, ew: 6, boards: [1,2,3,4,5,6] },
                    // Round 3
                    { round: 3, table: 1, ns: 1, ew: 4, boards: [13,14,15,16,17,18] },
                    { round: 3, table: 2, ns: 3, ew: 6, boards: [1,2,3,4,5,6] },
                    { round: 3, table: 3, ns: 2, ew: 5, boards: [7,8,9,10,11,12] },
                    // Round 4
                    { round: 4, table: 1, ns: 1, ew: 5, boards: [1,2,3,4,5,6] },
                    { round: 4, table: 2, ns: 2, ew: 6, boards: [7,8,9,10,11,12] },
                    { round: 4, table: 3, ns: 3, ew: 4, boards: [13,14,15,16,17,18] },
                    // Round 5
                    { round: 5, table: 1, ns: 1, ew: 6, boards: [7,8,9,10,11,12] },
                    { round: 5, table: 2, ns: 2, ew: 4, boards: [13,14,15,16,17,18] },
                    { round: 5, table: 3, ns: 3, ew: 5, boards: [1,2,3,4,5,6] }
                ]
            },
            '4tables': {
                pairs: 8,
                tables: 4,
                rounds: 7,
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5,6] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [7,8,9,10,11,12] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [13,14,15,16,17,18] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [1,2,3,4,5,6] },
                    // Round 2
                    { round: 2, table: 1, ns: 1, ew: 3, boards: [7,8,9,10,11,12] },
                    { round: 2, table: 2, ns: 2, ew: 5, boards: [13,14,15,16,17,18] },
                    { round: 2, table: 3, ns: 4, ew: 7, boards: [1,2,3,4,5,6] },
                    { round: 2, table: 4, ns: 6, ew: 8, boards: [7,8,9,10,11,12] }
                ]
            },
            '5tables': {
                pairs: 10,
                tables: 5,
                rounds: 9,
                sitOut: false,
                movement: [
                    // Round 1
                    { round: 1, table: 1, ns: 1, ew: 2, boards: [1,2,3,4,5,6] },
                    { round: 1, table: 2, ns: 3, ew: 4, boards: [7,8,9,10,11,12] },
                    { round: 1, table: 3, ns: 5, ew: 6, boards: [13,14,15,16,17,18] },
                    { round: 1, table: 4, ns: 7, ew: 8, boards: [1,2,3,4,5,6] },
                    { round: 1, table: 5, ns: 9, ew: 10, boards: [7,8,9,10,11,12] }
                ]
            }
        };
    }
    
    /**
     * Initialize Duplicate Bridge mode
     */
    initialize() {
        console.log('🎯 Starting Duplicate Bridge session');
        this.inputState = 'session_setup';
        this.updateDisplay();
    }
    
    /**
     * Handle user actions
     */
    handleAction(value) {
        console.log(`🎮 Duplicate Bridge action: ${value} in state: ${this.inputState}`);
        
        switch (this.inputState) {
            case 'session_setup':
                this.handleSessionSetup(value);
                break;
            case 'board_count':
                this.handleBoardCount(value);
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
     * Handle session setup (number of tables)
     */
    handleSessionSetup(value) {
        const validSetups = ['2', '3', '4', '5'];
        if (validSetups.includes(value)) {
            this.session.tables = parseInt(value);
            this.session.movementType = value + 'tables';
            
            const movement = this.movements[this.session.movementType];
            this.session.pairs = movement.pairs;
            
            this.inputState = 'board_count';
            console.log(`📋 Session setup: ${value} tables, ${this.session.pairs} pairs`);
        }
    }
    
    /**
     * Handle board count selection
     */
    handleBoardCount(value) {
        const boardCount = parseInt(value);
        if (boardCount >= 16 && boardCount <= 20) {
            this.session.totalBoards = boardCount;
            
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
            console.log(`📊 Playing ${boardCount} boards`);
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
            this.currentEntry.board = boardNum;
            this.inputState = 'table_selection';
            console.log(`🃏 Board ${boardNum} selected`);
        }
    }
    
    /**
     * Handle table selection
     */
    handleTableSelection(value) {
        // Parse table selection format like "T1-R1"
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
            entry.boards.includes(boardNumber)
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
        
        // Simple matchpoint calculation
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
            case 'board_count':
                this.inputState = 'session_setup';
                break;
            case 'board_selection':
                this.inputState = 'board_count';
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
        return this.inputState !== 'session_setup';
    }
    
    /**
     * Get active buttons for current state
     */
    getActiveButtons() {
        switch (this.inputState) {
            case 'session_setup':
                return ['2', '3', '4', '5'];
            case 'board_count':
                return ['16', '17', '18', '19', '20'];
            case 'board_selection':
                const buttons = [];
                for (let i = 1; i <= Math.min(this.session.totalBoards, 18); i++) {
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
            case 'session_setup':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Setup</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Session Setup</strong></div>
                        <div style="color: #2c3e50;">Choose number of tables:</div>
                        <div style="color: #2c3e50; font-size: 11px; margin-top: 8px;">
                            • 2 tables = 4 pairs<br>
                            • 3 tables = 6 pairs<br>
                            • 4 tables = 8 pairs<br>
                            • 5 tables = 10 pairs
                        </div>
                    </div>
                    <div class="current-state">Select table configuration (2-5)</div>
                `;
                
            case 'board_count':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.tables} Tables<br>
                            ${this.session.pairs} Pairs
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${this.session.pairs} Pairs Setup Complete</strong></div>
                        <div style="color: #2c3e50;">Choose number of boards to play:</div>
                        <div style="color: #2c3e50; font-size: 11px; margin-top: 8px;">
                            Recommended: 16-18 boards for 2-3 hour session
                        </div>
                    </div>
                    <div class="current-state">Select total boards (16-20)</div>
                `;
                
            case 'board_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.tables} Tables<br>
                            Score Entry
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${this.session.pairs} Pairs • ${this.session.totalBoards} Boards</strong></div>
                        <div style="color: #2c3e50; font-size: 12px;">
                            Enter results from completed travelers
                        </div>
                    </div>
                    <div class="current-state">Select board to enter results</div>
                `;
                
            case 'table_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            Board ${this.currentEntry.board}<br>
                            Select Table
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Board ${this.currentEntry.board}</strong></div>
                        <div style="color: #2c3e50;">Vulnerability: ${this.getBoardVulnerability(this.currentEntry.board)}</div>
                    </div>
                    <div class="current-state">Select table/round combination</div>
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
                <div><strong>Leaderboard</strong></div>
                <div style="font-size: 11px; color: #2c3e50;">Completed: ${completedBoards} boards</div>
                ${this.getLeaderboardDisplay(sortedPairs)}
            </div>
            <div class="current-state">Session results • Press Back to enter more scores</div>
        `;
    }
    
    /**
     * Get leaderboard display
     */
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
                    <h4>Cruise Duplicate Bridge</h4>
                    <p>This app handles scoring from completed travelers using exact Howell movements. Perfect for cruise ships and casual duplicate sessions.</p>
                </div>
                
                <div class="help-section">
                    <h4>Setup Process</h4>
                    <ol>
                        <li><strong>Choose Tables:</strong> Select 2-5 tables</li>
                        <li><strong>Choose Boards:</strong> Select 16-20 boards</li>
                        <li><strong>Print Materials:</strong> Movement cards and travelers</li>
                        <li><strong>Play Bridge:</strong> Follow movement cards</li>
                        <li><strong>Enter Scores:</strong> Use app to verify results</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Score Verification</h4>
                    <ul>
                        <li><strong>✓ Green:</strong> Traveler score matches calculation</li>
                        <li><strong>⚠ Red:</strong> Score mismatch - check entry</li>
                        <li><strong>Automatic:</strong> Handles vulnerability and doubling</li>
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