
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { 
  Player, 
  UnitType, 
  UNIT_STATS,
  Position
} from '@/types/game';
import { User, Truck, Plane } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface UnitOptionProps {
  type: UnitType;
  player: Player;
  cost: number;
  selectedUnit: UnitType | null;
  onSelect: (type: UnitType) => void;
}

const UnitOption: React.FC<UnitOptionProps> = ({ type, player, cost, selectedUnit, onSelect }) => {
  const isSelected = selectedUnit === type;
  
  const getUnitIcon = () => {
    switch (type) {
      case 'infantry':
        return <User className="h-6 w-6" />;
      case 'tank':
        return <Truck className="h-6 w-6" />;
      case 'helicopter':
        return <Plane className="h-6 w-6" />;
    }
  };
  
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      className={`flex items-center justify-between w-full ${
        player === 'blue' ? 'hover:bg-team-blue/20' : 'hover:bg-team-red/20'
      } ${
        isSelected && player === 'blue' ? 'bg-team-blue text-white' : ''
      } ${
        isSelected && player === 'red' ? 'bg-team-red text-white' : ''
      }`}
      onClick={() => onSelect(type)}
    >
      <div className="flex items-center">
        <div className="mr-2">{getUnitIcon()}</div>
        <span className="capitalize">{type}</span>
      </div>
      <span>{cost}</span>
    </Button>
  );
};

const DeploymentPanel: React.FC = () => {
  const { state, deployUnit } = useGame();
  const { phase, blueCredits, redCredits, currentPlayer } = state;
  const [selectedUnit, setSelectedUnit] = React.useState<UnitType | null>(null);
  const [deploymentMode, setDeploymentMode] = React.useState<boolean>(false);
  
  // Listen for deploymentComplete events from GameGrid
  React.useEffect(() => {
    const handleDeploymentComplete = () => {
      setSelectedUnit(null);
      setDeploymentMode(false);
    };
    
    window.addEventListener('deploymentComplete', handleDeploymentComplete);
    return () => {
      window.removeEventListener('deploymentComplete', handleDeploymentComplete);
    };
  }, []);
  
  const handleUnitSelect = (type: UnitType) => {
    setSelectedUnit(type);
    setDeploymentMode(true);
    
    // Emit event to notify GameGrid about deployment mode
    window.dispatchEvent(
      new CustomEvent('deploymentModeChange', { 
        detail: { active: true, unitType: type }
      })
    );
    
    toast.info(`Select a position to deploy ${type}`);
  };
  
  const handleCancelDeployment = () => {
    setSelectedUnit(null);
    setDeploymentMode(false);
    
    // Emit event to notify GameGrid about deployment mode cancellation
    window.dispatchEvent(
      new CustomEvent('deploymentModeChange', { 
        detail: { active: false, unitType: null }
      })
    );
  };
  
  // If not in deployment phase, don't show this panel
  if (phase !== 'deployment') {
    return null;
  }
  
  const playerCredits = currentPlayer === 'blue' ? blueCredits : redCredits;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={currentPlayer === 'blue' ? 'text-team-blue' : 'text-team-red'}>
          {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} Deployment
        </CardTitle>
        <CardDescription>
          Credits: {playerCredits}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <UnitOption
          type="infantry"
          player={currentPlayer}
          cost={UNIT_STATS.infantry.cost}
          selectedUnit={selectedUnit}
          onSelect={handleUnitSelect}
        />
        <UnitOption
          type="tank"
          player={currentPlayer}
          cost={UNIT_STATS.tank.cost}
          selectedUnit={selectedUnit}
          onSelect={handleUnitSelect}
        />
        <UnitOption
          type="helicopter"
          player={currentPlayer}
          cost={UNIT_STATS.helicopter.cost}
          selectedUnit={selectedUnit}
          onSelect={handleUnitSelect}
        />
        
        {deploymentMode && (
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancelDeployment}
            >
              Cancel Deployment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeploymentPanel;
