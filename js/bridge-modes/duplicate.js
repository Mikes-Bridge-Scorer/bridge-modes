/**
 * Simplified Duplicate Bridge Mode with Mobile Popup Fixes
 */

import { BaseBridgeMode } from './base-mode.js';

class DuplicateBridge extends BaseBridgeMode {
    constructor(gameState, ui) {
        super(gameState, ui);
        
        this.modeName = 'duplicate';
        this.displayName = 'Duplicate Bridge';
        
        this.session = {
            pairs: 0,
            movement: null,
            currentBoard: 1,
            boards: {},
            isSetup: false
        };
        
        this.traveler = {
            isActive: false,
            boardNumber: null,
            data: []
        };
        
        this.inputState = 'pairs_setup';
        this.initializeMovements();
    }
    
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
                    { round: 2, table: 4, ns: 2, ew: 5, boards: [1,2] }
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
    
    // MOBILE FIX: Setup touch events for popup buttons
    setupMobilePopupButtons() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) return;
        
        console.log('📱 Setting up mobile touch for duplicate popup buttons');
        
        setTimeout(() => {
            const popup = document.getElementById('travelerPopup') || 
                         document.getElementById('boardSelectorPopup') || 
                         document.getElementById('movementPopup');
                         
            if (!popup) return;
            
            const buttons = popup.querySelectorAll('button');
            
            buttons.forEach((button) => {
                button.style.touchAction = 'manipulation';
                button.style.userSelect = 'none';
                button.style.webkitTapHighlightColor = 'transparent';
                button.style.minHeight = '44px';
                
                const originalOnclick = button.onclick;
                const onclickAttr = button.getAttribute('onclick');
                
                const mobileHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('📱 Popup button touched:', button.textContent.trim());
                    
                    button.style.transform = 'scale(0.95)';
                    button.style.opacity = '0.8';
                    
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
                            console.error('Error executing popup button:', error);
                        }
                    }, 100);
                };
                
                button.addEventListener('touchend', mobileHandler, { passive: false });
                button.addEventListener('click', mobileHandler);
            });
            
            console.log(`✅ Mobile touch setup complete for ${buttons.length} buttons`);
        }, 200);
    }
    
    openTravelerPopup(boardNumber = null) {
        if (boardNumber) {
            this.openSpecificTraveler(boardNumber);
        } else {
            this.showBoardSelectorPopup();
        }
    }
    
    showBoardSelectorPopup() {
        const popup = document.createElement('div');
        popup.id = 'boardSelectorPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 95%; color: #2c3e50;">
                <h3 style="text-align: center; margin-bottom: 20px;">Board Selection</h3>
                
                <div style="text-align: center; margin: 20px 0;">
                    <select id="boardDropdown" style="padding: 15px; border: 2px solid #3498db; border-radius: 8px; font-size: 18px; min-width: 250px; background: white;">
                        <option value="">Select Board...</option>
                        <option value="1">Board 1 (None)</option>
                        <option value="2">Board 2 (NS)</option>
                        <option value="3">Board 3 (EW)</option>
                        <option value="4">Board 4 (Both)</option>
                        <option value="5">Board 5 (EW)</option>
                        <option value="6">Board 6 (Both)</option>
                        <option value="7">Board 7 (None)</option>
                        <option value="8">Board 8 (NS)</option>
                        <option value="9">Board 9 (NS)</option>
                        <option value="10">Board 10 (EW)</option>
                        <option value="11">Board 11 (Both)</option>
                        <option value="12">Board 12 (None)</option>
                    </select>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="
                        var d = document.getElementById('boardDropdown');
                        if (d.value) {
                            document.getElementById('boardSelectorPopup').remove();
                            window.duplicateBridge.openSpecificTraveler(parseInt(d.value));
                        } else {
                            alert('Please select a board first!');
                        }
                    " style="background: #27ae60; color: white; border: none; padding: 15px 25px; border-radius: 4px; margin-right: 8px; min-height: 50px; font-size: 18px; cursor: pointer;">Open Traveler</button>
                    
                    <button onclick="document.getElementById('boardSelectorPopup').remove();" style="background: #e74c3c; color: white; border: none; padding: 15px 25px; border-radius: 4px; min-height: 50px; font-size: 18px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
    }
    
    // MOBILE FIX: Setup board selector events with enhanced dropdown support
    setupBoardSelectorEvents() {
        const openBtn = document.getElementById('openTravelerBtn');
        const cancelBtn = document.getElementById('cancelBoardBtn');
        const dropdown = document.getElementById('boardDropdown');
        
        // ENHANCED MOBILE DROPDOWN FIX
        if (dropdown) {
            console.log('📱 Setting up enhanced dropdown for mobile');
            
            dropdown.style.touchAction = 'manipulation';
            dropdown.style.userSelect = 'none';
            dropdown.style.webkitUserSelect = 'none';
            dropdown.style.webkitTapHighlightColor = 'transparent';
            dropdown.style.fontSize = '16px'; // Prevents zoom on iOS
            dropdown.style.minHeight = '44px';
            
            // Multiple event types for maximum compatibility
            dropdown.addEventListener('change', (e) => {
                console.log('📱 Dropdown changed to:', e.target.value);
            });
            
            dropdown.addEventListener('touchstart', (e) => {
                console.log('📱 Dropdown touched');
            }, { passive: true });
            
            dropdown.addEventListener('click', (e) => {
                console.log('📱 Dropdown clicked');
                // Force focus for mobile
                setTimeout(() => {
                    dropdown.focus();
                }, 50);
            });
        }
        
        if (openBtn) {
            const openHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('📱 Open Traveler button pressed - FIXED VERSION');
                
                const dropdown = document.getElementById('boardDropdown');
                const selectedValue = dropdown ? dropdown.value : '';
                
                console.log('📱 Dropdown value:', selectedValue);
                
                if (selectedValue && selectedValue !== '') {
                    const boardNum = parseInt(selectedValue);
                    console.log('📱 Opening board:', boardNum);
                    this.closeBoardSelector();
                    setTimeout(() => {
                        this.openSpecificTraveler(boardNum);
                    }, 100);
                } else {
                    console.log('📱 No board selected - showing alert');
                    alert('Please select a board first!');
                }
            };
            
            // EMERGENCY FIX: Remove ALL existing handlers and add fresh ones
            openBtn.replaceWith(openBtn.cloneNode(true));
            const freshOpenBtn = document.getElementById('openTravelerBtn');
            
            freshOpenBtn.style.touchAction = 'manipulation';
            freshOpenBtn.style.userSelect = 'none';
            freshOpenBtn.style.webkitTapHighlightColor = 'transparent';
            freshOpenBtn.style.cursor = 'pointer';
            
            freshOpenBtn.addEventListener('click', openHandler);
            freshOpenBtn.addEventListener('touchend', openHandler, { passive: false });
            freshOpenBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                freshOpenBtn.style.transform = 'scale(0.95)';
                freshOpenBtn.style.opacity = '0.8';
            }, { passive: false });
            
            console.log('📱 Fresh Open Traveler button setup complete');
        }
        
        if (cancelBtn) {
            const cancelHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📱 Cancel button pressed');
                this.closeBoardSelector();
            };
            
            cancelBtn.style.touchAction = 'manipulation';
            cancelBtn.style.userSelect = 'none';
            cancelBtn.style.webkitTapHighlightColor = 'transparent';
            cancelBtn.addEventListener('click', cancelHandler);
            cancelBtn.addEventListener('touchend', cancelHandler, { passive: false });
        }
    }
    
    getBoardDropdownOptions() {
        let options = '';
        
        Object.values(this.session.boards).forEach(board => {
            const status = board.completed ? '✅' : '⭕';
            const vulnerability = this.getBoardVulnerability(board.number);
            
            options += `<option value="${board.number}">Board ${board.number} ${status} (${vulnerability})</option>`;
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
        this.traveler.isActive = true;
        this.traveler.boardNumber = boardNumber;
        this.traveler.data = this.generateTravelerRows(boardNumber);
        
        this.showSpecificTravelerPopup();
    }
    
    generateTravelerRows(boardNumber) {
        const instances = this.session.movement.movement.filter(entry => 
            entry.boards && entry.boards.includes(boardNumber)
        );
        
        return instances.map((instance) => ({
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
    
    showSpecificTravelerPopup() {
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        
        const popup = document.createElement('div');
        popup.id = 'travelerPopup';
        popup.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.8); z-index: 1000; 
            display: flex; align-items: center; justify-content: center;
        `;
        
        popup.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 95%; max-height: 90%; overflow: auto; color: #2c3e50;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>Board ${this.traveler.boardNumber}</h3>
                    <div style="color: #e74c3c; font-weight: bold;">${vulnerability} Vulnerable</div>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #34495e; color: white;">
                                <th style="padding: 8px; border: 1px solid #2c3e50;">NS</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">EW</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">Bid</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">Suit</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">By</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">Tricks</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">NS Score</th>
                                <th style="padding: 8px; border: 1px solid #2c3e50;">EW Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getTravelerRowsHTML()}
                        </tbody>
                    </table>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.calculateAllScores()" style="background: #27ae60; color: white; border: none; padding: 12px 20px; border-radius: 4px; margin-right: 8px;">Calculate</button>
                    <button onclick="window.saveTravelerData()" style="background: #3498db; color: white; border: none; padding: 12px 20px; border-radius: 4px; margin-right: 8px;">Save</button>
                    <button onclick="window.closeTravelerPopup()" style="background: #e74c3c; color: white; border: none; padding: 12px 20px; border-radius: 4px;">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        this.setupTravelerGlobals();
        this.setupDropdownListeners(); // Add this for auto-calculation
        this.setupMobilePopupButtons();
    }
    
    getTravelerRowsHTML() {
        return this.traveler.data.map((row, index) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${row.nsPair}</td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">${row.ewPair}</td>
                <td style="padding: 4px; border: 1px solid #bdc3c7;">
                    <select data-row="${index}" data-field="level" style="width: 50px;">
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
                <td style="padding: 4px; border: 1px solid #bdc3c7;">
                    <select data-row="${index}" data-field="suit" style="width: 50px;">
                        <option value="">-</option>
                        <option value="♣">♣</option>
                        <option value="♦">♦</option>
                        <option value="♥">♥</option>
                        <option value="♠">♠</option>
                        <option value="NT">NT</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7;">
                    <select data-row="${index}" data-field="declarer" style="width: 40px;">
                        <option value="">-</option>
                        <option value="N">N</option>
                        <option value="S">S</option>
                        <option value="E">E</option>
                        <option value="W">W</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7;">
                    <select data-row="${index}" data-field="double" style="width: 40px;">
                        <option value="">-</option>
                        <option value="X">X</option>
                        <option value="XX">XX</option>
                    </select>
                </td>
                <td style="padding: 4px; border: 1px solid #bdc3c7;">
                    <select data-row="${index}" data-field="tricks" style="width: 50px;">
                        <option value="">-</option>
                        ${Array.from({length: 14}, (_, i) => `<option value="${i}">${i}</option>`).join('')}
                    </select>
                </td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">
                    <span id="nsScore_${index}">${row.nsScore !== null ? row.nsScore : '-'}</span>
                </td>
                <td style="padding: 8px; border: 1px solid #bdc3c7; text-align: center;">
                    <span id="ewScore_${index}">${row.ewScore !== null ? row.ewScore : '-'}</span>
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
                
                console.log(`📱 Dropdown changed: row ${rowIndex}, field ${field}, value ${value}`);
                
                this.traveler.data[rowIndex][field] = value;
                
                // AUTO-CALCULATE when row is complete
                const row = this.traveler.data[rowIndex];
                if (row.level && row.suit && row.declarer && row.tricks) {
                    console.log(`📱 Auto-calculating score for row ${rowIndex}`);
                    this.calculateScore(rowIndex);
                }
            });
        });
    }
    
    calculateScore(rowIndex) {
        const row = this.traveler.data[rowIndex];
        if (!row.level || !row.suit || !row.declarer || !row.tricks) return;
        
        console.log(`📱 Calculating score for row ${rowIndex}:`, row);
        
        const vulnerability = this.getBoardVulnerability(this.traveler.boardNumber);
        const declarerSide = ['N', 'S'].includes(row.declarer) ? 'NS' : 'EW';
        
        // Determine if declarer's side is vulnerable
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
            // Contract made
            const suitPoints = { '♣': 20, '♦': 20, '♥': 30, '♠': 30, 'NT': 30 };
            let basicScore = level * suitPoints[row.suit];
            if (row.suit === 'NT') basicScore += 10; // NT bonus
            
            if (isDoubled || isRedoubled) {
                basicScore *= (isRedoubled ? 4 : 2);
            }
            
            score = basicScore;
            
            // Add overtricks
            if (result > 0) {
                if (isDoubled || isRedoubled) {
                    const overtrickValue = isVulnerable ? 200 : 100;
                    score += result * overtrickValue * (isRedoubled ? 2 : 1);
                } else {
                    score += result * suitPoints[row.suit];
                }
            }
            
            // Game bonus
            if (basicScore >= 100) {
                score += isVulnerable ? 500 : 300;
            } else {
                score += 50;
            }
            
            // Double bonus
            if (isDoubled) score += 50;
            if (isRedoubled) score += 100;
            
        } else {
            // Contract failed
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
        
        // Assign scores (no negative scores in duplicate)
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
        
        console.log(`📱 Calculated scores: NS=${row.nsScore}, EW=${row.ewScore}`);
        
        // Update display
        const nsSpan = document.getElementById(`nsScore_${rowIndex}`);
        const ewSpan = document.getElementById(`ewScore_${rowIndex}`);
        if (nsSpan) nsSpan.textContent = row.nsScore;
        if (ewSpan) ewSpan.textContent = row.ewScore;
    }
    
    setupTravelerGlobals() {
        window.calculateAllScores = () => {
            console.log('Calculate all scores clicked');
        };
        
        window.saveTravelerData = () => {
            this.saveTravelerData();
        };
        
        window.closeTravelerPopup = () => {
            this.closeTravelerPopup();
        };
    }
    
    saveTravelerData() {
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
        
        popup.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 80%; overflow: auto; color: #2c3e50;">
                <h3 style="text-align: center;">${movement.description}</h3>
                ${this.getMovementTableHTML()}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 4px; margin-right: 10px;">Close</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove(); window.duplicateBridge.handleAction('2');" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 4px;">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        window.duplicateBridge = this;
        this.setupMobilePopupButtons();
    }
    
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
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 300px;">
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
                    
                    html += `
                        <td style="padding: 8px; border: 1px solid #2c3e50; text-align: center; font-size: 11px;">
                            <div><strong>NS: ${entry.ns}</strong></div>
                            <div><strong>EW: ${entry.ew}</strong></div>
                            <div style="color: #666; margin-top: 4px;">Boards: ${boardRange}</div>
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
    
    getBoardVulnerability(boardNumber) {
        const cycle = (boardNumber - 1) % 16;
        const vulns = ['None', 'NS', 'EW', 'Both', 'EW', 'Both', 'None', 'NS', 
                      'NS', 'EW', 'Both', 'None', 'Both', 'None', 'NS', 'EW'];
        return vulns[cycle];
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
                const buttons = ['BACK'];
                if (this.areAllBoardsComplete()) {
                    buttons.push('RESULTS');
                }
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
        
        // MOBILE FIX: Enhanced board selection button setup
        if (this.inputState === 'board_selection') {
            setTimeout(() => {
                const selectBtn = document.getElementById('selectBoardBtn');
                if (selectBtn) {
                    console.log('📱 Setting up board selection button');
                    
                    // Remove any existing handlers
                    selectBtn.onclick = null;
                    
                    // MOBILE FIX: Add both click and touch handlers
                    const boardSelectHandler = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📱 Board selection button pressed');
                        
                        // Visual feedback
                        selectBtn.style.transform = 'scale(0.95)';
                        selectBtn.style.opacity = '0.8';
                        
                        setTimeout(() => {
                            selectBtn.style.transform = '';
                            selectBtn.style.opacity = '';
                            this.openTravelerPopup();
                        }, 100);
                    };
                    
                    // Add mobile properties
                    selectBtn.style.touchAction = 'manipulation';
                    selectBtn.style.userSelect = 'none';
                    selectBtn.style.webkitTapHighlightColor = 'transparent';
                    selectBtn.style.cursor = 'pointer';
                    
                    // Add both event types
                    selectBtn.addEventListener('click', boardSelectHandler);
                    selectBtn.addEventListener('touchend', boardSelectHandler, { passive: false });
                    
                    console.log('✅ Board selection button mobile touch setup complete');
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
                        <div style="margin-top: 8px;">
                            • <strong>4 pairs:</strong> 2 tables, ~2 hours<br>
                            • <strong>6 pairs:</strong> 3 tables, ~1.5 hours<br>
                            • <strong>8 pairs:</strong> 4 tables, ~2.5 hours
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
                        <div style="margin-top: 8px;">
                            Press <strong>1</strong> to view movement<br>
                            Press <strong>2</strong> to confirm and start
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
                        <div><strong>Board Entry</strong></div>
                        <div style="margin-top: 8px;">
                            Select board to enter traveler results
                        </div>
                        
                        <div style="text-align: center; margin: 15px 0;">
                            <button id="selectBoardBtn" style="background: #3498db; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer;">
                                📋 Select Board
                            </button>
                        </div>
                    </div>
                    <div class="current-state">Select board to enter results</div>
                `;
                
            case 'results':
                return `
                    <div class="title-score-row">
                        <div class="mode-title">Results</div>
                        <div class="score-display">${this.session.pairs} Pairs</div>
                    </div>
                    <div class="game-content">
                        <div><strong>Final Results</strong></div>
                        <div style="margin: 20px 0; text-align: center;">
                            Results would be calculated here
                        </div>
                    </div>
                    <div class="current-state">BACK to continue</div>
                `;
                
            default:
                return '<div class="current-state">Loading...</div>';
        }
    }
    
    areAllBoardsComplete() {
        return Object.values(this.session.boards).every(board => board.completed);
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
                    <p>Easy duplicate bridge scoring with mobile support.</p>
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