/**
 * Veri Odaklı (Data-Driven) Modül ve Parça Yapılandırması.
 * Yeni bir oyun modülü veya parça eklemek için çekirdek Three.js koduna dokunmadan
 * yalnızca bu dosyaya yeni bir nesne eklemeniz yeterlidir.
 */
export const MODULES_DATA = [
  {
    id: 'anatomy',
    title: 'İnsan Vücudu',
    icon: '🫀',
    description: 'Beyin, akciğerler, kalp, karaciğer, mide ve bağırsakları tam boy insan vücudunda doğru yerlerine yerleştir!',
    themeColor: '#ef4444',
    snapThreshold: 0.85,
    cameraPosition: [0, -0.25, 11.2],
    baseGuide: {
      modelUrl: null
    },
    parts: [
      {
        id: 'brain',
        name: 'Beyin',
        icon: '🧠',
        description: 'Kafatasımızın içinde yer alır; düşünmemizi, öğrenmemizi ve tüm vücudumuzu yönetmemizi sağlar.',
        modelUrl: null,
        color: 0xf4a27e,
        startPosition: { x: -4.4, y: 2.3, z: 0 },
        targetPosition: { x: 0, y: 2.75, z: 0.04 }
      },
      {
        id: 'lung_left',
        name: 'Sağ Akciğer',
        icon: '🫁',
        description: 'Soluk borusundan gelen temiz havadaki oksijeni kana aktarır ve karbondioksiti dışarı verir.',
        modelUrl: null,
        color: 0xec6b78,
        startPosition: { x: -4.4, y: 0.8, z: 0 },
        targetPosition: { x: -0.36, y: 0.78, z: 0.04 }
      },
      {
        id: 'lung_right',
        name: 'Sol Akciğer',
        icon: '🫁',
        description: 'Göğüs kafesimizin sol tarafında bulunur; kalbe yer açmak için iç kısmında özel bir kavisi vardır.',
        modelUrl: null,
        color: 0xec6b78,
        startPosition: { x: 4.4, y: 2.1, z: 0 },
        targetPosition: { x: 0.36, y: 0.78, z: 0.04 }
      },
      {
        id: 'heart',
        name: 'Kalp ve Ana Damarlar',
        icon: '❤️',
        description: 'İki akciğerin arasında durur; atardamar ve toplardamarlar ile tüm vücuda durmadan kan pompalar.',
        modelUrl: null,
        color: 0xd9383a,
        startPosition: { x: -4.4, y: -0.7, z: 0 },
        targetPosition: { x: 0.04, y: 0.58, z: 0.16 }
      },
      {
        id: 'liver',
        name: 'Karaciğer',
        icon: '🛡️',
        description: 'Diyaframın hemen altında sağ tarafta bulunur; kanı temizler, vitamin depolar ve safra üretir.',
        modelUrl: null,
        color: 0xa6637c,
        startPosition: { x: 4.4, y: 0.5, z: 0 },
        targetPosition: { x: -0.28, y: 0.16, z: 0.14 }
      },
      {
        id: 'stomach',
        name: 'Mide',
        icon: '🍎',
        description: 'Karaciğerin yanında yer alan J-şekilli kaslı kesedir; yediğimiz besinleri mide asidiyle sindirir.',
        modelUrl: null,
        color: 0xdf4b4b,
        startPosition: { x: 4.4, y: -1.1, z: 0 },
        targetPosition: { x: 0.2, y: 0.1, z: 0.18 }
      },
      {
        id: 'intestines',
        name: 'İnce ve Kalın Bağırsaklar',
        icon: '🌀',
        description: 'Karın boşluğunu doldurur; sindirilen besinlerdeki yararlı vitaminleri ve suyu kana emilimle kazandırır.',
        modelUrl: null,
        color: 0xd9737b,
        startPosition: { x: -4.4, y: -2.3, z: 0 },
        targetPosition: { x: 0, y: -0.52, z: 0.12 }
      }
    ]
  },
  {
    id: 'car_mechanic',
    title: 'Araba Tamiri',
    icon: '🚗',
    description: 'V6 motor bloğu, akü, radyatör, direksiyon ve tekerlekleri şasiye monte et!',
    themeColor: '#3b82f6',
    snapThreshold: 0.85,
    cameraPosition: [0, 0.4, 9.5],
    baseGuide: {
      modelUrl: null
    },
    parts: [
      {
        id: 'engine_block',
        name: 'V6 Motor Bloğu',
        icon: '⚙️',
        description: 'Motor, pistonları sayesinde yakıtı harekete dönüştüren arabanın kalbidir!',
        modelUrl: null,
        color: 0xef4444,
        startPosition: { x: -4.3, y: 1.9, z: 0 },
        targetPosition: { x: -1.15, y: 0.1, z: 0.1 }
      },
      {
        id: 'battery',
        name: 'Akü',
        icon: '🔋',
        description: 'Akü, marş motorunun çalışması ve farların yanması için elektrik enerjisi sağlar!',
        modelUrl: null,
        color: 0x22c55e,
        startPosition: { x: 4.3, y: 1.9, z: 0 },
        targetPosition: { x: -0.3, y: 0.12, z: 0.15 }
      },
      {
        id: 'radiator',
        name: 'Radyatör',
        icon: '❄️',
        description: 'Radyatör, çalışan motorun aşırı ısınmasını önler ve suyla soğutur!',
        modelUrl: null,
        color: 0x06b6d4,
        startPosition: { x: -4.3, y: 0.1, z: 0 },
        targetPosition: { x: -1.92, y: 0.05, z: 0.1 }
      },
      {
        id: 'steering_wheel',
        name: 'Direksiyon',
        icon: '🛞',
        description: 'Direksiyon, sürücünün ön tekerlekleri sağa ve sola yönlendirmesini sağlar!',
        modelUrl: null,
        color: 0xa855f7,
        startPosition: { x: 4.3, y: 0.1, z: 0 },
        targetPosition: { x: -0.25, y: 0.82, z: 0.2 }
      },
      {
        id: 'wheel_front',
        name: 'Ön Tekerlek',
        icon: '⚫',
        description: 'Ön tekerlekler arabanın yön değiştirmesini ve yola tutunmasını sağlar!',
        modelUrl: null,
        color: 0xf59e0b,
        startPosition: { x: -4.3, y: -1.7, z: 0 },
        targetPosition: { x: -1.35, y: -0.75, z: 0.35 }
      },
      {
        id: 'wheel_rear',
        name: 'Arka Tekerlek',
        icon: '⚫',
        description: 'Arka tekerlekler arabanın dengeli biçimde hızlanmasını sağlar!',
        modelUrl: null,
        color: 0xeab308,
        startPosition: { x: 4.3, y: -1.7, z: 0 },
        targetPosition: { x: 1.35, y: -0.75, z: 0.35 }
      }
    ]
  },
  {
    id: 'space_rocket',
    title: 'Uzay Roketi',
    icon: '🚀',
    description: 'Burun konisi, astronot kabini, yakıt tankı ve itici motorları birleştir!',
    themeColor: '#8b5cf6',
    snapThreshold: 0.85,
    cameraPosition: [0, 0.5, 9.5],
    baseGuide: {
      modelUrl: null
    },
    parts: [
      {
        id: 'nose_cone',
        name: 'Burun Konisi',
        icon: '🔺',
        description: 'Aerodinamik burun konisi roketin atmosferi hızla yararak yükselmesini sağlar!',
        modelUrl: null,
        color: 0xef4444,
        startPosition: { x: -4.2, y: 1.9, z: 0 },
        targetPosition: { x: 0, y: 2.3, z: 0 }
      },
      {
        id: 'cockpit_module',
        name: 'Astronot Kabini',
        icon: '👨‍🚀',
        description: 'Astronotların uzay yolculuğunda bulunduğu pencereli komuta modülü!',
        modelUrl: null,
        color: 0x38bdf8,
        startPosition: { x: 4.2, y: 1.9, z: 0 },
        targetPosition: { x: 0, y: 1.1, z: 0 }
      },
      {
        id: 'fuel_tank',
        name: 'Ana Yakıt Tankı',
        icon: '⛽',
        description: 'Roketin yerçekimini yenip uzaya çıkması için sıvı yakıt ve oksijen taşır!',
        modelUrl: null,
        color: 0xf97316,
        startPosition: { x: -4.2, y: 0.0, z: 0 },
        targetPosition: { x: 0, y: -0.22, z: 0 }
      },
      {
        id: 'booster_left',
        name: 'Sol İtici Roket',
        icon: '🔥',
        description: 'Yan itici roketler fırlatma anında devasa bir ek itiş gücü üretir!',
        modelUrl: null,
        color: 0xa855f7,
        startPosition: { x: -4.2, y: -1.8, z: 0 },
        targetPosition: { x: -1.02, y: -0.35, z: 0 }
      },
      {
        id: 'booster_right',
        name: 'Sağ İtici Roket',
        icon: '🔥',
        description: 'Sağ ve sol iticiler roketin dengeli biçimde yükselmesine yardım eder!',
        modelUrl: null,
        color: 0x8b5cf6,
        startPosition: { x: 4.2, y: 0.0, z: 0 },
        targetPosition: { x: 1.02, y: -0.35, z: 0 }
      },
      {
        id: 'thruster_nozzle',
        name: 'Ana Roket Motoru',
        icon: '⚡',
        description: 'Ana roket motoru sıcak gazları hızla püskürterek roketi uzaya fırlatır!',
        modelUrl: null,
        color: 0xfacc15,
        startPosition: { x: 4.2, y: -1.8, z: 0 },
        targetPosition: { x: 0, y: -1.32, z: 0 }
      }
    ]
  },
  {
    id: 'solar_system',
    title: 'Güneş Sistemi',
    icon: '🪐',
    description: 'Merkür, Venüs, Dünya, Mars, Jüpiter ve halkalı Satürn gezegenlerini Güneş etrafındaki yörüngelerine yerleştir!',
    themeColor: '#f59e0b',
    snapThreshold: 0.85,
    cameraPosition: [0, 0.2, 10.2],
    baseGuide: {
      modelUrl: null
    },
    parts: [
      {
        id: 'mercury',
        name: 'Merkür',
        icon: '🪨',
        description: 'Güneş\'e en yakın ve en küçük gezegendir; yüzeyi kraterlerle kaplıdır!',
        modelUrl: null,
        color: 0x94a3b8,
        startPosition: { x: -4.4, y: 2.0, z: 0 },
        targetPosition: { x: 0.85, y: 0.78, z: 0 }
      },
      {
        id: 'venus',
        name: 'Venüs',
        icon: '🌕',
        description: 'Kalın atmosferi nedeniyle Güneş sisteminin en sıcak ve en parlak gezegenidir!',
        modelUrl: null,
        color: 0xfbbf24,
        startPosition: { x: -4.4, y: 0.1, z: 0 },
        targetPosition: { x: -1.25, y: 0.92, z: 0 }
      },
      {
        id: 'earth',
        name: 'Dünya ve Ay',
        icon: '🌍',
        description: 'Üzerinde yaşadığımız, okyanusları ve kıtalarıyla yaşam barındıran mavi gezegenimiz!',
        modelUrl: null,
        color: 0x2563eb,
        startPosition: { x: -4.4, y: -1.8, z: 0 },
        targetPosition: { x: 1.55, y: -0.95, z: 0 }
      },
      {
        id: 'mars',
        name: 'Mars',
        icon: '🔴',
        description: 'Toprağındaki demir oksit nedeniyle Kızıl Gezegen olarak bilinir; kutuplarında buzullar vardır!',
        modelUrl: null,
        color: 0xea580c,
        startPosition: { x: 4.4, y: 2.0, z: 0 },
        targetPosition: { x: -1.85, y: -0.82, z: 0 }
      },
      {
        id: 'jupiter',
        name: 'Jüpiter',
        icon: '🟠',
        description: 'Güneş sisteminin en büyük dev gaz gezegenidir; üzerinde Büyük Kırmızı Leke fırtınası bulunur!',
        modelUrl: null,
        color: 0xd97706,
        startPosition: { x: 4.4, y: 0.1, z: 0 },
        targetPosition: { x: 0.0, y: 2.4, z: 0 }
      },
      {
        id: 'saturn',
        name: 'Satürn',
        icon: '🪐',
        description: 'Etrafındaki buz ve kayalardan oluşan muhteşem halkalarıyla ünlü dev gezegen!',
        modelUrl: null,
        color: 0xfacc15,
        startPosition: { x: 4.4, y: -1.8, z: 0 },
        targetPosition: { x: 0.0, y: -2.8, z: 0 }
      }
    ]
  }
];
