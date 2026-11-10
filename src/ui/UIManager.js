/**
 * Arayüz, Menü Kartları, Bildirim (Toast) ve Konfeti Efekti Yöneticisi
 */
export class UIManager {
  /**
   * @param {Object} callbacks
   * @param {(moduleData: Object) => void} callbacks.onSelectModule
   * @param {() => void} callbacks.onBackToMenu
   * @param {() => void} callbacks.onResetModule
   * @param {() => void} [callbacks.onRequestHint]
   * @param {() => boolean} [callbacks.onToggleSound]
   */
  constructor(callbacks) {
    this.callbacks = callbacks;

    this.mainMenuEl = document.getElementById('main-menu');
    this.moduleCardsEl = document.getElementById('module-cards');
    this.hudEl = document.getElementById('game-hud');
    this.hudTitleEl = document.getElementById('hud-module-title');
    this.hudProgressEl = document.getElementById('hud-progress');

    this.toastEl = document.getElementById('part-toast');
    this.toastIconEl = document.getElementById('part-toast-icon');
    this.toastNameEl = document.getElementById('part-toast-name');
    this.toastDescEl = document.getElementById('part-toast-desc');

    this.celebrationModalEl = document.getElementById('celebration-modal');
    this.celebrationTitleEl = document.getElementById('celebration-title');
    this.celebrationMessageEl = document.getElementById('celebration-message');

    this.confettiCanvas = document.getElementById('confetti-canvas');
    this.confettiCtx = this.confettiCanvas.getContext('2d');
    this.confettiParticles = [];
    this.confettiAnimId = null;

    this.toastTimer = null;

    this.bindButtons();
    this.resizeConfetti();
    window.addEventListener('resize', () => this.resizeConfetti());
  }

  bindButtons() {
    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this.stopConfetti();
      this.callbacks.onBackToMenu();
    });

    document.getElementById('btn-reset-module').addEventListener('click', () => {
      this.stopConfetti();
      this.hideCelebration();
      this.callbacks.onResetModule();
    });

    const hintBtn = document.getElementById('btn-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => {
        if (this.callbacks.onRequestHint) {
          this.callbacks.onRequestHint();
        }
      });
    }

    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (this.callbacks.onToggleSound) {
          const isEnabled = this.callbacks.onToggleSound();
          soundBtn.textContent = isEnabled ? '🔊' : '🔇';
        }
      });
    }

    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.stopConfetti();
      this.hideCelebration();
      this.callbacks.onResetModule();
    });

    document.getElementById('btn-celebration-menu').addEventListener('click', () => {
      this.stopConfetti();
      this.hideCelebration();
      this.callbacks.onBackToMenu();
    });
  }

  /**
   * modulesData.js içindeki modülleri ana menüde kart olarak oluşturur.
   * @param {Array} modulesList
   */
  renderModuleCards(modulesList) {
    this.moduleCardsEl.innerHTML = '';

    modulesList.forEach((mod) => {
      const card = document.createElement('div');
      card.className = 'module-card';
      card.style.borderColor = mod.themeColor || '#3b82f6';

      card.innerHTML = `
        <div class="module-card-icon">${mod.icon || '🧩'}</div>
        <h3 class="module-card-title">${mod.title}</h3>
        <p class="module-card-desc">${mod.description}</p>
        <div class="module-card-badge" style="background: ${mod.themeColor || '#3b82f6'}">
          ▶ Hemen Oyna (${mod.parts.length} Parça)
        </div>
      `;

      card.addEventListener('click', () => {
        this.callbacks.onSelectModule(mod);
      });

      this.moduleCardsEl.appendChild(card);
    });
  }

  showMainMenu() {
    this.mainMenuEl.classList.remove('hidden');
    this.hudEl.classList.add('hidden');
    this.hideCelebration();
    this.hideToast();
  }

  showGameHUD(moduleData) {
    this.mainMenuEl.classList.add('hidden');
    this.hudEl.classList.remove('hidden');
    this.hudTitleEl.textContent = `${moduleData.icon} ${moduleData.title}`;
    this.updateProgress(0, moduleData.parts.length);
    this.hideToast();
  }

  updateProgress(lockedCount, totalCount) {
    this.hudProgressEl.textContent = `${lockedCount} / ${totalCount}`;
  }

  /**
   * Parça tutulduğunda veya yerine oturduğunda ekranın ortasında bilgi kartı gösterir.
   */
  showPartToast(partConfig, isSnapped = false) {
    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastIconEl.textContent = partConfig.icon || '✨';
    this.toastNameEl.textContent = isSnapped
      ? `✅ ${partConfig.name} Yerleşti!`
      : `${partConfig.name}`;
    this.toastDescEl.textContent = partConfig.description || '';

    this.toastEl.style.borderColor = isSnapped ? '#22c55e' : '#3b82f6';
    this.toastEl.classList.remove('hidden');

    this.toastTimer = setTimeout(() => {
      this.hideToast();
    }, isSnapped ? 3200 : 2000);
  }

  hideToast() {
    this.toastEl.classList.add('hidden');
  }

  showCelebration(moduleData) {
    this.celebrationTitleEl.textContent = 'Harika İş Çıkardın! 🎉';
    this.celebrationMessageEl.textContent = `"${moduleData.title}" bölümündeki tüm parçaları başarıyla tamamladın!`;
    this.celebrationModalEl.classList.remove('hidden');
    this.launchConfetti();
  }

  hideCelebration() {
    this.celebrationModalEl.classList.add('hidden');
  }

  resizeConfetti() {
    this.confettiCanvas.width = window.innerWidth;
    this.confettiCanvas.height = window.innerHeight;
  }

  launchConfetti() {
    this.stopConfetti();
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
    const count = 110;

    this.confettiParticles = Array.from({ length: count }, () => ({
      x: Math.random() * this.confettiCanvas.width,
      y: -20 - Math.random() * this.confettiCanvas.height * 0.5,
      size: 8 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2.5 + Math.random() * 4.5,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15
    }));

    const renderConfetti = () => {
      this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

      let activeCount = 0;
      for (const p of this.confettiParticles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < this.confettiCanvas.height + 30) {
          activeCount++;
        }

        this.confettiCtx.save();
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate(p.rotation);
        this.confettiCtx.fillStyle = p.color;
        this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        this.confettiCtx.restore();
      }

      if (activeCount > 0) {
        this.confettiAnimId = requestAnimationFrame(renderConfetti);
      }
    };

    renderConfetti();
  }

  stopConfetti() {
    if (this.confettiAnimId) {
      cancelAnimationFrame(this.confettiAnimId);
      this.confettiAnimId = null;
    }
    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
  }
}
