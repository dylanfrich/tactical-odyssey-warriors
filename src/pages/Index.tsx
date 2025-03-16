
import React from 'react';
import { GameProvider } from '@/contexts/GameContext';
import GameGrid from '@/components/GameGrid';
import ActionPanel from '@/components/ActionPanel';
import DeploymentPanel from '@/components/DeploymentPanel';
import GameInfo from '@/components/GameInfo';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Tactical Odyssey</h1>
            </div>
            <Button variant="outline">How to Play</Button>
          </div>
        </header>
        
        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg shadow-lg overflow-hidden p-4 h-[600px] flex items-center justify-center">
                <div className="w-full h-full max-w-3xl mx-auto">
                  <GameGrid />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <ActionPanel />
              <DeploymentPanel />
              <GameInfo />
            </div>
          </div>
        </main>
        
        <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          <div className="container mx-auto">
            Tactical Odyssey - A Turn-Based Strategy Game
          </div>
        </footer>
      </div>
    </GameProvider>
  );
};

export default Index;
