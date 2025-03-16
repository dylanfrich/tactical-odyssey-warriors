
import React, { createContext, useContext, useReducer } from 'react';
import { 
  GameState, GameAction, Player, Position, Unit, UnitType, 
  UNIT_STATS, STARTING_CREDITS, GRID_SIZE, Terrain
} from '@/types/game';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Initialize the game grid
const initializeGrid = () => {
  const { width, height } = GRID_SIZE;
  const grid = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Randomly assign terrain with weighted probabilities
      let terrain: Terrain = 'grass';
      const random = Math.random();
      
      if (random < 0.05) {
        terrain = 'mountain';
      } else if (random < 0.15) {
        terrain = 'water';
      } else if (random < 0.3) {
        terrain = 'road';
      }

      row.push({
        position: { x, y },
        terrain,
        unit: null,
      });
    }
    grid.push(row);
  }

  return grid;
};

const initialState: GameState = {
  grid: initializeGrid(),
  currentPlayer: 'blue',
  phase: 'deployment',
  winner: null,
  blueCredits: STARTING_CREDITS,
  redCredits: STARTING_CREDITS,
  selectedUnit: null,
  availableMoves: [],
  availableAttacks: [],
  turn: 1,
};

// Helper functions
const calculateMoves = (grid: GameState['grid'], unit: Unit): Position[] => {
  if (!unit) return [];

  const { x, y } = unit.position;
  const { moveRange } = unit;
  const moves: Position[] = [];

  // Simple flood fill algorithm to find valid moves within range
  for (let newY = Math.max(0, y - moveRange); newY < Math.min(grid.length, y + moveRange + 1); newY++) {
    for (let newX = Math.max(0, x - moveRange); newX < Math.min(grid[0].length, x + moveRange + 1); newX++) {
      // Skip the unit's current position
      if (x === newX && y === newY) continue;

      // Calculate Manhattan distance
      const distance = Math.abs(newX - x) + Math.abs(newY - y);
      
      // Check if within move range and the cell is not occupied
      if (distance <= moveRange && !grid[newY][newX].unit) {
        moves.push({ x: newX, y: newY });
      }
    }
  }

  return moves;
};

const calculateAttacks = (grid: GameState['grid'], unit: Unit): Position[] => {
  if (!unit) return [];

  const { x, y } = unit.position;
  const { attackRange } = unit;
  const attacks: Position[] = [];

  // Check each cell within attack range
  for (let newY = Math.max(0, y - attackRange); newY < Math.min(grid.length, y + attackRange + 1); newY++) {
    for (let newX = Math.max(0, x - attackRange); newX < Math.min(grid[0].length, x + attackRange + 1); newX++) {
      // Skip the unit's current position
      if (x === newX && y === newY) continue;

      // Calculate Manhattan distance
      const distance = Math.abs(newX - x) + Math.abs(newY - y);
      
      // Check if within attack range and has an enemy unit
      const targetCell = grid[newY][newX];
      if (distance <= attackRange && targetCell.unit && targetCell.unit.player !== unit.player) {
        attacks.push({ x: newX, y: newY });
      }
    }
  }

  return attacks;
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'select': {
      const { position } = action.payload;
      const cell = state.grid[position.y][position.x];
      
      // If no unit at position, or unit belongs to other player, return current state
      if (!cell.unit || cell.unit.player !== state.currentPlayer) {
        return state;
      }

      // If unit has already moved and attacked, it can't do anything else
      if (cell.unit.hasMoved && cell.unit.hasAttacked) {
        toast.info('This unit has already completed its actions for this turn');
        return state;
      }

      // Calculate available moves and attacks
      const availableMoves = cell.unit.hasMoved ? [] : calculateMoves(state.grid, cell.unit);
      const availableAttacks = cell.unit.hasAttacked ? [] : calculateAttacks(state.grid, cell.unit);

      return {
        ...state,
        selectedUnit: cell.unit,
        availableMoves,
        availableAttacks,
      };
    }
    
    case 'move': {
      if (!state.selectedUnit) return state;
      
      const { position } = action.payload;
      const { x: oldX, y: oldY } = state.selectedUnit.position;
      
      // Create a new unit with updated position and movement status
      const updatedUnit = {
        ...state.selectedUnit,
        position,
        hasMoved: true,
      };
      
      // Create a new grid with the unit moved
      const newGrid = [...state.grid];
      newGrid[oldY][oldX].unit = null; // Remove from old position
      newGrid[position.y][position.x].unit = updatedUnit; // Add to new position
      
      // Calculate new available attacks after moving
      const availableAttacks = updatedUnit.hasAttacked 
        ? [] 
        : calculateAttacks(newGrid, updatedUnit);
      
      toast.success(`Unit moved to (${position.x}, ${position.y})`);
      
      return {
        ...state,
        grid: newGrid,
        selectedUnit: updatedUnit,
        availableMoves: [],
        availableAttacks,
      };
    }
    
    case 'attack': {
      if (!state.selectedUnit) return state;
      
      const { position } = action.payload;
      const targetCell = state.grid[position.y][position.x];
      
      if (!targetCell.unit) return state;
      
      // Calculate damage
      const attacker = state.selectedUnit;
      const defender = targetCell.unit;
      
      // Simple damage calculation
      const damage = Math.max(5, attacker.attack - (defender.defense / 2));
      
      // Update defender's health
      const updatedDefender = {
        ...defender,
        health: Math.max(0, defender.health - damage),
      };
      
      // Create a new grid with the updated defender
      const newGrid = [...state.grid];
      
      // Check if defender is defeated
      if (updatedDefender.health <= 0) {
        newGrid[position.y][position.x].unit = null;
        toast.success(`Enemy unit destroyed!`);
      } else {
        newGrid[position.y][position.x].unit = updatedDefender;
        toast.info(`Dealt ${damage} damage to enemy unit`);
      }
      
      // Update attacker to mark it as having attacked
      const { x: attackerX, y: attackerY } = attacker.position;
      const updatedAttacker = {
        ...attacker,
        hasAttacked: true,
      };
      newGrid[attackerY][attackerX].unit = updatedAttacker;
      
      // Check for game over condition
      let winner = null;
      
      // Count units for each player
      let blueUnits = 0;
      let redUnits = 0;
      
      for (let y = 0; y < newGrid.length; y++) {
        for (let x = 0; x < newGrid[y].length; x++) {
          const unit = newGrid[y][x].unit;
          if (unit) {
            if (unit.player === 'blue') blueUnits++;
            else if (unit.player === 'red') redUnits++;
          }
        }
      }
      
      if (state.phase === 'battle' && (blueUnits === 0 || redUnits === 0)) {
        winner = blueUnits === 0 ? 'red' : 'blue';
      }
      
      return {
        ...state,
        grid: newGrid,
        selectedUnit: updatedAttacker,
        availableMoves: [],
        availableAttacks: [],
        winner,
        phase: winner ? 'gameOver' : state.phase,
      };
    }
    
    case 'cancel':
      return {
        ...state,
        selectedUnit: null,
        availableMoves: [],
        availableAttacks: [],
      };
    
    case 'endTurn': {
      // Reset all units' movement and attack status for the current player
      const newGrid = state.grid.map(row => {
        return row.map(cell => {
          if (cell.unit && cell.unit.player === state.currentPlayer) {
            return {
              ...cell,
              unit: {
                ...cell.unit,
                hasMoved: false,
                hasAttacked: false,
              }
            };
          }
          return cell;
        });
      });
      
      // Switch to the other player
      const nextPlayer = state.currentPlayer === 'blue' ? 'red' : 'blue';
      const newTurn = nextPlayer === 'blue' ? state.turn + 1 : state.turn;
      
      toast.info(`${nextPlayer === 'blue' ? 'Blue' : 'Red'} player's turn`);
      
      return {
        ...state,
        grid: newGrid,
        currentPlayer: nextPlayer,
        selectedUnit: null,
        availableMoves: [],
        availableAttacks: [],
        turn: newTurn,
      };
    }
    
    case 'deployUnit': {
      if (state.phase !== 'deployment') return state;
      
      const { unitType, position, player } = action.payload;
      const unitCost = UNIT_STATS[unitType].cost;
      
      // Check if player has enough credits
      const playerCredits = player === 'blue' ? state.blueCredits : state.redCredits;
      
      if (playerCredits < unitCost) {
        toast.error(`Not enough credits to deploy ${unitType}`);
        return state;
      }
      
      // Check if position is valid for deployment
      const { x, y } = position;
      
      // Blue can only deploy on left side, Red can only deploy on right side
      const isValidPosition = player === 'blue' 
        ? x < GRID_SIZE.width / 3 
        : x >= GRID_SIZE.width * 2 / 3;
      
      if (!isValidPosition) {
        toast.error(`Invalid deployment position for ${player} player`);
        return state;
      }
      
      // Check if the cell is empty
      if (state.grid[y][x].unit) {
        toast.error('This cell is already occupied');
        return state;
      }
      
      // Create a new unit
      const newUnit: Unit = {
        id: uuidv4(),
        type: unitType,
        player,
        position: { x, y },
        ...UNIT_STATS[unitType],
        maxHealth: UNIT_STATS[unitType].health,
        hasMoved: false,
        hasAttacked: false,
      };
      
      // Update the grid with the new unit
      const newGrid = [...state.grid];
      newGrid[y][x].unit = newUnit;
      
      // Update player credits
      const newBlueCredits = player === 'blue' 
        ? state.blueCredits - unitCost 
        : state.blueCredits;
      
      const newRedCredits = player === 'red' 
        ? state.redCredits - unitCost 
        : state.redCredits;
      
      toast.success(`Deployed ${unitType} for ${player} player`);
      
      return {
        ...state,
        grid: newGrid,
        blueCredits: newBlueCredits,
        redCredits: newRedCredits,
      };
    }
    
    case 'startBattle': {
      if (state.phase !== 'deployment') return state;
      
      toast.success('Deployment phase complete. Battle begins!');
      
      return {
        ...state,
        phase: 'battle',
        currentPlayer: 'blue',
        turn: 1,
      };
    }
    
    case 'resetGame':
      toast.info('Game reset');
      return {
        ...initialState,
        grid: initializeGrid(),
      };
    
    default:
      return state;
  }
};

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  deployUnit: (unitType: UnitType, position: Position, player: Player) => void;
  selectUnit: (position: Position) => void;
  moveUnit: (position: Position) => void;
  attackUnit: (position: Position) => void;
  cancelSelection: () => void;
  endTurn: () => void;
  startBattle: () => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const deployUnit = (unitType: UnitType, position: Position, player: Player) => {
    dispatch({ type: 'deployUnit', payload: { unitType, position, player } });
  };

  const selectUnit = (position: Position) => {
    dispatch({ type: 'select', payload: { position } });
  };

  const moveUnit = (position: Position) => {
    dispatch({ type: 'move', payload: { position } });
  };

  const attackUnit = (position: Position) => {
    dispatch({ type: 'attack', payload: { position } });
  };

  const cancelSelection = () => {
    dispatch({ type: 'cancel' });
  };

  const endTurn = () => {
    dispatch({ type: 'endTurn' });
  };

  const startBattle = () => {
    dispatch({ type: 'startBattle' });
  };

  const resetGame = () => {
    dispatch({ type: 'resetGame' });
  };

  return (
    <GameContext.Provider 
      value={{ 
        state, 
        dispatch,
        deployUnit,
        selectUnit,
        moveUnit,
        attackUnit,
        cancelSelection,
        endTurn,
        startBattle,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
