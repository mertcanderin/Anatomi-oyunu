import { MODULES_DATA } from './config/modulesData.js';
import { Engine } from './core/Engine.js';
import { TouchController } from './core/TouchController.js';
import { AudioManager } from './core/AudioManager.js';
import { UIManager } from './ui/UIManager.js';

class GameApp {
  constructor() {
    this.currentModule = null;
    this.audio = new AudioManager();

    const canvasContainer = document.getElementById('canvas-container');
    this.engine = new Engine(canvasContainer);

    this.ui = new UIManager({
      onSelectModule: (mod) => this.startModule(mod),
      onBackToMenu: () => this.returnToMenu(),
      onResetModule: () => {
        if (this.currentModule) {
          this.startModule(this.currentModule);
        }
      },
      onRequestHint: () => {
        const hintPart = this.engine.triggerHint();
        if (hintPart) {
          this.audio.playPickup();
          this.audio.speak(hintPart.name);
          this.ui.showPartToast(hintPart, false);
        }
      },
      onToggleSound: () => {
        this.audio.enabled = !this.audio.enabled;
        return this.audio.enabled;
      }
    });

    this.touchController = new TouchController(this.engine, {
      onPartPickup: (partConfig) => {
        this.audio.playPickup();
        this.ui.showPartToast(partConfig, false);
      },
      onPartSnapped: (partConfig, lockedCount, totalCount) => {
        this.audio.playSnapSuccess();
        this.audio.speak(partConfig.name);
        this.ui.updateProgress(lockedCount, totalCount);
        this.ui.showPartToast(partConfig, true);
      },
      onPartReturned: () => {
        this.audio.playReturn();
      },
      onModuleCompleted: () => {
        setTimeout(() => {
          this.audio.playCelebration();
          this.audio.speak('Harika iş çıkardın! Tüm parçaları yerleştirdin.');
          if (this.currentModule) {
            this.ui.showCelebration(this.currentModule);
          }
        }, 450);
      }
    });

    this.init();
  }

  init() {
    this.ui.renderModuleCards(MODULES_DATA);
    this.engine.startRenderLoop();
    this.registerServiceWorker();
  }

  async startModule(moduleData) {
    this.audio.unlock();
    this.currentModule = moduleData;
    this.touchController.setSnapThreshold(moduleData.snapThreshold);
    this.ui.showGameHUD(moduleData);
    await this.engine.loadModule(moduleData);
  }

  returnToMenu() {
    this.currentModule = null;
    this.engine.clearModule();
    this.ui.showMainMenu();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('Service Worker kaydı başarısız:', err);
        });
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
