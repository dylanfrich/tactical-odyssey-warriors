
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { UnitType } from '@/types/game';
import UnitDisplay from './UnitDisplay';
import { 
  SquareX, 
  MoveRight, 
  Swords, 
  Flag,
  RotateCcw
} from 'lucide-react';

const ActionPanel: React.FC = () => {
  const { state, cancelSelection, endTurn, startBattle, resetGame } = useGame();
  const { 
    phase, 
    currentPlayer, 
    selectedUnit, 
    availableMoves, 
    availableAttacks,
    turn,
    winner
  } = state;
  
  if (phase === 'gameOver') {
    return (
      <div className="bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Game Over</h2>
        <p className="text-lg mb-4">
          {winner === 'blue' ? 'Blue' : 'Red'} player wins!
        </p>
        <Button onClick={resetGame} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Game
        </Button>
      </div>
    );
  }
  
  if (phase === 'deployment') {
    return (
      <div className="bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Deployment Phase</h2>
        <p className="mb-4">
          Deploy your units on your side of the map.
          <br />
          Blue: Left side | Red: Right side
        </p>
        <Button onClick={startBattle} className="w-full">
          <Flag className="mr-2 h-4 w-4" />
          Start Battle
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${currentPlayer === 'blue' ? 'text-team-blue' : 'text-team-red'}`}>
          {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn
        </h2>
        <span className="text-sm text-muted-foreground">Turn {turn}</span>
      </div>
      
      {selectedUnit ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <UnitDisplay unit={selectedUnit} showDetails={true} />
            </div>
            <div>
              <h3 className="font-medium">
                {selectedUnit.type.charAt(0).toUpperCase() + selectedUnit.type.slice(1)}
              </h3>
              <div className="text-sm text-muted-foreground">
                Position: ({selectedUnit.position.x}, {selectedUnit.position.y})
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              disabled={availableMoves.length === 0}
              className={availableMoves.length > 0 ? 'bg-action-move/20' : ''}
            >
              <MoveRight className="mr-2 h-4 w-4" />
              Move ({availableMoves.length})
            </Button>
            
            <Button 
              variant="outline" 
              disabled={availableAttacks.length === 0}
              className={availableAttacks.length > 0 ? 'bg-action-attack/20' : ''}
            >
              <Swords className="mr-2 h-4 w-4" />
              Attack ({availableAttacks.length})
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={cancelSelection} 
            className="w-full"
          >
            <SquareX className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Select a unit to view actions
        </div>
      )}
      
      <Button onClick={endTurn} className="w-full mt-4">
        End Turn
      </Button>
    </div>
  );
};

export default ActionPanel;
