
export type Player = 'blue' | 'red';

export type UnitType = 'infantry' | 'tank' | 'helicopter';

export type Terrain = 'grass' | 'water' | 'mountain' | 'road';

export type Position = {
  x: number;
  y: number;
};

export type Unit = {
  id: string;
  type: UnitType;
  player: Player;
  position: Position;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  moveRange: number;
  attackRange: number;
  cost: number;
  hasMoved: boolean;
  hasAttacked: boolean;
};

export type Cell = {
  position: Position;
  terrain: Terrain;
  unit: Unit | null;
};

export type GameState = {
  grid: Cell[][];
  currentPlayer: Player;
  phase: 'deployment' | 'battle' | 'gameOver';
  winner: Player | null;
  blueCredits: number;
  redCredits: number;
  selectedUnit: Unit | null;
  availableMoves: Position[];
  availableAttacks: Position[];
  turn: number;
};

export type ActionType = 'select' | 'move' | 'attack' | 'cancel' | 'endTurn';

export type GameAction = {
  type: ActionType;
  payload?: any;
};

export const UNIT_STATS = {
  infantry: {
    health: 100,
    attack: 30,
    defense: 20,
    moveRange: 3,
    attackRange: 1,
    cost: 100,
  },
  tank: {
    health: 200,
    attack: 60,
    defense: 50,
    moveRange: 5,
    attackRange: 2,
    cost: 300,
  },
  helicopter: {
    health: 150,
    attack: 70,
    defense: 30,
    moveRange: 7,
    attackRange: 3,
    cost: 400,
  },
};

export const TERRAIN_COSTS = {
  grass: 1,
  road: 0.5,
  water: 3,
  mountain: 2,
};

export const STARTING_CREDITS = 1000;
export const GRID_SIZE = { width: 10, height: 8 };
