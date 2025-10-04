// ==================== Defend Earth Game Mode ====================
// Gamified asteroid defense simulation with time-limited challenges

class DefendEarthGame {
    constructor() {
        this.gameState = {
            isActive: false,
            level: 1,
            score: 0,
            lives: 3,
            timeRemaining: 300, // 5 minutes
            currentThreat: null,
            defeatedThreats: 0,
            gameMode: 'campaign', // 'campaign', 'survival', 'challenge'
            difficulty: 'normal' // 'easy', 'normal', 'hard', 'expert'
        };
        
        this.scenarios = [
            {
                name: "Chelyabinsk Redux",
                description: "A 20m asteroid approaches Earth. You have 2 years to deflect it.",
                asteroid: { diameter: 20, velocity: 19, density: 2700, warningTime: 730 },
                timeLimit: 120,
                points: 100
            },
            {
                name: "City Killer",
                description: "150m asteroid threatens major population center. Act fast!",
                asteroid: { diameter: 150, velocity: 25, density: 3000, warningTime: 365 },
                timeLimit: 180,
                points: 500
            },
            {
                name: "Regional Devastator",
                description: "300m asteroid could cause continental damage. Ultimate challenge!",
                asteroid: { diameter: 300, velocity: 30, density: 3500, warningTime: 180 },
                timeLimit: 240,
                points: 1000
            }
        ];
        
        this.achievements = [];
        this.leaderboard = JSON.parse(localStorage.getItem('defendEarthLeaderboard') || '[]');
    }

    startGame(mode = 'campaign', difficulty = 'normal') {
        this.gameState.isActive = true;
        this.gameState.gameMode = mode;
        this.gameState.difficulty = difficulty;
        this.gameState.level = 1;
        this.gameState.score = 0;
        this.gameState.lives = 3;
        this.gameState.defeatedThreats = 0;
        
        this.showGameUI();
        this.loadNextThreat();
        this.startGameTimer();
    }

    showGameUI() {
        const gameUI = document.getElementById('game-ui') || this.createGameUI();
        gameUI.style.display = 'block';
        this.updateGameUI();
    }

    createGameUI() {
        const gameUI = document.createElement('div');
        gameUI.id = 'game-ui';
        gameUI.className = 'fixed top-4 right-4 bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 z-50';
        gameUI.innerHTML = `
            <div class="text-center mb-4">
                <h3 class="text-xl font-bold text-blue-400 orbitron">🛡️ DEFEND EARTH</h3>
                <div class="text-sm text-gray-300 mt-1">Level <span id="game-level">1</span></div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div class="text-blue-400">Score</div>
                    <div id="game-score" class="text-white font-bold">0</div>
                </div>
                <div>
                    <div class="text-red-400">Lives</div>
                    <div id="game-lives" class="text-white font-bold">❤️❤️❤️</div>
                </div>
                <div>
                    <div class="text-yellow-400">Time</div>
                    <div id="game-time" class="text-white font-bold">5:00</div>
                </div>
                <div>
                    <div class="text-green-400">Threats</div>
                    <div id="game-threats" class="text-white font-bold">0</div>
                </div>
            </div>
            
            <div id="current-threat" class="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded">
                <div class="text-red-400 font-bold text-sm">INCOMING THREAT</div>
                <div id="threat-name" class="text-white font-bold"></div>
                <div id="threat-description" class="text-gray-300 text-xs mt-1"></div>
                <div id="threat-timer" class="text-yellow-400 text-sm mt-2"></div>
            </div>
            
            <div class="mt-4 space-y-2">
                <button id="game-pause" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm">
                    ⏸️ Pause
                </button>
                <button id="game-quit" class="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                    🚪 Quit Game
                </button>
            </div>
        `;
        
        document.body.appendChild(gameUI);
        
        // Event listeners
        document.getElementById('game-pause').addEventListener('click', () => this.togglePause());
        document.getElementById('game-quit').addEventListener('click', () => this.endGame());
        
        return gameUI;
    }

    loadNextThreat() {
        const scenario = this.scenarios[(this.gameState.level - 1) % this.scenarios.length];
        this.gameState.currentThreat = {
            ...scenario,
            startTime: Date.now(),
            timeLimit: scenario.timeLimit * (this.gameState.difficulty === 'hard' ? 0.7 : this.gameState.difficulty === 'easy' ? 1.5 : 1)
        };
        
        // Load asteroid parameters into simulator
        state.diameter = scenario.asteroid.diameter;
        state.velocity = scenario.asteroid.velocity;
        state.density = scenario.asteroid.density;
        
        // Update UI sliders
        updateSliderValues();
        
        this.updateThreatUI();
        this.showThreatAlert();
    }

    showThreatAlert() {
        const alert = document.createElement('div');
        alert.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        alert.innerHTML = `
            <div class="bg-red-900 border-2 border-red-500 rounded-lg p-8 max-w-md text-center animate-pulse">
                <div class="text-4xl mb-4">🚨</div>
                <h2 class="text-2xl font-bold text-red-400 mb-4">THREAT DETECTED</h2>
                <h3 class="text-xl text-white mb-2">${this.gameState.currentThreat.name}</h3>
                <p class="text-gray-300 mb-6">${this.gameState.currentThreat.description}</p>
                <button id="accept-challenge" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">
                    ACCEPT CHALLENGE
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        document.getElementById('accept-challenge').addEventListener('click', () => {
            alert.remove();
            this.startThreatTimer();
        });
    }

    startThreatTimer() {
        this.threatTimer = setInterval(() => {
            const elapsed = (Date.now() - this.gameState.currentThreat.startTime) / 1000;
            const remaining = this.gameState.currentThreat.timeLimit - elapsed;
            
            if (remaining <= 0) {
                this.threatFailed();
            } else {
                this.updateThreatUI();
            }
        }, 1000);
    }

    updateThreatUI() {
        const elapsed = (Date.now() - this.gameState.currentThreat.startTime) / 1000;
        const remaining = Math.max(0, this.gameState.currentThreat.timeLimit - elapsed);
        
        document.getElementById('threat-name').textContent = this.gameState.currentThreat.name;
        document.getElementById('threat-description').textContent = this.gameState.currentThreat.description;
        document.getElementById('threat-timer').textContent = `Time: ${Math.floor(remaining / 60)}:${(remaining % 60).toFixed(0).padStart(2, '0')}`;
        
        // Color coding based on urgency
        const timerEl = document.getElementById('threat-timer');
        if (remaining < 30) {
            timerEl.className = 'text-red-400 text-sm mt-2 animate-pulse';
        } else if (remaining < 60) {
            timerEl.className = 'text-yellow-400 text-sm mt-2';
        } else {
            timerEl.className = 'text-green-400 text-sm mt-2';
        }
    }

    checkMitigationSuccess() {
        if (!state.mitigationResults) return false;
        
        const deflection = state.mitigationResults.deflection_distance_km;
        const earthRadius = 6371; // km
        
        // Success if deflection is greater than Earth's radius
        return deflection > earthRadius;
    }

    threatDefeated() {
        clearInterval(this.threatTimer);
        
        const timeBonus = Math.floor((this.gameState.currentThreat.timeLimit - (Date.now() - this.gameState.currentThreat.startTime) / 1000) * 10);
        const points = this.gameState.currentThreat.points + timeBonus;
        
        this.gameState.score += points;
        this.gameState.defeatedThreats++;
        this.gameState.level++;
        
        this.showSuccessMessage(points);
        
        setTimeout(() => {
            if (this.gameState.level <= this.scenarios.length) {
                this.loadNextThreat();
            } else {
                this.gameWon();
            }
        }, 3000);
    }

    threatFailed() {
        clearInterval(this.threatTimer);
        this.gameState.lives--;
        
        if (this.gameState.lives <= 0) {
            this.gameOver();
        } else {
            this.showFailureMessage();
            setTimeout(() => this.loadNextThreat(), 2000);
        }
    }

    showSuccessMessage(points) {
        const message = document.createElement('div');
        message.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        message.innerHTML = `
            <div class="bg-green-900 border-2 border-green-500 rounded-lg p-8 text-center animate-bounce">
                <div class="text-4xl mb-4">🎉</div>
                <h2 class="text-2xl font-bold text-green-400 mb-4">THREAT NEUTRALIZED!</h2>
                <p class="text-white mb-2">+${points} points</p>
                <p class="text-gray-300">Earth is safe... for now.</p>
            </div>
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }

    showFailureMessage() {
        const message = document.createElement('div');
        message.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        message.innerHTML = `
            <div class="bg-red-900 border-2 border-red-500 rounded-lg p-8 text-center">
                <div class="text-4xl mb-4">💥</div>
                <h2 class="text-2xl font-bold text-red-400 mb-4">IMPACT!</h2>
                <p class="text-white mb-2">Lives remaining: ${this.gameState.lives}</p>
                <p class="text-gray-300">Try again, Earth depends on you!</p>
            </div>
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }

    updateGameUI() {
        document.getElementById('game-level').textContent = this.gameState.level;
        document.getElementById('game-score').textContent = this.gameState.score.toLocaleString();
        document.getElementById('game-lives').textContent = '❤️'.repeat(this.gameState.lives);
        document.getElementById('game-threats').textContent = this.gameState.defeatedThreats;
        
        const minutes = Math.floor(this.gameState.timeRemaining / 60);
        const seconds = this.gameState.timeRemaining % 60;
        document.getElementById('game-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (!this.gameState.isPaused) {
                this.gameState.timeRemaining--;
                this.updateGameUI();
                
                if (this.gameState.timeRemaining <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        document.getElementById('game-pause').textContent = this.gameState.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }

    endGame() {
        this.gameState.isActive = false;
        clearInterval(this.gameTimer);
        clearInterval(this.threatTimer);
        
        document.getElementById('game-ui').style.display = 'none';
        
        // Save score to leaderboard
        this.saveScore();
        this.showGameOverScreen();
    }

    gameWon() {
        this.endGame();
        this.showVictoryScreen();
    }

    gameOver() {
        this.endGame();
    }

    saveScore() {
        const score = {
            score: this.gameState.score,
            level: this.gameState.level,
            threats: this.gameState.defeatedThreats,
            mode: this.gameState.gameMode,
            difficulty: this.gameState.difficulty,
            date: new Date().toISOString()
        };
        
        this.leaderboard.push(score);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10
        
        localStorage.setItem('defendEarthLeaderboard', JSON.stringify(this.leaderboard));
    }

    showGameOverScreen() {
        const screen = document.createElement('div');
        screen.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
        screen.innerHTML = `
            <div class="bg-gray-900 border-2 border-blue-500 rounded-lg p-8 max-w-md text-center">
                <h2 class="text-3xl font-bold text-blue-400 mb-4 orbitron">GAME OVER</h2>
                <div class="space-y-2 mb-6">
                    <p class="text-white">Final Score: <span class="text-yellow-400 font-bold">${this.gameState.score.toLocaleString()}</span></p>
                    <p class="text-white">Level Reached: <span class="text-blue-400 font-bold">${this.gameState.level}</span></p>
                    <p class="text-white">Threats Defeated: <span class="text-green-400 font-bold">${this.gameState.defeatedThreats}</span></p>
                </div>
                <div class="space-y-2">
                    <button id="play-again" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">
                        🔄 Play Again
                    </button>
                    <button id="view-leaderboard" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold">
                        🏆 Leaderboard
                    </button>
                    <button id="back-to-sim" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                        ← Back to Simulator
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(screen);
        
        document.getElementById('play-again').addEventListener('click', () => {
            screen.remove();
            this.startGame();
        });
        
        document.getElementById('view-leaderboard').addEventListener('click', () => {
            screen.remove();
            this.showLeaderboard();
        });
        
        document.getElementById('back-to-sim').addEventListener('click', () => {
            screen.remove();
        });
    }

    showVictoryScreen() {
        const screen = document.createElement('div');
        screen.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
        screen.innerHTML = `
            <div class="bg-green-900 border-2 border-green-500 rounded-lg p-8 max-w-md text-center">
                <div class="text-6xl mb-4">🌍✨</div>
                <h2 class="text-3xl font-bold text-green-400 mb-4 orbitron">EARTH SAVED!</h2>
                <p class="text-white mb-4">Congratulations! You've successfully defended Earth from all asteroid threats!</p>
                <div class="space-y-2 mb-6">
                    <p class="text-white">Final Score: <span class="text-yellow-400 font-bold">${this.gameState.score.toLocaleString()}</span></p>
                    <p class="text-white">Perfect Score Bonus: <span class="text-green-400 font-bold">+5000</span></p>
                </div>
                <div class="space-y-2">
                    <button id="play-again-victory" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold">
                        🔄 Play Again
                    </button>
                    <button id="back-to-sim-victory" class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                        ← Back to Simulator
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(screen);
        
        document.getElementById('play-again-victory').addEventListener('click', () => {
            screen.remove();
            this.startGame();
        });
        
        document.getElementById('back-to-sim-victory').addEventListener('click', () => {
            screen.remove();
        });
    }

    showLeaderboard() {
        const screen = document.createElement('div');
        screen.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-50';
        
        let leaderboardHTML = '<div class="space-y-2">';
        this.leaderboard.forEach((entry, index) => {
            leaderboardHTML += `
                <div class="flex justify-between items-center p-2 bg-gray-800 rounded">
                    <span class="text-yellow-400 font-bold">#${index + 1}</span>
                    <span class="text-white">${entry.score.toLocaleString()}</span>
                    <span class="text-gray-400 text-sm">L${entry.level}</span>
                </div>
            `;
        });
        leaderboardHTML += '</div>';
        
        screen.innerHTML = `
            <div class="bg-gray-900 border-2 border-purple-500 rounded-lg p-8 max-w-md">
                <h2 class="text-2xl font-bold text-purple-400 mb-4 text-center orbitron">🏆 LEADERBOARD</h2>
                ${leaderboardHTML}
                <button id="close-leaderboard" class="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(screen);
        
        document.getElementById('close-leaderboard').addEventListener('click', () => {
            screen.remove();
        });
    }
}

// Global game instance
const defendEarthGame = new DefendEarthGame();

// Integration with main app
function startDefendEarthMode() {
    defendEarthGame.startGame('campaign', 'normal');
}

// Override mitigation calculation to check for game success
const originalCalculateMitigation = window.calculateMitigation;
window.calculateMitigation = function() {
    originalCalculateMitigation();
    
    // Check if game is active and mitigation was successful
    if (defendEarthGame.gameState.isActive && defendEarthGame.checkMitigationSuccess()) {
        setTimeout(() => {
            defendEarthGame.threatDefeated();
        }, 2000); // Give time for results to display
    }
};
