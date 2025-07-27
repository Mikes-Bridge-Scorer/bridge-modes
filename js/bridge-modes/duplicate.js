/**
 * Simplified Duplicate Bridge Mode - Fixed with Mobile Popup Support
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
     * Initialize movement data
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
    
    initialize() {
        this.inputState = 'pairs_setup';
        window.duplicateBridge = this;
        this.updateDisplay();
    }
    
    handleAction(value) {
        console.log(`🎮 Duplicate action: ${value} in state: ${this.inputState}`);
        
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
    
    handleBoardSelection(value) {
        if (value === 'BACK') {
            this.inputState = 'movement_confirm';
            return;
        }
        
        if (value === 'RESULTS') {
            this.inputState = 'results';
            return;
        }
    }
    
    handleResults(value) {
        if (value === 'BACK') {
            this.inputState = 'board_selection';
        }
    }
    
    openTravelerPopup(boardNumber = null) {
        if (boardNumber) {
            this.openSpecificTraveler(boardNumber);
        } else {
            this.showBoardSelectorPopup();
        }
    }
    
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
            double: '',
            tricks: '',
            nsScore: null,
            ewScore: null
        }));
    }
    
    /**
     * MOBILE FIXED: Setup touch events for popup buttons
     */
    setupMobilePopupButtons() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) return;
        
        console.log('📱 Setting up mobile touch for duplicate popup buttons');
        
        const popup = document.getElementById('travelerPopup') || 
                     document.getElementById('boardSelectorPopup') || 
                     document.getElementById('movementPopup');
        if (!popup) return;
        
        const buttons = popup.querySelectorAll('button');
        
        buttons.forEach((button, index) => {
            console.log(`📱 Setting up mobile touch for button ${index}:`, button.textContent.trim());
            
            button.style.touchAction = 'manipulation';
            button.style.userSelect = 'none';
            button.style.webkitTapHighlightColor = 'transparent';
            button.style.minHeight = '44px';
            button.style.cursor = 'pointer';
            
            const originalOnclick = button.onclick;
            const onclickAttr = button.getAttribute('onclick');
            
            const mobileHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📱 Duplicate popup button touched:', button.textContent.trim());
                
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.8';
                
                if (navigator.vibrate) {
                    navigator.vibrate(30);
                }
                
                setTimeout(() => {
                    button.style.transform = '';
                    button.style.opacity = '';
                    
                    try {
                        if (originalOnclick) {
                            originalOnclick.call(button, e);
                        } else if (onclickAttr) {
                            const func = new Function('event', onclickAttr);
                            func.call(button, e);
                        }
                    } catch (error) {
                        console.error('Error executing popup button action:', error);
                    }
                }, 100);
            };
            
            button.addEventListener('touchend', mobileHandler, { passive: false });
            button.addEventListener('click', mobileHandler);
        });
        
        console.log(`✅ Mobile touch setup complete for ${buttons.length} popup buttons`);
    }
    
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
        
        window.selectBoardFromDropdown = () => this.selectBoardFromDropdown();
        window.closeBoardSelector = () => this.closeBoardSelector();
        
        this.setupMobilePopupButtons();
    }
    
    getBoardDropdownOptions() {
        let options = '';
        
        Object.values(this.session.boards).forEach(board => {
            const status = board.completed ? '✅' : '⭕';
            const vulnerability = this.getBoardVulnerability(board.number);
            
            options += `<option value="${board.number}">
                Board ${board.number} ${status} (${vulnerability})
            </option>`;
        });
        
        return options;
    }
    
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
    
    closeBoardSelector() {
        const popup = document.getElementById('boardSelectorPopup');
        if (popup) popup.remove();
        
        delete window.selectBoardFromDropdown;
        delete window.closeBoardSelector;
    }
    
    openSpecificTraveler(boardNumber) {
        console.log(`🎯 Opening traveler for board ${boardNumber}`);
        
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showSpecificTravelerPopup();
    }
    
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
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.calculateAllScores()" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Calculate All Scores</button>
                <button onclick="window.saveTravelerData()" style="background: #3498db; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 8px;">Save & Close</button>
                <button onclick="window.closeTravelerPopup()" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Cancel</button>
            </div>
        `;
        
        popup.appendChild(content);
        document.body.appendChild(popup);
        
        this.setupTravelerGlobals();
        this.setupDropdownListeners();
        this.setupMobilePopupButtons();
    }
    
    getTravelerRowsHTML() {
        return this.traveler.data.map((row, index) => `
            <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.nsPair}</td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center; font-weight: bold;">${row.ewPair}</td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="level" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="suit" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 14px; font-weight: bold;">
                        <option value="">-</option>
                        <option value="♣">♣</option>
                        <option value="♦">♦</option>
                        <option value="♥">♥</option>
                        <option value="♠">♠</option>
                        <option value="NT">NT</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="declarer" style="width: 40px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="N">N</option>
                        <option value="S">S</option>
                        <option value="E">E</option>
                        <option value="W">W</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="double" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        <option value="X">X</option>
                        <option value="XX">XX</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7; text-align: center;">
                    <select data-row="${index}" data-field="tricks" style="width: 55px; padding: 2px; border: 1px solid #ccc; font-size: 11px;">
                        <option value="">-</option>
                        ${Array.from({length: 14}, (_, i) => `<option value="${i}">${i}</option>`).join('')}
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
    
    setupDropdownListeners() {
        const selects = document.querySelectorAll('#travelerPopup select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                const rowIndex = parseInt(e.target.dataset.row);
                const field = e.target.dataset.field;
                const value = e.target.value;
                
                this.traveler.data[rowIndex][field] = value;
                
                const row = this.traveler.data[rowIndex];
                if (row.level && row.suit && row.declarer && row.tricks) {
                    this.calculateScore(rowIndex);
                }
            });
        });
    }
    
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
    
    calculateScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.tricks) return;
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        
        let isVulnerable = false;
        if (vulnerability === 'Both') isVulnerable = true;
        else if (vulnerability === 'NS' && declarerSide === 'NS') isVulnerable = true;
        else if (vulnerability === 'EW' && declarerSide === 'EW') isVulnerable = true;
        
        const level = parseInt(row.level);
        const tricks = parseInt(row.tricks);
        const needed = 6 + level;
        const result = tricks - needed;
        const isDoubled = row.double === 'X';
        const isRedoubled = row.double === 'XX';
        
        let score = 0;
        if (result >= 0) {
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10;
            
            if (isDoubled || isRedoubled) {
                basicScore *= (isRedoubled ? 4 : 2);
            }
            
            score = basicScore;
            
            if (result > 0) {
                if (isDoubled || isRedoubled) {
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += result * overtrickValue * (isRedoubled ? 2 : 1);
                } else {
                    score += result * suitPoints[row.suit];
                }
            }
            
            if (basicScore >= 100) {
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            if (isDoubled) score += 50;
            if (isRedoubled) score += 100;
            
        } else {
            const undertricks = Math.abs(result);
            
            if (isDoubled || isRedoubled) {
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
                score = -(undertricks * (isVulnerable ? 100 : 50));
            }
        }
        
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
        
        const nsSpan = document.getElementById(`nsScore_${rowIndex}`);
        const ewSpan = document.getElementById(`ewScore_${rowIndex}`);
        if (nsSpan) nsSpan.textContent = row.nsScore;
        if (ewSpan) ewSpan.textContent = row.ewScore;
    }
    
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        if (cycle === 0) return 'None';
        if (cycle === 1) return 'NS';
        if (cycle === 2) return 'EW';
        if (cycle === 3) return 'Both';
        if (cycle === 4) return 'EW';
        if (cycle === 5) return 'Both';
        if (cycle === 6) return 'None';
        if (cycle === 7) return 'NS';
        if (cycle === 8) return 'NS';
        if (cycle === 9) return 'EW';
        if (cycle === 10) return 'Both';
        if (cycle === 11) return 'None';
        if (cycle === 12) return 'Both';
        if (cycle === 13) return 'None';
        if (cycle === 14) return 'NS';
        if (cycle === 15) return 'EW';
    }
    
    saveTravelerData() {
        this.session.boards[this.traveler.boardNumber].results = [...this.traveler.data];
        this.session.boards[this.traveler.boardNumber].completed = true;
        
        console.log(`💾 Saved traveler for Board ${this.traveler.boardNumber}`);
        this.closeTravelerPopup();
    }
    
    closeTravelerPopup() {
        const popup = document.getElementById('travelerPopup');
        if (popup) popup.remove();
        
        this.traveler.isActive = false;
        
        delete window.calculateAllScores;
        delete window.saveTravelerData;
        delete window.closeTravelerPopup;
        
        this.updateDisplay();
    }
    
    showMovementPopup() {
        const movement = this.session.movement;
        
        const popup = document.createElement('div');
        popup.id = 'movementPopup';
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
        
        window.duplicateBridge = this;
        this.setupMobilePopupButtons();
    }
    
    getMovementTableHTML() {
        const movement = this.session.movement;
        if (!movement || !movement.movement) return '<p>Movement data not available</p>';
        
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
        
        for (let t = 1; t <= movement.tables; t++) {
            html += `<th style="padding: 8px; border: 1px solid #2c3e50;">Table ${t}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        Object.keys(roundData).sort((a,b) => parseInt(a) - parseInt(b)).forEach(round => {
            html += `<tr><td style="padding: 8px; border: 1px solid #2c3e50; font-weight: bold; background: #ecf0f1; text-align: center;">${round}</td>`;
            
            const roundEntries = roundData[round];
            
            for (let t = 1; t <= movement.tables; t++) {
                const entry = roundEntries.find(e => e.table === t);
                if (entry) {
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
        
        return html;
    }
    
    getActiveButtons() {
        if (this.traveler.isActive) {
            return [];
        }
        
        switch (this.inputState) {
            case 'pairs_setup':
                return ['4','6','8'];
            case 'movement_confirm':
                return ['1','2','BACK'];
            case 'board_selection':
                const buttons = [];
                if (this.areAllBoardsComplete()) {
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
    
    updateDisplay() {
        const content = this.getDisplayContent();
        this.ui.updateDisplay(content);
        
        const activeButtons = this.getActiveButtons();
        this.ui.updateButtonStates(activeButtons);
        
        if (this.inputState === 'board_selection') {
            setTimeout(() => {
                const selectBtn = document.getElementById('selectBoardBtn');
                if (selectBtn) {
                    selectBtn.onclick = () => {
                        console.log('Board selection button clicked');
                        this.openTravelerPopup();
                    };
                }
            }, 100);
        }
    }
    
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
                            <button id="selectBoardBtn" 
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
    
    getResultsDisplay() {
        return `
            <div class="title-score-row">
                <div class="mode-title">Results</div>
                <div class="score-display">${this.session.pairs} Pairs</div>
            </div>
            <div class="game-content">
                <div><strong>Final Results - ${this.session.movement.description}</strong></div>
                <div style="text-align: center; margin: 20px 0;">
                    Results calculation would appear here
                </div>
            </div>
            <div class="current-state">BACK to continue scoring</div>
        `;
    }
    
    areAllBoardsComplete() {
        return Object.values(this.session.boards).every(board => board.completed);
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
    
    canGoBack() {
        return this.inputState !== 'pairs_setup' || this.traveler.isActive;
    }
    
    getHelpContent() {
        return {
            title: 'Duplicate Bridge Help',
            content: `
                <div class="help-section">
                    <h4>Simplified Duplicate Bridge</h4>
                    <p>Easy-to-use duplicate bridge scoring with dropdown interface.</p>
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
                        <li><strong>Score entry:</strong> Select board → fill traveler data</li>
                        <li><strong>Calculate:</strong> Scores auto-calculate</li>
                        <li><strong>Save:</strong> Click Save & Close when complete</li>
                    </ol>
                </div>
            `,
            buttons: [
                { text: 'Close Help', action: 'close', class: 'close-btn' }
            ]
        };
    }
    
    cleanup() {
        const popups = ['travelerPopup', 'boardSelectorPopup', 'movementPopup'];
        popups.forEach(id => {
            const popup = document.getElementById(id);
            if (popup) popup.remove();
        });
        
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