from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import copy
import math
from typing import List, Tuple, Optional, Dict, Any
import json

app = Flask(__name__)
CORS(app)

class Game2048:
    def __init__(self, grid_size: int = 4):
        self.grid_size = grid_size
        self.grid = [[0 for _ in range(grid_size)] for _ in range(grid_size)]
        self.score = 0
        self.game_history = []
        
    def initialize_game(self):
        """Initialize a new game with 2 random tiles"""
        self.grid = [[0 for _ in range(self.grid_size)] for _ in range(self.grid_size)]
        self.score = 0
        self.game_history = []
        self.add_random_tile()
        self.add_random_tile()
        
    def add_random_tile(self):
        """Add a random tile (2 or 4) to an empty cell"""
        empty_cells = []
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i][j] == 0:
                    empty_cells.append((i, j))
        
        if empty_cells:
            i, j = random.choice(empty_cells)
            self.grid[i][j] = 2 if random.random() < 0.9 else 4
            
    def save_state(self):
        """Save current game state for undo functionality"""
        state = {
            'grid': copy.deepcopy(self.grid),
            'score': self.score
        }
        self.game_history.append(state)
        
        # Keep only last 10 states
        if len(self.game_history) > 10:
            self.game_history.pop(0)
    
    def undo_move(self):
        """Undo the last move"""
        if self.game_history:
            last_state = self.game_history.pop()
            self.grid = last_state['grid']
            self.score = last_state['score']
            return True
        return False
    
    def move_left(self):
        moved = False
        for i in range(self.grid_size):
            original = self.grid[i][:]
            new_row = [cell for cell in self.grid[i] if cell != 0]
            merged = [False] * self.grid_size
            j = 0
            while j < len(new_row) - 1:
                if new_row[j] == new_row[j + 1] and not merged[j] and not merged[j + 1]:
                    new_row[j] *= 2
                    self.score += new_row[j]
                    merged[j] = True
                    new_row.pop(j + 1)
                j += 1
            while len(new_row) < self.grid_size:
                new_row.append(0)
            if new_row != original:
                moved = True
            self.grid[i] = new_row
        return moved
    
    def move_right(self):
        moved = False
        for i in range(self.grid_size):
            original = self.grid[i][:]
            new_row = [cell for cell in self.grid[i] if cell != 0]
            merged = [False] * self.grid_size
            j = len(new_row) - 1
            while j > 0:
                if new_row[j] == new_row[j - 1] and not merged[j] and not merged[j - 1]:
                    new_row[j] *= 2
                    self.score += new_row[j]
                    merged[j] = True
                    new_row.pop(j - 1)
                    j -= 1
                j -= 1
            while len(new_row) < self.grid_size:
                new_row.insert(0, 0)
            if new_row != original:
                moved = True
            self.grid[i] = new_row
        return moved
    
    def move_up(self):
        moved = False
        for j in range(self.grid_size):
            original = [self.grid[i][j] for i in range(self.grid_size)]
            new_col = [self.grid[i][j] for i in range(self.grid_size) if self.grid[i][j] != 0]
            merged = [False] * self.grid_size
            i = 0
            while i < len(new_col) - 1:
                if new_col[i] == new_col[i + 1] and not merged[i] and not merged[i + 1]:
                    new_col[i] *= 2
                    self.score += new_col[i]
                    merged[i] = True
                    new_col.pop(i + 1)
                i += 1
            while len(new_col) < self.grid_size:
                new_col.append(0)
            for k in range(self.grid_size):
                if self.grid[k][j] != new_col[k]:
                    moved = True
                self.grid[k][j] = new_col[k]
        return moved
    
    def move_down(self):
        moved = False
        for j in range(self.grid_size):
            original = [self.grid[i][j] for i in range(self.grid_size)]
            new_col = [self.grid[i][j] for i in range(self.grid_size) if self.grid[i][j] != 0]
            merged = [False] * self.grid_size
            i = len(new_col) - 1
            while i > 0:
                if new_col[i] == new_col[i - 1] and not merged[i] and not merged[i - 1]:
                    new_col[i] *= 2
                    self.score += new_col[i]
                    merged[i] = True
                    new_col.pop(i - 1)
                    i -= 1
                i -= 1
            while len(new_col) < self.grid_size:
                new_col.insert(0, 0)
            for k in range(self.grid_size):
                if self.grid[k][j] != new_col[k]:
                    moved = True
                self.grid[k][j] = new_col[k]
        return moved
    
    def make_move(self, direction: str):
        """Make a move in the specified direction"""
        self.save_state()
        
        moved = False
        if direction == 'left':
            moved = self.move_left()
        elif direction == 'right':
            moved = self.move_right()
        elif direction == 'up':
            moved = self.move_up()
        elif direction == 'down':
            moved = self.move_down()
        
        if moved:
            self.add_random_tile()
        else:
            # Remove the saved state if no move was made
            if self.game_history:
                self.game_history.pop()
                
        return moved
    
    def is_game_over(self):
        """Check if the game is over (no more moves possible)"""
        # Check for empty cells
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if self.grid[i][j] == 0:
                    return False
        
        # Check for possible merges
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                current = self.grid[i][j]
                # Check right neighbor
                if j < self.grid_size - 1 and self.grid[i][j + 1] == current:
                    return False
                # Check bottom neighbor
                if i < self.grid_size - 1 and self.grid[i + 1][j] == current:
                    return False
                    
        return True
    
    def get_game_state(self):
        """Get current game state"""
        return {
            'grid': self.grid,
            'score': self.score,
            'game_over': self.is_game_over()
        }

class AIPlayer:
    def __init__(self, difficulty: str = 'medium'):
        self.difficulty = difficulty
        self.depth = {
            'easy': 2,
            'medium': 3,
            'hard': 4
        }.get(difficulty, 3)
        
    def get_best_move(self, game: Game2048):
        """Get the best move using minimax algorithm"""
        best_score = -1
        best_move = None
        
        for direction in ['up', 'down', 'left', 'right']:
            # Create a copy of the game
            game_copy = copy.deepcopy(game)
            
            if game_copy.make_move(direction):
                score = self.minimax(game_copy, self.depth - 1, False, -math.inf, math.inf)
                
                if score > best_score:
                    best_score = score
                    best_move = direction
        
        return best_move
    
    def minimax(self, game: Game2048, depth: int, is_maximizing: bool, alpha: float, beta: float):
        """Minimax algorithm with alpha-beta pruning"""
        if depth == 0 or game.is_game_over():
            return self.evaluate_grid(game)
        
        if is_maximizing:
            max_eval = -math.inf
            for direction in ['up', 'down', 'left', 'right']:
                game_copy = copy.deepcopy(game)
                if game_copy.make_move(direction):
                    eval_score = self.minimax(game_copy, depth - 1, False, alpha, beta)
                    max_eval = max(max_eval, eval_score)
                    alpha = max(alpha, eval_score)
                    if beta <= alpha:
                        break
            return max_eval
        else:
            min_eval = math.inf
            empty_cells = []
            for i in range(game.grid_size):
                for j in range(game.grid_size):
                    if game.grid[i][j] == 0:
                        empty_cells.append((i, j))
            
            for i, j in empty_cells[:4]:  # Limit to 4 empty cells for performance
                for value in [2, 4]:
                    game_copy = copy.deepcopy(game)
                    game_copy.grid[i][j] = value
                    eval_score = self.minimax(game_copy, depth - 1, True, alpha, beta)
                    min_eval = min(min_eval, eval_score)
                    beta = min(beta, eval_score)
                    if beta <= alpha:
                        break
                if beta <= alpha:
                    break
            return min_eval
    
    def evaluate_grid(self, game: Game2048):
        """Evaluate the current grid state"""
        score = game.score
        
        # Add randomness based on difficulty
        if self.difficulty == 'easy':
            score += random.randint(-1000, 1000)
        elif self.difficulty == 'medium':
            score += random.randint(-500, 500)
        
        # Empty cells bonus
        empty_cells = sum(1 for i in range(game.grid_size) for j in range(game.grid_size) if game.grid[i][j] == 0)
        score += empty_cells * 100
        
        # Monotonicity bonus
        score += self.calculate_monotonicity(game.grid) * 50
        
        # Smoothness bonus
        score += self.calculate_smoothness(game.grid) * 30
        
        # Max tile in corner bonus
        max_tile = max(max(row) for row in game.grid)
        corners = [game.grid[0][0], game.grid[0][-1], game.grid[-1][0], game.grid[-1][-1]]
        if max_tile in corners:
            score += max_tile * 2
            
        return score
    
    def calculate_monotonicity(self, grid):
        """Calculate monotonicity score"""
        monotonicity = 0
        
        # Check rows
        for i in range(len(grid)):
            increasing = decreasing = 0
            for j in range(1, len(grid[i])):
                if grid[i][j] > grid[i][j-1]:
                    increasing += 1
                elif grid[i][j] < grid[i][j-1]:
                    decreasing += 1
            monotonicity += max(increasing, decreasing)
        
        # Check columns
        for j in range(len(grid[0])):
            increasing = decreasing = 0
            for i in range(1, len(grid)):
                if grid[i][j] > grid[i-1][j]:
                    increasing += 1
                elif grid[i][j] < grid[i-1][j]:
                    decreasing += 1
            monotonicity += max(increasing, decreasing)
        
        return monotonicity
    
    def calculate_smoothness(self, grid):
        """Calculate smoothness score"""
        smoothness = 0
        
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] != 0:
                    # Check right neighbor
                    if j < len(grid[0]) - 1 and grid[i][j+1] != 0:
                        smoothness -= abs(math.log2(grid[i][j]) - math.log2(grid[i][j+1]))
                    # Check bottom neighbor
                    if i < len(grid) - 1 and grid[i+1][j] != 0:
                        smoothness -= abs(math.log2(grid[i][j]) - math.log2(grid[i+1][j]))
        
        return smoothness

# Game instances storage
games = {}
ai_players = {}

@app.route('/api/new_game', methods=['POST'])
def new_game():
    """Create a new game instance"""
    data = request.json
    game_id = data.get('game_id', 'default')
    grid_size = data.get('grid_size', 4)
    
    game = Game2048(grid_size)
    game.initialize_game()
    games[game_id] = game
    
    return jsonify({
        'success': True,
        'game_state': game.get_game_state()
    })

@app.route('/api/move', methods=['POST'])
def make_move():
    """Make a move in the game"""
    data = request.json
    game_id = data.get('game_id', 'default')
    direction = data.get('direction')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    moved = game.make_move(direction)
    
    return jsonify({
        'success': True,
        'moved': moved,
        'game_state': game.get_game_state()
    })

@app.route('/api/undo', methods=['POST'])
def undo_move():
    """Undo the last move"""
    data = request.json
    game_id = data.get('game_id', 'default')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    success = game.undo_move()
    
    return jsonify({
        'success': success,
        'game_state': game.get_game_state() if success else None
    })

@app.route('/api/hint', methods=['POST'])
def get_hint():
    """Get a hint for the best move"""
    data = request.json
    game_id = data.get('game_id', 'default')
    difficulty = data.get('difficulty', 'medium')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    ai = AIPlayer(difficulty)
    best_move = ai.get_best_move(game)
    
    return jsonify({
        'success': True,
        'hint': best_move
    })

@app.route('/api/ai_move', methods=['POST'])
def ai_move():
    """Get AI move for vs mode"""
    data = request.json
    game_id = data.get('game_id', 'ai_game')
    difficulty = data.get('difficulty', 'medium')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'AI game not found'}), 404
    
    game = games[game_id]
    
    if game_id not in ai_players:
        ai_players[game_id] = AIPlayer(difficulty)
    
    ai = ai_players[game_id]
    best_move = ai.get_best_move(game)
    
    if best_move:
        moved = game.make_move(best_move)
        return jsonify({
            'success': True,
            'move': best_move,
            'moved': moved,
            'game_state': game.get_game_state()
        })
    
    return jsonify({
        'success': False,
        'error': 'No valid moves available'
    })

@app.route('/api/game_state', methods=['GET'])
def get_game_state():
    """Get current game state"""
    game_id = request.args.get('game_id', 'default')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    return jsonify({
        'success': True,
        'game_state': game.get_game_state()
    })

@app.route('/api/new_vs_game', methods=['POST'])
def new_vs_game():
    """Create new games for VS mode (human and AI)"""
    data = request.json
    grid_size = data.get('grid_size', 4)
    difficulty = data.get('difficulty', 'medium')
    
    # Create human game
    human_game = Game2048(grid_size)
    human_game.initialize_game()
    games['human'] = human_game
    
    # Create AI game
    ai_game = Game2048(grid_size)
    ai_game.initialize_game()
    games['ai_game'] = ai_game
    
    # Create AI player
    ai_players['ai_game'] = AIPlayer(difficulty)
    
    return jsonify({
        'success': True,
        'human_state': human_game.get_game_state(),
        'ai_state': ai_game.get_game_state()
    })

@app.route('/api/evaluate_move', methods=['POST'])
def evaluate_move():
    """Evaluate a potential move for hint system"""
    data = request.json
    game_id = data.get('game_id', 'default')
    direction = data.get('direction')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    # Create a copy of the game to test the move
    game_copy = copy.deepcopy(games[game_id])
    moved = game_copy.make_move(direction)
    
    if moved:
        ai = AIPlayer('medium')
        score = ai.evaluate_grid(game_copy)
        
        return jsonify({
            'success': True,
            'moved': True,
            'evaluation_score': score,
            'points_gained': game_copy.score - games[game_id].score
        })
    
    return jsonify({
        'success': True,
        'moved': False,
        'evaluation_score': -1000  # Penalty for invalid moves
    })

@app.route('/api/best_moves', methods=['POST'])
def get_best_moves():
    """Get ranked list of all possible moves"""
    data = request.json
    game_id = data.get('game_id', 'default')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    moves_evaluation = []
    
    for direction in ['up', 'down', 'left', 'right']:
        game_copy = copy.deepcopy(game)
        moved = game_copy.make_move(direction)
        
        if moved:
            ai = AIPlayer('medium')
            score = ai.evaluate_grid(game_copy)
            moves_evaluation.append({
                'direction': direction,
                'score': score,
                'points_gained': game_copy.score - game.score
            })
    
    # Sort by score (best first)
    moves_evaluation.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({
        'success': True,
        'moves': moves_evaluation
    })

@app.route('/api/stats', methods=['GET'])
def get_game_stats():
    """Get game statistics"""
    game_id = request.args.get('game_id', 'default')
    
    if game_id not in games:
        return jsonify({'success': False, 'error': 'Game not found'}), 404
    
    game = games[game_id]
    
    # Calculate various statistics
    max_tile = max(max(row) for row in game.grid)
    empty_cells = sum(1 for i in range(game.grid_size) for j in range(game.grid_size) if game.grid[i][j] == 0)
    total_cells = game.grid_size * game.grid_size
    
    # Calculate tile distribution
    tile_count = {}
    for i in range(game.grid_size):
        for j in range(game.grid_size):
            if game.grid[i][j] != 0:
                tile = game.grid[i][j]
                tile_count[tile] = tile_count.get(tile, 0) + 1
    
    return jsonify({
        'success': True,
        'stats': {
            'score': game.score,
            'max_tile': max_tile,
            'empty_cells': empty_cells,
            'filled_cells': total_cells - empty_cells,
            'tile_distribution': tile_count,
            'moves_available': len([d for d in ['up', 'down', 'left', 'right'] 
                                  if copy.deepcopy(game).make_move(d)]),
            'game_over': game.is_game_over()
        }
    })

@app.route('/api/delete_game', methods=['DELETE'])
def delete_game():
    """Delete a game instance"""
    game_id = request.args.get('game_id', 'default')
    
    if game_id in games:
        del games[game_id]
        
    if game_id in ai_players:
        del ai_players[game_id]
    
    return jsonify({'success': True})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'active_games': len(games),
        'active_ai_players': len(ai_players)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)