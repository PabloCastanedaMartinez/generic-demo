export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'cafe', label: 'Café de especialidad' },
  { id: 'pan', label: 'Panadería de horno' },
  { id: 'objetos', label: 'Objetos y mesa' }
];

export const STORE_INFO = {
  name: 'Bramadero — Tienda y Obrador Zona 4',
  address: 'Vía 4, Cuatro Grados Norte, Zona 4, Ciudad de Guatemala',
  hours: 'Martes a domingo, 07:30 a 19:00 h',
  modality: 'Reserva en línea · Entrega exclusiva en tienda física',
  paymentNote: 'Sin pagos ni envíos en la página (liquidación presencial al recoger en mostrador)'
};

export const TRACKING_INTERVAL_MS = 5 * 60 * 1000;

export const TRACKING_LABELS = [
  {
    key: 'recibida',
    title: 'Reserva recibida',
    detail: 'Folio registrado y stock apartado',
    milestone: '0 min'
  },
  {
    key: 'preparacion',
    title: 'En preparación',
    detail: 'Seleccionando y empacando en el obrador',
    milestone: '+5 min'
  },
  {
    key: 'lista',
    title: 'Lista en tienda',
    detail: 'Disponible para retirar en mostrador',
    milestone: '+10 min'
  },
  {
    key: 'entregado',
    title: 'Entregado en tienda',
    detail: 'Reserva entregada en tienda física',
    milestone: '+15 min'
  }
];

export const PRODUCTS = [
  {
    id: 'caja-cata',
    name: 'Caja de Cata 3 × 200 g',
    category: 'cafe',
    categoryLabel: 'Café de especialidad',
    price: 195,
    stock: 5,
    image: '/assets/img/photo-c70.jpg',
    alt: 'Tres cuencos blancos con granos de café en distintos perfiles de tueste sobre mesa clara',
    description: 'Tres bolsas de 200 g de Antigua, Huehuetenango y Acatenango en perfiles claro, medio y desarrollado.',
    today: true,
    variants: ['Grano entero', 'Molido filtro', 'Molido espresso'],
    specs: [
      ['Contenido neto', '600 g (3 × 200 g)'],
      ['Orígenes', 'Antigua, Huehuetenango y Acatenango'],
      ['Tueste', 'Martes de esta semana'],
      ['Notas en taza', 'Cacao, ciruela pasa y almendra']
    ]
  },
  {
    id: 'sierra-madre',
    name: 'Café Huehuetenango — Tueste Medio',
    category: 'cafe',
    categoryLabel: 'Café de especialidad',
    price: 115,
    stock: 6,
    image: '/assets/img/m147143898-1200.webp',
    alt: 'Calador de acero sosteniendo granos recién tostados frente al tambor de tueste',
    description: 'Lote lavado de 1,750 m s. n. m. con cuerpo sedoso para prensa francesa o cafetera de goteo.',
    today: true,
    variants: ['Grano entero (340 g)', 'Molido filtro (340 g)', 'Prensa francesa (340 g)'],
    specs: [
      ['Contenido neto', '340 g'],
      ['Región', 'San Pedro Necta, Huehuetenango'],
      ['Altitud', '1,750 m s. n. m.'],
      ['Notas en taza', 'Chocolate amargo y panela']
    ]
  },
  {
    id: 'microlote-oaxaca',
    name: 'Micro-lote Lavado de Acatenango',
    category: 'cafe',
    categoryLabel: 'Café de especialidad',
    price: 135,
    stock: 2,
    image: '/assets/img/m147143894-1200.webp',
    alt: 'Muestra de granos verdes y medio tostados tomada directamente del tambor de tueste',
    description: 'Tueste ligero de altura pensado para métodos de vertido manual V60, Chemex o Kalita.',
    today: false,
    variants: ['Grano entero (250 g)', 'Molido V60 / Chemex (250 g)'],
    specs: [
      ['Contenido neto', '250 g'],
      ['Variedad', 'Bourbon y Caturra'],
      ['Tueste', 'Ligero para filtrado'],
      ['Notas en taza', 'Mandarina, miel de caña y flor blanca']
    ]
  },
  {
    id: 'mezcla-casa',
    name: 'Mezcla de la Casa para Espresso',
    category: 'cafe',
    categoryLabel: 'Café de especialidad',
    price: 150,
    stock: 8,
    image: '/assets/img/m187311853-1200.webp',
    alt: 'Barista compactando café molido dentro de un portafiltro metálico junto a la máquina',
    description: 'Equilibrio dulce y estable de Atitlán y Fraijanes diseñado para extracciones con o sin leche.',
    today: true,
    variants: ['Grano entero (500 g)', 'Molido espresso (500 g)', 'Moka italiana (500 g)'],
    specs: [
      ['Contenido neto', '500 g'],
      ['Relación', '70 % lavado de Atitlán, 30 % natural'],
      ['Reposo sugerido', '7 días post-tueste'],
      ['Notas en taza', 'Avellana tostada y caramelo']
    ]
  },
  {
    id: 'hogaza-centeno',
    name: 'Hogaza de Centeno y Alcaravea',
    category: 'pan',
    categoryLabel: 'Panadería de horno',
    price: 58,
    stock: 4,
    image: '/assets/img/m33603672-1200.webp',
    alt: 'Hogazas de centeno espolvoreadas con semillas de alcaravea sobre el piso de piedra del horno',
    description: 'Fermentación lenta de 24 horas con masa madre de centeno molido a la piedra.',
    today: true,
    variants: ['Hogaza entera (850 g)', 'Rebanada gruesa (850 g)'],
    specs: [
      ['Peso horneado', '850 g'],
      ['Harinas', '60 % centeno integral, 40 % trigo'],
      ['Fermentación', '24 horas en frío'],
      ['Conservación', '5 días en bolsa de lino o papel']
    ]
  },
  {
    id: 'pan-campesino',
    name: 'Pan Campesino de Masa Madre',
    category: 'pan',
    categoryLabel: 'Panadería de horno',
    price: 48,
    stock: 7,
    image: '/assets/img/m33603558-1200.webp',
    alt: 'Charola de hogazas redondas de masa madre recién horneadas dentro del horno de piedra',
    description: 'Corteza crujiente dorada en piso refractario y miga abierta de acidez suave.',
    today: true,
    variants: ['Hogaza redonda (900 g)', 'Rebanada para mesa (900 g)'],
    specs: [
      ['Peso horneado', '900 g'],
      ['Hidratación', '78 %'],
      ['Ingredientes', 'Harina nacional, agua filtrada y sal marina'],
      ['Horneado', '06:30 h todos los días']
    ]
  },
  {
    id: 'desayuno-horno',
    name: 'Pack Desayuno de Horno y Taza',
    category: 'pan',
    categoryLabel: 'Panadería de horno',
    price: 110,
    stock: 3,
    image: '/assets/img/photo-c166.jpg',
    alt: 'Capuchino con canela en taza blanca acompañado de croissant recién horneado sobre mesa iluminada',
    description: 'Dos croissants de mantequilla fermentada con bolsa de 250 g de mezcla de la casa.',
    today: true,
    variants: ['Para 2 personas', 'Con jalea artesanal'],
    specs: [
      ['Contenido', '2 croissants de 95 g + 250 g de café'],
      ['Laminado', 'Mantequilla de pastura al 82 %'],
      ['Horneado', '07:00 h del día de recolección'],
      ['Alérgenos', 'Trigo, lácteos']
    ]
  },
  {
    id: 'hervidor-cobre',
    name: 'Hervidor de Cobre Cuello de Cisne',
    category: 'objetos',
    categoryLabel: 'Objetos y mesa',
    price: 560,
    stock: 2,
    image: '/assets/img/photo-c96.jpg',
    alt: 'Agua caliente vertida desde un hervidor de cobre cuello de cisne sobre un filtro de café',
    description: 'Flujo fino y controlado para extracciones manuales; base compatible con gas e inducción.',
    today: false,
    variants: ['Cobre cepillado (900 ml)', 'Cobre con asa nogal (900 ml)'],
    specs: [
      ['Capacidad útil', '900 ml'],
      ['Material', 'Cobre laminado con interior estañado'],
      ['Peso vacío', '620 g'],
      ['Compatibilidad', 'Gas, vitrocerámica e inducción']
    ]
  },
  {
    id: 'banneton-paja',
    name: 'Canasto de Fermentación Banneton',
    category: 'objetos',
    categoryLabel: 'Objetos y mesa',
    price: 185,
    stock: 4,
    image: '/assets/img/m37164269-1200.webp',
    alt: 'Masa de centeno fermentando en canastos tejidos de paja y mimbre sobre mesa de madera',
    description: 'Cesta tejida a mano con funda de lino crudo para formar hogazas de hasta 1 kg.',
    today: false,
    variants: ['Redondo 25 cm', 'Ovalado 28 cm'],
    specs: [
      ['Capacidad', 'Masas de 750 g a 1 kg'],
      ['Material', 'Paja y mimbre natural sin barniz'],
      ['Incluye', 'Funda lavable de lino sin blanquear'],
      ['Cuidado', 'Cepillar en seco después de cada uso']
    ]
  },
  {
    id: 'bitacora-cata',
    name: 'Bitácora de Cata Encuadernada a Mano',
    category: 'objetos',
    categoryLabel: 'Objetos y mesa',
    price: 220,
    stock: 3,
    image: '/assets/img/m162973523-1200.webp',
    mediaClass: 'product-media--book',
    alt: 'Manos de encuadernador dorando el lomo de una bitácora artesanal en prensa de madera',
    description: 'Cuaderno cosido a mano con papel algodón de 120 g para registrar moliendas, tiempos y recetas.',
    today: false,
    variants: ['Piel azul marino (160 pág.)', 'Lino crudo (160 pág.)'],
    specs: [
      ['Páginas', '160 páginas numeradas en papel algodón'],
      ['Encuadernado', 'Cosido a mano con lomo redondeado'],
      ['Formato', '14 × 21 cm apertura plana 180°'],
      ['Acabado', 'Grabado en hoja dorada en prensa manual']
    ]
  },
  {
    id: 'ramo-temporada',
    name: 'Ramo Botánico de Temporada',
    category: 'objetos',
    categoryLabel: 'Objetos y mesa',
    price: 160,
    stock: 5,
    image: '/assets/img/m138226686-1200.webp',
    alt: 'Ramo de flores y follaje fresco envuelto en papel kraft sostenido por una florista',
    description: 'Atado semanal con flores de corte de San Juan Sacatepéquez envuelto en papel kraft.',
    today: true,
    variants: ['Ramo mediano (12 tallos)', 'Ramo amplio (20 tallos)'],
    specs: [
      ['Duración estimada', '7 a 10 días en agua fresca'],
      ['Origen', 'Floricultores de San Juan Sacatepéquez'],
      ['Presentación', 'Papel kraft húmedo listo para florero'],
      ['Entrega', 'Recolección en tienda física (Zona 4)']
    ]
  },
  {
    id: 'atado-leucadendron',
    name: 'Atado de Leucadendron Seco',
    category: 'objetos',
    categoryLabel: 'Objetos y mesa',
    price: 130,
    stock: 0,
    image: '/assets/img/m183016636-1200.webp',
    alt: 'Detalle de brotes botánicos de leucadendron en tonos cobrizo y verde en cubeta de florería',
    description: 'Tallos de follaje cobrizo curados para secar en florero sin necesidad de agua.',
    today: false,
    variants: ['Atado de 8 tallos', 'Atado de 14 tallos'],
    specs: [
      ['Altura aproximada', '50 cm'],
      ['Conservación', 'Hasta 6 meses en interior seco'],
      ['Coloración', 'Cobrizo y verde oliva natural'],
      ['Embalaje', 'Caja rígida de cartón reciclado']
    ]
  }
];
