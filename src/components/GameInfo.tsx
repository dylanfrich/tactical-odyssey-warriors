
import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Truck, 
  Plane, 
  Heart,
  Shield,
  Target,
  MoveRight
} from 'lucide-react';
import { UnitType, UNIT_STATS } from '@/types/game';

const UnitStatsRow: React.FC<{ type: UnitType }> = ({ type }) => {
  const stats = UNIT_STATS[type];
  
  const getUnitIcon = () => {
    switch (type) {
      case 'infantry':
        return <User className="h-5 w-5" />;
      case 'tank':
        return <Truck className="h-5 w-5" />;
      case 'helicopter':
        return <Plane className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className="mr-2 p-1 bg-muted rounded-full">{getUnitIcon()}</div>
        <span className="font-medium capitalize">{type}</span>
      </div>
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center" title="Health">
          <Heart className="h-4 w-4 mr-1 text-red-500" />
          <span>{stats.health}</span>
        </div>
        <div className="flex items-center" title="Attack">
          <Target className="h-4 w-4 mr-1 text-action-attack" />
          <span>{stats.attack}</span>
        </div>
        <div className="flex items-center" title="Defense">
          <Shield className="h-4 w-4 mr-1 text-blue-500" />
          <span>{stats.defense}</span>
        </div>
        <div className="flex items-center" title="Move Range">
          <MoveRight className="h-4 w-4 mr-1 text-action-move" />
          <span>{stats.moveRange}</span>
        </div>
      </div>
    </div>
  );
};

const GameInfo: React.FC = () => {
  const { state } = useGame();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Information</CardTitle>
      </CardHeader>
      <CardContent>
        <UnitStatsRow type="infantry" />
        <Separator className="my-2" />
        <UnitStatsRow type="tank" />
        <Separator className="my-2" />
        <UnitStatsRow type="helicopter" />
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="mb-2">Game Rules:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Deploy units on your side of the map</li>
            <li>Take turns to move and attack with your units</li>
            <li>Units can move OR attack each turn</li>
            <li>Win by eliminating all enemy units</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameInfo;
