
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Position } from '@/types/game';
import { cn } from '@/lib/utils';
import UnitDisplay from './UnitDisplay';

const GameGrid: React.FC = () => {
  const { state, selectUnit, moveUnit, attackUnit } = useGame();
  const { grid, selectedUnit, availableMoves, availableAttacks, currentPlayer, phase } = state;
  
  const handleCellClick = (position: Position) => {
    // If game is over or in deployment phase, do nothing
    if (phase === 'gameOver' || phase === 'deployment') return;
    
    const cell = grid[position.y][position.x];
    
    // If a unit is selected, check if this is a move or attack action
    if (selectedUnit) {
      // Check if clicked on a valid move position
      const isValidMove = availableMoves.some(
        pos => pos.x === position.x && pos.y === position.y
      );
      
      // Check if clicked on a valid attack position
      const isValidAttack = availableAttacks.some(
        pos => pos.x === position.x && pos.y === position.y
      );
      
      if (isValidMove) {
        moveUnit(position);
        return;
      }
      
      if (isValidAttack) {
        attackUnit(position);
        return;
      }
      
      // If it's the same unit that's already selected, do nothing
      if (cell.unit && cell.unit.id === selectedUnit.id) {
        return;
      }
      
      // If it's another unit of the current player, select it
      if (cell.unit && cell.unit.player === currentPlayer) {
        selectUnit(position);
        return;
      }
    } else if (cell.unit && cell.unit.player === currentPlayer) {
      // If no unit is selected and clicked on current player's unit, select it
      selectUnit(position);
    }
  };
  
  const getCellClassNames = (position: Position) => {
    const { x, y } = position;
    const cell = grid[y][x];
    
    // Base styles for different terrain types
    const terrainClasses = {
      grass: 'bg-terrain-grass text-terrain-grass',
      water: 'bg-terrain-water text-terrain-water',
      mountain: 'bg-terrain-mountain text-terrain-mountain',
      road: 'bg-terrain-road text-terrain-road',
    };
    
    // Check if this cell is a valid move or attack
    const isSelectedUnit = selectedUnit && 
      selectedUnit.position.x === x && 
      selectedUnit.position.y === y;
    
    const isValidMove = availableMoves.some(
      pos => pos.x === x && pos.y === y
    );
    
    const isValidAttack = availableAttacks.some(
      pos => pos.x === x && pos.y === y
    );
    
    return cn(
      'hex-cell',
      terrainClasses[cell.terrain],
      isSelectedUnit && 'ring-2 ring-white ring-opacity-75',
      isValidMove && 'bg-action-move/70 animate-pulse-highlight',
      isValidAttack && 'bg-action-attack/70 animate-pulse-highlight',
    );
  };
  
  return (
    <div 
      className="hex-grid" 
      style={{ '--columns': grid[0].length } as React.CSSProperties}
    >
      {grid.map((row, y) => 
        row.map((cell, x) => (
          <div 
            key={`${x}-${y}`}
            className={getCellClassNames({ x, y })}
            onClick={() => handleCellClick({ x, y })}
          >
            <div className="hex-content">
              {cell.unit && <UnitDisplay unit={cell.unit} />}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GameGrid;
