import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ModelFactory } from './ModelFactory.js';

/**
 * Three.js 3D Sahne, Kamera, Işıklandırma ve Model/Geometri Yöneticisi
 */
export class Engine {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.baseCameraPos = new THREE.Vector3(0, 0.4, 9.8);
    this.camera.position.copy(this.baseCameraPos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    this.gltfLoader = new GLTFLoader();

    // Tüm modül elemanlarını tutan ana grup
    this.moduleGroup = new THREE.Group();
    this.scene.add(this.moduleGroup);

    // Ortadaki kılavuz gövde ve yerleşmiş parçaların birlikte 3D döndürülebilmesi için pivot
    this.centerAssemblyGroup = new THREE.Group();
    this.moduleGroup.add(this.centerAssemblyGroup);

    this.targetRotationY = 0;
    this.targetRotationX = 0;

    /** @type {THREE.Object3D[]} */
    this.draggableParts = [];
    /** @type {Array} */
    this.burstParticles = [];
    this.hintRing = null;
    this.hintTargetPart = null;
    this.hintExpireTime = 0;

    this.clock = new THREE.Clock();

    this.setupLights();
    this.createHintRing();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.75);
    hemiLight.position.set(0, 10, 0);
    this.scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.35);
    mainLight.position.set(5, 8, 8);
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
    rimLight.position.set(-6, -3, 6);
    this.scene.add(rimLight);
  }

  createHintRing() {
    const geom = new THREE.RingGeometry(0.48, 0.62, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });
    this.hintRing = new THREE.Mesh(geom, mat);
    this.hintRing.visible = false;
    this.scene.add(this.hintRing);
  }

  /**
   * Ekran boyutuna ve en-boy oranına göre kamerayı adapte eder.
   */
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;

    const targetHorizontalHalfSpan = 5.75;
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const requiredZ = targetHorizontalHalfSpan / (Math.tan(fovRad / 2) * aspect);

    this.camera.position.z = Math.max(this.baseCameraPos.z, requiredZ);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Boş alan sürüklendiğinde ortadaki kılavuz modeli döndürür.
   */
  rotateCenterAssembly(deltaX, deltaY) {
    this.targetRotationY = THREE.MathUtils.clamp(
      this.targetRotationY + deltaX * 0.007,
      -0.65,
      0.65
    );
    this.targetRotationX = THREE.MathUtils.clamp(
      this.targetRotationX + deltaY * 0.004,
      -0.25,
      0.25
    );
  }

  resetCenterRotation() {
    this.targetRotationY = 0;
    this.targetRotationX = 0;
  }

  /**
   * Mevcut modül sahnesini temizler.
   */
  clearModule() {
    this.draggableParts = [];
    this.burstParticles.forEach((p) => this.scene.remove(p.mesh));
    this.burstParticles = [];
    if (this.hintRing) this.hintRing.visible = false;
    this.hintTargetPart = null;
    this.resetCenterRotation();
    this.centerAssemblyGroup.rotation.set(0, 0, 0);

    while (this.centerAssemblyGroup.children.length > 0) {
      this.centerAssemblyGroup.remove(this.centerAssemblyGroup.children[0]);
    }

    // moduleGroup içinde centerAssemblyGroup dışındaki sürüklenebilir parçaları temizle
    for (let i = this.moduleGroup.children.length - 1; i >= 0; i--) {
      const child = this.moduleGroup.children[i];
      if (child !== this.centerAssemblyGroup) {
        this.moduleGroup.remove(child);
      }
    }
  }

  createPrimitiveGeometry(prim) {
    const args = prim.args || [];
    switch (prim.type) {
      case 'sphere':
        return new THREE.SphereGeometry(...args);
      case 'cylinder':
        return new THREE.CylinderGeometry(...args);
      case 'capsule':
        return new THREE.CapsuleGeometry(...args);
      case 'torus':
        return new THREE.TorusGeometry(...args);
      case 'cone':
        return new THREE.ConeGeometry(...args);
      case 'box':
      default:
        return new THREE.BoxGeometry(...args);
    }
  }

  createPrimitiveObject(prim, defaultColor) {
    if (prim.type === 'group' && Array.isArray(prim.children)) {
      const group = new THREE.Group();
      prim.children.forEach((childPrim) => {
        const geom = this.createPrimitiveGeometry(childPrim);
        const mat = new THREE.MeshStandardMaterial({
          color: childPrim.color ?? defaultColor ?? 0x3b82f6,
          roughness: 0.32,
          metalness: 0.12
        });
        const mesh = new THREE.Mesh(geom, mat);
        if (childPrim.position) mesh.position.set(...childPrim.position);
        if (childPrim.rotation) mesh.rotation.set(...childPrim.rotation);
        if (childPrim.scale) mesh.scale.set(...childPrim.scale);
        group.add(mesh);
      });
      if (prim.rotation) group.rotation.set(...prim.rotation);
      if (prim.scale) group.scale.set(...prim.scale);
      return group;
    }

    const geom = this.createPrimitiveGeometry(prim);
    const mat = new THREE.MeshStandardMaterial({
      color: defaultColor ?? 0x3b82f6,
      roughness: 0.32,
      metalness: 0.12
    });
    const mesh = new THREE.Mesh(geom, mat);
    if (prim.rotation) mesh.rotation.set(...prim.rotation);
    if (prim.scale) mesh.scale.set(...prim.scale);
    return mesh;
  }

  /**
   * Seçilen modülün kılavuz gövdesini ve sürüklenebilir parçalarını oluşturur.
   * @param {Object} moduleData
   */
  async loadModule(moduleData) {
    this.clearModule();

    if (moduleData.cameraPosition) {
      this.baseCameraPos.set(...moduleData.cameraPosition);
      this.camera.position.set(
        this.baseCameraPos.x,
        this.baseCameraPos.y,
        this.baseCameraPos.z
      );
      this.handleResize();
    }

    // 1. Ortadaki Ana Kılavuz Gövdeyi Oluştur
    await this.buildBaseGuide(moduleData);

    // 2. Parçaları ve Hedef Yuva İpuçlarını Oluştur
    for (let i = 0; i < moduleData.parts.length; i++) {
      const partConfig = moduleData.parts[i];
      await this.buildPartAndSlot(partConfig, i);
    }
  }

  async buildBaseGuide(moduleData) {
    const baseGuide = moduleData.baseGuide || {};
    let guideGroup = null;

    if (baseGuide.modelUrl) {
      try {
        const gltf = await this.gltfLoader.loadAsync(baseGuide.modelUrl);
        guideGroup = gltf.scene;
      } catch (err) {
        console.warn('Kılavuz GLB yüklenemedi, prosedürel model kullanılıyor:', err);
      }
    }

    if (!guideGroup) {
      guideGroup = ModelFactory.createBaseGuide(moduleData.id);
    }

    if (guideGroup.children.length === 0 && baseGuide.primitives) {
      baseGuide.primitives.forEach((prim) => {
        const geom = this.createPrimitiveGeometry(prim);
        const mat = new THREE.MeshPhysicalMaterial({
          color: prim.color ?? 0x94a3b8,
          transparent: true,
          opacity: prim.opacity ?? 0.28,
          roughness: 0.35,
          metalness: 0.05,
          depthWrite: false
        });
        const mesh = new THREE.Mesh(geom, mat);
        if (prim.position) mesh.position.set(...prim.position);
        if (prim.rotation) mesh.rotation.set(...prim.rotation);
        if (prim.scale) mesh.scale.set(...prim.scale);
        guideGroup.add(mesh);
      });
    }

    guideGroup.name = 'BaseGuide';
    this.centerAssemblyGroup.add(guideGroup);
  }

  async buildPartAndSlot(partConfig, index) {
    const partRoot = new THREE.Group();
    partRoot.name = `Part_${partConfig.id}`;

    let visualMesh = null;

    // 1. Harici .glb modeli varsa yükle
    if (partConfig.modelUrl) {
      try {
        const gltf = await this.gltfLoader.loadAsync(partConfig.modelUrl);
        visualMesh = gltf.scene;
      } catch (err) {
        console.warn(`${partConfig.name} GLB modeli yüklenemedi, detaylı model kullanılıyor:`, err);
      }
    }

    // 2. ModelFactory içinde detaylı 3D organ/parça modeli varsa oluştur
    if (!visualMesh) {
      visualMesh = ModelFactory.createPartModel(partConfig.id, partConfig);
    }

    // 3. Yedek: modulesData.js içinde primitive tanımı varsa oluştur
    if (!visualMesh) {
      const prim = partConfig.primitive || { type: 'box', args: [0.7, 0.7, 0.7] };
      visualMesh = this.createPrimitiveObject(prim, partConfig.color);
    }

    partRoot.add(visualMesh);

    // Parçanın altına okunaklı 3D İsim Etiketi ekle
    const shortName = partConfig.name.split(' (')[0];
    const labelSprite = ModelFactory.createLabelSprite(shortName, partConfig.icon);
    labelSprite.position.set(0, -0.58, 0.25);
    partRoot.add(labelSprite);

    const startPos = new THREE.Vector3(
      partConfig.startPosition.x,
      partConfig.startPosition.y,
      partConfig.startPosition.z
    );
    const targetPos = new THREE.Vector3(
      partConfig.targetPosition.x,
      partConfig.targetPosition.y,
      partConfig.targetPosition.z
    );

    partRoot.position.copy(startPos);

    // Hedef yuvada çocuğa şekil ipucu veren yarı saydam silüet (Target Ghost)
    const ghostMesh = visualMesh.clone();
    ghostMesh.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: partConfig.color ?? 0xffffff,
          transparent: true,
          opacity: 0.24,
          roughness: 0.4,
          depthWrite: false
        });
      }
    });
    ghostMesh.position.copy(targetPos);
    this.centerAssemblyGroup.add(ghostMesh);

    partRoot.userData = {
      partConfig,
      visualMesh,
      labelSprite,
      startPos: startPos.clone(),
      targetPos: targetPos.clone(),
      isLocked: false,
      isDragging: false,
      floatOffset: index * 0.9,
      ghostMesh,
      snapAnimProgress: 0
    };

    // Alt mesh'lerden üst gruba kolay erişim (Raycaster için)
    visualMesh.traverse((child) => {
      child.userData.partRoot = partRoot;
    });

    this.moduleGroup.add(partRoot);
    this.draggableParts.push(partRoot);
  }

  /**
   * Parça doğru yere oturduğunda 3D yıldız/parçacık efekti patlatır ve parçayı gövde grubuna bağlar.
   */
  onPartLocked(partRoot) {
    const data = partRoot.userData;
    if (data.labelSprite) {
      data.labelSprite.visible = false;
    }
    if (this.hintTargetPart === partRoot) {
      this.hintTargetPart = null;
      this.hintRing.visible = false;
    }

    // Parçayı centerAssemblyGroup içine taşı ki gövde döndürüldüğünde yerleşmiş organlar da birlikte dönsün
    this.centerAssemblyGroup. attach(partRoot);

    this.spawnSnapBurst(data.targetPos, data.partConfig.color || 0xfacc15);
  }

  spawnSnapBurst(localPos, colorHex) {
    const worldPos = localPos.clone().applyMatrix4(this.centerAssemblyGroup.matrixWorld);
    const count = 18;
    const geom = new THREE.OctahedronGeometry(0.08, 0);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? colorHex : 0xfef08a,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(worldPos);

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 1.6 + Math.random() * 2.2;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        (Math.random() - 0.5) * 1.5
      );

      this.scene.add(mesh);
      this.burstParticles.push({ mesh, velocity, life: 1.0 });
    }
  }

  /**
   * Henüz yerleşmemiş bir parçayı ve hedef yuvasını vurgular (İpucu Butonu).
   * @returns {Object|null} Vurgulanan parçanın yapılandırması
   */
  triggerHint() {
    const unlocked = this.draggableParts.filter((p) => !p.userData.isLocked);
    if (unlocked.length === 0) return null;

    const chosen = unlocked[0];
    this.hintTargetPart = chosen;
    this.hintExpireTime = this.clock.getElapsedTime() + 3.5;
    this.hintRing.visible = true;
    this.resetCenterRotation();

    return chosen.userData.partConfig;
  }

  /**
   * Ana animasyon ve render döngüsü.
   */
  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      // Ortadaki gövdenin yumuşak 3D dönüşü
      this.centerAssemblyGroup.rotation.y = THREE.MathUtils.lerp(
        this.centerAssemblyGroup.rotation.y,
        this.targetRotationY,
        0.12
      );
      this.centerAssemblyGroup.rotation.x = THREE.MathUtils.lerp(
        this.centerAssemblyGroup.rotation.x,
        this.targetRotationX,
        0.12
      );

      // Parçaların animasyonları
      for (const part of this.draggableParts) {
        const data = part.userData;
        if (!data.isDragging && !data.isLocked) {
          const targetY = data.startPos.y + Math.sin(elapsed * 2.2 + data.floatOffset) * 0.06;
          part.position.x = THREE.MathUtils.lerp(part.position.x, data.startPos.x, 0.14);
          part.position.y = THREE.MathUtils.lerp(part.position.y, targetY, 0.14);
          part.position.z = THREE.MathUtils.lerp(part.position.z, data.startPos.z, 0.14);

          // Kendi ekseninde hafif 3D salınım (organın 3 boyutlu detaylarının görünmesi için)
          if (data.visualMesh) {
            data.visualMesh.rotation.y = Math.sin(elapsed * 1.4 + data.floatOffset) * 0.28;
          }

          if (this.hintTargetPart === part && elapsed < this.hintExpireTime) {
            const hintPulse = 1 + Math.sin(elapsed * 10) * 0.12;
            part.scale.setScalar(hintPulse);
          } else {
            part.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
          }
        } else if (data.isDragging) {
          if (data.visualMesh) {
            data.visualMesh.rotation.y = THREE.MathUtils.lerp(data.visualMesh.rotation.y, 0, 0.2);
          }
        } else if (data.isLocked) {
          part.position.lerp(data.targetPos, 0.25);
          part.rotation.set(0, 0, 0);
          if (data.visualMesh) {
            data.visualMesh.rotation.y = THREE.MathUtils.lerp(data.visualMesh.rotation.y, 0, 0.25);
          }

          if (data.snapAnimProgress < 1) {
            data.snapAnimProgress = Math.min(1, data.snapAnimProgress + 0.08);
            const pulse = 1 + Math.sin(data.snapAnimProgress * Math.PI) * 0.25;
            part.scale.setScalar(pulse);
          } else if (data.partConfig.id === 'heart') {
            // Yerleşmiş kalp için gerçekçi kalp atışı (lub-dub)
            const beat = 1 + Math.pow(Math.max(0, Math.sin(elapsed * 4.5)), 6) * 0.08;
            part.scale.setScalar(beat);
          } else if (data.partConfig.id === 'lung_left' || data.partConfig.id === 'lung_right') {
            // Yerleşmiş akciğerler için nefes alıp verme hareketi
            const breath = 1 + Math.sin(elapsed * 2.0) * 0.045;
            part.scale.setScalar(breath);
          } else {
            part.scale.setScalar(1);
          }
        }
      }

      // İpucu halkası animasyonu
      if (this.hintTargetPart && elapsed < this.hintExpireTime) {
        const targetWorld = this.hintTargetPart.userData.targetPos
          .clone()
          .applyMatrix4(this.centerAssemblyGroup.matrixWorld);
        this.hintRing.position.copy(targetWorld);
        this.hintRing.position.z += 0.25;
        const s = 1 + Math.sin(elapsed * 8) * 0.18;
        this.hintRing.scale.setScalar(s);
      } else if (this.hintRing.visible) {
        this.hintRing.visible = false;
        this.hintTargetPart = null;
      }

      // 3D Parçacık patlaması güncellemesi
      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        const bp = this.burstParticles[i];
        bp.life -= dt * 1.8;
        if (bp.life <= 0) {
          this.scene.remove(bp.mesh);
          this.burstParticles.splice(i, 1);
        } else {
          bp.mesh.position.addScaledVector(bp.velocity, dt);
          bp.mesh.rotation.x += dt * 5;
          bp.mesh.rotation.y += dt * 5;
          bp.mesh.material.opacity = bp.life;
          bp.mesh.scale.setScalar(bp.life);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}
