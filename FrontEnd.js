// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Client Class
class Game2048API {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Game Management
    async newGame(gameId = 'default', gridSize = 4) {
        return await this.makeRequest('/new_game', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId,
                grid_size: gridSize
            })
        });
    }

    async makeMove(gameId = 'default', direction) {
        return await this.makeRequest('/move', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId,
                direction: direction
            })
        });
    }

    async undoMove(gameId = 'default') {
        return await this.makeRequest('/undo', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId
            })
        });
    }

    async getHint(gameId = 'default', difficulty = 'medium') {
        return await this.makeRequest('/hint', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId,
                difficulty: difficulty
            })
        });
    }

    async getGameState(gameId = 'default') {
        return await this.makeRequest(`/game_state?game_id=${gameId}`);
    }

    // VS Mode
    async newVSGame(gridSize = 4, difficulty = 'medium') {
        return await this.makeRequest('/new_vs_game', {
            method: 'POST',
            body: JSON.stringify({
                grid_size: gridSize,
                difficulty: difficulty
            })
        });
    }

    async getAIMove(difficulty = 'medium') {
        return await this.makeRequest('/ai_move', {
            method: 'POST',
            body: JSON.stringify({
                game_id: 'ai_game',
                difficulty: difficulty
            })
        });
    }

    // Advanced Features
    async evaluateMove(gameId = 'default', direction) {
        return await this.makeRequest('/evaluate_move', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId,
                direction: direction
            })
        });
    }

    async getBestMoves(gameId = 'default') {
        return await this.makeRequest('/best_moves', {
            method: 'POST',
            body: JSON.stringify({
                game_id: gameId
            })
        });
    }

    async getStats(gameId = 'default') {
        return await this.makeRequest(`/stats?game_id=${gameId}`);
    }

    async deleteGame(gameId = 'default') {
        return await this.makeRequest(`/delete_game?game_id=${gameId}`, {
            method: 'DELETE'
        });
    }

    async healthCheck() {
        return await this.makeRequest('/health');
    }
}

// Enhanced Game State Management
class EnhancedGameState {
    constructor() {
        this.api = new Game2048API();
        this.useBackend = false; // Fallback to local mode if backend unavailable
        this.localGameState = {
            gridSize: 4,
            grid: [],
            score: 0,
            best: localStorage.getItem('best2048') || 0,
            gameHistory: [],
            isVSMode: false,
            aiDifficulty: 'medium',
            timeLimit: 120,
            timeRemaining: 120,
            gameTimer: null,
            aiGame: null,
            aiTimer: null
        };
        this.initializeBackendConnection();
    }

    async initializeBackendConnection() {
        try {
            await this.api.healthCheck();
            this.useBackend = true;
            console.log('Backend connection established');
        } catch (error) {
            console.log('Backend unavailable, using local mode');
            this.useBackend = false;
        }
    }

    // Hybrid methods that use backend when available, fall back to local
    async createNewGame(gridSize = 4, gameId = 'default') {
        if (this.useBackend) {
            try {
                const response = await this.api.newGame(gameId, gridSize);
                return response.game_state;
            } catch (error) {
                console.warn('Backend failed, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback
        return this.createLocalGame(gridSize);
    }

    async makeGameMove(direction, gameId = 'default') {
        if (this.useBackend) {
            try {
                const response = await this.api.makeMove(gameId, direction);
                return {
                    moved: response.moved,
                    gameState: response.game_state
                };
            } catch (error) {
                console.warn('Backend failed for move, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback
        return this.makeLocalMove(direction);
    }

    async getGameHint(difficulty = 'medium', gameId = 'default') {
        if (this.useBackend) {
            try {
                const response = await this.api.getHint(gameId, difficulty);
                return response.hint;
            } catch (error) {
                console.warn('Backend failed for hint, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback - simplified hint system
        return this.getLocalHint();
    }

    async undoGameMove(gameId = 'default') {
        if (this.useBackend) {
            try {
                const response = await this.api.undoMove(gameId);
                return response.success ? response.game_state : null;
            } catch (error) {
                console.warn('Backend failed for undo, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback
        return this.undoLocalMove();
    }

    async createVSGame(gridSize = 4, difficulty = 'medium') {
        if (this.useBackend) {
            try {
                const response = await this.api.newVSGame(gridSize, difficulty);
                return {
                    humanState: response.human_state,
                    aiState: response.ai_state
                };
            } catch (error) {
                console.warn('Backend failed for VS game, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback
        return this.createLocalVSGame(gridSize, difficulty);
    }

    async getAIMove(difficulty = 'medium') {
        if (this.useBackend) {
            try {
                const response = await this.api.getAIMove(difficulty);
                return {
                    move: response.move,
                    gameState: response.game_state
                };
            } catch (error) {
                console.warn('Backend failed for AI move, falling back to local');
                this.useBackend = false;
            }
        }

        // Local fallback
        return this.getLocalAIMove(difficulty);
    }

    // Local game implementation methods
    createLocalGame(gridSize) {
        this.localGameState.gridSize = gridSize;
        this.localGameState.grid = [];
        this.localGameState.score = 0;
        this.localGameState.gameHistory = [];

        // Initialize empty grid
        for (let i = 0; i < gridSize; i++) {
            this.localGameState.grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                this.localGameState.grid[i][j] = 0;
            }
        }

        // Add initial tiles
        this.addRandomTileLocal();
        this.addRandomTileLocal();

        return {
            grid: this.localGameState.grid,
            score: this.localGameState.score,
            game_over: false
        };
    }

    addRandomTileLocal() {
        const emptyCells = [];
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.grid[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.localGameState.grid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    makeLocalMove(direction) {
        // Save current state for undo
        this.localGameState.gameHistory.push({
            grid: this.localGameState.grid.map(row => [...row]),
            score: this.localGameState.score
        });

        // Keep only last 10 moves
        if (this.localGameState.gameHistory.length > 10) {
            this.localGameState.gameHistory.shift();
        }

        let moved = false;
        switch(direction) {
            case 'left':
                moved = this.moveLeftLocal();
                break;
            case 'right':
                moved = this.moveRightLocal();
                break;
            case 'up':
                moved = this.moveUpLocal();
                break;
            case 'down':
                moved = this.moveDownLocal();
                break;
        }

        if (moved) {
            this.addRandomTileLocal();
        } else {
            // Remove the saved state if no move was made
            this.localGameState.gameHistory.pop();
        }

        return {
            moved: moved,
            gameState: {
                grid: this.localGameState.grid,
                score: this.localGameState.score,
                game_over: this.isGameOverLocal()
            }
        };
    }

    moveLeftLocal() {
        let moved = false;
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            const row = this.localGameState.grid[i].filter(val => val !== 0);
            
            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.localGameState.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            // Pad with zeros
            while (row.length < this.localGameState.gridSize) {
                row.push(0);
            }
            
            // Check if row changed
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.localGameState.grid[i][j] = row[j];
            }
        }
        return moved;
    }

    moveRightLocal() {
        let moved = false;
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            const row = this.localGameState.grid[i].filter(val => val !== 0);
            
            // Merge tiles from right
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.localGameState.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            
            // Pad with zeros at the beginning
            while (row.length < this.localGameState.gridSize) {
                row.unshift(0);
            }
            
            // Check if row changed
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.localGameState.grid[i][j] = row[j];
            }
        }
        return moved;
    }

    moveUpLocal() {
        let moved = false;
        for (let j = 0; j < this.localGameState.gridSize; j++) {
            const column = [];
            for (let i = 0; i < this.localGameState.gridSize; i++) {
                if (this.localGameState.grid[i][j] !== 0) {
                    column.push(this.localGameState.grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.localGameState.score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            // Pad with zeros
            while (column.length < this.localGameState.gridSize) {
                column.push(0);
            }
            
            // Update grid and check for changes
            for (let i = 0; i < this.localGameState.gridSize; i++) {
                if (this.localGameState.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.localGameState.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    moveDownLocal() {
        let moved = false;
        for (let j = 0; j < this.localGameState.gridSize; j++) {
            const column = [];
            for (let i = 0; i < this.localGameState.gridSize; i++) {
                if (this.localGameState.grid[i][j] !== 0) {
                    column.push(this.localGameState.grid[i][j]);
                }
            }
            
            // Merge tiles from bottom
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.localGameState.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                }
            }
            
            // Pad with zeros at the beginning
            while (column.length < this.localGameState.gridSize) {
                column.unshift(0);
            }
            
            // Update grid and check for changes
            for (let i = 0; i < this.localGameState.gridSize; i++) {
                if (this.localGameState.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.localGameState.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    undoLocalMove() {
        if (this.localGameState.gameHistory.length > 0) {
            const previousState = this.localGameState.gameHistory.pop();
            this.localGameState.grid = previousState.grid;
            this.localGameState.score = previousState.score;
            
            return {
                grid: this.localGameState.grid,
                score: this.localGameState.score,
                game_over: this.isGameOverLocal()
            };
        }
        return null;
    }

    isGameOverLocal() {
        // Check for empty cells
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                const current = this.localGameState.grid[i][j];
                // Check right neighbor
                if (j < this.localGameState.gridSize - 1 && this.localGameState.grid[i][j + 1] === current) {
                    return false;
                }
                // Check bottom neighbor
                if (i < this.localGameState.gridSize - 1 && this.localGameState.grid[i + 1][j] === current) {
                    return false;
                }
            }
        }

        return true;
    }

    getLocalHint() {
        // Simple local hint - just return a random valid move
        const validMoves = [];
        const directions = ['up', 'down', 'left', 'right'];
        
        for (const direction of directions) {
            // Test if this direction produces a valid move
            const gridCopy = this.localGameState.grid.map(row => [...row]);
            const scoreCopy = this.localGameState.score;
            
            const moved = this.testLocalMove(direction);
            
            if (moved) {
                validMoves.push(direction);
            }
            
            // Restore state
            this.localGameState.grid = gridCopy;
            this.localGameState.score = scoreCopy;
        }

        return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
    }

    testLocalMove(direction) {
        // Test a move without actually changing the game state permanently
        switch(direction) {
            case 'left': return this.moveLeftLocal();
            case 'right': return this.moveRightLocal();
            case 'up': return this.moveUpLocal();
            case 'down': return this.moveDownLocal();
            default: return false;
        }
    }

    createLocalVSGame(gridSize, difficulty) {
        // Create human game
        const humanGame = this.createLocalGame(gridSize);
        
        // Create AI game
        this.localGameState.aiGame = {
            grid: [],
            score: 0
        };

        // Initialize AI grid
        for (let i = 0; i < gridSize; i++) {
            this.localGameState.aiGame.grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                this.localGameState.aiGame.grid[i][j] = 0;
            }
        }

        // Add initial tiles for AI
        this.addRandomTileAI();
        this.addRandomTileAI();

        this.localGameState.aiDifficulty = difficulty;

        return {
            humanState: humanGame,
            aiState: {
                grid: this.localGameState.aiGame.grid,
                score: this.localGameState.aiGame.score,
                game_over: false
            }
        };
    }

    addRandomTileAI() {
        const emptyCells = [];
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.aiGame.grid[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.localGameState.aiGame.grid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    getLocalAIMove(difficulty) {
        // Simple AI logic for local mode
        const directions = ['up', 'down', 'left', 'right'];
        let bestMove = null;
        let bestScore = -1;

        for (const direction of directions) {
            const gridCopy = this.localGameState.aiGame.grid.map(row => [...row]);
            const scoreCopy = this.localGameState.aiGame.score;

            const moved = this.makeAILocalMove(direction);
            
            if (moved) {
                let score = this.localGameState.aiGame.score - scoreCopy;
                
                // Add empty cells bonus
                const emptyCells = this.countEmptyCellsAI();
                score += emptyCells * 10;

                // Add randomness based on difficulty
                if (difficulty === 'easy') {
                    score += Math.random() * 100;
                } else if (difficulty === 'medium') {
                    score += Math.random() * 50;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = direction;
                }
            }

            // Restore AI game state
            this.localGameState.aiGame.grid = gridCopy;
            this.localGameState.aiGame.score = scoreCopy;
        }

        if (bestMove) {
            // Actually make the best move
            const moved = this.makeAILocalMove(bestMove);
            if (moved) {
                this.addRandomTileAI();
            }

            return {
                move: bestMove,
                gameState: {
                    grid: this.localGameState.aiGame.grid,
                    score: this.localGameState.aiGame.score,
                    game_over: false
                }
            };
        }

        return null;
    }

    makeAILocalMove(direction) {
        let moved = false;
        const grid = this.localGameState.aiGame.grid;
        const size = this.localGameState.gridSize;

        switch(direction) {
            case 'left':
                for (let i = 0; i < size; i++) {
                    const row = grid[i].filter(val => val !== 0);
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            this.localGameState.aiGame.score += row[j];
                            row.splice(j + 1, 1);
                        }
                    }
                    while (row.length < size) row.push(0);
                    for (let j = 0; j < size; j++) {
                        if (grid[i][j] !== row[j]) moved = true;
                        grid[i][j] = row[j];
                    }
                }
                break;

            case 'right':
                for (let i = 0; i < size; i++) {
                    const row = grid[i].filter(val => val !== 0);
                    for (let j = row.length - 1; j > 0; j--) {
                        if (row[j] === row[j - 1]) {
                            row[j] *= 2;
                            this.localGameState.aiGame.score += row[j];
                            row.splice(j - 1, 1);
                            j--;
                        }
                    }
                    while (row.length < size) row.unshift(0);
                    for (let j = 0; j < size; j++) {
                        if (grid[i][j] !== row[j]) moved = true;
                        grid[i][j] = row[j];
                    }
                }
                break;

            case 'up':
                for (let j = 0; j < size; j++) {
                    const column = [];
                    for (let i = 0; i < size; i++) {
                        if (grid[i][j] !== 0) column.push(grid[i][j]);
                    }
                    for (let i = 0; i < column.length - 1; i++) {
                        if (column[i] === column[i + 1]) {
                            column[i] *= 2;
                            this.localGameState.aiGame.score += column[i];
                            column.splice(i + 1, 1);
                        }
                    }
                    while (column.length < size) column.push(0);
                    for (let i = 0; i < size; i++) {
                        if (grid[i][j] !== column[i]) moved = true;
                        grid[i][j] = column[i];
                    }
                }
                break;

            case 'down':
                for (let j = 0; j < size; j++) {
                    const column = [];
                    for (let i = 0; i < size; i++) {
                        if (grid[i][j] !== 0) column.push(grid[i][j]);
                    }
                    for (let i = column.length - 1; i > 0; i--) {
                        if (column[i] === column[i - 1]) {
                            column[i] *= 2;
                            this.localGameState.aiGame.score += column[i];
                            column.splice(i - 1, 1);
                            i--;
                        }
                    }
                    while (column.length < size) column.unshift(0);
                    for (let i = 0; i < size; i++) {
                        if (grid[i][j] !== column[i]) moved = true;
                        grid[i][j] = column[i];
                    }
                }
                break;
        }

        return moved;
    }

    countEmptyCellsAI() {
        let count = 0;
        for (let i = 0; i < this.localGameState.gridSize; i++) {
            for (let j = 0; j < this.localGameState.gridSize; j++) {
                if (this.localGameState.aiGame.grid[i][j] === 0) count++;
            }
        }
        return count;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game2048API, EnhancedGameState };
}