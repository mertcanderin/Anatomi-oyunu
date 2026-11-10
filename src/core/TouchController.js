import * as THREE from 'three';

/**
 * Mobil/Tablet Dokunmatik (Pointer Events) Sürükle-Bırak, Hedefe Yapışma (Snap-to-Target)
 * ve Boş Alan Sürükleme ile 3D Model Döndürme Kontrolcüsü
 */
export class TouchController {
  /**
   * @param {import('./Engine.js').Engine} engine
   * @param {Object} callbacks
   * @param {(partConfig: Object) => void} [callbacks.onPartPickup]
   * @param {(partConfig: Object, lockedCount: number, totalCount: number) => void} [callbacks.onPartSnapped]
   * @param {(partConfig: Object) => void} [callbacks.onPartReturned]
   * @param {() => void} [callbacks.onModuleCompleted]
   */
  constructor(engine, callbacks = {}) {
    this.engine = engine;
    this.callbacks = callbacks;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.planeIntersect = new THREE.Vector3();
    this.dragOffset = new THREE.Vector3();

    /** @type {THREE.Object3D | null} */
    this.activePart = null;
    this.activePointerId = null;
    this.snapThreshold = 0.85;

    // Boş alanı sürükleyerek modeli 3D döndürme durumu
    this.isOrbiting = false;
    this.lastOrbitX = 0;
    this.lastOrbitY = 0;

    this.domElement = this.engine.renderer.domElement;
    this.bindEvents();
  }

  setSnapThreshold(threshold) {
    this.snapThreshold = threshold || 0.85;
  }

  bindEvents() {
    this.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));
  }

  updatePointerCoords(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onPointerDown(event) {
    if (this.activePart !== null || this.isOrbiting) return;

    this.updatePointerCoords(event);
    this.raycaster.setFromCamera(this.pointer, this.engine.camera);

    const unlockedVisuals = this.engine.draggableParts
      .filter((part) => !part.userData.isLocked)
      .map((part) => part.userData.visualMesh);

    const intersects = this.raycaster.intersectObjects(unlockedVisuals, true);
    if (intersects.length === 0) {
      // Yerleşmiş bir organa tıklandıysa alt barda bilgisini göster ve aynı zamanda döndürmeye izin ver
      const lockedVisuals = this.engine.draggableParts
        .filter((part) => part.userData.isLocked)
        .map((part) => part.userData.visualMesh);
      const lockedHit = this.raycaster.intersectObjects(lockedVisuals, true);
      if (lockedHit.length > 0 && lockedHit[0].object.userData.partRoot) {
        const lockedRoot = lockedHit[0].object.userData.partRoot;
        lockedRoot.userData.snapAnimProgress = 0;
        if (this.callbacks.onPartPickup) {
          this.callbacks.onPartPickup(lockedRoot.userData.partConfig);
        }
      }

      // 3D döndürme modunu başlat
      this.isOrbiting = true;
      this.activePointerId = event.pointerId;
      this.lastOrbitX = event.clientX;
      this.lastOrbitY = event.clientY;
      return;
    }

    const hitObject = intersects[0].object;
    const partRoot = hitObject.userData.partRoot;
    if (!partRoot || partRoot.userData.isLocked) return;

    // Parça tutulduğunda ortadaki gövdeyi düz karşıya hizala
    this.engine.resetCenterRotation();

    this.activePart = partRoot;
    this.activePointerId = event.pointerId;
    partRoot.userData.isDragging = true;

    this.dragPlane.constant = -partRoot.userData.targetPos.z;
    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
      this.dragOffset.subVectors(partRoot.position, this.planeIntersect);
    } else {
      this.dragOffset.set(0, 0, 0);
    }

    partRoot.scale.setScalar(1.15);
    partRoot.position.z = 0.75;

    if (this.callbacks.onPartPickup) {
      this.callbacks.onPartPickup(partRoot.userData.partConfig);
    }
  }

  onPointerMove(event) {
    if (event.pointerId !== this.activePointerId) return;

    if (this.isOrbiting) {
      const dx = event.clientX - this.lastOrbitX;
      const dy = event.clientY - this.lastOrbitY;
      this.lastOrbitX = event.clientX;
      this.lastOrbitY = event.clientY;
      this.engine.rotateCenterAssembly(dx, dy);
      return;
    }

    if (!this.activePart) return;

    this.updatePointerCoords(event);
    this.raycaster.setFromCamera(this.pointer, this.engine.camera);

    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
      this.activePart.position.x = this.planeIntersect.x + this.dragOffset.x;
      this.activePart.position.y = this.planeIntersect.y + this.dragOffset.y;
      this.activePart.position.z = 0.75;

      const targetPos = this.activePart.userData.targetPos;
      const dist2D = Math.hypot(
        this.activePart.position.x - targetPos.x,
        this.activePart.position.y - targetPos.y
      );

      if (dist2D < this.snapThreshold) {
        this.snapActivePart();
      }
    }
  }

  onPointerUp(event) {
    if (event.pointerId !== this.activePointerId) return;

    if (this.isOrbiting) {
      this.isOrbiting = false;
      this.activePointerId = null;
      return;
    }

    if (!this.activePart) return;

    const targetPos = this.activePart.userData.targetPos;
    const dist2D = Math.hypot(
      this.activePart.position.x - targetPos.x,
      this.activePart.position.y - targetPos.y
    );

    if (dist2D < this.snapThreshold) {
      this.snapActivePart();
    } else {
      const releasedPart = this.activePart;
      releasedPart.userData.isDragging = false;
      this.activePart = null;
      this.activePointerId = null;

      if (this.callbacks.onPartReturned) {
        this.callbacks.onPartReturned(releasedPart.userData.partConfig);
      }
    }
  }

  snapActivePart() {
    if (!this.activePart) return;

    const part = this.activePart;
    const data = part.userData;

    data.isDragging = false;
    data.isLocked = true;
    data.snapAnimProgress = 0;

    if (data.ghostMesh) {
      data.ghostMesh.visible = false;
    }

    this.engine.onPartLocked(part);

    this.activePart = null;
    this.activePointerId = null;

    const totalCount = this.engine.draggableParts.length;
    const lockedCount = this.engine.draggableParts.filter(
      (p) => p.userData.isLocked
    ).length;

    if (this.callbacks.onPartSnapped) {
      this.callbacks.onPartSnapped(data.partConfig, lockedCount, totalCount);
    }

    if (lockedCount === totalCount && this.callbacks.onModuleCompleted) {
      this.callbacks.onModuleCompleted();
    }
  }
}
