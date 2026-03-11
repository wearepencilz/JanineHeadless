'use client';

import { useState, useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { createGameConfig, getGameContainerStyles } from '@/lib/game/phaser-config';
import MobileControls from '@/components/game/MobileControls';

export default function GameTestPage() {
  const [phaserLoaded, setPhaserLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile control handlers
  const handleMobileMove = (direction: 'left' | 'right' | 'stop') => {
    if (!gameInstanceRef.current) return;
    const scene = gameInstanceRef.current.scene.getScene('GameScene') as any;
    if (scene && scene.setMobileInput) {
      scene.setMobileInput({ move: direction });
    }
  };

  const handleMobileJump = () => {
    if (!gameInstanceRef.current) return;
    const scene = gameInstanceRef.current.scene.getScene('GameScene') as any;
    if (scene && scene.setMobileInput) {
      scene.setMobileInput({ jump: true });
      setTimeout(() => {
        if (scene && scene.setMobileInput) {
          scene.setMobileInput({ jump: false });
        }
      }, 100);
    }
  };

  const handleCloseGame = () => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }
    window.location.href = '/';
  };

  // Load Phaser dynamically
  useEffect(() => {
    import('phaser').then(() => {
      setPhaserLoaded(true);
    });
  }, []);

  // Initialize game
  useEffect(() => {
    if (!phaserLoaded || !gameContainerRef.current || gameInstanceRef.current) return;

    const initGame = async () => {
      const PhaserModule = await import('phaser');
      const Phaser = PhaserModule.default || PhaserModule;
      const { GameScene } = await import('@/lib/game/scenes/GameScene');

      const config = createGameConfig(gameContainerRef.current!, [GameScene]);
      const game = new Phaser.Game(config);
      gameInstanceRef.current = game;

      game.events.once('ready', () => {
        const scene = game.scene.getScene('GameScene') as any;
        
        // Real campaign configuration from CURRENT_GAME_LAYOUT.json
        const realLevelConfig = {
          platforms: [
            { x: 0, y: 358, width: 635, height: 16 },
            { x: 844, y: 399, width: 119, height: 16 },
            { x: 958, y: 311, width: 259, height: 16 },
            { x: 40, y: 190, width: 176, height: 16 },
            { x: 466, y: 205, width: 128, height: 16 },
            { x: 823, y: 158, width: 200, height: 16 },
          ],
          ingredients: [
            { x: 128, y: 125, type: 'vanilla' },
            { x: 518, y: 141, type: 'chocolate' },
            { x: 884, y: 342, type: 'strawberry' },
          ],
          iceCreams: [
            { x: 915, y: 93 }
          ],
          hazards: [],
          spawnPoint: { x: 48, y: 286 },
        };

        const sceneData = {
          campaignId: '79af08d0-8d8d-4f9c-a46d-77e2a47ce3ca',
          sessionId: 'test-session-' + Date.now(),
          timerDuration: 60,
          levelConfig: realLevelConfig,
          assets: {},
        };

        scene.scene.restart(sceneData);
      });
    };

    initGame();

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [phaserLoaded]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-start p-5" style={{ backgroundColor: '#DDD9D5' }}>
      {/* Screen with border - 4:5 aspect ratio, max-width 400px */}
      <div className="w-full" style={{ maxWidth: '400px' }}>
        <div style={{ 
          aspectRatio: '4 / 5',
          backgroundColor: '#6B696E',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Game screen */}
          <div
            ref={gameContainerRef}
            className="w-full overflow-hidden select-none"
            style={{ 
              backgroundColor: '#9FB666',
              borderRadius: '4px',
              aspectRatio: '400 / 500',
              touchAction: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          />
        </div>
        
        {/* Quit button - 24px below screen, centered, desktop only */}
        {!isMobile && (
          <div className="flex justify-center" style={{ marginTop: '24px' }}>
            <button
              onClick={handleCloseGame}
              className="active:opacity-80 transition-opacity"
              aria-label="Quit Game"
            >
              <img 
                src="/controller/quit.png" 
                alt="Quit" 
                width={48} 
                height={48}
                className="w-12 h-12"
                style={{ 
                  pointerEvents: 'auto',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <MobileControls
          onMove={handleMobileMove}
          onJump={handleMobileJump}
          onClose={handleCloseGame}
        />
      )}
    </div>
  );
}
