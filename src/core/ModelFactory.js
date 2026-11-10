import * as THREE from 'three';

/**
 * Gerçekçi ve Detaylı 3D Anatomi, Araba, Roket ve Güneş Sistemi Model Fabrikası.
 * Kullanıcının paylaştığı anatomik referans görseline sadık kalarak:
 * - Baştan ayağa tam insan vücudu (ten rengi dış hatlar, kol/bacak kemikleri, kas lifleri ve açık göğüs/karın boşluğu)
 * - Bezier eğrileri (THREE.Shape + çok kademeli ExtrudeGeometry bevel) ve yüksek çözünürlüklü prosedürel
 *   anatomik dokularla (kıvrımlı beyin, halkalı soluk borusu, loblu akciğerler, J-mide, karaciğer, boğumlu kalın bağırsak ve kıvrımlı ince bağırsak)
 *   üretir.
 */
export class ModelFactory {
  /**
   * Parça üzerinde okunaklı isim etiketi (Sprite) oluşturur.
   */
  static createLabelSprite(text, icon = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;

    const x = 28;
    const y = 16;
    const w = canvas.width - 56;
    const h = canvas.height - 32;
    const r = 36;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${icon ? icon + ' ' : ''}${text}`, canvas.width / 2, canvas.height / 2 + 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.45, 0.32, 1);
    return sprite;
  }

  /**
   * 2B Bezier şeklini (THREE.Shape) pürüzsüz, dolgun 3B organik hacme dönüştürür ve merkezler.
   */
  static createSculptedOrganMesh(shape, options = {}) {
    const depth = options.depth ?? 0.08;
    const bevelThickness = options.bevelThickness ?? 0.14;
    const bevelSize = options.bevelSize ?? 0.12;
    const bevelSegments = options.bevelSegments ?? 12;

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments,
      curveSegments: 32
    });

    geom.computeBoundingBox();
    const center = new THREE.Vector3();
    geom.boundingBox.getCenter(center);
    geom.translate(0, 0, -center.z);
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhysicalMaterial({
      color: options.color ?? 0xffffff,
      map: options.map ?? null,
      roughness: options.roughness ?? 0.36,
      metalness: options.metalness ?? 0.04,
      clearcoat: options.clearcoat ?? 0.4,
      clearcoatRoughness: 0.25
    });

    return new THREE.Mesh(geom, mat);
  }

  static createBaseGuide(moduleId) {
    switch (moduleId) {
      case 'anatomy':
        return this.createHumanBodyGuide();
      case 'car_mechanic':
        return this.createCarChassisGuide();
      case 'space_rocket':
        return this.createRocketGuide();
      case 'solar_system':
        return this.createSolarSystemGuide();
      default:
        return new THREE.Group();
    }
  }

  static createPartModel(partId) {
    switch (partId) {
      // İNSAN ANATOMİSİ ORGANLARI (Referans görsele birebir uyumlu)
      case 'brain':
        return this.createDetailedBrain();
      case 'lung_left':
        return this.createDetailedLung('left');
      case 'lung_right':
        return this.createDetailedLung('right');
      case 'heart':
        return this.createDetailedHeart();
      case 'liver':
        return this.createDetailedLiver();
      case 'stomach':
        return this.createDetailedStomach();
      case 'intestines':
        return this.createDetailedIntestines();
      case 'kidneys':
        return this.createDetailedKidneys();

      // ARABA PARÇALARI
      case 'engine_block':
        return this.createDetailedEngine();
      case 'battery':
        return this.createDetailedBattery();
      case 'radiator':
        return this.createDetailedRadiator();
      case 'steering_wheel':
        return this.createDetailedSteeringWheel();
      case 'wheel_front':
      case 'wheel_rear':
        return this.createDetailedWheel();

      // UZAY ROKETİ PARÇALARI
      case 'nose_cone':
        return this.createRocketNoseCone();
      case 'cockpit_module':
        return this.createRocketCockpit();
      case 'fuel_tank':
        return this.createRocketFuelTank();
      case 'booster_left':
      case 'booster_right':
        return this.createRocketBooster(partId === 'booster_left' ? 'left' : 'right');
      case 'thruster_nozzle':
        return this.createRocketThruster();

      // GÜNEŞ SİSTEMİ GEZEGENLERİ
      case 'mercury':
        return this.createPlanetMercury();
      case 'venus':
        return this.createPlanetVenus();
      case 'earth':
        return this.createPlanetEarth();
      case 'mars':
        return this.createPlanetMars();
      case 'jupiter':
        return this.createPlanetJupiter();
      case 'saturn':
        return this.createPlanetSaturn();

      default:
        return null;
    }
  }

  // ============================================================================
  // 1. TAM BOY GERÇEKÇİ İNSAN VÜCUDU KILAVUZU (Referans Görseldeki Gibi)
  // ============================================================================
  static createHumanBodyGuide() {
    const group = new THREE.Group();

    // Doğal ten rengi materyal
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4bfa9,
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.1
    });

    // İç organ boşluğu (Cavity) koyu anatomik zemin
    const cavityMat = new THREE.MeshStandardMaterial({
      color: 0x2a1818,
      roughness: 0.8
    });

    // Kemik (Femur, Tibia, Kol kemikleri, Köprücük kemiği) materyali
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xf5e384,
      roughness: 0.4
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35
    });

    const muscleMat = new THREE.MeshStandardMaterial({
      color: 0xd94848,
      roughness: 0.45
    });

    const tracheaMat = new THREE.MeshPhysicalMaterial({
      color: 0x3898d4,
      roughness: 0.3,
      clearcoat: 0.3
    });

    // --- 1. BAŞ, KULAKLAR VE KAFATASI OYUĞU ---
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 32), skinMat);
    headMesh.scale.set(0.88, 1.08, 0.85);
    headMesh.position.set(0, 2.68, -0.22);
    group.add(headMesh);

    // Çene ve alt yüz
    const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.32, 0.52, 28), skinMat);
    jaw.scale.set(1, 1, 0.8);
    jaw.position.set(0, 2.22, -0.2);
    group.add(jaw);

    // Kulaklar
    [-0.58, 0.58].forEach((x) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), skinMat);
      ear.scale.set(0.45, 1.15, 0.65);
      ear.position.set(x, 2.55, -0.2);
      group.add(ear);
    });

    // Kafatası iç oyuğu (Beyin yuvası çerçevesi)
    const brainCavity = new THREE.Mesh(new THREE.SphereGeometry(0.56, 28, 28), cavityMat);
    brainCavity.scale.set(0.92, 0.85, 0.55);
    brainCavity.position.set(0, 2.75, -0.06);
    group.add(brainCavity);

    // Beyin altındaki yeşilimsi çizgili kafa tabanı (Referans görseldeki detay)
    const baseSkullMat = new THREE.MeshStandardMaterial({ color: 0x8ebc68, roughness: 0.5 });
    const baseSkull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 20), baseSkullMat);
    baseSkull.scale.set(1.15, 0.65, 0.5);
    baseSkull.position.set(0, 2.32, -0.05);
    group.add(baseSkull);

    // --- 2. BOYUN VE GÖVDEDEN GEÇEN MAVİ SOLUK BORUSU (TRACHEA) ---
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.65, 28), skinMat);
    neck.scale.set(1, 1, 0.75);
    neck.position.set(0, 1.82, -0.22);
    group.add(neck);

    // Mavi halkalı soluk borusu (Boğazdan akciğerlere inen Y-boru)
    const tracheaTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 1.15, 20),
      tracheaMat
    );
    tracheaTube.position.set(0, 1.65, 0.02);
    group.add(tracheaTube);

    // Soluk borusu halkaları
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e5b88 });
    for (let i = 0; i < 12; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.067, 0.008, 8, 20), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 2.15 - i * 0.085, 0.02);
      group.add(ring);
    }

    // Sağ ve sol bronş dalları (Y çatalı)
    [-1, 1].forEach((dir) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.38, 16), tracheaMat);
      branch.position.set(dir * 0.14, 1.02, 0.02);
      branch.rotation.z = dir * 0.65;
      group.add(branch);
    });

    // --- 3. GÖVDE (OMUZ, GÖĞÜS, BEL, KALÇA) VE İÇ ORGAN OYUĞU ---
    const torsoPoints = [
      new THREE.Vector2(0.01, -1.35),
      new THREE.Vector2(0.82, -1.28), // Kalça alt
      new THREE.Vector2(0.98, -0.85), // Pelvis genişliği
      new THREE.Vector2(0.84, -0.25), // Bel kavisi
      new THREE.Vector2(1.02, 0.55),  // Göğüs kafesi
      new THREE.Vector2(1.18, 1.25),  // Geniş omuzlar
      new THREE.Vector2(0.38, 1.52),  // Boyun birleşimi
      new THREE.Vector2(0.01, 1.53)
    ];
    const torsoGeom = new THREE.LatheGeometry(torsoPoints, 36);
    const torsoMesh = new THREE.Mesh(torsoGeom, skinMat);
    torsoMesh.scale.set(1.0, 1.0, 0.56);
    torsoMesh.position.set(0, 0.12, -0.25);
    group.add(torsoMesh);

    // Göğüs ve karın iç oyuğu (Organların içine yerleştiği koyu anatomik pencere)
    const cavityShape = new THREE.Shape();
    cavityShape.moveTo(0, 1.25);
    cavityShape.bezierCurveTo(0.68, 1.25, 0.82, 0.75, 0.78, 0.0);
    cavityShape.bezierCurveTo(0.75, -0.65, 0.65, -1.15, 0, -1.18);
    cavityShape.bezierCurveTo(-0.65, -1.15, -0.75, -0.65, -0.78, 0.0);
    cavityShape.bezierCurveTo(-0.82, 0.75, -0.68, 1.25, 0, 1.25);

    const torsoCavity = new THREE.Mesh(
      new THREE.ExtrudeGeometry(cavityShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 6
      }),
      cavityMat
    );
    torsoCavity.position.set(0, 0.12, -0.14);
    group.add(torsoCavity);

    // Köprücük kemikleri (Clavicles)
    [-1, 1].forEach((dir) => {
      const clavicleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.12, 1.42, 0.0),
        new THREE.Vector3(dir * 0.55, 1.48, -0.04),
        new THREE.Vector3(dir * 1.05, 1.38, -0.1)
      ]);
      const clavicle = new THREE.Mesh(
        new THREE.TubeGeometry(clavicleCurve, 16, 0.045, 10, false),
        boneMat
      );
      group.add(clavicle);
    });

    // --- 4. KOLLAR, ÖN KOLLAR, ELLER VE KOL KEMİKLERİ/DAMARLARI ---
    [-1, 1].forEach((dir) => {
      // Omuz yuvarlağı
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), skinMat);
      shoulder.position.set(dir * 1.18, 1.22, -0.22);
      group.add(shoulder);

      // Üst kol (ten)
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.19, 1.15, 20), skinMat);
      upperArm.position.set(dir * 1.38, 0.62, -0.22);
      upperArm.rotation.z = dir * 0.16;
      group.add(upperArm);

      // Ön kol (ten)
      const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 1.05, 20), skinMat);
      foreArm.position.set(dir * 1.62, -0.35, -0.2);
      foreArm.rotation.z = dir * 0.16;
      group.add(foreArm);

      // Kol içi kemik ve kas/damar kesiti (Referans görseldeki gibi)
      const armBone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 1.0, 12), boneMat);
      armBone.position.set(dir * 1.38, 0.62, -0.04);
      armBone.rotation.z = dir * 0.16;
      group.add(armBone);

      const forearmMuscle = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.65, 8, 12), muscleMat);
      forearmMuscle.position.set(dir * 1.62, -0.32, -0.04);
      forearmMuscle.rotation.z = dir * 0.16;
      group.add(forearmMuscle);

      // El ayası ve 5 parmak
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.09), skinMat);
      palm.position.set(dir * 1.78, -0.98, -0.16);
      palm.rotation.z = dir * 0.15;
      group.add(palm);

      for (let f = -2; f <= 2; f++) {
        const fingerLen = f === -2 ? 0.16 : 0.24 - Math.abs(f) * 0.02;
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.024, fingerLen, 6, 8),
          skinMat
        );
        const fx = dir * 1.81 + f * 0.045;
        const fy = f === -2 ? -0.98 : -1.18;
        finger.position.set(fx, fy, -0.15);
        if (f === -2) finger.rotation.z = dir * -0.45;
        group.add(finger);
      }
    });

    // --- 5. BACAKLAR, UYLUK KEMİĞİ (FEMUR), DİZ KAPAĞI VE AYAKLAR ---
    [-1, 1].forEach((dir) => {
      const legX = dir * 0.46;

      // Üst bacak (Uyluk teni)
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.25, 1.35, 24), skinMat);
      thigh.scale.set(1, 1, 0.78);
      thigh.position.set(legX, -1.62, -0.24);
      group.add(thigh);

      // Femur Kemiği (Sarı uyluk kemiği - referans görseldeki gibi)
      const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 1.25, 14), boneMat);
      femur.position.set(legX, -1.55, -0.02);
      femur.rotation.z = dir * -0.04;
      group.add(femur);

      // Uyluk alt kasları (Diz üstü kırmızı kas dokusu)
      const quadMuscle = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), muscleMat);
      quadMuscle.scale.set(0.9, 1.4, 0.5);
      quadMuscle.position.set(legX, -2.02, -0.03);
      group.add(quadMuscle);

      // Diz Eklemi (Sarı kıkırdak + Gri Diz Kapağı Patella)
      const kneeCartilage = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), boneMat);
      kneeCartilage.scale.set(1.1, 0.85, 0.6);
      kneeCartilage.position.set(legX, -2.28, -0.02);
      group.add(kneeCartilage);

      const patella = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), jointMat);
      patella.scale.set(1.1, 0.85, 0.5);
      patella.position.set(legX, -2.28, 0.06);
      group.add(patella);

      // Alt bacak (Baldır teni)
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.15, 1.25, 24), skinMat);
      calf.scale.set(1, 1, 0.78);
      calf.position.set(legX, -2.92, -0.24);
      group.add(calf);

      // Kaval Kemiği (Tibia)
      const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 1.1, 14), boneMat);
      tibia.position.set(legX, -2.9, -0.02);
      group.add(tibia);

      // Ayak
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat);
      foot.scale.set(0.85, 0.45, 1.45);
      foot.position.set(legX + dir * 0.05, -3.58, -0.12);
      group.add(foot);
    });

    return group;
  }

  // ============================================================================
  // 2. GERÇEKÇİ ANATOMİK ORGAN MODELLERİ (Referans Görsele Birebir Uyumlu)
  // ============================================================================

  /**
   * 🧠 BEYİN: Referans görseldeki sıcak şeftali-pembe tonunda iki simetrik yarımküre
   * ve üzerinde belirgin beyin kıvrım olukları (sulci/gyri).
   */
  static createDetailedBrain() {
    const group = new THREE.Group();

    // Yüksek çözünürlüklü beyin kıvrımları (sulci) dokusu
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Zemin beyin dokusu rengi
    const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
    grad.addColorStop(0, '#f8c291');
    grad.addColorStop(0.75, '#eba16c');
    grad.addColorStop(1, '#c47147');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Orta yarık (Longitudinal fissure)
    ctx.strokeStyle = '#5c2018';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(256, 10);
    ctx.lineTo(256, 502);
    ctx.stroke();

    // Kıvrım olukları (Sulci)
    ctx.strokeStyle = '#6e2c1f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    const sulciPaths = [
      // Sol yarımküre kıvrımları
      [[250, 90], [180, 80], [130, 120], [170, 160]],
      [[250, 175], [160, 190], [100, 160], [75, 220]],
      [[250, 250], [175, 240], [135, 290], [85, 280]],
      [[250, 330], [165, 340], [120, 390], [180, 420]],
      [[190, 130], [120, 220], [160, 300]],
      // Sağ yarımküre kıvrımları (simetrik)
      [[262, 90], [332, 80], [382, 120], [342, 160]],
      [[262, 175], [352, 190], [412, 160], [437, 220]],
      [[262, 250], [337, 240], [377, 290], [427, 280]],
      [[262, 330], [347, 340], [392, 390], [332, 420]],
      [[322, 130], [392, 220], [352, 300]]
    ];

    sulciPaths.forEach((pts) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    const brainMat = new THREE.MeshPhysicalMaterial({
      map: tex,
      roughness: 0.38,
      metalness: 0.02,
      clearcoat: 0.35
    });

    // Sol ve Sağ Hemisfer 3B Lobları
    [-0.22, 0.22].forEach((x, idx) => {
      const hemi = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), brainMat);
      hemi.scale.set(0.82, 1.05, 0.72);
      hemi.rotation.y = idx === 0 ? -Math.PI / 2 : -Math.PI / 2;
      hemi.position.set(x, 0.04, 0);
      group.add(hemi);
    });

    // Ön yüzey 3B kıvrım kabartmaları (organik derinlik hissi için)
    const foldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf3b27a,
      roughness: 0.4,
      clearcoat: 0.3
    });
    const grooveMat = new THREE.MeshBasicMaterial({ color: 0x6e2c1f });

    // Merkez yarık çizgisi
    const centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.68, 0.52), grooveMat);
    centerLine.position.set(0, 0.04, 0.02);
    group.add(centerLine);

    [-1, 1].forEach((dir) => {
      const curves = [
        [
          new THREE.Vector3(dir * 0.06, 0.24, 0.22),
          new THREE.Vector3(dir * 0.22, 0.26, 0.21),
          new THREE.Vector3(dir * 0.32, 0.14, 0.18)
        ],
        [
          new THREE.Vector3(dir * 0.06, 0.06, 0.24),
          new THREE.Vector3(dir * 0.25, 0.02, 0.22),
          new THREE.Vector3(dir * 0.36, -0.08, 0.18)
        ],
        [
          new THREE.Vector3(dir * 0.08, -0.14, 0.22),
          new THREE.Vector3(dir * 0.24, -0.18, 0.2),
          new THREE.Vector3(dir * 0.3, -0.04, 0.21)
        ]
      ];
      curves.forEach((pts) => {
        const c = new THREE.CatmullRomCurve3(pts);
        const tube = new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.055, 10, false), foldMat);
        group.add(tube);

        const sulc = new THREE.Mesh(new THREE.TubeGeometry(c, 16, 0.015, 8, false), grooveMat);
        sulc.position.y -= 0.045;
        sulc.position.z += 0.03;
        group.add(sulc);
      });
    });

    // Alt orta hipotalamus/beyin sapı kırmızımsı düğümü (referans görseldeki detay)
    const bulbMat = new THREE.MeshPhysicalMaterial({ color: 0xd64550, roughness: 0.35, clearcoat: 0.4 });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), bulbMat);
    bulb.position.set(0, -0.28, 0.12);
    group.add(bulb);

    return group;
  }

  /**
   * 🫁 AKCİĞER (Sol veya Sağ): Referans görseldeki gibi üstü daralan, dış kenarı
   * göğüs kafesi kavisli, tabanı diyafram oyuklu pürüzsüz pembe-mercan akciğer lobu.
   */
  static createDetailedLung(side = 'left') {
    const group = new THREE.Group();
    const isLeftScreen = side === 'left'; // Ekranda sol taraftaki (anatomik sağ akciğer)
    const dir = isLeftScreen ? -1 : 1;

    const shape = new THREE.Shape();
    if (isLeftScreen) {
      // Sol ekrandaki akciğer (Anatomik Sağ Akciğer)
      shape.moveTo(0.08, 0.48); // Üst tepe (Apex)
      shape.bezierCurveTo(-0.18, 0.48, -0.36, 0.15, -0.38, -0.25); // Dış kaburga kavisi
      shape.bezierCurveTo(-0.38, -0.44, -0.22, -0.48, -0.05, -0.38); // Alt diyafram kavisi
      shape.bezierCurveTo(0.12, -0.28, 0.22, -0.18, 0.22, 0.08); // İç mediastinal kenar
      shape.bezierCurveTo(0.22, 0.34, 0.16, 0.48, 0.08, 0.48);
    } else {
      // Sağ ekrandaki akciğer (Anatomik Sol Akciğer - kalp çentikli)
      shape.moveTo(-0.08, 0.48); // Üst tepe (Apex)
      shape.bezierCurveTo(0.18, 0.48, 0.36, 0.15, 0.38, -0.25); // Dış kaburga kavisi
      shape.bezierCurveTo(0.38, -0.44, 0.22, -0.48, 0.05, -0.38); // Alt diyafram kavisi
      shape.bezierCurveTo(-0.12, -0.28, -0.16, -0.12, -0.2, 0.08); // Kalp çentiği (Cardiac notch)
      shape.bezierCurveTo(-0.22, 0.34, -0.16, 0.48, -0.08, 0.48);
    }

    const lungMesh = this.createSculptedOrganMesh(shape, {
      depth: 0.06,
      bevelThickness: 0.16,
      bevelSize: 0.11,
      bevelSegments: 14,
      color: 0xec6b78,
      roughness: 0.38,
      clearcoat: 0.35
    });
    group.add(lungMesh);

    // Akciğer lob ayrım çizgisi ve bronş girişi
    const fissureCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dir * 0.05, 0.05, 0.18),
      new THREE.Vector3(dir * 0.22, -0.08, 0.17),
      new THREE.Vector3(dir * 0.36, -0.22, 0.12)
    ]);
    const fissureMat = new THREE.MeshBasicMaterial({ color: 0xa32a3b });
    const fissure = new THREE.Mesh(
      new THREE.TubeGeometry(fissureCurve, 16, 0.012, 8, false),
      fissureMat
    );
    group.add(fissure);

    // Mavi bronş kökü
    const bronchusMat = new THREE.MeshPhysicalMaterial({ color: 0x3898d4, roughness: 0.3 });
    const bronchus = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.26, 14),
      bronchusMat
    );
    bronchus.position.set(-dir * 0.18, 0.18, 0.05);
    bronchus.rotation.z = -dir * 0.65;
    group.add(bronchus);

    return group;
  }

  /**
   * ❤️ KALP VE ANA DAMARLAR: Referans görseldeki gibi akciğerlerin arasında yer alan
   * mavi Vena Cava / Pulmoner damar kemeri ve kırmızı kalp karıncığı/Aort yapısı.
   */
  static createDetailedHeart() {
    const group = new THREE.Group();

    // Kırmızı kalp kas gövdesi (Sculpted Shape)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.16);
    heartShape.bezierCurveTo(0.14, 0.26, 0.26, 0.12, 0.22, -0.06);
    heartShape.bezierCurveTo(0.18, -0.22, 0.08, -0.32, 0.04, -0.36); // Apex
    heartShape.bezierCurveTo(-0.08, -0.3, -0.2, -0.16, -0.2, 0.04);
    heartShape.bezierCurveTo(-0.2, 0.18, -0.08, 0.24, 0, 0.16);

    const heartBody = this.createSculptedOrganMesh(heartShape, {
      depth: 0.05,
      bevelThickness: 0.13,
      bevelSize: 0.09,
      bevelSegments: 12,
      color: 0xd9383a,
      roughness: 0.3,
      clearcoat: 0.55
    });
    heartBody.rotation.z = 0.22;
    group.add(heartBody);

    // Mavi Ana Damar Kemeri (Referans görselde soluk borusunun altından kıvrılan belirgin mavi damar)
    const blueVesselMat = new THREE.MeshPhysicalMaterial({
      color: 0x2b8cbe,
      roughness: 0.32,
      clearcoat: 0.45
    });
    const blueCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.12, 0.34, 0.04),
      new THREE.Vector3(-0.1, 0.08, 0.1),
      new THREE.Vector3(0.05, -0.04, 0.12),
      new THREE.Vector3(0.24, -0.06, 0.08)
    ]);
    const blueVessel = new THREE.Mesh(
      new THREE.TubeGeometry(blueCurve, 24, 0.075, 16, false),
      blueVesselMat
    );
    group.add(blueVessel);

    // Kırmızı Aort Kemeri ve Üst Damar Dalları
    const redVesselMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      roughness: 0.32,
      clearcoat: 0.45
    });
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.12, 0.04),
      new THREE.Vector3(0.08, 0.32, 0.04),
      new THREE.Vector3(-0.04, 0.38, 0.0)
    ]);
    const aorta = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 20, 0.06, 14, false),
      redVesselMat
    );
    group.add(aorta);

    return group;
  }

  /**
   * 🛡️ KARACİĞER: Referans görseldeki gibi sağ akciğerin (ekranın solunun) hemen altında
   * yer alan pürüzsüz, dolgun kama/fasulye biçimli karaciğer lobu ve safra kesesi.
   */
  static createDetailedLiver() {
    const group = new THREE.Group();

    const liverShape = new THREE.Shape();
    liverShape.moveTo(-0.34, 0.08);
    liverShape.bezierCurveTo(-0.32, 0.28, -0.05, 0.34, 0.22, 0.18);
    liverShape.bezierCurveTo(0.36, 0.1, 0.38, -0.04, 0.24, -0.12);
    liverShape.bezierCurveTo(0.05, -0.22, -0.18, -0.26, -0.3, -0.16);
    liverShape.bezierCurveTo(-0.38, -0.08, -0.36, 0.0, -0.34, 0.08);

    const liverMesh = this.createSculptedOrganMesh(liverShape, {
      depth: 0.06,
      bevelThickness: 0.14,
      bevelSize: 0.1,
      bevelSegments: 12,
      color: 0xa6637c, // Referans görseldeki morumsu-kızıl karaciğer tonu
      roughness: 0.34,
      clearcoat: 0.48
    });
    group.add(liverMesh);

    // Alt kenarda mavi-yeşil safra kesesi ve damar çıkıntısı
    const gallMat = new THREE.MeshPhysicalMaterial({
      color: 0x3898d4,
      roughness: 0.3,
      clearcoat: 0.45
    });
    const gallCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, -0.16, 0.08),
      new THREE.Vector3(0.05, -0.24, 0.08),
      new THREE.Vector3(0.22, -0.22, 0.05)
    ]);
    const gall = new THREE.Mesh(
      new THREE.TubeGeometry(gallCurve, 16, 0.055, 12, false),
      gallMat
    );
    group.add(gall);

    return group;
  }

  /**
   * 🍎 MİDE: Referans görseldeki gibi sol akciğerin (ekranın sağının) altında yer alan
   * dolgun kırmızı-mercan J-kesesi ve ortasındaki kıvrım çizgisi.
   */
  static createDetailedStomach() {
    const group = new THREE.Group();

    const stomachShape = new THREE.Shape();
    stomachShape.moveTo(-0.28, 0.12);
    stomachShape.bezierCurveTo(-0.15, 0.24, 0.18, 0.26, 0.32, 0.16); // Üst fundus kubbesi
    stomachShape.bezierCurveTo(0.42, 0.06, 0.38, -0.14, 0.22, -0.22); // Dış büyük eğrilik
    stomachShape.bezierCurveTo(0.02, -0.28, -0.22, -0.22, -0.34, -0.08); // Alt pilor kıvrımı
    stomachShape.bezierCurveTo(-0.4, 0.0, -0.35, 0.08, -0.28, 0.12);

    const stomachMesh = this.createSculptedOrganMesh(stomachShape, {
      depth: 0.05,
      bevelThickness: 0.14,
      bevelSize: 0.1,
      bevelSegments: 12,
      color: 0xdf4b4b,
      roughness: 0.34,
      clearcoat: 0.48
    });
    group.add(stomachMesh);

    // Mide üzerindeki anatomik kıvrım çizgisi (Referans görseldeki orta çizgi)
    const foldCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, 0.02, 0.17),
      new THREE.Vector3(0.04, 0.06, 0.18),
      new THREE.Vector3(0.26, -0.02, 0.16)
    ]);
    const foldMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d });
    const foldLine = new THREE.Mesh(
      new THREE.TubeGeometry(foldCurve, 16, 0.014, 8, false),
      foldMat
    );
    group.add(foldLine);

    return group;
  }

  /**
   * 🌀 BAĞIRSAKLAR (Kalın ve İnce Bağırsak): Referans görseldeki gibi dış çerçevede
   * boğumlu (haustra) Kalın Bağırsak ve ortasında kıvrım kıvrım İnce Bağırsak.
   */
  static createDetailedIntestines() {
    const group = new THREE.Group();

    const colonMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9737b,
      roughness: 0.38,
      clearcoat: 0.35
    });

    const colonCreaseMat = new THREE.MeshBasicMaterial({ color: 0x6b2128 });

    const smallMat = new THREE.MeshPhysicalMaterial({
      color: 0xeba09c,
      roughness: 0.36,
      clearcoat: 0.38
    });

    // 1. Üst Yatay ve Yan Kalın Bağırsak Çerçevesi (Boğumlu Haustra küre dizilimi)
    const colonPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.34, -0.42, 0.0),  // Sağ alt (çekum)
      new THREE.Vector3(-0.42, -0.08, 0.02), // Çıkan kolon
      new THREE.Vector3(-0.38, 0.24, 0.04),  // Sağ fleksura
      new THREE.Vector3(-0.08, 0.26, 0.06),  // Yatay (transvers) kolon
      new THREE.Vector3(0.24, 0.32, 0.06),
      new THREE.Vector3(0.4, 0.22, 0.04),    // Sol fleksura
      new THREE.Vector3(0.42, -0.12, 0.02),  // İnen kolon
      new THREE.Vector3(0.32, -0.44, 0.0),   // Sigmoid kolon
      new THREE.Vector3(0.0, -0.52, -0.02)   // Rektum
    ]);

    const segmentCount = 28;
    for (let i = 0; i <= segmentCount; i++) {
      const t = i / segmentCount;
      const pt = colonPath.getPoint(t);
      const tangent = colonPath.getTangent(t);

      // Boğumlu haustra kesesi
      const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 16), colonMat);
      pouch.scale.set(1.0, 0.85, 0.85);
      pouch.position.copy(pt);
      group.add(pouch);

      // Boğumlar arası koyu halka çizgisi
      if (i > 0 && i < segmentCount) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.009, 6, 16), colonCreaseMat);
        ring.position.copy(pt);
        ring.lookAt(pt.clone().add(tangent));
        group.add(ring);
      }
    }

    // 2. Orta Alanda Kıvrımlı İnce Bağırsak (Small Intestine Coils)
    const smallCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.12, 0.06),
      new THREE.Vector3(0.05, 0.16, 0.08),
      new THREE.Vector3(0.24, 0.1, 0.06),
      new THREE.Vector3(0.18, 0.0, 0.09),
      new THREE.Vector3(-0.08, 0.04, 0.08),
      new THREE.Vector3(-0.25, -0.04, 0.06),
      new THREE.Vector3(-0.18, -0.16, 0.09),
      new THREE.Vector3(0.06, -0.1, 0.08),
      new THREE.Vector3(0.25, -0.16, 0.06),
      new THREE.Vector3(0.16, -0.28, 0.09),
      new THREE.Vector3(-0.06, -0.24, 0.08),
      new THREE.Vector3(-0.22, -0.32, 0.06),
      new THREE.Vector3(0.04, -0.38, 0.08)
    ]);

    const smallTube = new THREE.Mesh(
      new THREE.TubeGeometry(smallCurve, 72, 0.068, 14, false),
      smallMat
    );
    group.add(smallTube);

    // İnce bağırsak kıvrım gölge hatları
    const smallOutline = new THREE.Mesh(
      new THREE.TubeGeometry(smallCurve, 72, 0.072, 12, false),
      new THREE.MeshBasicMaterial({ color: 0x7f2b32, side: THREE.BackSide })
    );
    group.add(smallOutline);

    return group;
  }

  /**
   * 🫘 DETAYLI BÖBREKLER
   */
  static createDetailedKidneys() {
    const group = new THREE.Group();
    const kidneyMat = new THREE.MeshPhysicalMaterial({
      color: 0xbe123c,
      roughness: 0.35,
      clearcoat: 0.45
    });
    const vesselRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const vesselBlue = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });

    [-1, 1].forEach((dir) => {
      const beanCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 0.42, 0.15, 0),
        new THREE.Vector3(dir * 0.5, 0.0, 0),
        new THREE.Vector3(dir * 0.42, -0.15, 0)
      ]);
      const bean = new THREE.Mesh(
        new THREE.TubeGeometry(beanCurve, 20, 0.11, 16, false),
        kidneyMat
      );
      group.add(bean);

      const artery = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 10), vesselRed);
      artery.rotation.z = Math.PI / 2;
      artery.position.set(dir * 0.2, 0.02, 0);
      group.add(artery);

      const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 10), vesselBlue);
      vein.rotation.z = Math.PI / 2;
      vein.position.set(dir * 0.2, -0.02, 0.02);
      group.add(vein);
    });

    return group;
  }

  // ============================================================================
  // 3. DETAYLI ARABA ŞASİSİ VE PARÇALARI
  // ============================================================================
  static createCarChassisGuide() {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.25,
      roughness: 0.25,
      metalness: 0.1,
      depthWrite: false
    });

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.82, 1.7), bodyMat);
    lowerBody.position.set(0, -0.22, -0.3);
    group.add(lowerBody);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.95, 1.55), bodyMat);
    cabin.position.set(0.45, 0.65, -0.3);
    group.add(cabin);

    [-1.35, 1.35].forEach((x) => {
      const axle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 1.85, 20),
        frameMat
      );
      axle.rotation.x = Math.PI / 2;
      axle.position.set(x, -0.75, -0.3);
      group.add(axle);

      const wheelWell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.62, 0.62, 0.5, 24, 1, false, 0, Math.PI),
        frameMat
      );
      wheelWell.rotation.x = Math.PI / 2;
      wheelWell.rotation.y = Math.PI / 2;
      wheelWell.position.set(x, -0.7, -0.05);
      group.add(wheelWell);
    });

    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.55 });
    [-0.55, 0.55].forEach((zOff) => {
      const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), lightMat);
      headlight.position.set(-2.25, -0.1, -0.3 + zOff);
      group.add(headlight);
    });

    return group;
  }

  static createDetailedEngine() {
    const group = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35, metalness: 0.3 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.75 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    const block = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.55, 0.72), metalMat);
    block.position.set(0, -0.06, 0);
    group.add(block);

    [-0.18, 0.18].forEach((z, i) => {
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.22, 0.26), redMat);
      cover.position.set(0, 0.26, z);
      cover.rotation.x = i === 0 ? 0.25 : -0.25;
      group.add(cover);
    });

    [-0.24, 0, 0.24].forEach((x) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 16), metalMat);
      pipe.position.set(x, 0.38, 0);
      group.add(pipe);
    });

    const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24), darkMat);
    pulley.rotation.z = Math.PI / 2;
    pulley.position.set(-0.46, -0.08, 0);
    group.add(pulley);

    return group;
  }

  static createDetailedBattery() {
    const group = new THREE.Group();
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.35 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const plusMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4 });
    const minusMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.4 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.48), boxMat);
    body.position.set(0, -0.04, 0);
    group.add(body);

    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.1, 0.5), topMat);
    lid.position.set(0, 0.2, 0);
    group.add(lid);

    const posPole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 16), plusMat);
    posPole.position.set(-0.18, 0.3, 0);
    group.add(posPole);

    const negPole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 16), minusMat);
    negPole.position.set(0.18, 0.3, 0);
    group.add(negPole);

    return group;
  }

  static createDetailedRadiator() {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.3 });
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 });
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    const core = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.72, 0.85), coreMat);
    group.add(core);

    const topTank = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.88), frameMat);
    topTank.position.set(0, 0.4, 0);
    group.add(topTank);

    const bottomTank = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.88), frameMat);
    bottomTank.position.set(0, -0.4, 0);
    group.add(bottomTank);

    const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 12, 24), fanMat);
    fanRing.rotation.y = Math.PI / 2;
    fanRing.position.set(0.16, 0, 0);
    group.add(fanRing);

    return group;
  }

  static createDetailedSteeringWheel() {
    const group = new THREE.Group();
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.35 });
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 16, 32), rimMat);
    group.add(rim);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20), rimMat);
    hub.rotation.x = Math.PI / 2;
    group.add(hub);

    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 12), spokeMat);
      spoke.position.set(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0);
      spoke.rotation.z = angle - Math.PI / 2;
      group.add(spoke);
    });

    group.rotation.y = 0.35;
    return group;
  }

  static createDetailedWheel() {
    const group = new THREE.Group();
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.25 });
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4 });

    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.4, 32), tireMat);
    tire.rotation.x = Math.PI / 2;
    group.add(tire);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.42, 24), rimMat);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    const centerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16), hubMat);
    centerCap.rotation.x = Math.PI / 2;
    group.add(centerCap);

    return group;
  }

  // ============================================================================
  // 4. DETAYLI UZAY ROKETİ KILAVUZU VE PARÇALARI
  // ============================================================================
  static createRocketGuide() {
    const group = new THREE.Group();
    const guideMat = new THREE.MeshPhysicalMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.24,
      roughness: 0.3,
      depthWrite: false
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 2.8, 32), guideMat);
    body.position.set(0, 0.25, -0.25);
    group.add(body);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.74, 1.3, 32), guideMat);
    nose.position.set(0, 2.3, -0.25);
    group.add(nose);

    [-1.02, 1.02].forEach((x) => {
      const booster = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 1.15, 12, 20), guideMat);
      booster.position.set(x, -0.35, -0.25);
      group.add(booster);
    });

    return group;
  }

  static createRocketNoseCone() {
    const group = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.74, 1.25, 32), redMat);
    group.add(cone);

    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.18, 32), whiteMat);
    band.position.set(0, -0.54, 0);
    group.add(band);

    return group;
  }

  static createRocketCockpit() {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.15 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.2, clearcoat: 0.8 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.35 });

    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.1, 32), hullMat);
    group.add(hull);

    const windowFrame = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 16, 28), frameMat);
    windowFrame.position.set(0, 0.05, 0.68);
    group.add(windowFrame);

    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), glassMat);
    glass.position.set(0, 0.05, 0.56);
    group.add(glass);

    return group;
  }

  static createRocketFuelTank() {
    const group = new THREE.Group();
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.38 });
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.35 });

    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.48, 32), orangeMat);
    group.add(tank);

    [-0.45, 0.45].forEach((y) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.04, 12, 32), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y, 0);
      group.add(ring);
    });

    return group;
  }

  static createRocketBooster() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.32 });
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.32 });
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.15, 24), bodyMat);
    group.add(body);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.42, 24), tipMat);
    tip.position.set(0, 0.78, 0);
    group.add(tip);

    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 20), nozzleMat);
    nozzle.position.set(0, -0.68, 0);
    group.add(nozzle);

    return group;
  }

  static createRocketThruster() {
    const group = new THREE.Group();
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.65, roughness: 0.3 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.62, 0.65, 28), nozzleMat);
    group.add(bell);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.55, 20), flameMat);
    flame.rotation.x = Math.PI;
    flame.position.set(0, -0.5, 0);
    group.add(flame);

    return group;
  }

  // ============================================================================
  // 5. DETAYLI GÜNEŞ SİSTEMİ KILAVUZU VE GEZEGENLER
  // ============================================================================
  static createSolarSystemGuide() {
    const group = new THREE.Group();

    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), sunMat);
    sun.position.set(0, 0, -0.15);
    group.add(sun);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.32
    });
    const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 32), glowMat);
    sunGlow.position.set(0, 0, -0.15);
    group.add(sunGlow);

    const orbitRadii = [1.15, 1.55, 1.98, 2.4, 2.85];
    const orbitMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.25
    });

    orbitRadii.forEach((r) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.015, 8, 64), orbitMat);
      ring.position.set(0, 0, -0.2);
      group.add(ring);
    });

    return group;
  }

  static createPlanetMercury() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), mat);
    group.add(planet);
    return group;
  }

  static createPlanetVenus() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 28), mat);
    group.add(planet);
    return group;
  }

  static createPlanetEarth() {
    const group = new THREE.Group();
    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      clearcoat: 0.4
    });
    const landMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.55 });
    const moonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });

    const earth = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 28), oceanMat);
    group.add(earth);

    const cont1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), landMat);
    cont1.position.set(0.16, 0.12, 0.18);
    group.add(cont1);

    const cont2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), landMat);
    cont2.position.set(-0.18, -0.1, 0.2);
    group.add(cont2);

    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), moonMat);
    moon.position.set(0.54, 0.28, 0.1);
    group.add(moon);

    return group;
  }

  static createPlanetMars() {
    const group = new THREE.Group();
    const marsMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });

    const mars = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), marsMat);
    group.add(mars);

    const polarCap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), iceMat);
    polarCap.scale.set(1.2, 0.45, 1.2);
    polarCap.position.set(0, 0.24, 0);
    group.add(polarCap);

    return group;
  }

  static createPlanetJupiter() {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.45 });
    const spotMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    const jupiter = new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 32), baseMat);
    group.add(jupiter);

    [-0.18, 0.18].forEach((y) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.055, 12, 32), bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.set(0, y, 0);
      group.add(band);
    });

    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), spotMat);
    spot.scale.set(1.3, 0.8, 0.5);
    spot.position.set(0.15, -0.12, 0.46);
    group.add(spot);

    return group;
  }

  static createPlanetSaturn() {
    const group = new THREE.Group();
    const planetMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4
    });

    const saturn = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 28), planetMat);
    group.add(saturn);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.54, 0.88, 40), ringMat);
    ring.rotation.x = Math.PI / 2.4;
    ring.rotation.y = 0.25;
    group.add(ring);

    return group;
  }
}
