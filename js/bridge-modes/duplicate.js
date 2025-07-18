/**
 * Duplicate Bridge Mode - Traveler Score Entry and Matchpoint Calculation
 * 
 * This module handles score entry from completed travelers with automatic
 * score validation and real-time matchpoint calculation for cruise ship
 * or casual duplicate bridge sessions.
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
            boards: [],
            totalBoards: 0,
            currentBoard: 1,
            isSetup: false
        };
        
        // Current entry state
        this.currentEntry = {
            board: null,
            table: null,
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
        
        this.inputState = 'session_setup'; // session_setup, board_selection, table_selection, contract_entry, score_verification, results_view
        this.contractInputStep = 'level'; // level, suit, declarer, result, score
        
        console.log('🏆 Duplicate Bridge mode initialized');
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
        if (['2', '3', '4', '5'].includes(value)) {
            const tables = parseInt(value);
            this.session.tables = tables;
            this.session.pairs = tables * 2;
            
            // Standard board counts for different table sizes
            const boardCounts = { 2: 6, 3: 15, 4: 28, 5: 45 };
            this.session.totalBoards = boardCounts[tables] || 15;
            
            // Initialize boards array
            this.session.boards = [];
            for (let i = 1; i <= this.session.totalBoards; i++) {
                this.session.boards.push({
                    number: i,
                    results: [], // Will store all table results for this board
                    matchpoints: null // Will store calculated matchpoints
                });
            }
            
            this.session.isSetup = true;
            this.inputState = 'board_selection';
            
            console.log(`📋 Session setup: ${tables} tables, ${this.session.pairs} pairs, ${this.session.totalBoards} boards`);
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
        const tableNum = parseInt(value);
        if (tableNum >= 1 && tableNum <= this.session.tables) {
            this.currentEntry.table = tableNum;
            
            // Set pair numbers based on standard Howell movement
            const movement = this.getMovementForBoard(this.currentEntry.board, tableNum);
            this.currentEntry.nsPair = movement.nsPair;
            this.currentEntry.ewPair = movement.ewPair;
            
            this.contractInputStep = 'level';
            this.inputState = 'contract_entry';
            this.resetCurrentContract();
            
            console.log(`🏓 Table ${tableNum} selected - NS: Pair ${movement.nsPair}, EW: Pair ${movement.ewPair}`);
        }
    }
    
    /**
     * Handle contract entry (level, suit, declarer, result, score)
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
                // Handle score entry (positive or negative numbers)
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
        } else if (value === 'BACK') {
            this.handleBack();
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
        
        // Get vulnerability for this board and declarer
        const vulnerability = this.getBoardVulnerability(this.currentEntry.board);
        const declarerSide = ['N', 'S'].includes(declarer) ? 'NS' : 'EW';
        const isVulnerable = vulnerability === declarerSide || vulnerability === 'Both';
        
        // Basic suit values per trick
        const suitValues = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
        let score = 0;
        
        if (result === '=' || result?.startsWith('+')) {
            // Contract made
            let basicScore = level * suitValues[suit];
            if (suit === 'NT') basicScore += 10; // NT first trick bonus
            
            // Handle doubling of basic score
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
     * Get board vulnerability using standard duplicate bridge cycle
     */
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        if (cycle < 4) return 'None';
        if (cycle < 8) return 'NS';
        if (cycle < 12) return 'EW';
        return 'Both';
    }
    
    /**
     * Get movement information for a board and table
     */
    getMovementForBoard(boardNumber, tableNumber) {
        // This is a simplified movement - in reality you'd reference your Howell movement cards
        // For 3 tables, pairs rotate in a standard pattern
        const round = Math.floor((boardNumber - 1) / 3) + 1;
        const ewShift = (round - 1) % this.session.pairs;
        
        const nsPair = tableNumber;
        let ewPair = tableNumber + ewShift;
        if (ewPair > this.session.pairs) ewPair -= this.session.pairs;
        
        return { nsPair, ewPair };
    }
    
    /**
     * Save the current result
     */
    saveResult() {
        const board = this.session.boards[this.currentEntry.board - 1];
        
        const result = {
            table: this.currentEntry.table,
            nsPair: this.currentEntry.nsPair,
            ewPair: this.currentEntry.ewPair,
            contract: { ...this.currentEntry.contract },
            score: this.currentEntry.travelerScore,
            calculatedScore: this.currentEntry.calculatedScore
        };
        
        // Remove any existing result for this table
        board.results = board.results.filter(r => r.table !== this.currentEntry.table);
        
        // Add new result
        board.results.push(result);
        
        console.log(`💾 Saved result for Board ${this.currentEntry.board}, Table ${this.currentEntry.table}`);
    }
    
    /**
     * Calculate matchpoints for a board
     */
    calculateMatchpoints() {
        const board = this.session.boards[this.currentEntry.board - 1];
        
        if (board.results.length === 0) return;
        
        // Group results by pair
        const pairResults = {};
        
        board.results.forEach(result => {
            const nsScore = result.score >= 0 ? result.score : 0;
            const ewScore = result.score < 0 ? Math.abs(result.score) : 0;
            
            if (!pairResults[result.nsPair]) pairResults[result.nsPair] = 0;
            if (!pairResults[result.ewPair]) pairResults[result.ewPair] = 0;
            
            pairResults[result.nsPair] += nsScore;
            pairResults[result.ewPair] += ewScore;
        });
        
        // Calculate matchpoints (simplified - top score gets 100%)
        const scores = Object.values(pairResults);
        const maxScore = Math.max(...scores);
        
        board.matchpoints = {};
        Object.entries(pairResults).forEach(([pair, score]) => {
            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 50;
            board.matchpoints[pair] = Math.round(percentage * 10) / 10; // Round to 1 decimal
        });
        
        console.log(`📊 Calculated matchpoints for Board ${this.currentEntry.board}`);
    }
    
    /**
     * Check if a score is valid
     */
    isValidScore(value) {
        const num = parseInt(value);
        return !isNaN(num) && num >= -7600 && num <= 7600; // Reasonable bridge score range
    }
    
    /**
     * Reset current entry
     */
    resetCurrentEntry() {
        this.currentEntry = {
            board: null,
            table: null,
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
            case 'board_selection':
                return false; // Let app handle return to mode selection
                
            case 'table_selection':
                this.inputState = 'board_selection';
                this.currentEntry.board = null;
                break;
                
            case 'contract_entry':
                switch (this.contractInputStep) {
                    case 'suit':
                        this.contractInputStep = 'level';
                        this.currentEntry.contract.level = null;
                        break;
                    case 'declarer':
                        this.contractInputStep = 'suit';
                        this.currentEntry.contract.suit = null;
                        this.currentEntry.contract.doubled = '';
                        break;
                    case 'result':
                        this.contractInputStep = 'declarer';
                        this.currentEntry.contract.declarer = null;
                        break;
                    case 'plus_tricks':
                    case 'down_tricks':
                        this.contractInputStep = 'result';
                        break;
                    case 'score':
                        if (this.currentEntry.contract.result?.includes('+') || this.currentEntry.contract.result?.includes('-')) {
                            this.contractInputStep = this.currentEntry.contract.result.includes('+') ? 'plus_tricks' : 'down_tricks';
                        } else {
                            this.contractInputStep = 'result';
                        }
                        this.currentEntry.contract.result = null;
                        break;
                    default:
                        this.inputState = 'table_selection';
                        this.resetCurrentContract();
                        break;
                }
                break;
                
            case 'score_verification':
                this.contractInputStep = 'score';
                this.inputState = 'contract_entry';
                this.currentEntry.travelerScore = null;
                this.currentEntry.calculatedScore = null;
                break;
                
            case 'results_view':
                this.inputState = 'board_selection';
                break;
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
                
            case 'board_selection':
                const buttons = [];
                for (let i = 1; i <= Math.min(this.session.totalBoards, 20); i++) {
                    buttons.push(i.toString());
                }
                buttons.push('RESULTS');
                return buttons;
                
            case 'table_selection':
                const tableButtons = [];
                for (let i = 1; i <= this.session.tables; i++) {
                    tableButtons.push(i.toString());
                }
                return tableButtons;
                
            case 'contract_entry':
                switch (this.contractInputStep) {
                    case 'level':
                        return ['1', '2', '3', '4', '5', '6', '7'];
                    case 'suit':
                        return ['♣', '♦', '♥', '♠', 'NT'];
                    case 'declarer':
                        const declarerButtons = ['N', 'S', 'E', 'W', 'X'];
                        if (this.currentEntry.contract.declarer) {
                            declarerButtons.push('MADE', 'PLUS', 'DOWN');
                        }
                        return declarerButtons;
                    case 'result':
                        return ['MADE', 'PLUS', 'DOWN'];
                    case 'plus_tricks':
                        return ['1', '2', '3', '4', '5', '6'];
                    case 'down_tricks':
                        return ['1', '2', '3', '4', '5', '6', '7'];
                    case 'score':
                        return []; // Custom number input needed
                }
                break;
                
            case 'score_verification':
                return ['ACCEPT', 'EDIT'];
                
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
            case 'session_setup':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">Setup</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Session Setup</strong></div>
                        <div>Choose number of tables:</div>
                        <div style="color: #95a5a6; font-size: 11px; margin-top: 8px;">
                            • 2 tables = 4 pairs, 6 boards<br>
                            • 3 tables = 6 pairs, 15 boards<br>
                            • 4 tables = 8 pairs, 28 boards<br>
                            • 5 tables = 10 pairs, 45 boards
                        </div>
                    </div>
                    <div class="current-state">Select number of tables (2-5)</div>
                `;
                
            case 'board_selection':
                const completedBoards = this.session.boards.filter(b => b.results.length === this.session.tables).length;
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            ${this.session.tables} Tables<br>
                            ${completedBoards}/${this.session.totalBoards} Complete
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>${this.session.pairs} Pairs • ${this.session.totalBoards} Boards Total</strong></div>
                        <div style="color: #3498db; font-size: 12px;">
                            Enter results from completed travelers
                        </div>
                        ${this.getBoardStatusDisplay()}
                    </div>
                    <div class="current-state">Select board to enter results (or view Results)</div>
                `;
                
            case 'table_selection':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">${this.displayName}</div>
                        <div class="score-display">
                            Board ${this.currentEntry.board}<br>
                            Table Entry
                        </div>
                    </div>
                    <div class="game-content">
                        <div><strong>Board ${this.currentEntry.board}</strong></div>
                        <div>Vulnerability: ${this.getBoardVulnerability(this.currentEntry.board)}</div>
                        ${this.getTableStatusDisplay()}
                    </div>
                    <div class="current-state">Select table to enter result</div>
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
            const completed = board.results.length;
            const total = this.session.tables;
            const status = completed === total ? '✓' : `${completed}/${total}`;
            const color = completed === total ? '#27ae60' : '#95a5a6';
            statusLines.push(`<span style="color: ${color};">Board ${i + 1}: ${status}</span>`);
        }
        
        if (this.session.totalBoards > 10) {
            statusLines.push('<span style="color: #95a5a6;">... and more</span>');
        }
        
        return `<div style="font-size: 11px; margin-top: 8px;">${statusLines.join(' • ')}</div>`;
    }
    
    /**
     * Get table status display
     */
    getTableStatusDisplay() {
        const board = this.session.boards[this.currentEntry.board - 1];
        const lines = [];
        
        for (let table = 1; table <= this.session.tables; table++) {
            const movement = this.getMovementForBoard(this.currentEntry.board, table);
            const hasResult = board.results.some(r => r.table === table);
            const status = hasResult ? '✓' : '○';
            const color = hasResult ? '#27ae60' : '#95a5a6';
            
            lines.push(`<span style="color: ${color};">Table ${table}: NS-${movement.nsPair} vs EW-${movement.ewPair} ${status}</span>`);
        }
        
        return `<div style="font-size: 11px; margin-top: 8px;">${lines.join('<br>')}</div>`;
    }
    
    /**
     * Get contract entry display
     */
    getContractEntryDisplay() {
        const movement = this.getMovementForBoard(this.currentEntry.board, this.currentEntry.table);
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
                    Table ${this.currentEntry.table}
                </div>
            </div>
            <div class="game-content">
                <div><strong>Table ${this.currentEntry.table}: NS-${movement.nsPair} vs EW-${movement.ewPair}</strong></div>
                <div>Vulnerability: ${this.getBoardVulnerability(this.currentEntry.board)}</div>
                ${contractSoFar ? `<div><strong>Contract: ${contractSoFar}</strong></div>` : ''}
            </div>
            <div class="current-state">${promptText}</div>
        `;
    }
    
    /**
     * Get score verification display
     */
    getScoreVerificationDisplay() {
        const movement = this.getMovementForBoard(this.currentEntry.board, this.currentEntry.table);
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
                <div><strong>Board ${this.currentEntry.board}, Table ${this.currentEntry.table}</strong></div>
                <div>NS-${movement.nsPair} vs EW-${movement.ewPair}</div>
                <div><strong>${contractString}</strong></div>
                <div style="margin-top: 8px;">
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
        
        const completedBoards = this.session.boards.filter(b => b.results.length === this.session.tables).length;
        const totalPossible = completedBoards * 100; // Maximum possible matchpoints
        
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
                <div style="font-size: 11px; color: #95a5a6;">Completed: ${completedBoards} boards</div>
                ${this.getLeaderboardDisplay(sortedPairs, totalPossible)}
            </div>
            <div class="current-state">Session results • Press Back to enter more scores</div>
        `;
    }
    
    /**
     * Get leaderboard display
     */
    getLeaderboardDisplay(sortedPairs, totalPossible) {
        if (sortedPairs.length === 0) {
            return '<div style="margin-top: 8px; color: #95a5a6;">No results yet</div>';
        }
        
        const lines = sortedPairs.map(({ pair, total, rank }) => {
            const percentage = totalPossible > 0 ? ((total / totalPossible) * 100).toFixed(1) : '0.0';
            const color = rank <= 3 ? '#f39c12' : '#95a5a6';
            return `<div style="color: ${color}; margin: 2px 0;">${rank}. Pair ${pair}: ${total.toFixed(1)} pts (${percentage}%)</div>`;
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
                    <h4>What is Duplicate Bridge?</h4>
                    <p><strong>Duplicate Bridge</strong> allows multiple tables to play the same hands, making results directly comparable. This app handles the scoring from completed travelers with automatic score verification.</p>
                </div>
                
                <div class="help-section">
                    <h4>Setup Process</h4>
                    <ol>
                        <li><strong>Physical Setup:</strong> Print movement cards and travelers from templates</li>
                        <li><strong>App Setup:</strong> Select number of tables (2-5)</li>
                        <li><strong>Play Hands:</strong> Players follow movement cards, fill travelers</li>
                        <li><strong>Score Entry:</strong> Director enters results from completed travelers</li>
                        <li><strong>Results:</strong> App calculates matchpoints and rankings</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h4>Score Verification System</h4>
                    <p>The app automatically calculates what each score should be and compares it to the traveler:</p>
                    <ul>
                        <li><strong>✓ Scores Match:</strong> Green checkmark, safe to accept</li>
                        <li><strong>⚠ Score Mismatch:</strong> Red warning, review traveler entry</li>
                        <li><strong>Common Errors:</strong> Wrong vulnerability, arithmetic mistakes, declarer confusion</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Board Status Tracking</h4>
                    <ul>
                        <li><strong>○ Pending:</strong> Results not yet entered for this table</li>
                        <li><strong>✓ Complete:</strong> All table results entered for this board</li>
                        <li><strong>X/Y Format:</strong> X results entered out of Y total tables</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Matchpoint Calculation</h4>
                    <p>Standard duplicate bridge scoring:</p>
                    <ul>
                        <li><strong>Best Score:</strong> Gets 100% (top)</li>
                        <li><strong>Other Scores:</strong> Scaled proportionally</li>
                        <li><strong>Tied Scores:</strong> Split the available points</li>
                        <li><strong>Final Ranking:</strong> Total matchpoints across all boards</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Vulnerability Cycle</h4>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px;">
                        <tr style="background: rgba(255,255,255,0.1);">
                            <th style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">Boards</th>
                            <th style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">Vulnerability</th>
                        </tr>
                        <tr><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">1, 5, 9, 13...</td><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">None</td></tr>
                        <tr><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">2, 6, 10, 14...</td><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">NS</td></tr>
                        <tr><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">3, 7, 11, 15...</td><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">EW</td></tr>
                        <tr><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">4, 8, 12, 16...</td><td style="padding: 4px; border: 1px solid rgba(255,255,255,0.2);">Both</td></tr>
                    </table>
                </div>
                
                <div class="help-section">
                    <h4>Session Sizes</h4>
                    <ul>
                        <li><strong>2 Tables:</strong> 4 pairs, 6 boards (quick session)</li>
                        <li><strong>3 Tables:</strong> 6 pairs, 15 boards (standard cruise session)</li>
                        <li><strong>4 Tables:</strong> 8 pairs, 28 boards (full evening)</li>
                        <li><strong>5 Tables:</strong> 10 pairs, 45 boards (tournament length)</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Tips for Directors</h4>
                    <ul>
                        <li><strong>Print Everything:</strong> Movement cards and travelers before play starts</li>
                        <li><strong>Check Travelers:</strong> Verify all scores before entering</li>
                        <li><strong>Score Regularly:</strong> Enter results as travelers come in</li>
                        <li><strong>Double-Check Mismatches:</strong> Red warnings usually indicate errors</li>
                        <li><strong>Show Progress:</strong> Let players see current standings</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>Perfect for Cruise Ships</h4>
                    <ul>
                        <li><strong>One Device:</strong> Only director needs the app</li>
                        <li><strong>Offline:</strong> No internet required</li>
                        <li><strong>Print & Play:</strong> Everything works with standard cards</li>
                        <li><strong>Fair Competition:</strong> Same hands for all tables</li>
                        <li><strong>Flexible Timing:</strong> Can accommodate dining schedules</li>
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