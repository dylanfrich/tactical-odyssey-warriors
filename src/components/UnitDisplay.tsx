
import React from 'react';
import { Unit } from '@/types/game';
import { Shield, Truck, Plane, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnitDisplayProps {
  unit: Unit;
  showDetails?: boolean;
}

const UnitDisplay: React.FC<UnitDisplayProps> = ({ unit, showDetails = false }) => {
  const getUnitIcon = () => {
    switch (unit.type) {
      case 'infantry':
        return <User className="h-5 w-5" />;
      case 'tank':
        return <Truck className="h-5 w-5" />;
      case 'helicopter':
        return <Plane className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  const healthPercentage = (unit.health / unit.maxHealth) * 100;
  const healthColorClass = 
    healthPercentage > 70 ? 'bg-green-500' :
    healthPercentage > 30 ? 'bg-yellow-500' :
    'bg-red-500';
  
  return (
    <div className={cn(
      'relative w-full h-full flex items-center justify-center',
      unit.hasMoved && unit.hasAttacked ? 'opacity-50' : 'opacity-100'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        unit.player === 'blue' ? 'bg-team-blue' : 'bg-team-red',
        unit.hasMoved && 'ring-1 ring-action-move ring-opacity-75',
        unit.hasAttacked && 'ring-1 ring-action-attack ring-opacity-75',
      )}>
        {getUnitIcon()}
      </div>
      
      {/* Health bar */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded">
        <div 
          className={cn("h-full rounded", healthColorClass)}
          style={{ width: `${healthPercentage}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-background/90 p-2 rounded shadow-md text-xs z-10">
          <div className="font-bold">{unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}</div>
          <div className="flex items-center gap-1">
            <span>❤️ {unit.health}/{unit.maxHealth}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🗡️ {unit.attack}</span>
            <span><Shield className="h-3 w-3" /> {unit.defense}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏃 {unit.moveRange}</span>
            <span>🎯 {unit.attackRange}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitDisplay;
