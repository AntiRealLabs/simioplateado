  const GALERIA_STATUS_ORDER = { disponible: 0, gestando: 1, irreal: 2, imposible: 3 };
  const GALERIA_GROUPS = [
    { family: 'grandes-mentes', titleKey: 'filter.family.greatMinds', copyKey: 'gallery.group.greatMinds' },
    { family: 'literatos', titleKey: 'filter.family.literatos', copyKey: 'gallery.group.literatos' },
    { family: 'objetos', titleKey: 'filter.family.objects', copyKey: 'gallery.group.objects' },
    { family: 'party-animals', titleKey: 'filter.family.partyAnimals', copyKey: 'gallery.group.partyAnimals' },
    { family: 'simiugs', titleKey: 'filter.family.simiugs', copyKey: 'gallery.group.simiugs' },
    { family: 'bocinas', titleKey: 'filter.family.speakers', copyKey: 'gallery.group.speakers' },
    { family: 'tuni', title: 'TUNI', copyKey: 'gallery.group.tuni' },
    { family: 'planti', title: 'PLANTI', copyKey: 'gallery.group.planti' },
    { family: 'colombia', title: 'COLOMBIA', copyKey: 'gallery.group.colombia' },
    { family: 'audio', title: 'AUDIO', copyKey: 'gallery.group.audio' },
    { family: 'otros', titleKey: 'filter.family.other', copyKey: 'gallery.group.other' },
    { family: 'wearables', title: 'WEARABLES', copyKey: 'gallery.group.wearables' }
  ];
  const GALERIA_FAMILY_ORDER = Object.fromEntries(GALERIA_GROUPS.map((grupo, index) => [grupo.family, index]));
  const GALERIA_GROUP_META = Object.fromEntries(GALERIA_GROUPS.map(grupo => [grupo.family, grupo]));
  const GALERIA_PRIORITY = {
    'pieza-superhombresito': 0,
    'pieza-marxito': 1,
    'pieza-traumin': 2,
    'pieza-jarron': 3,
    'pieza-camiseta-blanca': 4,
    'pieza-camiseta-negra': 5,
    'pieza-gorra': 6,
    'pieza-minidevenires': 7,
	    'pieza-arturito': 8,
	    'pieza-gramscito': 9,
	    'pieza-lacancito': 10,
	    'pieza-capitan-nausea': 11,
	    'pieza-agente-kafka': 12,
	    'pieza-bicho-k': 13,
	    'pieza-dostoiecito': 14,
	    'pieza-gabito': 15,
		    'pieza-poesito': 16,
		    'pieza-crafsito': 17,
		    'pieza-cthulito': 18,
		    'pieza-acefalo': 19,
		    'pieza-kowskito': 20,
		    'pieza-osito-wu-tang': 21,
		    'pieza-gotimonda': 21.5,
		    'pieza-vasija-atlas': 22,
		    'pieza-4-monos': 23,
		    'pieza-esponja-g': 24,
    'pieza-bunnivil': 25,
    'pieza-felpi': 26,
    'pieza-flow-eater': 27,
    'pieza-flowlamar': 28,
    'pieza-slimmy': 29,
	    'pieza-gorilla-bass': 30,
	    'pieza-surreal-cup': 31,
	    'pieza-goticup': 32,
	    'pieza-kubikup': 33,
	    'pieza-copa-de-la-vida': 34,
	    'pieza-bookup': 35,
    'pieza-sound-creature': 36,
    'pieza-visual-sounds': 37,
    'pieza-sonidos-del-alma': 38,
    'pieza-mental-sounds': 39,
    'pieza-vida-y-pena': 40
  };
  const GALERIA_AUTORES = new Set([
    'pieza-superhombresito',
    'pieza-marxito',
    'pieza-traumin',
    'pieza-minidevenires',
    'pieza-arturito',
    'pieza-gramscito',
    'pieza-lacancito',
    'pieza-capitan-nausea'
  ]);
  const galeriaFiltros = { availability: 'all', family: 'all' };

  function inferirDisponibilidad(pieza) {
    if (pieza.dataset.availability) return pieza.dataset.availability;
    if (pieza.classList.contains('imposible-tile')) return 'imposible';
    if (pieza.classList.contains('gestando')) return 'gestando';
    if (pieza.classList.contains('disponible')) return 'disponible';
    if (pieza.classList.contains('irreal')) return 'irreal';
    return 'irreal';
  }

  function inferirFamilia(pieza) {
    if (GALERIA_AUTORES.has(pieza.id)) return 'grandes-mentes';
    return pieza.dataset.family || 'otros';
  }

  function crearEncabezadoFamilia(family, total) {
    const meta = GALERIA_GROUP_META[family] || { family, title: family.toUpperCase(), copyKey: 'gallery.group.generic' };
    const grupo = document.createElement('div');
    grupo.className = 'catalogo-grupo';
    grupo.dataset.familyGroup = family;
    grupo.dataset.groupTotal = String(total);

    const titulo = document.createElement('h3');
    if (meta.titleKey) titulo.dataset.i18n = meta.titleKey;
    titulo.textContent = meta.titleKey ? t(meta.titleKey) : (meta.title || family.toUpperCase());

    const copy = document.createElement('p');
    if (meta.copyKey) copy.dataset.i18n = meta.copyKey;
    copy.textContent = meta.copyKey ? t(meta.copyKey) : '';

    const count = document.createElement('div');
    count.className = 'catalogo-grupo-count';
    count.dataset.groupCount = '';

    grupo.append(titulo, copy, count);
    return grupo;
  }

  function textoConteoGaleria(visible, total) {
    const unidadVisible = currentLang === 'en'
      ? `${visible === 1 ? 'piece' : 'pieces'}`
      : `${visible === 1 ? 'pieza' : 'piezas'}`;
    const unidadTotal = currentLang === 'en'
      ? `${total === 1 ? 'piece' : 'pieces'}`
      : `${total === 1 ? 'pieza' : 'piezas'}`;
    if (visible === total) return `${visible} ${unidadVisible}`;
    return currentLang === 'en'
      ? `${visible} of ${total} ${unidadTotal}`
      : `${visible} de ${total} ${unidadTotal}`;
  }

  function actualizarEtiquetasGruposGaleria(visiblesPorFamilia = {}) {
    document.querySelectorAll('.catalogo-grupo').forEach(grupo => {
      const total = Number(grupo.dataset.groupTotal || 0);
      const visible = visiblesPorFamilia[grupo.dataset.familyGroup] ?? total;
      const count = grupo.querySelector('[data-group-count]');
      if (count) count.textContent = textoConteoGaleria(visible, total);
    });
  }

  function disponibilidadInicialDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    const valor = (params.get('disponibilidad') || params.get('availability') || '').toLowerCase();
    return ['disponible', 'gestando', 'irreal', 'imposible'].includes(valor) ? valor : 'all';
  }

  function actualizarNavDisponibles() {
    const activo = galeriaFiltros.availability === 'disponible' && galeriaFiltros.family === 'all';
    document.querySelectorAll('[data-nav-available]').forEach(link => {
      if (activo) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function iniciarGaleriaCatalogo() {
    const catalogo = document.getElementById('galeria-catalogo');
    if (!catalogo || catalogo.dataset.ready === 'true') return;

    const fuentes = Array.from(document.querySelectorAll('[data-gallery-source]'));
    const piezas = fuentes.flatMap(grid => Array.from(grid.querySelectorAll('.pieza')));

    piezas.forEach((pieza, index) => {
      pieza.dataset.galleryIndex = String(index);
      pieza.dataset.availability = inferirDisponibilidad(pieza);
      pieza.dataset.family = inferirFamilia(pieza);
    });

    piezas.sort((a, b) => {
      const family = (GALERIA_FAMILY_ORDER[a.dataset.family] ?? 99) - (GALERIA_FAMILY_ORDER[b.dataset.family] ?? 99);
      if (family) return family;
      const status = (GALERIA_STATUS_ORDER[a.dataset.availability] ?? 99) - (GALERIA_STATUS_ORDER[b.dataset.availability] ?? 99);
      if (status) return status;
      const priority = (GALERIA_PRIORITY[a.id] ?? 99) - (GALERIA_PRIORITY[b.id] ?? 99);
      if (priority) return priority;
      return Number(a.dataset.galleryIndex) - Number(b.dataset.galleryIndex);
    });

    const totalPorFamilia = piezas.reduce((acc, pieza) => {
      const family = pieza.dataset.family || 'otros';
      acc[family] = (acc[family] || 0) + 1;
      return acc;
    }, {});
    let familiaActual = '';
    piezas.forEach(pieza => {
      const family = pieza.dataset.family || 'otros';
      if (family !== familiaActual) {
        catalogo.appendChild(crearEncabezadoFamilia(family, totalPorFamilia[family] || 0));
        familiaActual = family;
      }
      catalogo.appendChild(pieza);
    });
    fuentes.forEach(grid => grid.remove());
    document.querySelectorAll('[data-gallery-legacy]').forEach(section => {
      section.hidden = true;
    });

    document.querySelectorAll('[data-filter-type]').forEach(button => {
      button.addEventListener('click', () => {
        const tipo = button.dataset.filterType;
        if (!tipo) return;
        const valor = button.dataset.filterValue || 'all';
        const nuevoValor = galeriaFiltros[tipo] === valor && valor !== 'all' ? 'all' : valor;

        if (tipo === 'family') {
          galeriaFiltros.family = nuevoValor;
          if (nuevoValor !== 'all') galeriaFiltros.availability = 'all';
        }

        if (tipo === 'availability') {
          galeriaFiltros.availability = nuevoValor;
          if (nuevoValor !== 'all') galeriaFiltros.family = 'all';
        }

        actualizarGaleriaFiltrada();
      });
    });

    const disponibilidadUrl = disponibilidadInicialDesdeUrl();
    if (disponibilidadUrl !== 'all') {
      galeriaFiltros.availability = disponibilidadUrl;
      galeriaFiltros.family = 'all';
    }

    catalogo.dataset.ready = 'true';
    actualizarGaleriaFiltrada();
  }

  function actualizarGaleriaFiltrada() {
    const catalogo = document.getElementById('galeria-catalogo');
    if (!catalogo) return;
    const filtroFamilia = galeriaFiltros.family || 'all';
    const filtroDisponibilidad = filtroFamilia === 'all' ? galeriaFiltros.availability || 'all' : 'all';

    let visibles = 0;
    const visiblesPorFamilia = {};
    catalogo.querySelectorAll('.pieza').forEach(pieza => {
      const coincideDisponibilidad = filtroDisponibilidad === 'all' || pieza.dataset.availability === filtroDisponibilidad;
      const coincideFamilia = filtroFamilia === 'all' || pieza.dataset.family === filtroFamilia;
      const visible = coincideDisponibilidad && coincideFamilia;
      pieza.hidden = !visible;
      if (visible) {
        const family = pieza.dataset.family || 'otros';
        pieza.classList.add('is-visible');
        visibles += 1;
        visiblesPorFamilia[family] = (visiblesPorFamilia[family] || 0) + 1;
      }
    });

    catalogo.querySelectorAll('.catalogo-grupo').forEach(grupo => {
      const visibleCount = visiblesPorFamilia[grupo.dataset.familyGroup] || 0;
      grupo.hidden = visibleCount === 0;
    });
    actualizarEtiquetasGruposGaleria(visiblesPorFamilia);

    document.querySelectorAll('[data-filter-type]').forEach(button => {
      const tipo = button.dataset.filterType;
      const valor = button.dataset.filterValue || 'all';
      const active =
        (tipo === 'family' && valor === filtroFamilia) ||
        (tipo === 'availability' && valor === filtroDisponibilidad);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    actualizarNavDisponibles();

    const empty = document.querySelector('.catalogo-empty');
    if (empty) empty.hidden = visibles !== 0;
  }

  function iniciarMicrointeracciones() {
    iniciarGaleriaCatalogo();

    const targets = Array.from(document.querySelectorAll(
      '.pieza, .drop-header, .seccion-header, section.ensayos .titulo-seccion, section.about .titulo-seccion'
    ));
    const piezas = Array.from(document.querySelectorAll('.pieza'));
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    piezas.forEach((pieza, index) => {
      const entradaRot = ((index % 5) - 2) * 0.28;
      const hoverRot = ((index % 7) - 3) * 0.18;
      pieza.style.setProperty('--entrada-rot', `${entradaRot}deg`);
      pieza.style.setProperty('--hover-rot', `${hoverRot}deg`);
      pieza.style.setProperty('--entrada-delay', `${Math.min((index % 6) * 42, 210)}ms`);
    });

    if (reduceMotion) {
      targets.forEach(target => target.classList.add('is-visible'));
      return;
    }

    document.body.classList.add('motion-ready');

    if (!('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(target => observer.observe(target));
  }

  function iniciarVideosDiferidos() {
    document.querySelectorAll('[data-lazy-video]').forEach(wrapper => {
      const button = wrapper.querySelector('[data-video-src]');
      if (!button) return;
      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = button.dataset.videoSrc || '';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.title = button.dataset.videoTitle || 'Video Simio Plateado';
        wrapper.replaceChildren(iframe);
      }, { once: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarVideosDiferidos);
  } else {
    iniciarVideosDiferidos();
  }

  const LANG_STORAGE_KEY = 'simio-lang';
  const VIEW_STORAGE_KEY = 'simio-view';
  const ESPEJO_WIZARD_STORAGE_KEY = 'simio-espejo-wizard';
  let currentLang = 'es';
  let currentView = 'galeria';
  const FDM_RAW_COLOR = [0.88, 0.86, 0.81, 1];
  const SITE_BASE_URL = 'https://simioplateado.com';
	  const HOME = {
	    titulo: 'Simio Plateado',
	    img: 'assets/optimized/logo-simio-plateado-master.8465b6c28a.webp',
	    descripcion: 'Galeria web y tienda de piezas fisicas, wearables y existencias digitales de Simio Plateado.'
	  };
	  let literatoActual = null;
	  const LITERATOS = {
	    'agente-kafka': {
	      slug: 'agente-kafka',
		      code: 'AGENTE_KAFKA.v01',
		      title: 'AGENTE_KAFKA.v01',
		      titleImg: 'assets/optimized/processed/textos/agente-kafka.1d19a25cf1.webp',
	      state: 'IRREAL · existencia digital',
	      series: 'Literatos · cola curatorial',
	      subtitle: 'Pieza en cola / Serie literaria / Figura coleccionable',
	      concept: 'Autor convertido en pequeño expediente de oficina, con insecto mínimo y ansiedad sellada.',
	      production: 'No disponible para compra abierta: falta decidir nombre final, derechos, molde y tirada.',
	      caption: 'Estudio visual',
	      img: 'assets/optimized/processed/piezas/literatos/agente-kafka.6c3f1fee56.webp',
	      alt: 'AGENTE_KAFKA.v01'
	    },
	    'bicho-k': {
	      slug: 'bicho-k',
		      code: 'BICHO_K.v01',
		      title: 'BICHO_K.v01',
		      titleImg: 'assets/optimized/processed/textos/bicho-k.067c34a06c.webp',
	      state: 'IRREAL · existencia digital',
	      series: 'Literatos · metamorfosis',
	      subtitle: 'Pieza en cola / Serie literaria / Figura coleccionable',
	      concept: 'Variante kafkiana más mutada: cuerpo de trámite, caparazón y carpeta como órgano externo.',
	      production: 'Existe GLB web-ready y STL fuente; falta limpiar/validar si puede pasar a pieza física sin perder patas, caparazón o papeles.',
	      caption: 'Estudio visual',
	      img: 'assets/optimized/processed/piezas/literatos/bicho-k.5ff6cd79a3.webp',
	      model: 'assets/models/literatos/bicho-k.glb',
	      modelCaption: 'Modelo 3D web',
	      source3d: 'assets/models/literatos/bicho-k.stl',
	      alt: 'BICHO_K.v01'
	    },
		    'dostoiecito': {
		      slug: 'dostoiecito',
			      code: 'MINI_FIODOR.v01',
			      title: 'MINI_FIODOR.v01',
		      checkoutSlug: 'dostoiecito',
		      price: 'COP 230.000 · USD 58 ref. · pieza disponible',
		      state: 'Disponible · compra abierta',
		      series: 'Literatos · culpa y apuesta',
		      subtitle: 'Pieza física / Mini Fiodor / Drop 001',
		      concept: 'Mini Fiodor rosado, severo y portátil: hacha mínima, ficha de apuesta y toda la culpa convertida en pieza de escritorio.',
			      production: 'Compra segura vía Mercado Pago. Pieza FDM intervenida a mano en Medellín. Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
		      priceNote: 'Precio: COP 230.000. Referencia aproximada: USD 58. Mercado Pago procesa el cobro en COP.',
		      caption: 'Foto real del 3D',
		      img: 'assets/optimized/processed/piezas/literatos/dostoiecito-humillado-real.fd0f1bf1e4.webp',
		      imageVersion: '20260605-lit-real',
		      model: 'assets/models/literatos/dostoiecito.glb',
		      modelCaption: 'Modelo 3D web',
		      variants: [
		        { src: 'assets/optimized/processed/piezas/literatos/dostoiecito-gemini.32813294d8.webp', caption: 'Estudio alterno' }
		      ],
		      alt: 'MINI_FIODOR.v01 pieza fisica terminada'
		    },
		    'acefalo': {
		      slug: 'acefalo',
		      code: 'ACEFALO.v01',
		      title: 'ACEFALO.v01',
		      checkoutSlug: 'acefalo',
		      price: 'COP 200.000 · USD 50 ref. · pieza disponible',
		      state: 'Disponible · compra abierta',
		      series: 'Objetos · cuerpo ritual',
		      subtitle: 'Pieza física / Acéfalo / Drop 001',
		      concept: 'Figura rosa sin cabeza, con antorcha, daga y laberinto en el torso: un cuerpo ritual que parece haber escapado de su propio símbolo.',
		      production: 'Compra segura vía Mercado Pago. Pieza FDM intervenida a mano en Medellín. Medidas aproximadas: 25 cm alto x 20 cm ancho x 5 cm profundo. Esta unidad va sin caja. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
		      priceNote: 'Precio: COP 200.000. Referencia aproximada: USD 50. Mercado Pago procesa el cobro en COP.',
		      caption: 'Foto real del 3D',
		      img: 'assets/optimized/processed/piezas/acefalo/acefalo-real.1c164f7a64.webp',
		      imageVersion: '20260605-acefalo',
		      model: 'assets/models/acefalo.glb',
		      modelVersion: '20260605-acefalo3d',
		      modelCaption: 'Modelo 3D web',
		      keepMaterials: true,
		      cameraOrbit: '90deg 72deg 2.7m',
		      cameraTarget: '0m 0.55m 0m',
		      fieldOfView: '28deg',
		      variants: [
		        { src: 'assets/optimized/processed/piezas/acefalo/acefalo-detalle.15fb5f6069.webp', caption: 'Detalle de pieza y base', version: '20260605-acefalo' }
		      ],
		      alt: 'ACEFALO.v01 pieza fisica terminada'
		    },
		    'gabito': {
		      slug: 'gabito',
			      code: 'GABITO.v01',
			      title: 'GABITO.v01',
			      titleImg: 'assets/optimized/processed/textos/gabito.5ee18728ee.webp',
			      checkoutSlug: 'gabito',
			      price: 'COP 240.000 · USD 60 ref. · pieza disponible',
		      state: 'Disponible · compra abierta',
		      series: 'Literatos · trópico dorado',
		      subtitle: 'Pieza física / mariposas en órbita / Drop 001',
		      concept: 'Pequeño patriarca luminoso, medalla al pecho, café en mano y mariposas orbitando como clima propio.',
		      production: 'Compra segura vía Mercado Pago. Pieza FDM intervenida a mano en Medellín. Medidas aproximadas en caja: 16 cm alto x 10 cm ancho x 10 cm profundo. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
			      priceNote: 'Precio: COP 240.000. Referencia aproximada: USD 60. Mercado Pago procesa el cobro en COP.',
		      caption: 'Foto real del 3D',
		      img: 'assets/optimized/processed/piezas/literatos/gabito-real.4bb99783a9.webp',
			      imageVersion: '20260608-gabito-real',
		      model: 'assets/models/literatos/gabito.glb',
		      modelCaption: 'Modelo 3D web',
			      variants: [
			        { src: 'assets/optimized/processed/piezas/literatos/gabito.2df262ecb5.webp', caption: 'Estudio visual', version: '20260531-lit-white' }
			      ],
		      alt: 'GABITO.v01 pieza fisica terminada'
		    },
		    'poesito': {
		      slug: 'poesito',
		      code: 'POESITO.v01',
		      title: 'POESITO.v01',
		      checkoutSlug: 'poesito',
		      price: 'COP 230.000 · USD 58 ref. · pieza disponible',
		      state: 'Disponible · compra abierta',
		      series: 'Literatos · gótico tierno',
		      subtitle: 'Pieza física / corazón portátil / Drop 001',
		      concept: 'Figura dorada y melancólica con corazón anatómico portátil y sombra al hombro.',
			      production: 'Compra segura vía Mercado Pago. Pieza FDM intervenida a mano en Medellín. Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
		      priceNote: 'Precio: COP 230.000. Referencia aproximada: USD 58. Mercado Pago procesa el cobro en COP.',
		      caption: 'Foto real del 3D',
		      img: 'assets/optimized/processed/piezas/literatos/poesito-dorado-real.b5c4f4e1fb.webp',
		      imageVersion: '20260605-lit-real',
		      model: 'assets/models/literatos/poesito.glb',
		      modelCaption: 'Modelo 3D web',
	      variants: [
	        { src: 'assets/optimized/processed/piezas/literatos/poesito-lil.1f73ce4650.webp', caption: 'Micrófono' },
	        { src: 'assets/optimized/processed/piezas/literatos/poemo.9bf68b411f.webp', caption: 'Sombra' }
	      ],
	      alt: 'POESITO.v01'
	    },
	    'crafsito': {
	      slug: 'crafsito',
		      code: 'CRAFSITO.v01',
		      title: 'CRAFSITO.v01',
		      titleImg: 'assets/optimized/processed/textos/crafsito.f15338ce6c.webp',
	      state: 'IRREAL · existencia digital',
	      series: 'Literatos · rareza cósmica',
	      subtitle: 'Pieza en cola / Serie literaria / Figura coleccionable',
	      concept: 'Autor serio poseído por un acompañante abisal, sosteniendo un helado absurdo como si nada.',
	      production: 'No disponible para compra abierta: falta decidir si se separa de CTHULITO o nace como dupla.',
	      caption: 'Estudio visual',
	      img: 'assets/optimized/processed/piezas/literatos/crafsito.a15f3bc6bf.webp',
	      model: 'assets/models/literatos/crafsito.glb',
	      modelCaption: 'Modelo 3D web',
	      alt: 'CRAFSITO.v01'
	    },
	    'cthulito': {
		      slug: 'cthulito',
			      code: 'CTHULITO.v01',
			      title: 'CTHULITO.v01',
			      titleImg: 'assets/optimized/processed/textos/cthulito.55e42ee11e.webp',
			      state: 'Disponible · compra abierta',
		      series: 'Literatos · criatura abisal',
		      subtitle: 'Pieza física premium / criatura FDM intervenida / Drop 001',
			      concept: 'Criatura de altar pequeño, cuerpo dorado y brillo abisal: el monstruo como reliquia de bolsillo.',
			      production: 'Compra abierta: tirada inicial de 3 unidades, intervenidas y terminadas a mano en Medellín. Medidas aproximadas: 11 cm alto x 18,5 cm ancho x 16,5 cm profundo.',
			      caption: 'Foto real del 3D',
			      img: 'assets/optimized/processed/piezas/literatos/cthulito-dorado-real.9e06aeb454.webp',
			      imageVersion: '20260605-lit-real',
			      model: 'assets/models/literatos/cthulito.glb',
		      modelCaption: 'Modelo 3D web',
		      variants: [
		        { src: 'assets/optimized/processed/piezas/literatos/cthulito.daa3235bab.webp', caption: 'Diseño base' }
		      ],
		      alt: 'CTHULITO.v01'
		    },
	    'kowskito': {
	      slug: 'kowskito',
		      code: 'KOWSKITO.v01',
		      title: 'KOWSKITO.v01',
		      titleImg: 'assets/optimized/processed/textos/kowskito.521c7b86bb.webp',
	      state: 'IRREAL · existencia digital',
	      series: 'Literatos · resaca lírica',
	      subtitle: 'Pieza en cola / Serie literaria / Figura coleccionable',
	      concept: 'Poeta áspero de camisa blanca, lata, gato y papeles: antiheroísmo de escritorio.',
		      production: 'No disponible para compra abierta: requiere revisar nombre, derechos de imagen, textos visibles y marcas antes de producir.',
		      caption: 'Estudio visual',
		      img: 'assets/optimized/processed/piezas/literatos/kowskito.e19e65c5dd.webp',
		      alt: 'KOWSKITO.v01'
			    },
				    'quijotico': {
				      slug: 'quijotico',
				      code: 'QUIJOTICO.v01',
				      title: 'QUIJOTICO.v01',
				      checkoutSlug: 'quijotico',
				      price: 'COP 260.000 · USD 65 ref. · pieza disponible',
				      state: 'Disponible · compra abierta',
				      series: 'Literatos · caballería fantasma',
				      subtitle: 'Pieza física / caballero de lanza / Drop 001',
				      concept: 'Caballero dorado y vertical, con lanza finísima, escudo, rosa y una terquedad solemne ya convertida en pieza.',
				      production: 'Compra segura vía Mercado Pago. Pieza FDM intervenida a mano en Medellín, con lanza fina y alto nivel de detalle. Medidas finales por confirmar antes de despacho. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
				      priceNote: 'Precio: COP 260.000. Referencia aproximada: USD 65. Mercado Pago procesa el cobro en COP.',
				      caption: 'Foto real del 3D',
				      img: 'assets/optimized/processed/piezas/literatos/quijotico-real.b91f4030bf.webp',
				      imageVersion: '20260608-quijotico-real',
				      model: 'assets/models/literatos/quijotico.glb',
				      modelVersion: '20260607-quijotico3d',
				      modelCaption: 'Modelo 3D web',
				      cameraOrbit: '90deg 74deg 2.9m',
				      cameraTarget: '0m 0.75m 0m',
				      fieldOfView: '27deg',
				      variants: [
				        { src: 'assets/optimized/processed/piezas/literatos/quijotico.d7e56b71ed.webp', caption: 'Ilustración base', version: '20260607-quijotico' }
				      ],
				      alt: 'QUIJOTICO.v01 pieza fisica terminada'
				    }
			  };
  let partyAnimalActual = null;
  const PARTY_ANIMALS = {
    bunnivil: {
      slug: 'bunnivil',
      sondeoSlug: 'party-bunnivil-v01',
      code: 'BUNNIVIL.v01',
      title: 'BUNNIVIL.v01',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · sonido táctico',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Conejo blanco con altavoz blindado: ternura de guerra mínima para una fiesta que apunta de frente.',
      production: 'GLB web-ready cargado. Falta título handwritten, escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/bunnivil.6c468626bc.webp',
      model: 'assets/models/party-animals/bunnivil.glb',
      alt: 'BUNNIVIL.v01'
    },
    felpi: {
      slug: 'felpi',
      sondeoSlug: 'party-felpi-v01',
	      code: 'FELPI.v01',
	      title: 'FELPI.v01',
	      titleImg: 'assets/optimized/processed/textos/felpi.1fa75a2828.webp',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · ruido peludo',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Bola rosa coronada con speaker de boca: mascota de rave, grito suave y textura abrazable.',
	      production: 'GLB web-ready y título handwritten cargados. Falta decidir escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/felpi.ac82ffd3f4.webp',
      model: 'assets/models/party-animals/felpi.glb',
      alt: 'FELPI.v01'
    },
    'flow-eater': {
      slug: 'flow-eater',
      sondeoSlug: 'party-flow-eater-v01',
	      code: 'FLOW_EATER.v01',
	      title: 'FLOW_EATER.v01',
	      titleImg: 'assets/optimized/processed/textos/flow-eater.df45595274.webp',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · apetito de bajo',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Cerdito rosado abrazado a un parlante negro: se alimenta de beat y devuelve ternura saturada.',
	      production: 'GLB web-ready y título handwritten cargados. Falta decidir escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/flow-eater.e90e9d1e14.webp',
      model: 'assets/models/party-animals/flow-eater.glb',
      alt: 'FLOW_EATER.v01'
    },
    flowlamar: {
      slug: 'flowlamar',
      sondeoSlug: 'party-flowlamar-v01',
      code: 'FLOWLAMAR.v01',
      title: 'FLOWLAMAR.v01',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · flor de bajo',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Flor púrpura con cuerpo tentacular, bocina central y trompeta: planta nocturna para invocar bajos.',
      production: 'GLB web-ready cargado. Falta título handwritten, escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/flowlamar.0e0a962d62.webp',
      model: 'assets/models/party-animals/flowlamar.glb',
      variants: [
        { src: 'assets/optimized/processed/piezas/party-animals/flowlamar-alt.20d7ce5d1c.webp', caption: 'Estudio alterno' }
      ],
      alt: 'FLOWLAMAR.v01'
    },
    slimmy: {
      slug: 'slimmy',
      sondeoSlug: 'party-slimmy-v01',
	      code: 'SLIMMY.v01',
	      title: 'SLIMMY.v01',
	      titleImg: 'assets/optimized/processed/textos/slimmy.64993b1ab1.webp',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · baba amable',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Fantasma verde con speaker frontal: gelatina tímida, mirada perdida y volumen interno.',
	      production: 'GLB web-ready y título handwritten cargados. Falta decidir escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/slimmy.33e41d1b27.webp',
      model: 'assets/models/party-animals/slimmy.glb',
      alt: 'SLIMMY.v01'
    },
    'gorilla-bass': {
      slug: 'gorilla-bass',
      sondeoSlug: 'party-gorilla-bass-v01',
	      code: 'GORILLA_BASS.v01',
	      title: 'GORILLA_BASS.v01',
	      titleImg: 'assets/optimized/processed/textos/gorilla-bass.fdf85564c2.webp',
      state: 'Gestándose · modelo 3D listo',
      series: 'Party Animals · bajo selvático',
      subtitle: 'Party Animals / diseño animado + modelo 3D',
      concept: 'Gorila gris con cadena, gorra y bocina frontal: fuerza amable para cargar el bajo como amuleto.',
	      production: 'GLB web-ready y título handwritten cargados. Falta decidir escala, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/party-animals/gorilla-bass.c9ae5dac0f.webp',
      model: 'assets/models/party-animals/gorilla-bass.glb',
      alt: 'GORILLA_BASS.v01'
    },
    'sound-creature': {
      slug: 'sound-creature',
      sondeoSlug: 'bocina-sound-creature-v01',
      code: 'SOUND_CREATURE.v01',
      title: 'SOUND_CREATURE.v01',
      stateKey: 'state.partyAnimalGestando',
      actionTitle: 'Bocinas',
      series: 'Bocinas · criatura sonora',
      subtitle: 'Bocinas / imagen sin fondo + modelo 3D',
      concept: 'Boca monstruosa convertida en altar de sonido: una criatura que no canta, sino que deja salir ruido desde el centro.',
      production: 'Imagen sin fondo y GLB web-ready cargados. Falta validar escala, electrónica, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/bocinas/sound-creature.f69fc896b9.webp',
      imageVersion: '20260609-bocinas',
      model: 'assets/models/bocinas/sound-creature.glb',
      modelVersion: '20260609-bocinas',
      cameraTarget: '0m 0.55m 0m',
      fieldOfView: '28deg',
      alt: 'SOUND_CREATURE.v01'
    },
    'visual-sounds': {
      slug: 'visual-sounds',
      sondeoSlug: 'bocina-visual-sounds-v01',
      code: 'VISUAL_SOUNDS.v01',
      title: 'VISUAL_SOUNDS.v01',
      stateKey: 'state.partyAnimalGestando',
      actionTitle: 'Bocinas',
      series: 'Bocinas · ojo innombrable',
      subtitle: 'Bocinas / imagen sin fondo + modelo 3D',
      concept: 'Un ojo parlante sobre pedestal: mirar el sonido hasta que el centro también empiece a escucharte.',
      production: 'Imagen sin fondo y GLB web-ready cargados. Falta validar escala, electrónica, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/bocinas/visual-sounds.68cc06f535.webp',
      imageVersion: '20260609-bocinas',
      model: 'assets/models/bocinas/visual-sounds.glb',
      modelVersion: '20260609-bocinas',
      cameraTarget: '0m 0.5m 0m',
      fieldOfView: '28deg',
      alt: 'VISUAL_SOUNDS.v01'
    },
    'sonidos-del-alma': {
      slug: 'sonidos-del-alma',
      sondeoSlug: 'bocina-sonidos-del-alma-v01',
      code: 'SONIDOS_DEL_ALMA.v01',
      title: 'SONIDOS_DEL_ALMA.v01',
      stateKey: 'state.partyAnimalGestando',
      actionTitle: 'Bocinas',
      series: 'Bocinas · máscara de escucha',
      subtitle: 'Bocinas / imagen sin fondo + modelo 3D',
      concept: 'Máscara doliente con bocina en la boca: un objeto para que la pena tenga salida física y volumen.',
      production: 'Imagen sin fondo y GLB web-ready cargados. Falta validar escala, electrónica, material, acabado y tirada.',
      img: 'assets/optimized/processed/piezas/bocinas/sonidos-del-alma.05b87ccce6.webp',
      imageVersion: '20260609-bocinas',
      model: 'assets/models/bocinas/sonidos-del-alma.glb',
      modelVersion: '20260609-bocinas',
      cameraTarget: '0m 0.55m 0m',
      fieldOfView: '28deg',
      alt: 'SONIDOS_DEL_ALMA.v01'
    },
    'mental-sounds': {
      slug: 'mental-sounds',
      sondeoSlug: 'bocina-mental-sounds-v01',
      code: 'MENTAL_SOUNDS.v01',
      title: 'MENTAL_SOUNDS.v01',
      stateKey: 'state.visualOnly',
      actionTitle: 'Bocinas',
      series: 'Bocinas · cráneo translúcido',
      subtitle: 'Bocinas / imagen sin fondo',
      concept: 'Cráneo transparente con electrónica visible: una cabeza como vitrina sonora, entre reliquia y circuito.',
      production: 'Imagen sin fondo cargada. Falta ubicar el GLB correspondiente para activar visor 3D.',
      img: 'assets/optimized/processed/piezas/bocinas/mental-sounds.10979af1fe.webp',
      imageVersion: '20260609-bocinas',
      alt: 'MENTAL_SOUNDS.v01'
    },
    'vida-y-pena': {
      slug: 'vida-y-pena',
      sondeoSlug: 'vida-y-pena-v01',
      code: 'VIDA_Y_PENA.v01',
      title: 'VIDA_Y_PENA.v01',
      stateKey: 'state.printingTest',
      actionTitle: 'Vida y Pena',
      series: 'Objetos · Fatum et Dolor',
      subtitle: 'Estatua ritual / imagen sin fondo + modelo 3D',
      concept: 'Máscara abierta sobre arquitectura espinada: una pieza entre teatro, reliquia y duelo materializado.',
      production: 'Imagen sin fondo y GLB web-ready cargados. Pieza en impresión; falta validar medidas, acabado y precio final.',
      img: 'assets/optimized/processed/piezas/objetos/vida-y-pena.f76ff63174.webp',
      imageVersion: '20260609-vida-pena',
      model: 'assets/models/objetos/vida-y-pena.glb',
      modelVersion: '20260609-vida-pena',
      cameraTarget: '0m 0.7m 0m',
      cameraOrbit: '90deg 75deg 2.8m',
      fieldOfView: '26deg',
      alt: 'VIDA_Y_PENA.v01'
    }
  };
  let simiugActual = null;
  const SIMIUGS = {
    'surreal-cup': {
      slug: 'surreal-cup',
      sondeoSlug: 'simiug-surreal-cup-v01',
	      code: 'SURREAL_CUP.v01',
	      title: 'SURREAL_CUP.v01',
	      titleImg: 'assets/optimized/processed/textos/surreal-cup.875d91656d.webp',
      state: 'Gestándose · prototipo de objeto',
      series: 'Simiugs · tacto surreal',
      subtitle: 'Simiugs / taza imposible + estudio de doble vista',
      concept: 'Recipiente con mano, dedos, ojo y tentáculo: una taza que parece sostenerte de vuelta.',
	      production: 'Vista frontal, posterior, GLB web-ready y título handwritten cargados. Falta material, escala y tirada.',
      img: 'assets/optimized/processed/piezas/simiugs/surreal-cup.a076748487.webp',
      model: 'assets/models/simiugs/surreal-cup.glb',
      variants: [
        { src: 'assets/optimized/processed/piezas/simiugs/surreal-cup-back.ad382d94a9.webp', caption: 'Vista posterior' }
      ],
      alt: 'SURREAL_CUP.v01'
    },
    goticup: {
      slug: 'goticup',
      sondeoSlug: 'simiug-goticup-v01',
	      code: 'GOTICUP.v01',
	      title: 'GOTICUP.v01',
	      titleImg: 'assets/optimized/processed/textos/goticup.121781974b.webp',
      state: 'Gestándose · prototipo de objeto',
      series: 'Simiugs · gótico táctil',
      subtitle: 'Simiugs / taza imposible + estudio visual',
      concept: 'Dedos largos, relieve ornamental y asa ósea: una taza litúrgica para tomar sombra.',
	      production: 'Estudio visual, GLB web-ready y título handwritten cargados. Falta material, escala y tirada.',
      img: 'assets/optimized/processed/piezas/simiugs/goticup.00ca6b43f2.webp',
      model: 'assets/models/simiugs/goticup.glb',
      alt: 'GOTICUP.v01'
    },
    kubikup: {
      slug: 'kubikup',
      sondeoSlug: 'simiug-kubikup-v01',
	      code: 'KUBIKUP.v01',
	      title: 'KUBIKUP.v01',
	      titleImg: 'assets/optimized/processed/textos/kubikup.362b966374.webp',
      state: 'Gestándose · prototipo de objeto',
      series: 'Simiugs · geometría rota',
      subtitle: 'Simiugs / taza imposible + estudio visual',
      concept: 'Taza-cubo de planos quebrados, casi brutalista: recipiente para beber desde una maqueta mental.',
	      production: 'Estudio visual, GLB web-ready y título handwritten cargados. Falta material, escala y tirada.',
      img: 'assets/optimized/processed/piezas/simiugs/kubikup.b5153e2ad6.webp',
      model: 'assets/models/simiugs/kubikup.glb',
      alt: 'KUBIKUP.v01'
    },
    'copa-de-la-vida': {
      slug: 'copa-de-la-vida',
      sondeoSlug: 'simiug-copa-de-la-vida-v01',
	      code: 'COPA_DE_LA_VIDA.v01',
	      title: 'COPA_DE_LA_VIDA.v01',
	      titleImg: 'assets/optimized/processed/textos/copa-de-la-vida.2a3456e1e3.webp',
      state: 'Gestándose · prototipo de objeto',
      series: 'Simiugs · memento bebestible',
      subtitle: 'Simiugs / taza imposible + modelo 3D',
      concept: 'Cráneo tallado convertido en copa: memento mori doméstico para recordar que incluso beber es ritual.',
	      production: 'GLB web-ready y título handwritten cargados. Falta validación técnica, material, escala y tirada.',
      img: 'assets/optimized/processed/piezas/simiugs/copa-de-la-vida.a856979440.webp',
      model: 'assets/models/simiugs/copa-de-la-vida.glb',
      alt: 'COPA_DE_LA_VIDA.v01'
    },
    bookup: {
      slug: 'bookup',
      sondeoSlug: 'simiug-bookup-v01',
      code: 'BOOKUP.v01',
      title: 'BOOKUP.v01',
      state: 'Gestándose · prototipo de objeto',
      series: 'Simiugs · biblioteca bebible',
      subtitle: 'Simiugs / taza imposible + estudio visual',
      concept: 'Taza apilada como libros: biblioteca de mano para tomar café entre lomos imposibles.',
      production: 'Estudio visual cargado. Falta título handwritten, modelo 3D, material, escala y tirada.',
      img: 'assets/optimized/processed/piezas/simiugs/bookup.f512d87df6.webp',
      alt: 'BOOKUP.v01'
    }
  };
		  const STORE_META = {
    titulo: 'Tienda · Simio Plateado',
    img: 'assets/optimized/logo-simio-plateado-master.8465b6c28a.webp',
    descripcion: 'Vista tienda de Simio Plateado: piezas disponibles, piezas en produccion y procesos visibles de fabricacion.'
  };
  const ESPEJO_META = {
    titulo: 'ESPEJO PLATEADO · Simio Plateado',
    img: 'assets/optimized/processed/espejo/espejo-proceso-publico.4403d28c85.webp',
    descripcion: 'Servicio experimental de retrato fisico: envia una foto, elige una vista Simio Plateado y convierte la imagen en pieza.'
  };
  const ESPEJO_WIZARD_META = {
    titulo: 'Pedido ESPEJO PLATEADO · Simio Plateado',
    img: 'assets/optimized/processed/espejo/espejo-proceso-publico.4403d28c85.webp',
    descripcion: 'Formulario de pedido ESPEJO PLATEADO preparado para personalizar imagen, estilo, consentimiento y produccion.'
  };
  const GRACIAS_META = {
    titulo: 'Gracias · Simio Plateado',
    img: 'assets/optimized/logo-simio-plateado-master.8465b6c28a.webp',
    descripcion: 'Confirmacion de pago y estado de pedido de Simio Plateado.'
  };
  const ENCARGOS_META = {
    titulo: 'Encargos · Simio Plateado',
    img: 'assets/optimized/logo-simio-plateado-master.8465b6c28a.webp',
    descripcion: 'Carga una imagen y solicita una pieza personalizada impresa en 3D con cotizacion manual.'
  };
  const ENCARGOS_CREAR_META = {
    titulo: 'Crear encargo · Simio Plateado',
    img: 'assets/optimized/logo-simio-plateado-master.8465b6c28a.webp',
    descripcion: 'Formulario para enviar imagen, opciones y precio estimado de una pieza personalizada Simio Plateado.'
  };
  const ENCARGOS_INTENT_ENDPOINT = 'https://api.simioplateado.com/api/encargos/intent';
  const ENCARGOS_PREVIEW_ENDPOINT = 'https://api.simioplateado.com/api/encargos/preview';
  const ENCARGOS_TRIPO_TASK_ENDPOINT = 'https://api.simioplateado.com/api/encargos/tripo-task';
  const ENCARGOS_REQUEST_ENDPOINT = 'https://api.simioplateado.com/api/encargos/request';
  const LEGAL_META = {
    privacidad: {
      title: 'Política de privacidad',
      fullTitle: 'Política de privacidad · Simio Plateado',
      description: 'Política de tratamiento de datos personales y privacidad de Simio Plateado, sub-marca de Anti Real Labs S.A.S. en Colombia.',
      file: 'privacidad.html'
    },
    terminos: {
      title: 'Términos y condiciones',
      fullTitle: 'Términos y condiciones · Simio Plateado',
      description: 'Términos y condiciones de venta de piezas físicas y digitales de Simio Plateado.',
      file: 'terminos.html'
    },
    'uso-imagen': {
      title: 'Consentimiento de uso de imagen',
      fullTitle: 'Consentimiento de uso de imagen · Simio Plateado',
      description: 'Consentimiento explícito de uso de imagen para ESPEJO PLATEADO de Simio Plateado.',
      file: 'uso-imagen.html'
    }
  };
  const ROUTING = {
    'tuni': { modal: 'modal-tuni', modalSlug: 'tuni', scrollTo: 'pieza-tuni', titulo: 'TUNI.v01 · Simio Plateado', img: 'assets/optimized/processed/tuni-rosa.26dd99e083.webp' },
    'copa': { modal: 'modal-copa', modalSlug: 'copa', scrollTo: 'pieza-copa', titulo: 'COPA_CHISTE_COLOMBIA.v0 · Simio Plateado', img: 'assets/optimized/processed/copa-colombia.e5482d17ec.webp' },
	    'marxito': { modal: 'modal-marxito', modalSlug: 'marxito', scrollTo: 'pieza-marxito', titulo: 'MARXITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/marxito-fisico.6e99446f20.webp' },
	    'superhombresito': { modal: 'modal-superhombresito', modalSlug: 'superhombresito', scrollTo: 'pieza-superhombresito', titulo: 'NIETZSCHESITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nietzschesito-real.919c675cdb.webp' },
		    'osito-wu-tang': { modal: 'modal-osito-wu-tang', modalSlug: 'osito-wu-tang', scrollTo: 'pieza-osito-wu-tang', titulo: 'WU_TANG_OSITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nuevas/goti-monda-real.6d681e0f62.webp' },
		    'gotimonda': { modal: 'modal-gotimonda', modalSlug: 'gotimonda', scrollTo: 'pieza-gotimonda', titulo: 'GOTIMONDA.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nuevas/gotimonda-real.e4e93a15a4.webp', descripcion: 'GOTIMONDA.v01 en Simio Plateado: figura de armadura ceremonial con mascara elefante, modelo 3D listo y ficha en construccion.' },
		    'vasija-atlas': { modal: 'modal-vasija-atlas', modalSlug: 'vasija-atlas', scrollTo: 'pieza-vasija-atlas', titulo: 'VASIJA_ATLAS.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nuevas/mondigotica-real.85b8ded1af.webp' },
		    '4-monos': { modal: 'modal-4-monos', modalSlug: '4-monos', scrollTo: 'pieza-4-monos', titulo: '4_MONOS.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nuevas/juntitos-real.7d7ec34cee.webp' },
		    'esponja-g': { modal: 'modal-esponja-g', modalSlug: 'esponja-g', scrollTo: 'pieza-esponja-g', titulo: 'ESPONJA_G.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/nuevas/esponja-g-real.1a3da1919f.webp', descripcion: 'ESPONJA_G.v01 en Simio Plateado: figura fisica con fotografia real del 3D, diseno base y modelo 3D.' },
    'bunnivil': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'bunnivil', scrollTo: 'pieza-bunnivil', titulo: 'BUNNIVIL.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS.bunnivil.img, descripcion: 'Party Animals de Simio Plateado: BUNNIVIL.v01 como diseño animado con modelo 3D.' },
    'felpi': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'felpi', scrollTo: 'pieza-felpi', titulo: 'FELPI.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS.felpi.img, descripcion: 'Party Animals de Simio Plateado: FELPI.v01 como diseño animado con modelo 3D.' },
    'flow-eater': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'flow-eater', scrollTo: 'pieza-flow-eater', titulo: 'FLOW_EATER.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS['flow-eater'].img, descripcion: 'Party Animals de Simio Plateado: FLOW_EATER.v01 como diseño animado con modelo 3D.' },
    'flowlamar': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'flowlamar', scrollTo: 'pieza-flowlamar', titulo: 'FLOWLAMAR.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS.flowlamar.img, descripcion: 'Party Animals de Simio Plateado: FLOWLAMAR.v01 como diseño animado con modelo 3D.' },
    'slimmy': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'slimmy', scrollTo: 'pieza-slimmy', titulo: 'SLIMMY.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS.slimmy.img, descripcion: 'Party Animals de Simio Plateado: SLIMMY.v01 como diseño animado con modelo 3D.' },
    'gorilla-bass': { modal: 'modal-party-animal', modalSlug: 'party-animal', partyAnimal: 'gorilla-bass', scrollTo: 'pieza-gorilla-bass', titulo: 'GORILLA_BASS.v01 · Party Animals · Simio Plateado', img: PARTY_ANIMALS['gorilla-bass'].img, descripcion: 'Party Animals de Simio Plateado: GORILLA_BASS.v01 como diseño animado con modelo 3D.' },
    'sound-creature': { modal: 'modal-party-animal', modalSlug: 'bocinas', partyAnimal: 'sound-creature', scrollTo: 'pieza-sound-creature', titulo: 'SOUND_CREATURE.v01 · Bocinas · Simio Plateado', img: PARTY_ANIMALS['sound-creature'].img, descripcion: 'Bocinas de Simio Plateado: SOUND_CREATURE.v01 como criatura sonora con imagen sin fondo y modelo 3D.' },
    'visual-sounds': { modal: 'modal-party-animal', modalSlug: 'bocinas', partyAnimal: 'visual-sounds', scrollTo: 'pieza-visual-sounds', titulo: 'VISUAL_SOUNDS.v01 · Bocinas · Simio Plateado', img: PARTY_ANIMALS['visual-sounds'].img, descripcion: 'Bocinas de Simio Plateado: VISUAL_SOUNDS.v01 como ojo sonoro con imagen sin fondo y modelo 3D.' },
    'sonidos-del-alma': { modal: 'modal-party-animal', modalSlug: 'bocinas', partyAnimal: 'sonidos-del-alma', scrollTo: 'pieza-sonidos-del-alma', titulo: 'SONIDOS_DEL_ALMA.v01 · Bocinas · Simio Plateado', img: PARTY_ANIMALS['sonidos-del-alma'].img, descripcion: 'Bocinas de Simio Plateado: SONIDOS_DEL_ALMA.v01 como mascara de escucha con imagen sin fondo y modelo 3D.' },
    'mental-sounds': { modal: 'modal-party-animal', modalSlug: 'bocinas', partyAnimal: 'mental-sounds', scrollTo: 'pieza-mental-sounds', titulo: 'MENTAL_SOUNDS.v01 · Bocinas · Simio Plateado', img: PARTY_ANIMALS['mental-sounds'].img, descripcion: 'Bocinas de Simio Plateado: MENTAL_SOUNDS.v01 como craneo sonoro translucido en desarrollo.' },
    'vida-y-pena': { modal: 'modal-party-animal', modalSlug: 'vida-y-pena', partyAnimal: 'vida-y-pena', scrollTo: 'pieza-vida-y-pena', titulo: 'VIDA_Y_PENA.v01 · Simio Plateado', img: PARTY_ANIMALS['vida-y-pena'].img, descripcion: 'VIDA_Y_PENA.v01 en Simio Plateado: estatua ritual Fatum et Dolor con imagen sin fondo, modelo 3D e impresion en curso.' },
    'surreal-cup': { modal: 'modal-simiug', modalSlug: 'simiug', simiug: 'surreal-cup', scrollTo: 'pieza-surreal-cup', titulo: 'SURREAL_CUP.v01 · Simiugs · Simio Plateado', img: SIMIUGS['surreal-cup'].img, descripcion: 'Simiugs de Simio Plateado: SURREAL_CUP.v01 como taza-objeto en gestacion.' },
    'goticup': { modal: 'modal-simiug', modalSlug: 'simiug', simiug: 'goticup', scrollTo: 'pieza-goticup', titulo: 'GOTICUP.v01 · Simiugs · Simio Plateado', img: SIMIUGS.goticup.img, descripcion: 'Simiugs de Simio Plateado: GOTICUP.v01 como taza-objeto en gestacion.' },
    'kubikup': { modal: 'modal-simiug', modalSlug: 'simiug', simiug: 'kubikup', scrollTo: 'pieza-kubikup', titulo: 'KUBIKUP.v01 · Simiugs · Simio Plateado', img: SIMIUGS.kubikup.img, descripcion: 'Simiugs de Simio Plateado: KUBIKUP.v01 como taza-objeto en gestacion.' },
    'copa-de-la-vida': { modal: 'modal-simiug', modalSlug: 'simiug', simiug: 'copa-de-la-vida', scrollTo: 'pieza-copa-de-la-vida', titulo: 'COPA_DE_LA_VIDA.v01 · Simiugs · Simio Plateado', img: SIMIUGS['copa-de-la-vida'].img, descripcion: 'Simiugs de Simio Plateado: COPA_DE_LA_VIDA.v01 como taza-objeto con modelo 3D.' },
    'bookup': { modal: 'modal-simiug', modalSlug: 'simiug', simiug: 'bookup', scrollTo: 'pieza-bookup', titulo: 'BOOKUP.v01 · Simiugs · Simio Plateado', img: SIMIUGS.bookup.img, descripcion: 'Simiugs de Simio Plateado: BOOKUP.v01 como taza-objeto en gestacion.' },
		    'jarron': { modal: 'modal-jarron', modalSlug: 'jarron', scrollTo: 'pieza-jarron', titulo: 'KRAKEN_FLORERO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/jarron-pulpo.5b519f7efc.webp' },
    'dialoguin': { modal: 'modal-dialoguin', modalSlug: 'dialoguin', scrollTo: 'pieza-dialoguin', titulo: 'DIALOGUIN.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/dialoguin.d482ec9e85.webp' },
    'traumin': { modal: 'modal-traumin', modalSlug: 'traumin', scrollTo: 'pieza-traumin', titulo: 'TRAUMIN.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/traumin-real.6a3d19ab98.webp' },
    'mini-devenires': { modal: 'modal-minidevenires', modalSlug: 'minidevenires', scrollTo: 'pieza-minidevenires', titulo: 'MINI_DEVENIRES.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/mini-devenires.6e535dd819.webp' },
	    'arturito': { modal: 'modal-arturito', modalSlug: 'arturito', scrollTo: 'pieza-arturito', titulo: 'ARTURITO_EMO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/cola/arturito.6762d1fef9.webp' },
	    'gramscito': { modal: 'modal-gramscito', modalSlug: 'gramscito', scrollTo: 'pieza-gramscito', titulo: 'GRAMSCITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/cola/gramscito.c041dbb3a4.webp' },
	    'lacancito': { modal: 'modal-lacancito', modalSlug: 'lacancito', scrollTo: 'pieza-lacancito', titulo: 'LACANCITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/cola/lacanito.7973c251c0.webp' },
	    'capitan-nausea': { modal: 'modal-capitan-nausea', modalSlug: 'capitan-nausea', scrollTo: 'pieza-capitan-nausea', titulo: 'CAPITAN_NAUSEA.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/cola/capitan-nausin.146b8ec966.webp' },
	    'agente-kafka': { modal: 'modal-literato', modalSlug: 'literato', literato: 'agente-kafka', scrollTo: 'pieza-agente-kafka', titulo: 'AGENTE_KAFKA.v01 · Simio Plateado', img: LITERATOS['agente-kafka'].img, descripcion: 'Estudio literario de Simio Plateado: AGENTE_KAFKA.v01 en cola curatorial.' },
	    'bicho-k': { modal: 'modal-literato', modalSlug: 'literato', literato: 'bicho-k', scrollTo: 'pieza-bicho-k', titulo: 'BICHO_K.v01 · Simio Plateado', img: LITERATOS['bicho-k'].img, descripcion: 'Estudio literario de Simio Plateado: BICHO_K.v01 en cola curatorial.' },
		    'mini-fiodor': { modal: 'modal-literato', modalSlug: 'dostoiecito', literato: 'dostoiecito', scrollTo: 'pieza-dostoiecito', titulo: 'MINI_FIODOR.v01 · Simio Plateado', img: LITERATOS.dostoiecito.img, descripcion: 'MINI_FIODOR.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, 18 cm alto x 11 cm ancho x 11 cm profundo, compra abierta por Mercado Pago.' },
		    'dostoiecito': { modal: 'modal-literato', modalSlug: 'dostoiecito', literato: 'dostoiecito', scrollTo: 'pieza-dostoiecito', titulo: 'MINI_FIODOR.v01 · Simio Plateado', img: LITERATOS.dostoiecito.img, descripcion: 'MINI_FIODOR.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, 18 cm alto x 11 cm ancho x 11 cm profundo, compra abierta por Mercado Pago.' },
		    'acefalo': { modal: 'modal-literato', modalSlug: 'acefalo', literato: 'acefalo', scrollTo: 'pieza-acefalo', titulo: 'ACEFALO.v01 · Simio Plateado', img: LITERATOS.acefalo.img, descripcion: 'ACEFALO.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, 25 cm alto x 20 cm ancho x 5 cm profundo, sin caja y con compra abierta por Mercado Pago.' },
		    'gabito': { modal: 'modal-literato', modalSlug: 'literato', literato: 'gabito', scrollTo: 'pieza-gabito', titulo: 'GABITO.v01 · Simio Plateado', img: LITERATOS.gabito.img, descripcion: 'GABITO.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, medidas aproximadas en caja 16 cm alto x 10 cm ancho x 10 cm profundo, compra abierta por Mercado Pago.' },
			    'poesito': { modal: 'modal-literato', modalSlug: 'literato', literato: 'poesito', scrollTo: 'pieza-poesito', titulo: 'POESITO.v01 · Simio Plateado', img: LITERATOS.poesito.img, descripcion: 'POESITO.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, 18 cm alto x 11 cm ancho x 11 cm profundo, compra abierta por Mercado Pago.' },
		    'crafsito': { modal: 'modal-literato', modalSlug: 'literato', literato: 'crafsito', scrollTo: 'pieza-crafsito', titulo: 'CRAFSITO.v01 · Simio Plateado', img: LITERATOS.crafsito.img, descripcion: 'Estudio literario de Simio Plateado: CRAFSITO.v01 en cola curatorial.' },
			    'cthulito': { modal: 'modal-cthulito', modalSlug: 'cthulito', scrollTo: 'pieza-cthulito', titulo: 'CTHULITO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/literatos/cthulito-dorado-real.9e06aeb454.webp', descripcion: 'CTHULITO.v01 disponible en Simio Plateado: pieza FDM intervenida, 11 cm alto x 18,5 cm ancho x 16,5 cm profundo, tirada inicial de 3 unidades.' },
		    'kowskito': { modal: 'modal-literato', modalSlug: 'literato', literato: 'kowskito', scrollTo: 'pieza-kowskito', titulo: 'KOWSKITO.v01 · Simio Plateado', img: LITERATOS.kowskito.img, descripcion: 'Estudio literario de Simio Plateado: KOWSKITO.v01 en cola curatorial.' },
			    'quijotico': { modal: 'modal-literato', modalSlug: 'quijotico', literato: 'quijotico', scrollTo: 'pieza-quijotico', titulo: 'QUIJOTICO.v01 · Simio Plateado', img: LITERATOS.quijotico.img, descripcion: 'QUIJOTICO.v01 disponible en Simio Plateado: pieza FDM intervenida a mano, con lanza fina, modelo 3D web y compra abierta por Mercado Pago.' },
		    'planti-punk': { modal: 'modal-punk', modalSlug: 'punk', scrollTo: 'pieza-punk', titulo: 'PLANTI_PUNK.v01 · Simio Plateado', img: 'assets/optimized/inline/inline-png.4b5aa81683.webp' },
    'planti-punk-xl': { modal: 'modal-punk-xl', modalSlug: 'punk-xl', scrollTo: 'pieza-punk-xl', titulo: 'PLANTI_PUNK_XL.v01 · Simio Plateado', img: 'assets/optimized/inline/inline-png.7d9020e4c2.webp' },
    'planti-k': { modal: 'modal-k', modalSlug: 'k', scrollTo: 'pieza-k', titulo: 'PLANTI_K.v01 · Simio Plateado', img: 'assets/optimized/inline/inline-png.6fbf53ab2d.webp' },
    'planti-k-xl': { modal: 'modal-k-xl', modalSlug: 'k-xl', scrollTo: 'pieza-k-xl', titulo: 'PLANTI_K_XL.v01 · Simio Plateado', img: 'assets/optimized/inline/inline-png.554deed3bf.webp' },
    'wearables/camiseta-blanca': { modal: 'modal-camiseta-blanca', modalSlug: 'camiseta-blanca', scrollTo: 'pieza-camiseta-blanca', titulo: 'Camiseta blanca · Simio Plateado', img: 'assets/optimized/processed/piezas/camiseta-blanca.d0f7c7a2d3.webp' },
    'wearables/camiseta-negra': { modal: 'modal-camiseta-negra', modalSlug: 'camiseta-negra', scrollTo: 'pieza-camiseta-negra', titulo: 'Camiseta negra · Simio Plateado', img: 'assets/optimized/processed/piezas/camiseta-negra.b150fa99db.webp' },
    'wearables/gorra': { modal: 'modal-gorra', modalSlug: 'gorra', scrollTo: 'pieza-gorra', titulo: 'Gorra · Simio Plateado', img: 'assets/optimized/processed/piezas/gorra.9a0b97599e.webp' },
    'wearables/parchao': { modal: 'modal-parchao', modalSlug: 'parchao', scrollTo: 'pieza-parchao', titulo: 'PARCHAO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/parchao.5197c0bd0a.webp' },
    'wearables/melisimo': { modal: 'modal-melisimo', modalSlug: 'melisimo', scrollTo: 'pieza-melisimo', titulo: 'MELISIMO.v01 · Simio Plateado', img: 'assets/optimized/processed/piezas/melisimo.6b6c95e8b6.webp' },
    'imposible/audio-antropos': { modal: null, scrollTo: 'pieza-audio-antropos', titulo: 'AUDIO.ANTROPOS.v02 · Simio Plateado · Imposible', img: 'assets/optimized/processed/piezas/audifonos-tribu.5537195ddf.webp' },
    'imposible/audio-neo': { modal: null, scrollTo: 'pieza-audio-neo', titulo: 'AUDIO.NEO.v02 · Simio Plateado · Imposible', img: 'assets/optimized/processed/piezas/audifonos-neo.beaf26a250.webp' },
    'imposible/audio-oimis': { modal: null, scrollTo: 'pieza-audio-oimis', titulo: 'AUDIO.OIMIS.v02 · Simio Plateado · Imposible', img: 'assets/optimized/processed/piezas/audifonos-simio.1c19f1a2ec.webp' }
  };
  const ROUTE_ALIASES = {
    'punk': 'planti-punk',
    'punk-xl': 'planti-punk-xl',
    'k': 'planti-k',
    'k-xl': 'planti-k-xl',
    'minidevenires': 'mini-devenires',
    'kraken': 'jarron',
    'kraken-v01': 'jarron',
    'kraken-florero': 'jarron',
	    'kraken-florero-v01': 'jarron',
	    'jarron-pulpo': 'jarron',
	    'jarron-pulpo-v01': 'jarron',
	    'goti-monda': 'gotimonda',
	    'goti-monda-v01': 'gotimonda',
	    'gotimonda-v01': 'gotimonda',
	    'monda-goti': 'gotimonda',
	    'wu-tang-osito': 'osito-wu-tang',
	    'wu-tang-osito-v01': 'osito-wu-tang',
	    'osito-wu-tang-v01': 'osito-wu-tang',
	    'esponja-g-v01': 'esponja-g',
	    'sponja-g': 'esponja-g',
	    'sponja-g-v01': 'esponja-g',
	    'bob-esponja-gangster': 'esponja-g',
	    'bob-gangster': 'esponja-g',
	    'mondigotica': 'vasija-atlas',
	    'mondigotica-v01': 'vasija-atlas',
	    'atlas': 'vasija-atlas',
	    'vasija': 'vasija-atlas',
	    'vasija-atlas-v01': 'vasija-atlas',
		    'juntitos': '4-monos',
		    'juntitos-v01': '4-monos',
		    'cuatro-monos': '4-monos',
		    '4-monos-v01': '4-monos',
		    'anti-minis': '4-monos',
    'bunnivil-v01': 'bunnivil',
    'felpi-v01': 'felpi',
    'flow-eater-v01': 'flow-eater',
    'floweater': 'flow-eater',
    'floweater-v01': 'flow-eater',
    'flowlamar-v01': 'flowlamar',
    'slimmy-v01': 'slimmy',
    'gorilla-bass-v01': 'gorilla-bass',
    'gorila-bass': 'gorilla-bass',
    'gorila-bass-v01': 'gorilla-bass',
    'sound-creature-v01': 'sound-creature',
    'criatura-sonora': 'sound-creature',
    'visual-sounds-v01': 'visual-sounds',
    'sonidos-del-alma-v01': 'sonidos-del-alma',
    'sonidos-alma': 'sonidos-del-alma',
    'mental-sounds-v01': 'mental-sounds',
    'vida-y-pena-v01': 'vida-y-pena',
    'fatum-et-dolor': 'vida-y-pena',
    'fatum-dolor': 'vida-y-pena',
    'surreal-cup-v01': 'surreal-cup',
    'surrealcup': 'surreal-cup',
    'goticup-v01': 'goticup',
    'goti-cup': 'goticup',
    'goti-cup-v01': 'goticup',
    'kubikup-v01': 'kubikup',
    'kubi-cup': 'kubikup',
    'kubi-cup-v01': 'kubikup',
    'copa-vida': 'copa-de-la-vida',
    'copa-de-la-vida-v01': 'copa-de-la-vida',
    'bookup-v01': 'bookup',
    'book-cup': 'bookup',
    'book-cup-v01': 'bookup',
		    'arturito-emo': 'arturito',
    'arturito-emo-v01': 'arturito',
	    'sintomin': 'lacancito',
	    'sintomin-v01': 'lacancito',
	    'lacanito': 'lacancito',
	    'lacanito-v01': 'lacancito',
	    'capitan-nausea-v01': 'capitan-nausea',
	    'kafka': 'agente-kafka',
	    'kafkita': 'agente-kafka',
	    'agente-kafka-v01': 'agente-kafka',
	    'bicho-k-v01': 'bicho-k',
	    'dosto': 'mini-fiodor',
	    'dostoievsky': 'mini-fiodor',
	    'dostoiecito-v01': 'mini-fiodor',
	    'mini-fiodor-v01': 'mini-fiodor',
	    'mini-fyodor': 'mini-fiodor',
	    'mini-fyodor-v01': 'mini-fiodor',
	    'acefalo-v01': 'acefalo',
	    'acéfalo': 'acefalo',
	    'acéfalo-v01': 'acefalo',
	    'gabito-v01': 'gabito',
	    'poe': 'poesito',
	    'poesito-v01': 'poesito',
	    'crafsito-v01': 'crafsito',
		    'cthulito-v01': 'cthulito',
		    'bukowski': 'kowskito',
		    'kowskito-v01': 'kowskito',
		    'quijote': 'quijotico',
		    'quijotico-v01': 'quijotico',
		    'don-quijote': 'quijotico',
		    'camiseta-blanca': 'wearables/camiseta-blanca',
    'camiseta-negra': 'wearables/camiseta-negra',
    'gorra': 'wearables/gorra',
    'parchao': 'wearables/parchao',
    'melisimo': 'wearables/melisimo'
  };
  const TUNI_MODELOS = {
    negra: {
      src: 'assets/models/tuni-negra.glb?v=20260519',
      code: 'TUNI.v01.NEGRA',
      subtitle: 'Pieza 03 / Drop 001 / Dispositivo · variante NEGRA',
      alt: 'Modelo 3D monocromatico de TUNI negra'
    },
    blanca: {
      src: 'assets/models/tuni-blanca.glb?v=20260519',
      code: 'TUNI.v01.BLANCA',
      subtitle: 'Pieza 03 / Drop 001 / Dispositivo · variante BLANCA',
      alt: 'Modelo 3D monocromatico de TUNI blanca'
    },
    rosa: {
      src: 'assets/models/tuni-rosa.glb?v=20260519',
      code: 'TUNI.v01.ROSA',
      subtitle: 'Pieza 03 / Drop 001 / Dispositivo · variante ROSA',
      alt: 'Modelo 3D monocromatico de TUNI rosa'
    }
  };

  function normalizarPath(path = '') {
    return path.replace(/^\/+|\/+$/g, '');
  }

  function limpiarSlug(slug = '') {
    let clean = normalizarPath(slug);
    if (clean === 'en') clean = '';
    clean = clean.replace(/^en\//, '');
    if (
      clean === 'gracias' ||
      clean === 'encargos' ||
      clean === 'encargos/crear' ||
      /^legal\/(privacidad|terminos|uso-imagen)$/.test(clean)
    ) return '';
    clean = clean.replace(/^galeria\/?/, '');
    clean = clean.replace(/^tienda\/?/, '');
    if (clean === 'espejo' || clean === 'espejo/pedido' || clean === 'espejo-pedido') return clean;
    return ROUTE_ALIASES[clean] || clean;
  }

  function estadoPathActual() {
    const raw = normalizarPath(window.location.pathname);
    const isEnglish = raw === 'en' || raw.startsWith('en/');
    const localPath = isEnglish ? raw.replace(/^en\/?/, '') : raw;
    const parts = localPath.split('/').filter(Boolean);
    let view = 'galeria';
    let storePage = 'grid';
    let slug = '';

    if (esRutaEspecialPath(window.location.pathname)) {
      return { isEnglish, view, storePage, slug };
    }

    if (parts[0] === 'tienda') {
      view = 'tienda';
      const rest = parts.slice(1).join('/');
      if (rest === 'espejo') {
        storePage = 'espejo';
        slug = 'espejo';
      } else if (rest === 'espejo/pedido') {
        storePage = 'espejo-pedido';
        slug = 'espejo/pedido';
      } else {
        slug = limpiarSlug(rest);
      }
    } else if (parts[0] === 'galeria') {
      slug = limpiarSlug(parts.slice(1).join('/'));
    } else {
      slug = limpiarSlug(localPath);
    }

    return { isEnglish, view, storePage, slug };
  }

  function prefijoIdiomaActual() {
    const { isEnglish } = estadoPathActual();
    if (isEnglish || currentLang === 'en') return '/en';
    return '';
  }

  function pathVista(view = currentView, storePage = 'grid') {
    const prefix = prefijoIdiomaActual();
    if (view === 'tienda') {
      if (storePage === 'espejo') return `${prefix}/tienda/espejo`.replace(/\/+/g, '/');
      if (storePage === 'espejo-pedido') return `${prefix}/tienda/espejo/pedido`.replace(/\/+/g, '/');
      return `${prefix}/tienda`.replace(/\/+/g, '/');
    }
    return `${prefix}/galeria`.replace(/\/+/g, '/');
  }

  function pathParaSlug(slug) {
    const prefix = prefijoIdiomaActual();
    const canonicalSlug = limpiarSlug(slug);
    const base = currentView === 'tienda' ? 'tienda' : 'galeria';
    return `${prefix}/${base}/${canonicalSlug}`.replace(/\/+/g, '/');
  }

  function homePathActual() {
    return pathVista(currentView);
  }

  function metaParaVista(view, storePage = 'grid') {
    if (view === 'tienda' && storePage === 'espejo') return ESPEJO_META;
    if (view === 'tienda' && storePage === 'espejo-pedido') return ESPEJO_WIZARD_META;
    if (view === 'tienda') return STORE_META;
    return HOME;
  }

  function setVista(view = 'galeria', opts = {}) {
    const safeView = view === 'tienda' ? 'tienda' : 'galeria';
    const storePage = opts.storePage || 'grid';
    currentView = safeView;
    document.body.dataset.currentView = safeView;
    localStorage.setItem(VIEW_STORAGE_KEY, safeView);

    document.querySelectorAll('[data-view-link]').forEach(btn => {
      const activo = btn.dataset.viewLink === safeView;
      btn.classList.toggle('activo', activo);
      if (activo) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    document.querySelectorAll('[data-store-page]').forEach(page => {
      page.hidden = !(safeView === 'tienda' && page.dataset.storePage === storePage);
    });

    if (!opts.keepMeta) actualizarMetaTags(metaParaVista(safeView, storePage));
    if (safeView === 'tienda' && opts.scroll !== false) {
      document.getElementById('tienda')?.scrollIntoView({ behavior: opts.behavior || 'smooth', block: 'start' });
    }
    if (typeof renderEspejoWizard === 'function') renderEspejoWizard();
  }

  function navegarVista(view) {
    ocultarRutaEspecial();
    cerrarModalesVisualmente();
    const safeView = view === 'tienda' ? 'tienda' : 'galeria';
    const nextPath = pathVista(safeView);
    if (window.location.pathname !== nextPath) history.pushState({ view: safeView }, '', nextPath);
    setVista(safeView, { storePage: 'grid' });
  }

  function navegarTiendaEspecial(page = 'grid') {
    ocultarRutaEspecial();
    cerrarModalesVisualmente();
    const storePage = page === 'espejo-pedido' ? 'espejo-pedido' : (page === 'espejo' ? 'espejo' : 'grid');
    const nextPath = pathVista('tienda', storePage);
    if (window.location.pathname !== nextPath) history.pushState({ view: 'tienda', storePage }, '', nextPath);
    setVista('tienda', { storePage });
  }

  function iniciarSelectorVista() {
    const estado = estadoPathActual();
    const initialView = estado.view;

    document.querySelectorAll('[data-view-link]').forEach(btn => {
      btn.addEventListener('click', () => navegarVista(btn.dataset.viewLink));
    });
    if (esRutaEspecialPath(window.location.pathname)) {
      currentView = initialView;
      document.body.dataset.currentView = initialView;
      localStorage.setItem(VIEW_STORAGE_KEY, initialView);
      document.querySelectorAll('[data-view-link]').forEach(btn => {
        const activo = btn.dataset.viewLink === initialView;
        btn.classList.toggle('activo', activo);
        if (activo) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
      });
      return;
    }
    setVista(initialView, { storePage: estado.storePage, scroll: false, keepMeta: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarSelectorVista);
  } else {
    iniciarSelectorVista();
  }

  function cerrarModalesVisualmente() {
    document.querySelectorAll('.modal-explosionado').forEach(m => m.classList.remove('abierto'));
    document.body.classList.remove('modal-locked');
  }

  function scrollARuta(route, behavior = 'smooth') {
    const targetEl = route?.scrollTo ? document.getElementById(route.scrollTo) : null;
    if (targetEl) targetEl.scrollIntoView({ behavior, block: 'center' });
  }

  function setMeta(attr, key, content) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

	  function actualizarMetaTags(route = HOME) {
	    const fullPath = window.location.pathname === '/en' ? '/en/' : window.location.pathname;
	    const fullUrl = SITE_BASE_URL + fullPath;
    const imgUrl = SITE_BASE_URL + '/' + route.img;
    const descripcion = route.descripcion || HOME.descripcion;

    document.title = route.titulo;
    setMeta('name', 'description', descripcion);
    setMeta('property', 'og:title', route.titulo);
    setMeta('property', 'og:image', imgUrl);
    setMeta('property', 'og:url', fullUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Simio Plateado');
    setMeta('property', 'og:description', descripcion);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', route.titulo);
    setMeta('name', 'twitter:image', imgUrl);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
		    canonical.setAttribute('href', fullUrl);
		  }

  function pathLocalDesdePath(pathname = window.location.pathname) {
    const raw = normalizarPath(pathname);
    if (raw === 'en') return '';
    return raw.replace(/^en\//, '');
  }

  function esPathGracias(pathname = window.location.pathname) {
    return pathLocalDesdePath(pathname) === 'gracias';
  }

  function legalSlugDesdePath(pathname = window.location.pathname) {
    const localPath = pathLocalDesdePath(pathname);
    const match = localPath.match(/^legal\/(privacidad|terminos|uso-imagen)$/);
    return match ? match[1] : null;
  }

  function encargosRouteDesdePath(pathname = window.location.pathname) {
    const localPath = pathLocalDesdePath(pathname);
    if (localPath === 'encargos') return 'landing';
    if (localPath === 'encargos/crear') return 'crear';
    return null;
  }

  function esRutaEspecialPath(pathname = window.location.pathname) {
    return esPathGracias(pathname) || Boolean(legalSlugDesdePath(pathname)) || Boolean(encargosRouteDesdePath(pathname));
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatCop(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return 'COP 0';
    return `COP ${amount.toLocaleString('es-CO')}`;
  }

  function mostrarRutaEspecial(html, meta = GRACIAS_META) {
    const root = document.getElementById('route-page');
    if (!root) return;
    cerrarModalesVisualmente();
    root.innerHTML = html;
    root.hidden = false;
    document.body.classList.add('route-page-active');
    actualizarMetaTags({
      titulo: meta.fullTitle || meta.titulo || GRACIAS_META.titulo,
      img: meta.img || HOME.img,
      descripcion: meta.description || meta.descripcion || GRACIAS_META.descripcion
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function ocultarRutaEspecial() {
    const root = document.getElementById('route-page');
    if (root) {
      root.hidden = true;
      root.innerHTML = '';
    }
    document.body.classList.remove('route-page-active');
  }

  function slugDesdeExternalReference(reference = '') {
    const ref = String(reference || '').trim();
    if (!ref) return null;

    if (ref.startsWith('simio:')) {
      const slug = limpiarSlug(ref.split(':')[1] || '');
      return productoCheckout(slug)?.slug || null;
    }

    const lower = ref.toLowerCase();
    const slugs = Object.keys(CHECKOUT_PRODUCTS_FRONT).sort((a, b) => b.length - a.length);
    const found = slugs.find(slug => lower.endsWith(`-${slug}`) || lower.includes(`:${slug}:`));
    if (found) return found;

    const tail = lower.match(/^sp-\d{4}-\d+-(.+)$/);
    if (tail) {
      const slug = limpiarSlug(tail[1]);
      return productoCheckout(slug)?.slug || null;
    }

    return null;
  }

  function productoGracias(params) {
    const lastCheckout = leerUltimoCheckout();
    const externalRef = params.get('external_reference') || '';
    const candidatos = [
      params.get('sku'),
      params.get('slug'),
      params.get('product'),
      slugDesdeExternalReference(externalRef),
      lastCheckout?.slug
    ].filter(Boolean);

    for (const candidate of candidatos) {
      const product = productoCheckout(limpiarSlug(candidate));
      if (product) return product;
    }
    return null;
  }

  function purchasePayloadGracias(product, params) {
    const value = product?.priceCop || Number(params.get('value')) || 0;
    const payload = {
      content_ids: [product?.slug || 'unknown'],
      content_type: 'product',
      contents: [{ id: product?.slug || 'unknown', quantity: 1, item_price: value }],
      value,
      currency: 'COP'
    };
    if (product) {
      payload.content_name = product.name;
      payload.content_category = product.category;
    } else {
      console.warn('[simio] Purchase sin producto reconocible en /gracias');
    }
    return payload;
  }

  function trackPurchaseGracias(product, params) {
    const externalRef = params.get('external_reference') || '';
    const eventID =
      params.get('payment_id') ||
      params.get('collection_id') ||
      params.get('preference_id') ||
      externalRef ||
      `gracias:${window.location.search || 'sin-query'}`;
    const key = `simio:purchase:${eventID}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch (_) {}

    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', purchasePayloadGracias(product, params), { eventID });
      }
    } catch (_) {}
  }

  function renderGracias() {
    const params = new URLSearchParams(window.location.search);
    const status = (params.get('collection_status') || params.get('status') || '').toLowerCase();
    const product = productoGracias(params);
    const paymentId = params.get('payment_id') || params.get('collection_id') || '';
    const externalRef = params.get('external_reference') || '';
    const productBlock = product
      ? `<section class="pedido-detalle"><h2>Tu pedido</h2><p><strong>${escapeHtml(product.name)}</strong> · ${formatCop(product.priceCop)}</p></section>`
      : '';
    const referenceBlock = [
      externalRef ? `<p>Referencia de pedido: <code>${escapeHtml(externalRef)}</code></p>` : '',
      paymentId ? `<p>ID de pago: <code>${escapeHtml(paymentId)}</code></p>` : ''
    ].filter(Boolean).join('');

    if (status === 'approved') {
      mostrarRutaEspecial(`
        <article class="page-gracias gracias-approved">
          <h1>Pago confirmado</h1>
          <p class="lead">Gracias por tu compra. Recibimos tu pago y dejamos el pedido listo para producción o despacho.</p>
          ${productBlock}
          <section>
            <h2>Qué sigue</h2>
            <ol>
              <li>Recibirás confirmación por correo cuando Mercado Pago termine de reportar la orden.</li>
              <li>Tu pieza entra en preparación. Si requiere acabado manual, te avisamos el avance.</li>
              <li>Cuando esté lista y empacada, te enviamos guía de despacho y datos de rastreo.</li>
            </ol>
          </section>
          <section>
            <h2>Referencia</h2>
            ${referenceBlock || '<p>No recibimos referencia detallada en la URL, pero si el pago fue aprobado queda registrado por Mercado Pago.</p>'}
          </section>
          <p>Cualquier pregunta: <a href="mailto:el@simioplateado.com">el@simioplateado.com</a></p>
          <a class="btn-secundario" href="/tienda">Volver a la tienda</a>
        </article>
      `, GRACIAS_META);
      trackPurchaseGracias(product, params);
      return;
    }

    if (status === 'pending' || status === 'in_process') {
      mostrarRutaEspecial(`
        <article class="page-gracias gracias-pending">
          <h1>Pago en revisión</h1>
          <p class="lead">Tu pago está siendo procesado por Mercado Pago.</p>
          <p>Esto puede tomar unos minutos o unas horas, según el medio de pago. No vuelvas a pagar: si se acredita, recibirás la confirmación.</p>
          ${productBlock}
          ${referenceBlock ? `<section><h2>Referencia</h2>${referenceBlock}</section>` : ''}
          <a class="btn-secundario" href="/tienda">Volver a la tienda</a>
        </article>
      `, GRACIAS_META);
      return;
    }

    if (status === 'rejected' || status === 'failure' || status === 'failed' || status === 'cancelled' || status === 'canceled') {
      const retryPath = product ? `/tienda/${product.slug}` : '/tienda';
      mostrarRutaEspecial(`
        <article class="page-gracias gracias-rejected">
          <h1>El pago no se completó</h1>
          <p class="lead">Mercado Pago no pudo procesar el pago o la operación fue cancelada.</p>
          <p>No se produce ni se despacha nada sin confirmación de pago. Puedes intentar de nuevo con otro medio de pago.</p>
          ${productBlock}
          <a class="btn-primario" href="${retryPath}">Volver a intentar</a>
          <a class="btn-secundario" href="/tienda">Ver la tienda</a>
          <section id="checkout-issue-gracias" data-checkout-issue-route="true"></section>
        </article>
      `, GRACIAS_META);
      mostrarCheckoutIssueWidget(document.getElementById('checkout-issue-gracias'), product?.slug || 'unknown', {
        source: 'gracias_rejected',
        status,
        product: product?.name || '',
        payment_id: paymentId,
        external_reference: externalRef
      });
      return;
    }

    mostrarRutaEspecial(`
      <article class="page-gracias gracias-generic">
        <h1>Página de confirmación</h1>
        <p class="lead">Aquí aparece el estado de una compra cuando Mercado Pago devuelve datos de pago.</p>
        <p>Si llegaste después de pagar y no ves el detalle, escríbenos a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a> con el comprobante o ID de pago que te haya enviado Mercado Pago.</p>
        <a class="btn-secundario" href="/tienda">Volver a la tienda</a>
        <section id="checkout-issue-gracias" data-checkout-issue-route="true"></section>
      </article>
    `, GRACIAS_META);
    mostrarCheckoutIssueWidget(document.getElementById('checkout-issue-gracias'), product?.slug || 'unknown', {
      source: 'gracias_generic',
      status: status || 'sin_estado',
      product: product?.name || '',
      payment_id: paymentId,
      external_reference: externalRef
    });
  }

  async function renderLegal(slug) {
    const meta = LEGAL_META[slug];
    if (!meta) return false;

    mostrarRutaEspecial(`
      <article class="page-legal">
        <header class="legal-header">
          <h1>${escapeHtml(meta.title)}</h1>
          <p class="lead">${escapeHtml(meta.description)}</p>
        </header>
        <section class="legal-body" id="legal-content">
          <p class="loading">Cargando documento...</p>
        </section>
        <footer class="legal-footer">
          <p>Si tienes preguntas sobre este documento, escribe a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a>.</p>
          <a class="btn-secundario" href="/">Volver al inicio</a>
        </footer>
      </article>
    `, meta);

    try {
      const response = await fetch(`/legal-content/${meta.file}?v=20260601`);
      if (!response.ok) throw new Error('legal_doc_unavailable');
      const html = await response.text();
      const content = document.getElementById('legal-content');
      if (content) content.innerHTML = html;
    } catch (_) {
      const content = document.getElementById('legal-content');
      if (content) {
        content.innerHTML = '<p>No pudimos cargar este documento en este momento. Por favor escríbenos a <a href="mailto:el@simioplateado.com">el@simioplateado.com</a> y te enviamos una copia.</p>';
      }
    }
    return true;
  }

  const ENCARGO_PRICE_CONFIG = {
    base: { S: 120000, M: 160000, L: 190000, XL: 215000 },
    case: { S: 30000, M: 40000, L: 50000, XL: 60000 },
    premiumAddon: 20000,
    keychain: 35000,
    shippingColombia: 15000,
    multipliers: [1, 0.8, 0.7, 0.6],
    multiplierRest: 0.5,
    premiumFinishes: new Set(['dorado', 'plateado', 'rosado', 'plateado_mate'])
  };
  let encargoState = null;

  function renderEncargosLanding() {
    mostrarRutaEspecial(`
      <article class="page-encargos encargos-landing">
        <section class="encargos-hero">
          <div>
            <p class="encargos-kicker">Impresion 3D a pedido</p>
            <h1>Trae una imagen. Sal con una pieza.</h1>
            <p class="encargos-lead">Sube una referencia, genera un modelo 3D preliminar y deja la solicitud lista para que revisemos escala, material, viabilidad y precio final. No pagas aqui: primero cotizamos con cuidado.</p>
          </div>
          <aside class="encargos-side">
            <button class="encargos-hand-cta" type="button" id="encargos-start" aria-label="Haz real tu propia pieza">
              <img class="encargos-cta-title" src="assets/optimized/processed/textos/encargo-haz-real-tu-propia.48f66bc2d9.webp" alt="Haz real tu propia pieza" width="807" height="492" decoding="async" loading="lazy">
              <img class="encargos-cta-doodle" src="assets/optimized/processed/textos/encargo-dibujo-impresion-personalizada.f0a65a1b8a.webp" alt="" width="695" height="345" decoding="async" loading="lazy">
              <img class="encargos-cta-copy" src="assets/optimized/processed/textos/encargo-carga-tu-imagen.c3416163bc.webp" alt="Carga tu imagen y la volvemos 3D" width="1200" height="309" decoding="async" loading="lazy">
              <img class="encargos-cta-tag" src="assets/optimized/processed/textos/encargo-a-pedido.bf42022c3b.webp" alt="A pedido" width="705" height="232" decoding="async" loading="lazy">
            </button>
            <p class="encargos-confirmation">Cotizacion manual · produccion experimental · respuesta por email.</p>
          </aside>
        </section>
        <section class="encargos-flow" aria-label="Proceso de encargos">
          <div class="encargos-flow-step">
            <p class="encargos-step-label">01</p>
            <h2>Sube una imagen</h2>
            <p>Idealmente clara, completa y con buen contraste. Puede ser una persona, personaje, mascota, objeto o idea visual.</p>
          </div>
          <div class="encargos-flow-step">
            <p class="encargos-step-label">02</p>
            <h2>Mira el modelo 3D</h2>
            <p>Generamos una primera forma revisable para entender volumen, cuerpo y escala antes de cotizar la produccion.</p>
          </div>
          <div class="encargos-flow-step">
            <p class="encargos-step-label">03</p>
            <h2>Recibe cotizacion real</h2>
            <p>Revisamos el modelo, calculamos produccion y te enviamos precio definitivo con link de pago.</p>
          </div>
        </section>
        <section class="encargos-cases" aria-label="Ejemplos reales de encargos">
          <header class="encargos-cases-header">
            <h2>Del recuerdo al volumen</h2>
            <p>Algunas piezas empiezan como una foto familiar, una mascota o un dibujo imposible. El proceso no borra la referencia: la traduce a forma, escala, textura y presencia fisica.</p>
          </header>
          <article class="encargos-case">
            <div>
              <h3>Pareja</h3>
              <p>Referencia ilustrada, modelo 3D y prueba fisica en una sola linea de proceso.</p>
            </div>
            <div class="encargos-case-media">
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/espejo/espejo-animada.4ce70bd07f.webp" alt="Referencia ilustrada de pareja personalizada" width="720" height="860" decoding="async" loading="lazy">
                <figcaption>Referencia</figcaption>
              </figure>
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/espejo/espejo-modelo-3d.b28a04d426.webp" alt="Modelo 3D de pareja personalizada" width="720" height="860" decoding="async" loading="lazy">
                <figcaption>Modelo 3D</figcaption>
              </figure>
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/espejo/espejo-real-final.0914bfe2ae.webp" alt="Pieza fisica de pareja personalizada" width="720" height="860" decoding="async" loading="lazy">
                <figcaption>Pieza fisica</figcaption>
              </figure>
            </div>
          </article>
          <article class="encargos-case">
            <div>
              <h3>Perrito</h3>
              <p>De fotos de referencia a modelo revisable y pequeñas variaciones impresas.</p>
            </div>
            <div class="encargos-case-media is-four">
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/encargos/ejemplos/perrito-referencia-retrato.ff3733b182.webp" alt="Foto de referencia de perrito blanco" width="885" height="1200" decoding="async" loading="lazy">
                <figcaption>Referencia</figcaption>
              </figure>
              <figure class="encargos-case-shot landscape">
                <img src="assets/optimized/processed/encargos/ejemplos/perrito-modelo-3d.59e1e9b920.webp" alt="Modelo 3D del perrito en dos poses" width="1200" height="745" decoding="async" loading="lazy">
                <figcaption>Modelo 3D</figcaption>
              </figure>
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/encargos/ejemplos/perrito-fisico-sentado.792a31e515.webp" alt="Pieza fisica del perrito sentado" width="1050" height="1400" decoding="async" loading="lazy">
                <figcaption>Pieza sentada</figcaption>
              </figure>
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/encargos/ejemplos/perrito-fisico-acostado.ab897d5b02.webp" alt="Pieza fisica del perrito acostado" width="1050" height="1400" decoding="async" loading="lazy">
                <figcaption>Variacion</figcaption>
              </figure>
            </div>
          </article>
          <article class="encargos-case">
            <div>
              <h3>Abuelo</h3>
              <p>Una foto de archivo se convierte en figura con pose, base y texto personalizado.</p>
            </div>
            <div class="encargos-case-media">
              <figure class="encargos-case-shot square">
                <img src="assets/optimized/processed/encargos/ejemplos/abuelo-referencia.98fa13cafc.webp" alt="Foto de referencia de abuelo en plaza" width="1200" height="1200" decoding="async" loading="lazy">
                <figcaption>Referencia</figcaption>
              </figure>
              <figure class="encargos-case-shot landscape">
                <img src="assets/optimized/processed/encargos/ejemplos/abuelo-modelo-3d.43f837df6b.webp" alt="Modelo 3D del abuelo sobre base" width="1200" height="846" decoding="async" loading="lazy">
                <figcaption>Modelo 3D</figcaption>
              </figure>
              <figure class="encargos-case-shot portrait">
                <img src="assets/optimized/processed/encargos/ejemplos/abuelo-fisico.741d4f5267.webp" alt="Pieza fisica dorada del abuelo" width="1050" height="1400" decoding="async" loading="lazy">
                <figcaption>Pieza fisica</figcaption>
              </figure>
            </div>
          </article>
        </section>
      </article>
    `, ENCARGOS_META);

    trackSimio('encargos_landing_view', 'encargos', { source: 'landing' });
    document.getElementById('encargos-start')?.addEventListener('click', () => {
      registrarIntencionEncargos();
      history.pushState({}, '', '/encargos/crear');
      renderRutaEspecialSiAplica();
    });
  }

  function renderEncargosCrear() {
    encargoState = {
      step: 1,
      email: '',
      imageFile: null,
      imageDataUrl: '',
      previewDataUrl: '',
      conceptualPrompt: '',
      tripoTaskId: '',
      tripoStatus: '',
      tripoProgress: 0,
      tripoModelUrl: '',
      tripoRenderedImageUrl: '',
      tripoFileToken: '',
      tripoCreditsConsumed: 0
    };

    mostrarRutaEspecial(`
      <article class="page-encargos encargos-wizard">
        <header class="encargos-wizard-header">
          <div>
            <p class="encargos-kicker">Encargo personalizado</p>
            <h1>Haz real tu propia pieza</h1>
            <p class="encargos-lead">Primero te mostramos un estimado y guardamos tu solicitud. El precio definitivo llega por email despues de revisar si la pieza se puede producir bien.</p>
          </div>
          <nav class="encargos-progress" aria-label="Progreso">
            <span data-encargo-progress="1">Email</span>
            <span data-encargo-progress="2">Imagen</span>
            <span data-encargo-progress="3">Opciones</span>
            <span data-encargo-progress="4">Datos</span>
            <span data-encargo-progress="5">Listo</span>
          </nav>
        </header>

        <section class="encargos-step" data-encargo-step="1">
          <p class="encargos-step-label">Paso 1</p>
          <h2>Tu email</h2>
          <p>Es donde te llegara la cotizacion exacta. No spam, no listas, solo tu cotizacion.</p>
          <div class="encargos-form-grid">
            <label class="encargos-field">
              <span>Email</span>
              <input id="encargo-email" type="email" autocomplete="email" placeholder="tu@email.com">
            </label>
            <div>
              <p class="encargos-mini">Tienes 2 generaciones de modelo 3D por dia disponibles.</p>
              <p>Usalas con una imagen clara: cuerpo completo si quieres figura, rostro claro si quieres busto, o fondo simple si es objeto.</p>
            </div>
          </div>
          <div class="encargos-actions">
            <button type="button" id="encargo-email-next">Continuar</button>
          </div>
          <p class="encargos-status" id="encargo-status-1"></p>
        </section>

        <section class="encargos-step" data-encargo-step="2" hidden>
          <p class="encargos-step-label">Paso 2</p>
          <h2>Imagen base</h2>
          <div class="encargos-preview-grid">
            <div>
              <label class="encargos-field">
                <span>Imagen</span>
                <input id="encargo-imagen" type="file" accept="image/png,image/jpeg">
              </label>
              <label class="encargos-field">
                <span>Tipo de pieza</span>
                <select id="encargo-tipo">
                  <option value="figura completa">Figura completa</option>
                  <option value="busto o retrato">Busto o retrato</option>
                  <option value="mascota">Mascota</option>
                  <option value="objeto">Objeto</option>
                  <option value="lampara">Lampara</option>
                  <option value="otro">Otro / idea rara</option>
                </select>
              </label>
              <label class="encargos-field">
                <span>Que quieres extraer de la imagen</span>
                <textarea id="encargo-indicaciones" minlength="8" maxlength="700" required aria-describedby="encargo-indicaciones-ayuda" placeholder="Ej. solo el gato naranja, sin silla ni celular; convertirlo en figura coleccionable dorada sobre fondo blanco."></textarea>
              </label>
              <p class="encargos-field-note" id="encargo-indicaciones-ayuda">Obligatorio. Minimo 8 caracteres: nombra el sujeto principal y lo que quieres excluir. Ej: solo el gato, sin silla ni celular.</p>
              <div class="encargos-actions">
                <button type="button" class="secundario" data-encargo-back="1">Volver</button>
                <button type="button" id="encargo-preview-btn">Generar modelo 3D</button>
              </div>
              <p class="encargos-status" id="encargo-status-2"></p>
            </div>
            <div class="encargos-upload-frame" id="encargo-upload-preview">
              <p class="encargos-empty">La imagen aparecera aqui</p>
            </div>
          </div>
        </section>

        <section class="encargos-step" data-encargo-step="3" hidden>
          <p class="encargos-step-label">Paso 3</p>
          <h2>Modelo 3D y opciones</h2>
          <div class="encargos-preview-grid">
            <div class="encargos-preview-frame" id="encargo-preview-frame">
              <p class="encargos-empty">Aqui aparecera el modelo 3D</p>
            </div>
            <div>
              <div class="encargos-options-grid">
                <label class="encargos-field">
                  <span>Tamano</span>
                  <select id="encargo-size" data-encargo-price>
                    <option value="S">S · 10-12 cm</option>
                    <option value="M" selected>M · 12-15 cm</option>
                    <option value="L">L · 15-18 cm</option>
                    <option value="XL">XL · 18-20 cm</option>
                  </select>
                </label>
                <label class="encargos-field">
                  <span>Acabado</span>
                  <select id="encargo-finish" data-encargo-price>
                    <option value="blanco">Blanco</option>
                    <option value="negro">Negro</option>
                    <option value="translucido">Translucido natural</option>
                    <option value="dorado" selected>Dorado</option>
                    <option value="plateado">Plateado</option>
                    <option value="rosado">Rosado</option>
                    <option value="plateado_mate">Plateado mate</option>
                  </select>
                </label>
                <label class="encargos-field">
                  <span>Cantidad</span>
                  <select id="encargo-quantity" data-encargo-price>
                    <option value="1" selected>1 pieza</option>
                    <option value="2">2 piezas</option>
                    <option value="3">3 piezas</option>
                    <option value="4">4 piezas</option>
                    <option value="5">5 piezas</option>
                    <option value="6">6 piezas</option>
                  </select>
                </label>
                <label class="encargos-field">
                  <span>Envio</span>
                  <select id="encargo-city-zone" data-encargo-price>
                    <option value="medellin" selected>Area metropolitana</option>
                    <option value="colombia">Otra ciudad en Colombia</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </label>
                <label class="encargos-field">
                  <span>Graffiti gratis</span>
                  <select id="encargo-graffiti" data-encargo-price>
                    <option value="ninguno" selected>Sin manchas</option>
                    <option value="negras">Manchas negras</option>
                    <option value="plateadas">Manchas plateadas</option>
                  </select>
                </label>
              </div>
              <label class="encargos-check">
                <input id="encargo-keychain" type="checkbox" data-encargo-price>
                <span>Agregar version mini llavero (+COP 35.000).</span>
              </label>
              <label class="encargos-check">
                <input id="encargo-case" type="checkbox" data-encargo-price>
                <span>Empaque en estuche personalizado de coleccion.</span>
              </label>
              <label class="encargos-field" id="encargo-case-text-wrap" hidden>
                <span>Texto en estuche</span>
                <input id="encargo-case-text" type="text" maxlength="20" placeholder="Max. 20 caracteres">
              </label>
              <aside class="encargos-price-panel" aria-live="polite">
                <h3>Estimado</h3>
                <ul class="encargos-price-lines" id="encargo-price-lines"></ul>
                <div class="encargos-total"><span>Total estimado</span><strong id="encargo-total">COP 0</strong></div>
                <p class="encargos-price-note" id="encargo-price-note">Precio estimado · final por confirmar.</p>
              </aside>
              <div class="encargos-actions">
                <button type="button" class="secundario" data-encargo-back="2">Volver</button>
                <button type="button" data-encargo-next="4">Continuar</button>
              </div>
            </div>
          </div>
        </section>

        <section class="encargos-step" data-encargo-step="4" hidden>
          <p class="encargos-step-label">Paso 4</p>
          <h2>Datos para cotizar</h2>
          <div class="encargos-contact-grid">
            <label class="encargos-field"><span>Nombre</span><input id="encargo-nombre" type="text" autocomplete="name"></label>
            <label class="encargos-field"><span>Telefono / WhatsApp</span><input id="encargo-telefono" type="tel" autocomplete="tel"></label>
            <label class="encargos-field"><span>Ciudad</span><input id="encargo-ciudad" type="text" autocomplete="address-level2" value="Medellin"></label>
            <label class="encargos-field"><span>Pais</span><input id="encargo-pais" type="text" autocomplete="country-name" value="Colombia"></label>
          </div>
          <label class="encargos-field">
            <span>Observaciones finales</span>
            <textarea id="encargo-observaciones" maxlength="900" placeholder="Detalles de uso, regalo, fecha ideal, dudas sobre color o escala..."></textarea>
          </label>
          <label class="encargos-check"><input id="encargo-terms-rights" type="checkbox"><span>Confirmo que tengo derechos de uso sobre la imagen que subo, o que es de uso libre.</span></label>
          <label class="encargos-check"><input id="encargo-terms-estimate" type="checkbox"><span>Entiendo que el precio mostrado es estimado y sera confirmado por email tras revision manual.</span></label>
          <label class="encargos-check"><input id="encargo-terms-legal" type="checkbox"><span>Acepto los <a href="/legal/terminos">terminos y condiciones</a>.</span></label>
          <div class="encargos-actions">
            <button type="button" class="secundario" data-encargo-back="3">Volver</button>
            <button type="button" id="encargo-submit">Enviar solicitud</button>
          </div>
          <p class="encargos-status" id="encargo-status-4"></p>
        </section>

        <section class="encargos-step" data-encargo-step="5" hidden>
          <p class="encargos-step-label">Paso 5</p>
          <h2>Solicitud recibida</h2>
          <p id="encargo-success-text">Gracias. Recibimos tu solicitud y te responderemos por email con la cotizacion definitiva.</p>
          <div class="encargos-actions">
            <a class="btn-secundario" href="/galeria">Volver a la galeria</a>
            <a class="btn-primario" href="/encargos">Crear otra pieza</a>
          </div>
        </section>
      </article>
    `, ENCARGOS_CREAR_META);

    iniciarEncargosCrear();
  }

  function iniciarEncargosCrear() {
    const root = document.querySelector('.encargos-wizard');
    if (!root) return;

    mostrarPasoEncargo(1);
    actualizarPrecioEncargo(root);

    root.querySelector('#encargo-email-next')?.addEventListener('click', () => {
      const email = root.querySelector('#encargo-email')?.value.trim().toLowerCase() || '';
      if (!SONDEO_EMAIL_RE.test(email)) {
        setEncargoStatus(root, 1, 'Escribe un email valido para continuar.', true);
        return;
      }
      encargoState.email = email;
      setEncargoStatus(root, 1, '');
      mostrarPasoEncargo(2);
      trackSimio('encargos_preview_started', 'encargos', { source: 'email_step' });
    });

    root.querySelector('#encargo-imagen')?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      encargoState.imageFile = file;
      try {
        encargoState.imageDataUrl = await comprimirImagenEncargo(file);
        setFrameImage(root.querySelector('#encargo-upload-preview'), encargoState.imageDataUrl, 'Imagen subida');
      } catch (_) {
        encargoState.imageDataUrl = '';
        setEncargoStatus(root, 2, 'No pudimos preparar esa imagen. Intenta con JPG o PNG.', true);
      }
    });

    root.querySelector('#encargo-preview-btn')?.addEventListener('click', () => generarPreviewEncargo(root));

    root.querySelectorAll('[data-encargo-price]').forEach(el => {
      el.addEventListener('change', () => actualizarPrecioEncargo(root));
    });

    root.querySelector('#encargo-case')?.addEventListener('change', () => {
      const wrap = root.querySelector('#encargo-case-text-wrap');
      if (wrap) wrap.hidden = !root.querySelector('#encargo-case')?.checked;
    });

    root.querySelectorAll('[data-encargo-next]').forEach(btn => {
      btn.addEventListener('click', () => mostrarPasoEncargo(Number(btn.dataset.encargoNext)));
    });
    root.querySelectorAll('[data-encargo-back]').forEach(btn => {
      btn.addEventListener('click', () => mostrarPasoEncargo(Number(btn.dataset.encargoBack)));
    });
    root.querySelector('#encargo-submit')?.addEventListener('click', () => enviarSolicitudEncargo(root));
  }

  function registrarIntencionEncargos() {
    trackSimio('encargos_intent', 'encargos', { source: 'landing_cta' });
    fetch(ENCARGOS_INTENT_ENDPOINT, { method: 'POST', keepalive: true }).catch(() => {});
  }

  function mostrarPasoEncargo(step) {
    encargoState.step = step;
    document.querySelectorAll('[data-encargo-step]').forEach(section => {
      section.hidden = Number(section.dataset.encargoStep) !== step;
    });
    document.querySelectorAll('[data-encargo-progress]').forEach(item => {
      item.classList.toggle('activo', Number(item.dataset.encargoProgress) === step);
    });
  }

  function setEncargoStatus(root, step, message, isError = false) {
    const el = root.querySelector(`#encargo-status-${step}`);
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('error', Boolean(isError));
  }

  function setFrameImage(frame, src, alt) {
    if (!frame) return;
    frame.innerHTML = `<img src="${src}" alt="${escapeHtml(alt)}" decoding="async" loading="lazy">`;
  }

  function setFrameMessage(frame, title, body) {
    if (!frame) return;
    frame.innerHTML = `
      <p class="encargos-empty">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(body)}</span>
      </p>
    `;
  }

  function setFrameModel(frame, modelUrl, posterUrl = '') {
    if (!frame) return;
    frame.innerHTML = `
      <model-viewer
        src="${escapeHtml(modelUrl)}"
        ${posterUrl ? `poster="${escapeHtml(posterUrl)}"` : ''}
        alt="Modelo 3D generado para encargo Simio Plateado"
        camera-controls
        auto-rotate
        auto-rotate-delay="900"
        rotation-per-second="18deg"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="0.9"
        interaction-prompt="none"
        touch-action="pan-y"></model-viewer>
      <p class="encargos-model-note">Modelo preliminar generado con Tripo3D · revision final por Simio Plateado.</p>
    `;
    window.loadModelViewerOnce?.();
  }

  function opcionesEncargoDesdeFormulario(root) {
    return {
      tipo: root.querySelector('#encargo-tipo')?.value || 'figura completa',
      size: root.querySelector('#encargo-size')?.value || 'M',
      finish: root.querySelector('#encargo-finish')?.value || 'dorado',
      quantity: Number(root.querySelector('#encargo-quantity')?.value || 1),
      cityZone: root.querySelector('#encargo-city-zone')?.value || 'medellin',
      graffiti: root.querySelector('#encargo-graffiti')?.value || 'ninguno',
      keychain: Boolean(root.querySelector('#encargo-keychain')?.checked),
      caseSelected: Boolean(root.querySelector('#encargo-case')?.checked),
      caseText: (root.querySelector('#encargo-case-text')?.value || '').trim().slice(0, 20)
    };
  }

  function calcularPrecioEncargoFront(options) {
    const size = options.size || 'M';
    const quantity = Math.max(1, Math.min(6, Number(options.quantity) || 1));
    const finish = options.finish || 'dorado';
    const premiumAddon = ENCARGO_PRICE_CONFIG.premiumFinishes.has(finish) ? ENCARGO_PRICE_CONFIG.premiumAddon : 0;
    const unit = ENCARGO_PRICE_CONFIG.base[size] + premiumAddon;
    let piecesSubtotal = 0;
    const lines = [];

    for (let index = 1; index <= quantity; index += 1) {
      const multiplier = ENCARGO_PRICE_CONFIG.multipliers[index - 1] || ENCARGO_PRICE_CONFIG.multiplierRest;
      const amount = Math.round(unit * multiplier);
      piecesSubtotal += amount;
      lines.push({
        label: `Pieza ${index} (${size}, ${finish})`,
        amount,
        note: index === 1 ? '' : `${Math.round((1 - multiplier) * 100)}% off`
      });
    }

    const caseSubtotal = options.caseSelected ? ENCARGO_PRICE_CONFIG.case[size] * quantity : 0;
    if (caseSubtotal) lines.push({ label: `Estuche personalizado (${quantity})`, amount: caseSubtotal, note: 'texto gratis' });
    const keychainSubtotal = options.keychain ? ENCARGO_PRICE_CONFIG.keychain : 0;
    if (keychainSubtotal) lines.push({ label: 'Mini llavero', amount: keychainSubtotal, note: '5-7 cm aprox.' });

    let shipping = { label: 'Envio area metropolitana', amount: 0, note: 'incluido' };
    if (options.cityZone === 'colombia') shipping = { label: 'Envio Colombia', amount: ENCARGO_PRICE_CONFIG.shippingColombia, note: '' };
    if (options.cityZone === 'internacional') shipping = { label: 'Envio internacional', amount: null, note: 'cotizar aparte' };
    lines.push({ label: shipping.label, amount: shipping.amount || 0, note: shipping.note });

    return {
      currency: 'COP',
      lines,
      shipping,
      pieces_subtotal: piecesSubtotal,
      addons_subtotal: caseSubtotal + keychainSubtotal,
      total_estimated: piecesSubtotal + caseSubtotal + keychainSubtotal + (shipping.amount || 0),
      estimated: true
    };
  }

  function actualizarPrecioEncargo(root) {
    const options = opcionesEncargoDesdeFormulario(root);
    const price = calcularPrecioEncargoFront(options);
    const list = root.querySelector('#encargo-price-lines');
    const total = root.querySelector('#encargo-total');
    const note = root.querySelector('#encargo-price-note');

    if (list) {
      list.innerHTML = price.lines.map(line => `
        <li>
          <span>${escapeHtml(line.label)}${line.note ? `<small>${escapeHtml(line.note)}</small>` : ''}</span>
          <strong>${formatCop(line.amount)}</strong>
        </li>
      `).join('');
    }
    if (total) total.textContent = formatCop(price.total_estimated);
    if (note) {
      note.textContent = price.shipping.amount === null
        ? 'Precio estimado sin envio internacional · final por confirmar.'
        : 'Precio estimado · final por confirmar.';
    }
    return { options, price };
  }

  function guardarTripoEncargo(data = {}) {
    const tripo = data.tripo || data || {};
    encargoState.tripoTaskId = tripo.task_id || data.task_id || encargoState.tripoTaskId || '';
    encargoState.tripoStatus = tripo.status || data.status || encargoState.tripoStatus || '';
    encargoState.tripoProgress = Number(tripo.progress ?? data.progress ?? encargoState.tripoProgress) || 0;
    encargoState.tripoModelUrl = tripo.model_url || data.model_url || encargoState.tripoModelUrl || '';
    encargoState.tripoRenderedImageUrl = tripo.rendered_image_url || data.rendered_image_url || encargoState.tripoRenderedImageUrl || '';
    encargoState.tripoFileToken = tripo.file_token || data.file_token || encargoState.tripoFileToken || '';
    encargoState.tripoCreditsConsumed = Number(tripo.credits_consumed ?? data.credits_consumed ?? encargoState.tripoCreditsConsumed) || 0;
  }

  async function esperarModeloTripo(root, taskId) {
    for (let intento = 0; intento < 44; intento += 1) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const response = await fetch(`${ENCARGOS_TRIPO_TASK_ENDPOINT}/${encodeURIComponent(taskId)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos consultar el modelo 3D.');
      guardarTripoEncargo(data);

      const progress = encargoState.tripoProgress ? ` (${Math.round(encargoState.tripoProgress)}%)` : '';
      setEncargoStatus(root, 2, `Tripo sigue construyendo el modelo${progress}...`);

      if (encargoState.tripoStatus === 'success' && encargoState.tripoModelUrl) return data;
      if (encargoState.tripoStatus === 'failed' || encargoState.tripoStatus === 'cancelled') {
        throw new Error('Tripo no pudo completar este modelo. Intenta con una imagen mas clara.');
      }
    }
    throw new Error('El modelo sigue procesandose. Espera un minuto e intenta generar de nuevo con la misma imagen.');
  }

  async function generarPreviewEncargo(root) {
    const btn = root.querySelector('#encargo-preview-btn');
    const email = encargoState.email || root.querySelector('#encargo-email')?.value.trim().toLowerCase() || '';
    const file = encargoState.imageFile || root.querySelector('#encargo-imagen')?.files?.[0];
    const indicaciones = root.querySelector('#encargo-indicaciones')?.value.trim() || '';

    if (!SONDEO_EMAIL_RE.test(email)) {
      setEncargoStatus(root, 2, 'Vuelve al paso 1 y confirma tu email.', true);
      return;
    }
    if (!file) {
      setEncargoStatus(root, 2, 'Sube una imagen antes de generar el modelo 3D.', true);
      return;
    }
    if (indicaciones.length < 8) {
      setEncargoStatus(root, 2, 'Esta indicacion es obligatoria. Escribe al menos 8 caracteres: ej. solo el gato, sin silla ni fondo.', true);
      root.querySelector('#encargo-indicaciones')?.focus();
      return;
    }

    btn.disabled = true;
    setEncargoStatus(root, 2, 'Generando modelo 3D con Tripo. Puede tardar hasta dos minutos...');
    setFrameMessage(root.querySelector('#encargo-preview-frame'), 'Generando modelo 3D', 'Tripo esta construyendo una pieza preliminar desde la imagen y el sujeto indicado.');

    try {
      if (!encargoState.imageDataUrl) {
        encargoState.imageDataUrl = await comprimirImagenEncargo(file);
        setFrameImage(root.querySelector('#encargo-upload-preview'), encargoState.imageDataUrl, 'Imagen subida');
      }

      const form = new FormData();
      form.append('email', email);
      form.append('image', file);
      form.append('tipo', root.querySelector('#encargo-tipo')?.value || 'figura completa');
      form.append('acabado', root.querySelector('#encargo-finish')?.value || 'dorado');
      form.append('size', root.querySelector('#encargo-size')?.value || 'M');
      form.append('indicaciones', indicaciones);

      const response = await fetch(ENCARGOS_PREVIEW_ENDPOINT, { method: 'POST', body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos generar el modelo 3D.');

      encargoState.conceptualPrompt = data.prompt || '';
      encargoState.previewDataUrl = '';
      guardarTripoEncargo(data);

      if (!encargoState.tripoModelUrl && encargoState.tripoTaskId) {
        await esperarModeloTripo(root, encargoState.tripoTaskId);
      }

      if (!encargoState.tripoModelUrl) {
        throw new Error(data.message || 'No recibimos un modelo 3D de Tripo. Intenta con una imagen mas clara.');
      }

      setFrameModel(root.querySelector('#encargo-preview-frame'), encargoState.tripoModelUrl, encargoState.tripoRenderedImageUrl);
      setEncargoStatus(root, 2, data.message || 'Modelo 3D listo.');
      trackSimio('encargos_preview_ready', 'encargos', { source: 'tripo3d', task_id: encargoState.tripoTaskId, status: encargoState.tripoStatus });
      mostrarPasoEncargo(3);
    } catch (error) {
      setFrameMessage(root.querySelector('#encargo-preview-frame'), 'No se pudo generar el modelo', error.message || 'Intenta con otra imagen o descripcion mas clara.');
      setEncargoStatus(root, 2, error.message || 'No pudimos generar el modelo 3D. Intenta de nuevo.', true);
    } finally {
      btn.disabled = false;
    }
  }

  async function comprimirImagenEncargo(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('tipo_invalido');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('imagen_pesada');
    }

    const src = await fileToDataUrl(file);
    const img = await cargarImagen(src);
    const attempts = [
      { edge: 1400, quality: 0.84 },
      { edge: 1200, quality: 0.78 },
      { edge: 980, quality: 0.72 },
      { edge: 820, quality: 0.68 }
    ];

    for (const attempt of attempts) {
      const dataUrl = renderImagenEncargo(img, attempt.edge, attempt.quality);
      if (dataUrl.length < 1600000) return dataUrl;
    }

    return renderImagenEncargo(img, 720, 0.62);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function cargarImagen(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function renderImagenEncargo(img, maxEdge, quality) {
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  }

  async function enviarSolicitudEncargo(root) {
    const btn = root.querySelector('#encargo-submit');
    const { options, price } = actualizarPrecioEncargo(root);
    const payload = {
      email: encargoState.email || root.querySelector('#encargo-email')?.value.trim().toLowerCase(),
      nombre: root.querySelector('#encargo-nombre')?.value.trim(),
      telefono: root.querySelector('#encargo-telefono')?.value.trim(),
      ciudad: root.querySelector('#encargo-ciudad')?.value.trim(),
      pais: root.querySelector('#encargo-pais')?.value.trim(),
      observaciones: root.querySelector('#encargo-observaciones')?.value.trim(),
      options,
      price,
      imageDataUrl: encargoState.imageDataUrl,
      previewDataUrl: encargoState.previewDataUrl,
      conceptualPrompt: encargoState.conceptualPrompt,
      tripo: {
        provider: 'tripo3d',
        task_id: encargoState.tripoTaskId,
        status: encargoState.tripoStatus,
        progress: encargoState.tripoProgress,
        model_url: encargoState.tripoModelUrl,
        rendered_image_url: encargoState.tripoRenderedImageUrl,
        file_token: encargoState.tripoFileToken,
        credits_consumed: encargoState.tripoCreditsConsumed
      },
      sourceUrl: window.location.href,
      terms: {
        rights: Boolean(root.querySelector('#encargo-terms-rights')?.checked),
        estimate: Boolean(root.querySelector('#encargo-terms-estimate')?.checked),
        legal: Boolean(root.querySelector('#encargo-terms-legal')?.checked)
      }
    };

    if (!payload.nombre || !payload.telefono || !payload.ciudad || !payload.pais) {
      setEncargoStatus(root, 4, 'Completa nombre, telefono, ciudad y pais.', true);
      return;
    }
    if (!payload.imageDataUrl) {
      setEncargoStatus(root, 4, 'Falta la imagen base. Vuelve al paso 2.', true);
      return;
    }
    if (!payload.terms.rights || !payload.terms.estimate || !payload.terms.legal) {
      setEncargoStatus(root, 4, 'Acepta las tres confirmaciones para enviar.', true);
      return;
    }

    btn.disabled = true;
    setEncargoStatus(root, 4, 'Enviando solicitud...');

    try {
      const response = await fetch(ENCARGOS_REQUEST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos enviar la solicitud.');

      const success = root.querySelector('#encargo-success-text');
      if (success) {
        success.textContent = `Solicitud ${data.id} recibida. Te responderemos por email con la cotizacion definitiva. Estimado visible: ${formatCop(data.price?.total_estimated || price.total_estimated)}.`;
      }
      trackPixel('Lead', {
        content_name: 'Encargo personalizado',
        content_category: 'impresion_3d_a_pedido',
        value: data.price?.total_estimated || price.total_estimated,
        currency: 'COP'
      });
      trackSimio('encargos_request_sent', 'encargos', { source: 'encargos_form', total_estimated: data.price?.total_estimated || price.total_estimated });
      mostrarPasoEncargo(5);
    } catch (error) {
      setEncargoStatus(root, 4, error.message || 'No pudimos enviar la solicitud.', true);
    } finally {
      btn.disabled = false;
    }
  }

  function renderRutaEspecialSiAplica() {
    if (esPathGracias()) {
      renderGracias();
      return true;
    }
    const encargosRoute = encargosRouteDesdePath();
    if (encargosRoute === 'landing') {
      renderEncargosLanding();
      return true;
    }
    if (encargosRoute === 'crear') {
      renderEncargosCrear();
      return true;
    }
    const legalSlug = legalSlugDesdePath();
    if (legalSlug) {
      renderLegal(legalSlug);
      return true;
    }
    return false;
  }

  function iniciarInterceptoresRutasEspeciales() {
    if (document.documentElement.dataset.specialRoutesReady === 'true') return;
    document.documentElement.dataset.specialRoutesReady = 'true';
    document.addEventListener('click', (event) => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const url = new URL(link.getAttribute('href'), window.location.href);
      if (url.origin !== window.location.origin || !esRutaEspecialPath(url.pathname)) return;
      event.preventDefault();
      history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
      renderRutaEspecialSiAplica();
    });
  }

  iniciarInterceptoresRutasEspeciales();

  function setModalTitleVisual(modal, selector, item, version = '20260604-titlefix') {
    const el = modal?.querySelector(selector);
    if (!el || !item) return;
    el.innerHTML = '';
    if (item.titleImg) {
      const img = document.createElement('img');
      img.className = 'exp-titulo-hand';
      img.src = `${item.titleImg}?v=${version}`;
      img.alt = item.title || item.code;
      el.appendChild(img);
      return;
    }
    el.textContent = item.title || item.code || '';
  }

		  function poblarModalLiterato(slug) {
	    const item = LITERATOS[slug];
	    const modal = document.getElementById('modal-literato');
	    if (!item || !modal) return;

	    literatoActual = item;
	    const setText = (selector, value) => {
	      const el = modal.querySelector(selector);
	      if (el) el.textContent = value;
		    };

			    const isCheckoutLiterato = Boolean(item.checkoutSlug);
			    const imageVersion = item.imageVersion || '20260531-lit-white';
			    const statusBadge = modal.querySelector('.estado-badge');
			    const metaTwoLabel = modal.querySelector('[data-literato-meta-two-label]');
			    const priceNote = modal.querySelector('[data-literato-price-note]');
			    const actionTitle = modal.querySelector('[data-literato-action-title]');
			    const phaseTwo = modal.querySelector('[data-literato-phase-two]');
			    const phaseThree = modal.querySelector('[data-literato-phase-three]');

			    setText('[data-literato-code]', item.code);
			    setModalTitleVisual(modal, '[data-literato-title]', item);
			    setText('[data-literato-state]', item.state);
			    if (statusBadge) statusBadge.textContent = item.state;
			    if (metaTwoLabel) metaTwoLabel.textContent = isCheckoutLiterato ? t('label.price') : (currentLang === 'en' ? 'Series' : 'Serie');
		    setText('[data-literato-series]', isCheckoutLiterato ? item.price : item.series);
		    setText('[data-literato-subtitle]', item.subtitle);
		    setText('[data-literato-concept]', item.concept);
		    setText('[data-literato-production]', item.production);
		    if (priceNote) {
		      priceNote.textContent = item.priceNote || '';
		      priceNote.hidden = !isCheckoutLiterato || !item.priceNote;
		    }
		    setText('[data-literato-caption]', item.caption);

		    const img = modal.querySelector('[data-literato-img]');
		    if (img) {
		      img.src = `${item.img}?v=${imageVersion}`;
		      img.alt = item.alt || item.code;
		    }

	    const modelFigure = modal.querySelector('[data-literato-model-figure]');
	    const model = modal.querySelector('[data-literato-model]');
	    const modelCaption = modal.querySelector('[data-literato-model-caption]');
	    if (modelFigure && model) {
	      if (item.model) {
	        const modelSrc = `${item.model}?v=${item.modelVersion || '20260529-lit3d'}`;
		        modelFigure.hidden = false;
		        model.dataset.modelSrc = modelSrc;
		        if (item.keepMaterials) model.dataset.keepMaterials = 'true';
		        else delete model.dataset.keepMaterials;
		        model.setAttribute('poster', `${item.img}?v=${imageVersion}`);
	        model.setAttribute('alt', `Modelo 3D de ${item.code}`);
	        model.setAttribute('camera-orbit', item.cameraOrbit || '90deg 75deg 2m');
	        model.setAttribute('camera-target', item.cameraTarget || '0m 0.45m 0m');
	        model.setAttribute('field-of-view', item.fieldOfView || '30deg');
	        if (model.getAttribute('src') !== modelSrc) model.removeAttribute('src');
	        if (modelCaption) modelCaption.textContent = item.modelCaption || 'Modelo 3D';
	      } else {
	        modelFigure.hidden = true;
	        model.removeAttribute('src');
	        model.removeAttribute('data-model-src');
	        delete model.dataset.modelSrc;
	        delete model.dataset.keepMaterials;
	      }
	    }

	    const variantsWrap = modal.querySelector('[data-literato-variants]');
	    if (variantsWrap) {
	      variantsWrap.innerHTML = '';
	      const variants = item.variants || [];
	      variantsWrap.hidden = variants.length === 0;
	      variants.forEach((variant) => {
	        const figure = document.createElement('figure');
	        const variantImg = document.createElement('img');
	        const caption = document.createElement('figcaption');
		        variantImg.src = `${variant.src}?v=${variant.version || '20260531-lit-white'}`;
	        variantImg.alt = `${item.code} · ${variant.caption}`;
	        variantImg.loading = 'lazy';
	        caption.textContent = variant.caption || 'Estudio alterno';
	        figure.appendChild(variantImg);
	        figure.appendChild(caption);
	        variantsWrap.appendChild(figure);
	      });
	    }

			    const panel = document.getElementById('panel-votar-literato');
			    const conf = document.getElementById('votar-conf-literato');
			    const btn = document.getElementById('btn-votar-literato');
			    const input = document.getElementById('email-input-literato');
			    const interestBlock = panel?.closest('.votar-bloque');
			    const emailTitle = panel?.querySelector('.votar-opcion h5');
			    const emailCopy = panel?.querySelector('.votar-opcion p');
			    const checkoutForm = modal.querySelector('[data-literato-checkout]');
			    const checkoutSubmit = modal.querySelector('[data-literato-checkout-submit]');
			    const checkoutStatus = modal.querySelector('[data-literato-checkout-status]');
			    const wantsHave = item.interestMode === 'have';
			    panel?.classList.remove('abierto');
			    conf?.classList.remove('visible');
			    if (conf) conf.textContent = '';
			    if (input) input.value = '';
			    if (interestBlock) {
			      if (wantsHave) interestBlock.dataset.interestMode = 'have';
			      else delete interestBlock.dataset.interestMode;
			    }
				    if (isCheckoutLiterato) {
			      if (actionTitle) actionTitle.textContent = t('checkout.title');
			      if (phaseTwo) {
			        phaseTwo.className = 'fase hit';
			        phaseTwo.textContent = t('phase.intervened');
			      }
			      if (phaseThree) {
			        phaseThree.className = 'fase hit';
			        phaseThree.textContent = t('phase.made');
			      }
			      if (btn) btn.hidden = true;
			      if (panel) panel.hidden = true;
			      if (conf) conf.hidden = true;
			      if (checkoutForm) {
			        checkoutForm.hidden = false;
			        checkoutForm.dataset.checkoutFormSlug = item.checkoutSlug;
			        ['nombre', 'email', 'telefono', 'direccion', 'ciudad', 'departamento', 'pais', 'postal', 'notas'].forEach((field) => {
			          const fieldEl = checkoutForm.querySelector(`[data-literato-checkout-field="${field}"]`);
			          if (!fieldEl) return;
			          fieldEl.id = `checkout-${field}-${item.checkoutSlug}`;
			          if (field === 'pais' && !fieldEl.value) fieldEl.value = 'Colombia';
			        });
			      }
			      if (checkoutSubmit) {
			        checkoutSubmit.hidden = false;
			        checkoutSubmit.disabled = false;
			        checkoutSubmit.textContent = t('checkout.button');
			        checkoutSubmit.onclick = (event) => iniciarCompra(event, item.checkoutSlug);
			      }
			      if (checkoutStatus) {
			        checkoutStatus.id = `checkout-conf-${item.checkoutSlug}`;
			        checkoutStatus.className = 'preorder-status';
			        checkoutStatus.textContent = '';
			      }
			    } else {
				      if (actionTitle) actionTitle.textContent = wantsHave ? t('interestHave.title').replace('{product}', item.code) : (currentLang === 'en' ? 'Curatorial status' : 'Estado curatorial');
				      if (phaseTwo) {
				        phaseTwo.className = 'fase hit';
				        phaseTwo.textContent = t('phase.designed');
				      }
				      if (phaseThree) {
				        phaseThree.className = wantsHave ? 'fase hit' : 'fase vacia';
				        phaseThree.textContent = wantsHave ? t('phase.printing') : t('phase.irreal');
				      }
			      if (checkoutForm) {
			        checkoutForm.hidden = true;
			        delete checkoutForm.dataset.checkoutFormSlug;
			      }
			      if (checkoutSubmit) checkoutSubmit.onclick = null;
			      if (checkoutStatus) {
			        checkoutStatus.removeAttribute('id');
			        checkoutStatus.className = 'preorder-status';
			        checkoutStatus.textContent = '';
			      }
				      if (btn) {
				        btn.hidden = false;
				      btn.disabled = false;
				      btn.dataset.closedLabelKey = wantsHave ? 'button.wantHave' : 'button.wantExist';
				      btn.textContent = t(btn.dataset.closedLabelKey);
				    }
				      if (emailTitle) emailTitle.textContent = wantsHave ? t('interestHave.emailTitle') : t('notify.emailPhysicalTitle');
				      if (emailCopy) emailCopy.textContent = wantsHave ? t('interestHave.emailCopy').replace('{product}', item.code) : t('notify.emailPhysicalCopy');
				      if (panel) panel.hidden = false;
			      if (conf) conf.hidden = false;
			    }
			  }

  function poblarModalPartyAnimal(slug) {
    const item = PARTY_ANIMALS[slug];
    const modal = document.getElementById('modal-party-animal');
    if (!item || !modal) return;

    partyAnimalActual = item;
    const setText = (selector, value) => {
      const el = modal.querySelector(selector);
      if (el) el.textContent = value;
	    };

	    setText('[data-party-code]', item.code);
	    setModalTitleVisual(modal, '[data-party-title]', item);
    const stateKey = item.stateKey || 'state.partyAnimalGestando';
    const setKeyedText = (selector, value, key) => {
      const el = modal.querySelector(selector);
      if (!el) return;
      if (key) el.dataset.i18n = key;
      else el.removeAttribute('data-i18n');
      el.textContent = value;
    };
    setKeyedText('[data-party-state]', t(stateKey), stateKey);
    setKeyedText('[data-party-badge]', t(stateKey), stateKey);
    setText('[data-party-series]', item.series);
    setText('[data-party-subtitle]', item.subtitle);
    setText('[data-party-concept]', item.concept);
    setText('[data-party-production]', item.production);
    setText('[data-party-action-title]', item.actionTitle || 'Party Animals');

    const img = modal.querySelector('[data-party-img]');
    const imageVersion = item.imageVersion || '20260531-party-white';
    if (img) {
      img.src = `${item.img}?v=${imageVersion}`;
      img.alt = item.alt || item.code;
    }

    const modelFigure = modal.querySelector('[data-party-model-figure]');
    const model = modal.querySelector('[data-party-model]');
    if (modelFigure && model) {
      if (item.model) {
        const modelSrc = `${item.model}?v=${item.modelVersion || '20260531-party'}`;
        modelFigure.hidden = false;
        model.dataset.modelSrc = modelSrc;
        if (item.keepMaterials === false) delete model.dataset.keepMaterials;
        else model.dataset.keepMaterials = 'true';
        model.setAttribute('poster', `${item.img}?v=${imageVersion}`);
        model.setAttribute('alt', `Modelo 3D de ${item.code}`);
        model.setAttribute('camera-orbit', item.cameraOrbit || '90deg 75deg 2m');
        model.setAttribute('camera-target', item.cameraTarget || '0m 0.45m 0m');
        model.setAttribute('field-of-view', item.fieldOfView || '30deg');
        if (model.getAttribute('src') !== modelSrc) model.removeAttribute('src');
      } else {
        modelFigure.hidden = true;
        model.removeAttribute('src');
        model.removeAttribute('data-model-src');
        delete model.dataset.modelSrc;
      }
    }

    const variantsWrap = modal.querySelector('[data-party-variants]');
    if (variantsWrap) {
      variantsWrap.innerHTML = '';
      const variants = item.variants || [];
      variantsWrap.hidden = variants.length === 0;
      variants.forEach((variant) => {
        const figure = document.createElement('figure');
        const variantImg = document.createElement('img');
        const caption = document.createElement('figcaption');
        variantImg.src = `${variant.src}?v=${variant.version || imageVersion}`;
        variantImg.alt = `${item.code} · ${variant.caption}`;
        variantImg.loading = 'lazy';
        caption.textContent = variant.caption || 'Estudio alterno';
        figure.appendChild(variantImg);
        figure.appendChild(caption);
        variantsWrap.appendChild(figure);
      });
    }

    const panel = document.getElementById('panel-votar-party-animal');
    const conf = document.getElementById('votar-conf-party-animal');
    const btn = document.getElementById('btn-votar-party-animal');
    const input = document.getElementById('email-input-party-animal');
    panel?.classList.remove('abierto');
    conf?.classList.remove('visible');
    if (conf) conf.textContent = '';
    if (input) input.value = '';
    if (btn) {
      btn.disabled = false;
      btn.dataset.closedLabelKey = 'button.wantHave';
      btn.textContent = t('button.wantHave');
    }
  }

  function poblarModalSimiug(slug) {
    const item = SIMIUGS[slug];
    const modal = document.getElementById('modal-simiug');
    if (!item || !modal) return;

    simiugActual = item;
    const setText = (selector, value) => {
      const el = modal.querySelector(selector);
      if (el) el.textContent = value;
	    };

	    setText('[data-simiug-code]', item.code);
	    setModalTitleVisual(modal, '[data-simiug-title]', item);
	    setText('[data-simiug-state]', t('state.simiugGestando'));
    setText('[data-simiug-series]', item.series);
    setText('[data-simiug-subtitle]', item.subtitle);
    setText('[data-simiug-concept]', item.concept);
    setText('[data-simiug-production]', item.production);

    const img = modal.querySelector('[data-simiug-img]');
    if (img) {
      img.src = `${item.img}?v=20260531-simiugs`;
      img.alt = item.alt || item.code;
    }

    const modelFigure = modal.querySelector('[data-simiug-model-figure]');
    const model = modal.querySelector('[data-simiug-model]');
    if (modelFigure && model) {
      if (item.model) {
        const modelSrc = `${item.model}?v=20260531-simiugs`;
        modelFigure.hidden = false;
        model.dataset.modelSrc = modelSrc;
        model.setAttribute('poster', `${item.img}?v=20260531-simiugs`);
        model.setAttribute('alt', `Modelo 3D de ${item.code}`);
        model.setAttribute('camera-orbit', item.cameraOrbit || '90deg 75deg 2m');
        model.setAttribute('camera-target', item.cameraTarget || '0m 0.45m 0m');
        model.setAttribute('field-of-view', item.fieldOfView || '30deg');
        if (model.getAttribute('src') !== modelSrc) model.removeAttribute('src');
      } else {
        modelFigure.hidden = true;
        model.removeAttribute('src');
        model.removeAttribute('data-model-src');
        delete model.dataset.modelSrc;
      }
    }

    const variantsWrap = modal.querySelector('[data-simiug-variants]');
    if (variantsWrap) {
      variantsWrap.innerHTML = '';
      const variants = item.variants || [];
      variantsWrap.hidden = variants.length === 0;
      variants.forEach((variant) => {
        const figure = document.createElement('figure');
        const variantImg = document.createElement('img');
        const caption = document.createElement('figcaption');
        variantImg.src = `${variant.src}?v=20260531-simiugs`;
        variantImg.alt = `${item.code} · ${variant.caption}`;
        variantImg.loading = 'lazy';
        caption.textContent = variant.caption || 'Vista alterna';
        figure.appendChild(variantImg);
        figure.appendChild(caption);
        variantsWrap.appendChild(figure);
      });
    }

    const panel = document.getElementById('panel-votar-simiug');
    const conf = document.getElementById('votar-conf-simiug');
    const btn = document.getElementById('btn-votar-simiug');
    const input = document.getElementById('email-input-simiug');
    panel?.classList.remove('abierto');
    conf?.classList.remove('visible');
    if (conf) conf.textContent = '';
    if (input) input.value = '';
    if (btn) {
      btn.disabled = false;
      btn.dataset.closedLabelKey = 'button.wantHave';
      btn.textContent = t('button.wantHave');
    }
  }

		  function abrirModal(slug, opcion, opts = {}) {
	    if (opcion && typeof opcion === 'object') {
      opts = opcion;
      opcion = null;
    }

    ocultarRutaEspecial();
    const canonicalSlug = limpiarSlug(slug);
    const route = ROUTING[canonicalSlug];
    if (!route) return;

    cerrarModalesVisualmente();

	    if (route.modal) {
	      const modal = document.getElementById(route.modal);
		      if (!modal) return;
		      if (route.literato) poblarModalLiterato(route.literato);
      if (route.partyAnimal) poblarModalPartyAnimal(route.partyAnimal);
      if (route.simiug) poblarModalSimiug(route.simiug);
		      modal.classList.add('abierto');
      document.body.classList.add('modal-locked');
      modal.scrollTop = 0;
      if (route.modalSlug === 'tuni') cambiarModeloTuni(opcion || opts.opcion || 'negra');
      cargarModelos3D(modal);
      prepararAlineacionExplosionado(modal);
      trackVistaProductoCheckout(canonicalSlug, route);
    }

    if (!opts.skipHistory) {
      const nextPath = pathParaSlug(canonicalSlug);
      if (window.location.pathname !== nextPath) {
        history.pushState({ slug: canonicalSlug, opcion: opcion || null }, '', nextPath);
      }
    }

    actualizarMetaTags(route);
  }

  function cargarModelos3D(modal) {
    if (modal?.querySelector('model-viewer[data-model-src]')) window.loadModelViewerOnce?.();
    modal.querySelectorAll('model-viewer[data-model-src]').forEach(viewer => {
      prepararModeloFdm(viewer);
      if (!viewer.getAttribute('src')) {
        viewer.setAttribute('src', viewer.dataset.modelSrc);
      }
    });
  }

  function cambiarModeloTuni(variante = 'negra') {
    const modal = document.getElementById('modal-tuni');
    const config = TUNI_MODELOS[variante] || TUNI_MODELOS.negra;
    const viewer = modal?.querySelector('#modelo-tuni');
    if (!modal || !viewer) return;

    modal.querySelector('[data-tuni-code]').textContent = config.code;
    modal.querySelector('[data-tuni-subtitle]').textContent = config.subtitle;
    viewer.dataset.modelSrc = config.src;
    viewer.setAttribute('alt', config.alt);
    modal.querySelectorAll('[data-tuni-variant]').forEach(btn => {
      btn.classList.toggle('activa', btn.dataset.tuniVariant === variante);
    });

    if (viewer.getAttribute('src') && viewer.getAttribute('src') !== config.src) {
      viewer.setAttribute('src', config.src);
    }
    traducirTextosComerciales();
    prepararModeloFdm(viewer);
    requestAnimationFrame(() => prepararAlineacionExplosionado(modal));
  }

	  function prepararModeloFdm(viewer) {
	    if (viewer.dataset.fdmReady === 'true') return;
	    viewer.dataset.fdmReady = 'true';
	    const aplicar = () => {
	      if (viewer.dataset.keepMaterials !== 'true') aplicarAcabadoFdm(viewer);
	      const modal = viewer.closest('.modal-explosionado');
	      if (modal) prepararAlineacionExplosionado(modal);
	    };
    viewer.addEventListener('load', aplicar);
    if (viewer.model) aplicar();
  }

  function limpiarTextura(textureInfo) {
    try {
      const resultado = textureInfo?.setTexture?.(null);
      if (resultado?.catch) resultado.catch(() => {});
    } catch (_) {}
  }

  function aplicarAcabadoFdm(viewer) {
    const materiales = viewer.model?.materials || [];
    materiales.forEach(material => {
      const pbr = material.pbrMetallicRoughness;
      if (!pbr) return;
      limpiarTextura(pbr.baseColorTexture);
      limpiarTextura(pbr.metallicRoughnessTexture);
      pbr.setBaseColorFactor(FDM_RAW_COLOR);
      pbr.setMetallicFactor?.(0);
      pbr.setRoughnessFactor?.(0.92);
      material.setEmissiveFactor?.([0, 0, 0]);
    });
  }

  function cerrarModal(opts = {}) {
    ocultarRutaEspecial();
    cerrarModalesVisualmente();
    if (!opts.skipHistory && window.location.pathname !== homePathActual()) {
      history.pushState({}, '', homePathActual());
    }
    actualizarMetaTags(HOME);
  }

  function cerrarSiClickFuera(event, slug) {
    if (event.target.id === 'modal-' + slug) cerrarModal();
  }

  function abrirRutaDesdeNavegacion(slug, opts = {}) {
    ocultarRutaEspecial();
    const route = ROUTING[slug];
    if (!route) {
      cerrarModal({ skipHistory: true });
      history.replaceState({}, '', homePathActual());
      return;
    }

    if (route.modal) {
      abrirModal(slug, opts.opcion || null, { skipHistory: true });
    } else {
      cerrarModalesVisualmente();
      actualizarMetaTags(route);
    }
  }

  function resolverRutaInicial() {
    if (window.location.hash) {
      const hashSlug = limpiarSlug(window.location.hash.replace(/^#/, ''));
      if (ROUTING[hashSlug]) {
        history.replaceState({ slug: hashSlug }, '', pathParaSlug(hashSlug));
      }
    }

    if (renderRutaEspecialSiAplica()) return;
    ocultarRutaEspecial();

    const { slug } = estadoPathActual();
    if (!slug) {
      actualizarMetaTags(HOME);
      return;
    }

    const route = ROUTING[slug];
    if (!route) {
      history.replaceState({}, '', homePathActual());
      actualizarMetaTags(HOME);
      return;
    }

    setTimeout(() => scrollARuta(route), 200);
    setTimeout(() => abrirRutaDesdeNavegacion(slug, history.state || {}), 800);
  }

  window.addEventListener('popstate', (event) => {
    if (renderRutaEspecialSiAplica()) return;
    ocultarRutaEspecial();

    const { slug } = estadoPathActual();
    if (!slug) {
      cerrarModal({ skipHistory: true });
      return;
    }

    const route = ROUTING[slug];
    if (!route) {
      cerrarModal({ skipHistory: true });
      history.replaceState({}, '', homePathActual());
      return;
    }

    scrollARuta(route, 'auto');
    abrirRutaDesdeNavegacion(slug, event.state || {});
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolverRutaInicial);
  } else {
    resolverRutaInicial();
  }

  function prepararAlineacionExplosionado(modal) {
    const objetos = modal.querySelectorAll('.objeto-wrapper img, .objeto-wrapper model-viewer');
    objetos.forEach(objeto => {
      if (objeto.tagName === 'MODEL-VIEWER') {
        objeto.addEventListener('load', () => alinearLineasExplosionado(modal), { once: true });
      } else if (!objeto.complete) {
        objeto.addEventListener('load', () => alinearLineasExplosionado(modal), { once: true });
      }
    });
    requestAnimationFrame(() => alinearLineasExplosionado(modal));
  }

  function alinearLineasExplosionado(scope = document) {
    const areas = scope.matches?.('.exp-area') ? [scope] : scope.querySelectorAll('.exp-area');

    areas.forEach(area => {
      const svg = area.querySelector('.lineas');
      const objeto = area.querySelector('.objeto-wrapper model-viewer') || area.querySelector('.objeto-wrapper img') || area.querySelector('.objeto-wrapper');
      if (!svg || !objeto) return;

      if (getComputedStyle(svg).display === 'none') {
        svg.removeAttribute('data-ready');
        svg.replaceChildren();
        return;
      }

      if (window.matchMedia('(max-width: 760px)').matches) {
        svg.removeAttribute('data-ready');
        return;
      }

      const areaRect = area.getBoundingClientRect();
      const objetoRect = objeto.getBoundingClientRect();
      if (!areaRect.width || !areaRect.height || !objetoRect.width || !objetoRect.height) return;

      svg.setAttribute('viewBox', `0 0 ${areaRect.width} ${areaRect.height}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.replaceChildren();

      const objetoTop = objetoRect.top - areaRect.top;
      const objetoBottom = objetoRect.bottom - areaRect.top;
      const objetoInset = Math.min(18, objetoRect.width * 0.08);
      const objetoIzq = objetoRect.left - areaRect.left + objetoInset;
      const objetoDer = objetoRect.right - areaRect.left - objetoInset;

      const trazar = (callout, lado) => {
        const caja = callout.getBoundingClientRect();
        const desdeX = (lado === 'izq' ? caja.right : caja.left) - areaRect.left;
        const desdeY = caja.top - areaRect.top + caja.height / 2;
        const hastaX = lado === 'izq' ? objetoIzq : objetoDer;
        const hastaY = Math.min(Math.max(desdeY, objetoTop + 16), objetoBottom - 16);
        const distancia = Math.abs(hastaX - desdeX);
        const codoX = lado === 'izq'
          ? desdeX + Math.max(28, distancia * 0.58)
          : desdeX - Math.max(28, distancia * 0.58);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${desdeX.toFixed(1)} ${desdeY.toFixed(1)} L ${codoX.toFixed(1)} ${desdeY.toFixed(1)} L ${codoX.toFixed(1)} ${hastaY.toFixed(1)} L ${hastaX.toFixed(1)} ${hastaY.toFixed(1)}`);
        svg.appendChild(path);

        const punto = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        punto.setAttribute('cx', hastaX.toFixed(1));
        punto.setAttribute('cy', hastaY.toFixed(1));
        punto.setAttribute('r', '4');
        svg.appendChild(punto);
      };

      area.querySelectorAll('.col-izq .callout').forEach(callout => trazar(callout, 'izq'));
      area.querySelectorAll('.col-der .callout').forEach(callout => trazar(callout, 'der'));
      svg.dataset.ready = 'true';
    });
  }

  window.addEventListener('resize', () => {
    document.querySelectorAll('.modal-explosionado.abierto').forEach(modal => {
      alinearLineasExplosionado(modal);
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarModal();
  });

	  const SONDEO_ENDPOINT = 'https://api.simioplateado.com/api/sondeo';
		  const PREORDER_ENDPOINT = 'https://api.simioplateado.com/api/preorder';
		  const CHECKOUT_ENDPOINT = 'https://api.simioplateado.com/api/checkout';
		  const CHECKOUT_ISSUE_ENDPOINT = 'https://api.simioplateado.com/api/checkout-issue';
		  const ANALYTICS_ENDPOINT = 'https://api.simioplateado.com/api/analytics';
		  const SONDEO_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	  const CHECKOUT_REQUIRED_FIELDS = ['nombre', 'email', 'telefono', 'direccion', 'ciudad', 'departamento', 'pais'];
	  const CHECKOUT_SIZE_SLUGS = ['camiseta-blanca', 'camiseta-negra', 'gorra'];

  const SONDEO_SLUGS = {
    tuni: 'tuni-v01-negra',
    copa: 'copa-chiste-colombia-v0',
    marxito: 'marxito-v01',
    punk: 'planti-punk-v01',
    punkxl: 'planti-punk-xl-v01',
    k: 'planti-k-v01',
    kxl: 'planti-k-xl-v01',
    traumin: 'traumin-v01',
	    superhombresito: 'superhombresito-v01',
	    'osito-wu-tang': 'wu-tang-osito-v01',
	    gotimonda: 'gotimonda-v01',
		    'vasija-atlas': 'vasija-atlas-v01',
		    '4-monos': '4-monos-v01',
			    'esponja-g': 'esponja-g-v01',
				    cthulito: 'cthulito-v01',
				    quijotico: 'quijotico-v01',
				    poesito: 'poesito-v01',
			    dostoiecito: 'mini-fiodor-v01',
			    acefalo: 'acefalo-v01',
			    jarron: 'kraken-florero-v01',
    dialoguin: 'dialoguin-v01',
    minidevenires: 'mini-devenires-v01',
    arturito: 'arturito-v01',
    gramscito: 'gramscito-v01',
    lacancito: 'lacancito-v01',
    'capitan-nausea': 'capitan-nausea-v01',
    parchao: 'parchao-v01',
    melisimo: 'melisimo-v01'
  };

  const PREORDER_PRODUCTS = {
    'camiseta-blanca': { name: 'CAMISETA_BLANCA', price: 20.40, sizes: ['S', 'M', 'L', 'XL'] },
    'camiseta-negra': { name: 'CAMISETA_NEGRA', price: 22.80, sizes: ['S', 'M', 'L', 'XL'] },
    gorra: { name: 'GORRA', price: 26.40, sizes: ['unitalla'] },
      superhombresito: { name: 'NIETZSCHESITO.v01', price: 58, sizes: ['pieza-unica'] }
  };

  const CHECKOUT_PRODUCTS_FRONT = {
    'camiseta-blanca': { name: 'CAMISETA_BLANCA', priceCop: 81600, modalSlug: 'wearables/camiseta-blanca', category: 'wearables' },
    'camiseta-negra': { name: 'CAMISETA_NEGRA', priceCop: 91200, modalSlug: 'wearables/camiseta-negra', category: 'wearables' },
    gorra: { name: 'GORRA', priceCop: 105600, modalSlug: 'wearables/gorra', category: 'wearables' },
	    marxito: { name: 'MARXITO.v01', priceCop: 250000, modalSlug: 'marxito', category: 'figuras' },
	    traumin: { name: 'TRAUMIN.v01', priceCop: 220000, modalSlug: 'traumin', category: 'figuras' },
	    superhombresito: { name: 'NIETZSCHESITO.v01', priceCop: 230000, modalSlug: 'superhombresito', category: 'figuras' },
				    cthulito: { name: 'CTHULITO.v01', priceCop: 300000, modalSlug: 'cthulito', category: 'figuras' },
				    quijotico: { name: 'QUIJOTICO.v01', priceCop: 260000, modalSlug: 'quijotico', category: 'figuras' },
				    gabito: { name: 'GABITO.v01', priceCop: 240000, modalSlug: 'gabito', category: 'figuras' },
			    poesito: { name: 'POESITO.v01', priceCop: 230000, modalSlug: 'poesito', category: 'figuras' },
		    dostoiecito: { name: 'MINI_FIODOR.v01', priceCop: 230000, modalSlug: 'mini-fiodor', category: 'figuras' },
		    acefalo: { name: 'ACEFALO.v01', priceCop: 200000, modalSlug: 'acefalo', category: 'objetos' },
		    jarron: { name: 'KRAKEN_FLORERO.v01', priceCop: 220000, modalSlug: 'jarron', category: 'objetos' }
	  };

  function productoCheckout(slug) {
    const clean = (slug || '').replace(/^wearables\//, '');
    return CHECKOUT_PRODUCTS_FRONT[clean] ? { slug: clean, ...CHECKOUT_PRODUCTS_FRONT[clean] } : null;
  }

  function slugCheckoutDesdeRuta(canonicalSlug, route) {
    return productoCheckout(canonicalSlug)?.slug || productoCheckout(route?.modalSlug)?.slug || null;
  }

  function pixelParamsProducto(slug, extra = {}) {
    const product = productoCheckout(slug);
    if (!product) return null;
    return {
      content_ids: [product.slug],
      content_name: product.name,
      content_category: product.category,
      content_type: 'product',
      contents: [{ id: product.slug, quantity: 1, item_price: product.priceCop }],
      value: product.priceCop,
      currency: 'COP',
      ...extra
    };
  }

	  function trackPixel(eventName, params = {}, mode = 'track') {
	    try {
	      if (typeof window.fbq === 'function') window.fbq(mode, eventName, params);
	    } catch (_) {}
	  }

	  function simioSessionId() {
	    try {
	      const key = 'simio:analyticsSession';
	      const existing = localStorage.getItem(key);
	      if (existing) return existing;
	      const next = (crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(16).slice(2)).slice(0, 80);
	      localStorage.setItem(key, next);
	      return next;
	    } catch (_) {
	      return '';
	    }
	  }

	  function limpiarContextoAnalitica(context = {}) {
	    const blocked = new Set(['email', 'customer', 'cliente', 'shipping', 'direccion', 'address', 'telefono', 'phone', 'nombre', 'name']);
	    const clean = {};
	    Object.entries(context || {}).slice(0, 12).forEach(([key, value]) => {
	      const cleanKey = String(key || '').toLowerCase().replace(/[^a-z0-9_:-]+/g, '_').slice(0, 50);
	      if (!cleanKey || blocked.has(cleanKey)) return;
	      if (typeof value === 'number' || typeof value === 'boolean') {
	        clean[cleanKey] = value;
	      } else if (typeof value === 'string') {
	        clean[cleanKey] = value.slice(0, 160);
	      }
	    });
	    return clean;
	  }

	  function trackSimio(eventName, slug, context = {}) {
	    try {
	      const product = productoCheckout(slug);
	      const payload = JSON.stringify({
	        event: eventName,
	        slug: product?.slug || slug || '',
	        product: product?.name || '',
	        source: context.source || '',
	        path: window.location.pathname + window.location.search,
	        referrer: document.referrer || '',
	        lang: currentLang,
	        session_id: simioSessionId(),
	        context: limpiarContextoAnalitica(context)
	      });

	      if (navigator.sendBeacon) {
	        const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
	        navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
	        return;
	      }

	      fetch(ANALYTICS_ENDPOINT, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: payload,
	        keepalive: true
	      }).catch(() => {});
	    } catch (_) {}
	  }

	  function trackEventoComercio(eventName, slug, extra = {}) {
	    const params = pixelParamsProducto(slug, extra);
	    if (params) trackPixel(eventName, params);
	  }

  function trackEventoComercioCustom(eventName, slug, extra = {}) {
    const params = pixelParamsProducto(slug, extra) || extra;
    trackPixel(eventName, params, 'trackCustom');
  }

	  function trackVistaProductoCheckout(canonicalSlug, route) {
	    const slug = slugCheckoutDesdeRuta(canonicalSlug, route);
	    if (slug) {
	      trackEventoComercio('ViewContent', slug, { source: 'modal' });
	      trackSimio('product_view', slug, { source: 'modal' });
	    }
	  }

  function guardarUltimoCheckout(slug, data = {}) {
    const product = productoCheckout(slug);
    if (!product) return;
    try {
      sessionStorage.setItem('simio:lastCheckout', JSON.stringify({
        slug: product.slug,
        name: product.name,
        price_cop: product.priceCop,
        currency: 'COP',
        order_id: data.order_id || data.orderId || '',
        checkout_id: data.checkout_id || data.preference_id || '',
        ts: Date.now()
      }));
    } catch (_) {}
  }

  function leerUltimoCheckout() {
    try {
      return JSON.parse(sessionStorage.getItem('simio:lastCheckout') || 'null');
    } catch (_) {
      return null;
    }
  }

	  function checkoutReturnKey(status, params) {
	    const lastCheckout = leerUltimoCheckout();
	    return [
	      'simio:checkoutReturn',
	      status,
	      params.get('payment_id') || params.get('collection_id') || params.get('preference_id') || lastCheckout?.checkout_id || lastCheckout?.order_id || 'sin-id'
	    ].join(':');
	  }

	  function revisarRetornoCheckout() {
	    if (esRutaEspecialPath(window.location.pathname)) return;
	    const params = new URLSearchParams(window.location.search);
	    const checkoutStatus = (params.get('checkout') || '').toLowerCase();
	    const paymentStatus = (params.get('collection_status') || params.get('status') || '').toLowerCase();
	    const status = paymentStatus || checkoutStatus;
	    if (!status) return;

	    const key = checkoutReturnKey(status, params);
	    try {
	      if (sessionStorage.getItem(key)) return;
	      sessionStorage.setItem(key, '1');
	    } catch (_) {}

	    const lastCheckout = leerUltimoCheckout();
	    const fallbackSlug = params.get('slug') || params.get('sku') || params.get('product') || lastCheckout?.slug;
	    const checkoutProduct = productoCheckout(fallbackSlug);

		    trackEventoComercioCustom('CheckoutReturn', checkoutProduct?.slug, {
		      status,
		      checkout_status: checkoutStatus || undefined,
		      payment_status: paymentStatus || undefined,
		      content_ids: checkoutProduct ? [checkoutProduct.slug] : [],
		      content_name: checkoutProduct?.name || lastCheckout?.name || 'unknown'
		    });
		    trackSimio('checkout_return', checkoutProduct?.slug || fallbackSlug, {
		      status,
		      checkout_status: checkoutStatus || '',
		      payment_status: paymentStatus || ''
		    });
		  }

	  function limpiarCheckoutIssueWidget(slug) {
	    const cleanSlug = (slug || '').replace(/^wearables\//, '') || 'unknown';
	    document.querySelectorAll('[data-checkout-issue="' + cleanSlug + '"]').forEach(box => box.remove());
	  }

	  function checkoutIssueContext(base = {}) {
	    const params = new URLSearchParams(window.location.search);
	    const lastCheckout = leerUltimoCheckout() || {};
	    return {
	      source: base.source || 'checkout_issue',
	      status: base.status || params.get('collection_status') || params.get('status') || params.get('checkout') || '',
	      message: base.message || '',
	      url: window.location.href,
	      payment_id: base.payment_id || params.get('payment_id') || params.get('collection_id') || '',
	      preference_id: base.preference_id || params.get('preference_id') || lastCheckout.checkout_id || '',
	      external_reference: base.external_reference || params.get('external_reference') || '',
	      order_id: base.order_id || lastCheckout.order_id || '',
	      checkout_id: base.checkout_id || lastCheckout.checkout_id || ''
	    };
	  }

	  function checkoutIssueDefaultEmail(slug) {
	    const email = (campoCheckout(slug, 'email')?.value || '').trim();
	    return SONDEO_EMAIL_RE.test(email) ? email.toLowerCase() : '';
	  }

	  function mostrarCheckoutIssueWidget(target, slug, context = {}) {
	    if (!target) return;
	    const product = productoCheckout(slug);
	    const cleanSlug = product?.slug || (slug || 'unknown');
	    limpiarCheckoutIssueWidget(cleanSlug);

	    const mergedContext = checkoutIssueContext({
	      ...context,
	      product: product?.name || context.product || ''
	    });
	    const suggestedEmail = context.email || checkoutIssueDefaultEmail(cleanSlug);
	    const box = document.createElement('div');
	    box.className = 'checkout-issue-box';
	    box.dataset.checkoutIssue = cleanSlug;
	    box.dataset.issueContext = JSON.stringify(mergedContext);
	    box.innerHTML = [
	      '<button class="checkout-issue-toggle" type="button" data-issue-toggle>' + escapeHtml(t('checkout.issueButton')) + '</button>',
	      '<form class="checkout-issue-form" data-issue-form hidden>',
	      '<p class="checkout-issue-copy">' + escapeHtml(t('checkout.issueCopy')) + '</p>',
	      '<label class="checkout-issue-label">' + escapeHtml(t('checkout.issueEmailLabel')),
	      '<input type="email" data-issue-email inputmode="email" autocomplete="email" placeholder="' + escapeHtml(t('checkout.issueEmailPlaceholder')) + '" value="' + escapeHtml(suggestedEmail) + '">',
	      '</label>',
	      '<button class="checkout-issue-submit" type="submit" data-issue-submit>' + escapeHtml(t('checkout.issueSend')) + '</button>',
	      '<div class="checkout-issue-status" data-issue-status aria-live="polite"></div>',
	      '</form>'
	    ].join('');

	    const form = box.querySelector('[data-issue-form]');
	    const toggle = box.querySelector('[data-issue-toggle]');
		    const emailInput = box.querySelector('[data-issue-email]');
		    toggle.addEventListener('click', () => {
		      form.hidden = !form.hidden;
		      if (!form.hidden) {
		        trackSimio('checkout_issue_opened', cleanSlug, {
		          source: mergedContext.source || 'checkout_issue',
		          status: mergedContext.status || ''
		        });
		        window.setTimeout(() => emailInput?.focus(), 40);
		      }
		    });
	    form.addEventListener('submit', (event) => enviarCheckoutIssue(event, cleanSlug, box));

	    if (target.dataset?.checkoutIssueRoute === 'true') {
	      target.appendChild(box);
	    } else {
	      target.insertAdjacentElement('afterend', box);
	    }
	  }

	  async function enviarCheckoutIssue(event, slug, box) {
	    event?.preventDefault?.();
	    const product = productoCheckout(slug);
	    const emailInput = box.querySelector('[data-issue-email]');
	    const submit = box.querySelector('[data-issue-submit]');
	    const status = box.querySelector('[data-issue-status]');
	    const email = (emailInput?.value || '').trim().toLowerCase();
	    let context = {};

	    try {
	      context = JSON.parse(box.dataset.issueContext || '{}') || {};
	    } catch (_) {
	      context = {};
	    }

	    status.className = 'checkout-issue-status';
	    status.textContent = '';

	    if (email && !SONDEO_EMAIL_RE.test(email)) {
	      status.textContent = t('checkout.issueInvalidEmail');
	      status.classList.add('error');
	      emailInput?.focus();
	      return;
	    }

	    submit.disabled = true;
	    submit.textContent = t('checkout.issueSending');

	    try {
	      const resp = await fetch(CHECKOUT_ISSUE_ENDPOINT, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({
	          ...context,
	          slug,
	          product: product?.name || context.product || 'unknown',
	          email,
	          lang: currentLang
	        })
	      });
	      const data = await resp.json().catch(() => ({}));
	      if (!resp.ok || !data.ok) throw new Error(data.message || data.error || 'checkout_issue_error');

		      trackEventoComercioCustom('CheckoutIssueReported', product?.slug, {
		        source: context.source || 'checkout_issue',
		        status: context.status || '',
		        has_email: Boolean(email)
		      });
		      trackSimio('checkout_issue_reported', product?.slug || slug, {
		        source: context.source || 'checkout_issue',
		        status: context.status || '',
		        has_email: Boolean(email)
		      });
	      status.textContent = email ? t('checkout.issueSuccess') : t('checkout.issueSuccessNoEmail');
	      status.classList.add('ok');
	      submit.textContent = t('checkout.issueSend');
	    } catch (_) {
	      status.textContent = t('checkout.issueError');
	      status.classList.add('error');
	      submit.textContent = t('checkout.issueSend');
	      submit.disabled = false;
	    }
	  }

		  function formCheckout(slug) {
		    const product = productoCheckout(slug);
		    if (!product) return null;
		    const modal = document.getElementById('modal-' + product.slug);
		    return document.querySelector(`[data-checkout-form-slug="${product.slug}"]`) || modal?.querySelector('.checkout-form') || null;
		  }

	  function campoCheckout(slug, campo) {
	    return document.getElementById('checkout-' + campo + '-' + slug);
	  }

	  function limpiarErrorCampoCheckout(field) {
	    if (!field) return;
	    field.classList.remove('field-error');
	    field.removeAttribute('aria-invalid');
	    const helpId = field.id + '-error';
	    if (field.getAttribute('aria-describedby') === helpId) field.removeAttribute('aria-describedby');
	    document.getElementById(helpId)?.remove();
	  }

	  function marcarErrorCampoCheckout(field, message) {
	    if (!field) return;
	    const helpId = field.id + '-error';
	    field.classList.add('field-error');
	    field.setAttribute('aria-invalid', 'true');
	    field.setAttribute('aria-describedby', helpId);
	    let help = document.getElementById(helpId);
	    if (!help) {
	      help = document.createElement('span');
	      help.className = 'field-help';
	      help.id = helpId;
	      field.insertAdjacentElement('afterend', help);
	    }
	    help.textContent = message;
	  }

	  function ocultarToastCheckout(form) {
	    const toast = form?.querySelector('[data-checkout-toast]');
	    if (toast) toast.hidden = true;
	  }

	  function mostrarToastCheckout(form, message) {
	    if (!form) return;
	    let toast = form.querySelector('[data-checkout-toast]');
	    if (!toast) {
	      toast = document.createElement('div');
	      toast.className = 'inline-toast';
	      toast.dataset.checkoutToast = 'true';
	      toast.setAttribute('role', 'status');
	      form.insertBefore(toast, form.firstElementChild);
	    }
	    toast.textContent = message;
	    toast.hidden = false;
	  }

	  function activarLimpiezaErroresCheckout(form) {
	    if (!form || form.dataset.validationReady === 'true') return;
	    form.dataset.validationReady = 'true';
	    form.querySelectorAll('input, select, textarea').forEach(field => {
	      field.addEventListener('input', () => limpiarErrorCampoCheckout(field));
	      field.addEventListener('change', () => limpiarErrorCampoCheckout(field));
	    });
	  }

	  function validarCheckoutForm(slug, options = {}) {
	    const product = productoCheckout(slug);
	    const form = formCheckout(slug);
	    const showErrors = options.showErrors === true;
	    const invalid = [];

		    if (!product || !form) return { ok: false, form, firstInvalid: null, invalidCount: 1 };
	    activarLimpiezaErroresCheckout(form);
	    if (showErrors) {
	      form.querySelectorAll('.field-error').forEach(field => limpiarErrorCampoCheckout(field));
	      ocultarToastCheckout(form);
	    }

	    CHECKOUT_REQUIRED_FIELDS.forEach(campo => {
	      const field = campoCheckout(product.slug, campo);
	      const value = (field?.value || '').trim();
	      if (!value) invalid.push({ field, message: t('checkout.requiredField') });
	    });

	    const emailField = campoCheckout(product.slug, 'email');
	    const email = (emailField?.value || '').trim();
	    if (email && !SONDEO_EMAIL_RE.test(email)) {
	      invalid.push({ field: emailField, message: t('checkout.invalidEmailField') });
	    }

	    if (CHECKOUT_SIZE_SLUGS.includes(product.slug)) {
	      const sizeField = campoCheckout(product.slug, 'talla');
	      if (!(sizeField?.value || '').trim()) {
	        invalid.push({ field: sizeField, message: t('checkout.missingSize') });
	      }
	    }

	    if (showErrors && invalid.length) {
	      const seen = new Set();
	      invalid.forEach(item => {
	        if (!item.field || seen.has(item.field.id)) return;
	        seen.add(item.field.id);
	        marcarErrorCampoCheckout(item.field, item.message);
	      });
	      mostrarToastCheckout(form, t('checkout.completeRequired'));
	      const firstInvalid = invalid.find(item => item.field)?.field || null;
	      const bloque = form.closest('.votar-bloque') || form;
	      bloque.scrollIntoView({ behavior: 'smooth', block: 'start' });
	      window.setTimeout(() => firstInvalid?.focus({ preventScroll: true }), 420);
		      return { ok: false, form, firstInvalid, invalidCount: invalid.length };
		    }

		    return { ok: invalid.length === 0, form, firstInvalid: invalid[0]?.field || null, invalidCount: invalid.length };
		  }

  function actualizarCtasCheckoutRapidas() {
    Object.entries(CHECKOUT_PRODUCTS_FRONT).forEach(([slug, product]) => {
      const modal = document.getElementById('modal-' + slug);
      const meta = modal?.querySelector('.exp-meta-row');
      if (!modal || !meta) return;

      let row = modal.querySelector('[data-checkout-fast="' + slug + '"]');
      if (!row) {
        row = document.createElement('div');
        row.className = 'checkout-fast-row';
        row.dataset.checkoutFast = slug;
        row.innerHTML = [
          '<div class="checkout-fast-copy">',
          '<strong data-fast-title></strong>',
          '<span data-fast-copy></span>',
          '</div>',
          '<button class="checkout-fast-button" type="button" data-fast-button></button>'
        ].join('');
	        row.querySelector('[data-fast-button]').addEventListener('click', () => intentarCheckoutRapido(slug, 'modal_fast_cta'));
        meta.insertAdjacentElement('afterend', row);
      }

      row.querySelector('[data-fast-title]').textContent = t('checkout.fastTitle');
      row.querySelector('[data-fast-copy]').textContent = t('checkout.fastCopy');
      row.querySelector('[data-fast-button]').textContent = t('checkout.fastButton');
      row.querySelector('[data-fast-button]').setAttribute('aria-label', `${t('checkout.fastButton')} · ${product.name}`);
    });
  }

		  function enfocarFormularioCheckout(slug, source = 'modal_fast_cta') {
		    const product = productoCheckout(slug);
		    if (!product) return;

		    const modal = document.getElementById('modal-' + product.slug);
		    const form = document.querySelector(`[data-checkout-form-slug="${product.slug}"]`) || modal?.querySelector('.checkout-form');
	    if (!form) return;

    const bloque = form.closest('.votar-bloque') || form;
    bloque.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(() => {
      const firstInput = document.getElementById('checkout-nombre-' + product.slug);
	      firstInput?.focus({ preventScroll: true });
	    }, 420);
	  }

	  function intentarCheckoutRapido(slug, source = 'modal_fast_cta') {
	    const product = productoCheckout(slug);
	    if (!product) return;

	    const validation = validarCheckoutForm(product.slug, { showErrors: true });
	    if (!validation.ok) return;

	    const btn = document.querySelector('[data-checkout-fast="' + product.slug + '"] [data-fast-button]');
	    iniciarCompra({ preventDefault() {}, currentTarget: btn }, product.slug, source);
	  }

  function abrirCompra(slug, source = 'store_card') {
    const product = productoCheckout(slug);
	    if (!product) {
	      abrirModal(slug);
	      return;
	    }

	    trackEventoComercio('AddToCart', product.slug, { source, num_items: 1 });
	    trackSimio('buy_cta_click', product.slug, { source, num_items: 1 });
	    abrirModal(product.modalSlug);
	    window.setTimeout(() => enfocarFormularioCheckout(product.slug, source), 120);
	  }

	  if (document.readyState === 'loading') {
	    document.addEventListener('DOMContentLoaded', () => {
	      trackSimio('page_view', null, { source: 'page' });
	      revisarRetornoCheckout();
	    });
	  } else {
	    trackSimio('page_view', null, { source: 'page' });
	    revisarRetornoCheckout();
	  }

  const I18N = {
    es: {
      'nav.drop': 'drop 001',
      'nav.available': 'disponible',
      'nav.encargos': 'a pedido',
      'nav.about': 'about',
      'view.gallery': 'Galería',
      'view.store': 'Tienda',
      'store.kicker': 'Vista tienda',
      'store.title': 'Piezas disponibles',
      'store.copy': 'La galería vista como producto: piezas terminadas, modelos, procesos y objetos listos para comprar o seguir de cerca. El recorrido se ordena por familias para mirar el catálogo como un archivo vivo.',
      'home.phrase': 'Destrúyelo todo. Que no quede nada.',
      'home.dropStatus': 'Drop 001 — checkout + pre-order',
      'drop.title': 'Galería — Drop 001',
      'drop.center': 'ordenada por familias',
      'drop.right': 'subtemas / estados',
      'drop.legend': 'Galería web. Entre lo vivo y lo irreal. Con objetos disponibles, en gestación y en el imaginario colectivo. Todo puede existir si así lo deseas; solo dale vida con un click.',
      'original.title': 'Piezas exclusivas',
      'original.copy': 'El sello identifica piezas diseñadas desde el universo Simio Plateado: objetos, personajes, wearables y modelos que no salen de una plantilla ni existen como producto genérico.',
      'original.note': 'Diseño propio · tiradas pequeñas · producción experimental',
      'filter.availability': 'Disponibilidad',
      'filter.family': 'Familia',
      'filter.all': 'Todo',
      'filter.available': 'Disponibles',
      'filter.gestating': 'Gestándose',
      'filter.irreal': 'Irreales',
      'filter.impossible': 'Imposibles',
      'filter.family.greatMinds': 'GRANDES/MENTES',
	      'filter.family.literatos': 'LITERATOS',
	      'filter.family.partyAnimals': 'PARTY ANIMALS',
	      'filter.family.simiugs': 'SIMIUGS',
	      'filter.family.speakers': 'BOCINAS',
	      'filter.family.objects': 'OBJETOS',
      'filter.family.other': 'OTROS',
      'gallery.group.greatMinds': 'Autores, teorías, ideologías y pequeñas cabezas que ya entraron al laboratorio material.',
      'gallery.group.literatos': 'Escritores y criaturas de biblioteca: figuras entre cita, mito y caricatura.',
      'gallery.group.objects': 'Objetos físicos, recipientes, monstruos y piezas raras que ya piden escala propia.',
	      'gallery.group.partyAnimals': 'Mascotas sonoras y personajes de fiesta: diseñados como juguetes posibles con modelo 3D.',
	      'gallery.group.simiugs': 'Tazas y recipientes imposibles: objetos utilitarios contaminados por gesto y fantasía.',
	      'gallery.group.speakers': 'Objetos sonoros y parlantes escultóricos: máscaras, cráneos y criaturas donde el sonido también tiene cuerpo.',
	      'gallery.group.tuni': 'El dispositivo base de la casa: silicona, pantalla, pequeño compañero improbable.',
      'gallery.group.planti': 'Macetas-personaje y plantas con actitud: piezas de hogar con otra temperatura.',
      'gallery.group.colombia': 'Chistes, trofeos y pequeñas alegorías locales que cargan fiesta y derrota.',
      'gallery.group.audio': 'Piezas imposibles para escuchar con los ojos: exhibición pura, sin promesa de fabricación.',
      'gallery.group.other': 'Piezas satélite, diálogos y ensayos que orbitan el catálogo principal.',
      'gallery.group.wearables': 'Para llevar puesto: camisetas, gorra y objetos textiles al final del recorrido.',
      'gallery.group.generic': 'Piezas agrupadas por familia dentro del catálogo vivo.',
      'filter.empty': 'No hay piezas con ese filtro por ahora.',
      'wearables.center': 'para llevarse puesto',
      'wearables.right': 'compra abierta',
      'wearables.legend': 'Camisetas y gorra ya están disponibles para compra directa. Parchao y Melísimo siguen gestándose: dejan email y avisamos cuando abran reserva.',
      'state.available': 'Disponible · compra abierta',
      'state.buyOpen': 'Disponible · compra abierta',
      'state.gestando': 'Gestándose · pre-order en camino',
      'state.printingTest': 'Gestándose · prueba de impresión',
	      'state.partyAnimalGestando': 'Gestándose · modelo 3D listo',
	      'state.simiugGestando': 'Gestándose · prototipo de objeto',
	      'state.visualOnly': 'Gestándose · imagen sin fondo cargada',
	      'state.irrealDigital': 'IRREAL · existencia digital',
      'state.impossible': 'IMPOSIBLE · exhibición pura',
      'price.punk': 'USD 74 · en producción',
      'price.punkxl': 'USD 85 · en producción',
      'price.k': 'USD 72 · en producción',
      'price.kxl': 'USD 84 · en producción',
      'price.parchao': 'USD 70 · en producción',
      'price.melisimo': 'USD 70 · en producción',
      'price.irreal188': 'USD 188 · tirada limitada',
      'price.irreal64': 'USD 64 · tirada limitada',
      'price.irreal108': 'USD 108 · tirada limitada',
      'price.irreal84': 'USD 84 · tirada limitada',
      'price.irreal132': 'USD 132 · tirada muy limitada',
      'price.irreal148': 'USD 148 · tirada limitada',
      'price.nietzschesito': 'COP 230.000 · USD 58 ref. · tirada inicial 10',
      'price.marxito': 'COP 250.000 · USD 63 ref. · tirada inicial 10',
      'price.traumin': 'COP 220.000 · USD 55 ref. · tirada inicial 10',
	      'price.jarron': 'COP 220.000 · USD 55 ref. · tirada inicial 5',
				      'price.cthulito': 'COP 300.000 · USD 75 ref. · tirada inicial 3',
				      'price.quijotico': 'COP 260.000 · USD 65 ref. · pieza disponible',
				      'price.gabito': 'COP 240.000 · USD 60 ref. · pieza disponible',
			      'price.poesito': 'COP 230.000 · USD 58 ref. · pieza disponible',
		      'price.dostoiecito': 'COP 230.000 · USD 58 ref. · pieza disponible',
		      'price.acefalo': 'COP 200.000 · USD 50 ref. · pieza disponible',
	      'price.camisetaBlanca': 'COP 81.600 · USD 20.4 ref.',
      'price.camisetaNegra': 'COP 91.200 · USD 22.8 ref.',
      'price.gorra': 'COP 105.600 · USD 26.4 ref.',
      'desc.arturitoDigital': 'existencia digital · modelo en cola',
      'desc.gramscitoDigital': 'existencia digital · lucha libre de clases',
      'desc.lacancitoDigital': 'existencia digital · síntoma en cola',
      'desc.capitanNauseaDigital': 'existencia digital · náusea capitaneada',
      'desc.arturitoObject': 'modelo en cola',
      'desc.gramscitoObject': 'Lucha Libre de Clases',
      'desc.lacancitoObject': 'Sintomin / Lacancito',
      'desc.capitanNauseaObject': 'náusea capitaneada',
		      'desc.partyAnimalDigital': 'diseño animado + modelo 3D',
		      'desc.simiugDigital': 'objeto conceptual · taza/recipiente',
		      'desc.speakerCreature': 'objeto sonoro · criatura parlante',
		      'desc.speakerEye': 'objeto sonoro · ojo parlante',
		      'desc.speakerMask': 'objeto sonoro · máscara de escucha',
		      'desc.speakerMind': 'objeto sonoro · cráneo translúcido',
		      'desc.vidaYPena': 'estatua ritual · Fatum et Dolor',
			      'desc.quijoticoPrinting': 'pieza en impresión · caballero de lanza',
		      'desc.quijoticoFinished': 'pieza FDM intervenida · caballero de lanza',
	      'desc.gotimonda': 'pieza en gestación · máscara elefante',
	      'desc.esponjaGPhysical': 'pieza física · esponja gangster',
			      'desc.cthulitoFinished': 'pieza FDM intervenida · criatura abisal dorada',
				      'desc.gabitoFinished': 'pieza FDM intervenida · mariposas en órbita',
				      'desc.poesitoFinished': 'pieza FDM intervenida · corazón portátil',
			      'desc.dostoiecitoFinished': 'pieza FDM intervenida · Mini Fiodor',
				      'desc.acefaloFinished': 'pieza FDM intervenida · sin caja',
						      'measure.acefalo': 'Medidas aproximadas: 25 cm alto x 20 cm ancho x 5 cm profundo',
						      'measure.quijotico': 'Medidas finales por confirmar antes de despacho',
						      'measure.gabito': 'Medidas aproximadas en caja: 16 cm alto x 10 cm ancho x 10 cm profundo',
				      'measure.superhombresito': 'Medidas aproximadas: 17,5 cm alto x 10,5 cm ancho x 9 cm profundo',
	      'measure.marxito': 'Medidas aproximadas: 18 cm alto x 12 cm ancho x 11 cm profundo',
		      'measure.traumin': 'Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo',
		      'measure.poesito': 'Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo',
		      'measure.dostoiecito': 'Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo',
		      'measure.jarron': 'Medidas aproximadas: 15,2 cm alto x 9,9 cm ancho x 10,3 cm profundo',
		      'measure.cthulito': 'Medidas aproximadas: 11 cm alto x 18,5 cm ancho x 16,5 cm profundo',
      'phase.seen': 'Visto',
	      'phase.imagined': 'Imaginado',
	      'phase.designed': 'Diseñado',
	      'phase.made': 'Hecho',
		      'phase.irreal': 'IRREAL',
		      'phase.printing': 'En impresión',
	      'phase.gestating': 'Gestándose',
	      'phase.linePiece': 'Pieza de línea',
      'phase.intervened': 'Intervenida',
      'impossible.title': 'Imposible',
      'impossible.center': 'exhibición pura',
      'impossible.right': 'no a la venta',
      'impossible.legend': 'Piezas que no son para fabricarse ni venderse. No tienen botón, carrito ni persecución. Se miran y quedan suspendidas: lo IRREAL llevado hasta su forma más radical.',
      'essays.title': 'Ensayos / textos / videos',
      'essays.one': 'Por qué edición limitada y por qué firmar',
      'essays.two': 'El esmalte mintió: notas sobre el primer drop',
      'essays.three': 'No es coleccionable, es de uso',
      'essays.four': 'Destrúyelo todo',
      'essays.five': 'The Cyborg Codex',
      'essays.text': 'Texto',
      'essays.videoText': 'Video + texto',
      'video.play': 'Ver video',
      'essays.presentation': 'Presentación',
      'essay.breadcrumb': 'Ensayo 004 / Manifiesto-video',
      'essay.copyOne': '¿Confías en el arte? ¿Crees que es revolucionario? Destrúyelo entonces. Destruye todo el arte que existe. Que no quede nada. Todo lo que ha sido agrupado y definido como arte, destrúyelo. Así será libre. Así se develará donde pertenece, en todas partes, en ningún lugar. Destrúyelo todo. Así veremos el arte en las letras chuecas de los niños, arte en las manchas que ensucian el vestido, arte en el polvo que llena las esquinas, arte en la voz que grita su llanto, arte en la línea recta y la línea curva, en el vacío del silencio y los caminos de la hormiga.',
      'essay.copyTwo': 'Fue el impulso no artístico el que secuestró al arte y lo confinó para apreciarlo. Quiero el arte que quema, pero también el que duerme. En el fuego está la verdad, en el sueño está la verdad. Que venga el arte que no se deja ver, el incomprensible, el que nunca llega, que corre para nunca ser alcanzado. Ágil y rápido como el deseo. Productor como la creatividad, destructor como la razón. Destrúyelo todo, allí estará, lo prometo. Allí estaremos. Pero primero hemos de destruirnos para que el arte lo transforme todo.',
      'cyborg.breadcrumb': 'Publicación 005 / Documento visual-teórico',
      'cyborg.format': 'Presentación / PPTX',
      'cyborg.source': 'Anti Real Labs / Colibrí',
      'cyborg.copyOne': 'The Cyborg Codex funciona como documento de apoyo visual y teórico: un cuaderno de señales sobre cuerpos ensamblados, tecnología cotidiana, imaginación material y subjetividades que se fabrican entre máquina, archivo y gesto.',
      'cyborg.copyTwo': 'Lo incorporamos como publicación viva del archivo Simio Plateado / Anti Real Labs. No es producto ni checkout: es contexto para entender el ecosistema que rodea las figuras, los dispositivos y los objetos raros que estamos haciendo.',
      'cyborg.download': 'Descargar presentación',
      'cyborg.open': 'Abrir archivo',
      'about.title': 'Manifiesto / qué es esto',
      'about.quote': '¿Confías en el arte?',
      'about.fragment': 'Fragmento del manifiesto-video — ',
      'about.readFull': 'leer completo →',
      'about.copy': 'Simio Plateado es una línea de fuga estético-material hacia la proliferación de nuevas fugas y multiplicidades. Es un chiste. Es una galería web. Son ceros y unos. Existe esporádicamente pero con intensidad y pasión en todo tiempo espacio posible. Es un meme con palabras raras. Para los que necesitan respirar. Un aire nuevo.',
      'about.contact': 'hablanos:',
      'buy.title': 'Cómo comprar / Pricing',
      'buy.copy': 'Los productos disponibles se pagan por Mercado Pago. El envío nacional en Colombia está incluido. Para compras fuera de Colombia, el precio publicado no incluye envío internacional: te contactamos antes del despacho con la cotización exacta. Las piezas en producción siguen como aviso de disponibilidad o pre-order cuando corresponda. Los precios disponibles se muestran en COP con referencia USD aproximada; el cobro se procesa en COP.',
      'shipping.title': 'Envíos',
      'shipping.copy': 'Enviamos desde Medellín, Colombia. En Colombia, el envío nacional está incluido. Para otros países, el envío internacional se cotiza antes del despacho y se coordina contigo por email o WhatsApp. Wearables: 7-14 días hábiles. Ediciones limitadas: se envían según disponibilidad y preparación de cada pieza.',
      'returns.title': 'Devoluciones',
      'returns.copy': 'Wearables sin uso: devolución dentro de 14 días. Objetos de arte de edición limitada: venta final, sin devoluciones.',
      'footer.catalog': 'Catálogo',
      'footer.currentDrop': 'Drop actual',
      'footer.wearables': 'Wearables',
      'footer.impossible': 'Imposible',
      'footer.reading': 'Lectura',
      'footer.essays': 'Ensayos',
      'footer.destroy': 'Destrúyelo todo',
      'footer.manifesto': 'Manifiesto',
      'footer.store': 'Tienda',
      'footer.howToBuy': 'Cómo comprar / pricing',
      'footer.shipping': 'Envíos',
      'footer.returns': 'Devoluciones',
      'footer.legal': 'Legal',
      'footer.privacy': 'Política de privacidad',
      'footer.terms': 'Términos y condiciones',
      'footer.imageUse': 'Uso de imagen',
      'footer.language': 'Idioma',
      'footer.brand': '© Simio Plateado 2026 · una sub-marca de Anti Real Labs',
      'footer.made': 'hecho con manos, neuronas, 0s y 1s',
      'label.status': 'Estado',
      'label.price': 'Precio',
      'label.priceProjected': 'Precio proyectado',
      'label.object': 'Objeto',
      'label.variant': 'variante',
      'label.year': 'Año',
      'label.format': 'Formato',
      'label.archive': 'Archivo',
      'label.inspiration': 'Inspiración',
      'desc.siliconeSmall': 'silicona · 4.2 × 5.8 cm aprox',
      'desc.paintedCardboard18': 'cartón pintado · 18 cm alto',
      'desc.paintedResin12': 'resina pintada · 12 cm alto',
      'desc.whiteSiliconeRegular14': 'silicona blanca · regular · 14 cm alto',
      'desc.blackCeramicLarge22': 'cerámica negra · grande · 22 cm alto',
      'desc.paintedClayRegular12': 'barro pintado · regular · 12 cm alto',
      'desc.blackCeramicLarge18': 'cerámica negra · grande · 18 cm alto',
      'desc.nietzscheFinished': 'figura FDM intervenida · acabado dorado',
      'desc.marxitoFinished': 'figura FDM intervenida · acabado dorado',
      'desc.trauminFinished': 'figura FDM intervenida · acabado dorado',
	      'desc.marxitoPreview': 'modelo 3D a color · foto real en camino',
	      'desc.marxitoUpdated': 'figura coleccionable · imagen actualizada',
	      'desc.jarronFinished': 'Kraken Florero FDM intervenido · acabado negro brillante',
	      'desc.ositoWuTangPhysical': 'pieza física · osito Wu Tang dorado',
	      'desc.vasijaAtlasPhysical': 'pieza física · vasija sostenida',
	      'desc.cuatroMonosPhysical': 'pieza física · cuatro gestos en una base',
	      'desc.tentative30': 'edición tentativa 1 / 30',
      'desc.tentative50': 'edición tentativa 1 / 50',
      'desc.tentative20': 'edición tentativa 1 / 20',
      'subtitle.tuni.black': 'Pieza 03 / Drop 001 / Dispositivo · variante NEGRA',
      'subtitle.tuni.white': 'Pieza 03 / Drop 001 / Dispositivo · variante BLANCA',
      'subtitle.tuni.pink': 'Pieza 03 / Drop 001 / Dispositivo · variante ROSA',
      'subtitle.copa': 'Pieza 04 / Drop 001 / Objeto temático · Mundial 2026',
      'subtitle.marxito': 'Pieza 05 / Drop 001 / Figura coleccionable',
      'subtitle.traumin': 'Pieza 10 / Drop 001 / Figura coleccionable',
      'subtitle.punk.regular': 'Pieza 06 / Drop 001 / Familia PLANTI · regular',
      'subtitle.punk.xl': 'Pieza 07 / Drop 001 / Familia PLANTI · grande',
	      'subtitle.k.regular': 'Pieza 08 / Drop 001 / Familia PLANTI · regular',
	      'subtitle.k.xl': 'Pieza 09 / Drop 001 / Familia PLANTI · grande',
	      'subtitle.jarron': 'Pieza 14 / Drop 001 / Objeto de línea intervenido',
	      'subtitle.cthulito': 'Pieza física premium / criatura FDM intervenida / Drop 001',
	      'subtitle.ositoWuTang': 'Nuevo ingreso físico / osito dorado / ficha en construcción',
	      'subtitle.gotimonda': 'Diseño original Simio Plateado / armadura ceremonial / ficha en construcción',
	      'subtitle.vasijaAtlas': 'Nuevo ingreso físico / Atlas doméstico / ficha en construcción',
	      'subtitle.cuatroMonos': 'Nuevo ingreso físico / objeto de mesa / ficha en construcción',
	      'subtitle.esponjaG': 'Nuevo ingreso físico / figura intervenida / foto real del 3D como portada',
      'callout.dropBody': 'A · Cuerpo gota',
      'callout.speaker': 'C · Parlante',
      'callout.screen': 'B · Pantalla',
      'callout.rightButton': 'D · Botón derecha',
      'callout.tuni.body': '"Demasiado bonito como para que alguien se concentre."',
      'callout.tuni.speaker': '"Botón para reproducir y escuchar tu voz de perro en múltiples formas, estilos y colores."',
      'callout.tuni.screen': '"Puedes grabar lo que quieras y te devuelve la información importante, para que te distraigas con tranquilidad."',
      'callout.tuni.button': '"Botón para grabar tu voz o conversaciones y reuniones (si tienes autorización, no seas descaradx)."',
      'callout.flags': 'B · Banderitas tricolor',
      'callout.ball': 'A · Balón arriba',
      'callout.baseLegend': 'C · Base con leyenda',
      'callout.copa.flags': '"Reconoce la participación. Igual los queremos, y nos veremos en 4 años (si pasamos)."',
      'callout.copa.ball': '"Copa de cartón, para quienes compiten como nunca y pierden como siempre."',
      'callout.copa.base': '"Para recordar que lo nuestro es la dicha y la fiesta."',
      'callout.cane': 'B · Bastón',
      'callout.hat': 'A · Sombrero',
      'callout.coinBag': 'C · Bolsa de monedas',
      'callout.marxito.cane': '"Bastón para pisotear vampiros."',
      'callout.marxito.hat': '"Botón para reproducción de frases analíticas, contundentes y demoledoras."',
      'callout.marxito.coins': '"Monedas de chocolate para una dulce revolución."',
      'callout.head': 'A · Cabeza',
      'callout.arms': 'C · Brazos',
      'callout.paintedMouth': 'E · Boca pintada',
      'callout.screenEyes': 'B · Pantalla / ojos',
      'callout.sensorNose': 'D · Sensor / nariz',
      'callout.plant': 'A · Planta',
      'callout.internalSensor': 'C · Sensor interno',
      'callout.faceScreen': 'B · Pantalla con cara',
      'callout.charging': 'D · Estación de carga',
      'callout.k.plant': '"Planta saludable y bonita gracias a Planti."',
      'callout.k.sensor': '"Analiza el estado de los compuestos y te da las mejores recomendaciones."',
      'callout.k.screen': '"Te dice cuándo regarla, y que no dejes morir una planta más."',
      'callout.k.charging': '"Para que no te quedes nunca sin acompañamiento y orientación."',
      'button.close': 'Cerrar',
      'button.wantExist': 'Quiero que exista',
      'button.wantHave': 'Quiero tenerlo',
      'button.notify': 'Avisarme',
      'button.send': 'Enviar →',
      'button.thanks': 'Anotado · gracias',
      'button.sending': 'Enviando...',
      'button.noting': 'Anotando...',
      'variant.black': '.negra',
      'variant.white': '.blanca',
      'variant.pink': '.rosa',
      'variant.clay': '.barro',
      'variant.silicone': '.silicona',
      'variant.obsidian': '.obsidiana',
      'preorder.title': 'Pre-order abierto',
      'preorder.copy': 'Reserva esta pieza ahora. Cuando el drop cierre, te escribimos para procesar el pago vía Mercado Pago.',
      'preorder.nameLabel': 'Nombre (opcional)',
      'preorder.namePlaceholder': 'nombre',
      'preorder.emailLabel': 'Email',
      'preorder.emailPlaceholder': 'tu@email.com',
      'preorder.sizeLabel': 'Talla',
      'preorder.editionLabel': 'Edición',
      'preorder.chooseSize': 'Elige talla',
      'preorder.onesize': 'Unitalla',
      'preorder.uniquePiece': 'Pieza única',
      'preorder.button': 'Pre-order / Reservar',
      'preorder.invalidEmail': 'Necesitamos un email válido para reservar.',
      'preorder.missingSize': 'Elige una talla para continuar.',
      'preorder.sending': 'Reservando...',
      'preorder.success': 'Pre-order registrado. Te enviamos confirmación al email.',
      'preorder.error': 'Hubo un problema registrando el pre-order. Intentá de nuevo.',
      'preorder.rateLimited': 'Demasiados pre-orders desde esta dirección. Esperá una hora o contactanos.',
      'checkout.title': 'Compra directa',
      'checkout.copy': 'Compra segura vía Mercado Pago. Tirada inicial de 10 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
      'checkout.copySuperhombresito': 'Compra segura vía Mercado Pago. Figura FDM intervenida a mano, 17,5 cm alto x 10,5 cm ancho x 9 cm profundo. Tirada inicial de 10 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
      'checkout.copyMarxito': 'Compra segura vía Mercado Pago. Figura FDM intervenida a mano, 18 cm alto x 12 cm ancho x 11 cm profundo. Tirada inicial de 10 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
      'checkout.copyTraumin': 'Compra segura vía Mercado Pago. Figura FDM intervenida a mano, 18 cm alto x 11 cm ancho x 11 cm profundo. Tirada inicial de 10 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
      'checkout.priceNote': 'Precio: COP 230.000. Referencia aproximada: USD 58. Mercado Pago procesa el cobro en COP.',
      'checkout.priceNoteMarxito': 'Precio: COP 250.000. Referencia aproximada: USD 63. Mercado Pago procesa el cobro en COP.',
      'checkout.priceNoteTraumin': 'Precio: COP 220.000. Referencia aproximada: USD 55. Mercado Pago procesa el cobro en COP.',
	      'checkout.copyJarron': 'Compra segura vía Mercado Pago. Kraken Florero FDM intervenido a mano, 15,2 cm alto x 9,9 cm ancho x 10,3 cm profundo. Tirada inicial de 5 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
	      'checkout.priceNoteJarron': 'Precio: COP 220.000. Referencia aproximada: USD 55. Mercado Pago procesa el cobro en COP.',
		      'checkout.copyCthulito': 'Compra segura vía Mercado Pago. CTHULITO.v01 FDM intervenido a mano, acabado dorado brillante, 11 cm alto x 18,5 cm ancho x 16,5 cm profundo. Tirada inicial de 3 unidades, intervenidas y terminadas a mano en Medellín. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
		      'checkout.priceNoteCthulito': 'Precio: COP 300.000. Referencia aproximada: USD 75. Mercado Pago procesa el cobro en COP.',
		      'checkout.copyQuijotico': 'Compra segura vía Mercado Pago. QUIJOTICO.v01 FDM intervenido a mano, acabado dorado brillante, con lanza fina y alto nivel de detalle. Medidas finales por confirmar antes de despacho. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
		      'checkout.priceNoteQuijotico': 'Precio: COP 260.000. Referencia aproximada: USD 65. Mercado Pago procesa el cobro en COP.',
	      'checkout.copyWearable': 'Compra segura vía Mercado Pago. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.',
      'checkout.sizesShirt': 'Tallas disponibles: S, M, L y XL.',
      'checkout.priceNoteCamisetaBlanca': 'Precio: COP 81.600. Referencia aproximada: USD 20.4. Mercado Pago procesa el cobro en COP.',
      'checkout.priceNoteCamisetaNegra': 'Precio: COP 91.200. Referencia aproximada: USD 22.8. Mercado Pago procesa el cobro en COP.',
      'checkout.priceNoteGorra': 'Precio: COP 105.600. Referencia aproximada: USD 26.4. Mercado Pago procesa el cobro en COP.',
      'checkout.button': 'Comprar ahora',
      'checkout.fastTitle': 'Pago directo',
      'checkout.fastCopy': 'Mercado Pago · envío nacional incluido.',
      'checkout.fastButton': 'Pagar con Mercado Pago',
      'checkout.nameLabel': 'Nombre completo',
      'checkout.namePlaceholder': 'Nombre y apellido',
      'checkout.emailLabel': 'Email',
      'checkout.emailPlaceholder': 'tu@email.com',
      'checkout.sizeLabel': 'Talla',
      'checkout.chooseSize': 'Elegí talla',
      'checkout.onesize': 'Unitalla',
      'checkout.phoneLabel': 'Teléfono / WhatsApp',
      'checkout.phonePlaceholder': '+57 ...',
      'checkout.addressLabel': 'Dirección de envío',
      'checkout.addressPlaceholder': 'Calle, número, apto',
      'checkout.cityLabel': 'Ciudad',
      'checkout.cityPlaceholder': 'Medellín',
      'checkout.stateLabel': 'Departamento / Estado',
      'checkout.statePlaceholder': 'Antioquia',
      'checkout.countryLabel': 'País',
	      'checkout.countryPlaceholder': 'Colombia',
	      'checkout.postalLabel': 'Código postal (opcional)',
	      'checkout.postalPlaceholder': '050001',
	      'checkout.notesLabel': 'Notas de envío (opcional)',
	      'checkout.notesPlaceholder': 'Portería, horario, referencias...',
	      'checkout.completeRequired': 'Completa estos datos para continuar al pago.',
	      'checkout.requiredField': 'Este dato es necesario para continuar.',
	      'checkout.invalidEmailField': 'Escribe un email válido para continuar.',
	      'checkout.missingShipping': 'Completá nombre, teléfono y dirección de envío antes del pago.',
	      'checkout.missingSize': 'Elegí una talla antes de continuar.',
	      'checkout.invalidEmail': 'Necesitamos un email válido para crear la orden.',
      'checkout.sending': 'Abriendo Mercado Pago...',
      'checkout.redirecting': 'Redirigiendo a Mercado Pago...',
      'checkout.error': 'No pudimos abrir el checkout. Intentá de nuevo o escríbenos.',
      'checkout.configMissing': 'El checkout de Mercado Pago todavía necesita el token de producción en Cloudflare.',
      'checkout.rateLimited': 'Demasiados intentos de compra desde esta dirección. Esperá una hora o contactanos.',
      'checkout.issueButton': 'No pude realizar mi compra',
      'checkout.issueCopy': 'Déjanos tu email y te avisamos apenas podamos corregirlo. Perdón por la fricción.',
      'checkout.issueEmailLabel': 'Email para avisarte (opcional)',
      'checkout.issueEmailPlaceholder': 'tu@email.com',
      'checkout.issueSend': 'Avisarme cuando se corrija',
      'checkout.issueSending': 'Enviando aviso...',
      'checkout.issueSuccess': 'Gracias. Quedó reportado y te avisaremos cuando puedas pagar sin fricción.',
      'checkout.issueSuccessNoEmail': 'Gracias. Quedó reportado. Si nos escribes por correo, podemos avisarte directamente.',
      'checkout.issueError': 'No pudimos registrar el aviso. Escríbenos a el@simioplateado.com.',
      'checkout.issueInvalidEmail': 'Ese email no parece válido. Puedes dejarlo vacío o corregirlo.',
      'media.finished': 'Pieza terminada',
	      'media.model3d': 'Modelo 3D',
	      'media.illustration': 'Ilustración',
	      'media.digitalVersion': 'Versión digital',
	      'media.boxOpen': 'Caja + pieza',
	      'media.boxClosed': 'Caja cerrada',
	      'media.nietzschePinkBox': 'Variante rosa + caja',
	      'media.realPhoto': 'Foto real',
      'media.real3dPhoto': 'Foto real del 3D',
      'media.baseDesign': 'Diseño base',
      'media.jarronFinished': 'Kraken Florero terminado',
      'media.jarronModel3d': 'Modelo 3D blanco',
      'media.partyIllustration': 'Ilustración',
      'media.simiugIllustration': 'Estudio visual',
	      'notify.title': 'Aviso de producción',
	      'notify.helper': 'Un solo email',
	      'notify.emailTitle': '→ Avísame cuando abra pre-order',
	      'notify.emailCopy': 'Te escribimos una vez cuando esta pieza pase de producción a pre-order abierto.',
      'notify.emailPhysicalTitle': '→ Avísame si pasa a pieza física',
      'notify.emailPhysicalCopy': 'Te escribimos una vez si este diseño entra a producción.',
      'notify.invalidEmail': 'Necesitamos un email válido para avisarte.',
      'notify.error': 'Hubo un problema. Intentá de nuevo.',
      'notify.registeredTitle': 'Aviso registrado.',
      'notify.registeredBody': 'Te escribimos cuando {product} pase a pre-order. Solo eso. No newsletter.',
      'interest.title': '¿Debería existir {product}?',
      'interest.helper': 'elige el gesto',
      'interest.emailTitle': '→ Avísame si empieza a volverse real',
      'interest.emailCopy': 'Un solo correo si {product} pasa de existencia digital a producción.',
      'interest.silentTitle': '→ Solo deja constancia',
      'interest.silentCopy': 'Guardamos el gesto sin pedirte email.',
      'interest.silentButton': 'Dejar constancia',
      'interest.emailRegisteredTitle': 'Aviso anotado.',
      'interest.emailRegisteredBody': 'Te escribimos si {product} empieza a volverse real. Un solo correo.',
      'interest.registeredTitle': 'Gesto registrado.',
      'interest.registeredBody': 'Sin email, sin persecución. Queda anotado entre los posibles devenires.',
      'interestHave.title': '¿Quieres tener {product}?',
      'interestHave.helper': 'elige cómo',
      'interestHave.emailTitle': '→ Avísame para tenerlo',
      'interestHave.emailCopy': 'Un solo correo si {product} abre pedido, reserva o producción.',
      'interestHave.emailCopyGeneric': 'Te escribimos una vez si este diseño abre pedido, reserva o producción.',
      'interestHave.silentTitle': '→ Solo quiero tenerlo',
      'interestHave.silentCopy': 'Registramos tu interés sin pedirte email.',
      'interestHave.silentButton': 'Registrar interés',
      'interestHave.emailRegisteredTitle': 'Interés anotado.',
      'interestHave.emailRegisteredBody': 'Te escribimos si {product} abre pedido, reserva o producción. Un solo correo.',
      'interestHave.registeredTitle': 'Interés registrado.',
      'interestHave.registeredBody': 'Sin email, sin persecución. Queda anotado que quieres tenerlo.'
    },
    en: {
      'nav.drop': 'drop 001',
      'nav.available': 'available',
      'nav.encargos': 'custom',
      'nav.about': 'about',
      'view.gallery': 'Gallery',
      'view.store': 'Store',
      'store.kicker': 'Store view',
      'store.title': 'Available pieces',
      'store.copy': 'The gallery seen as product: finished pieces, models, process traces, and objects ready to buy or follow closely. The path now follows families, so the catalog reads like a living archive.',
      'home.phrase': 'Destroy everything. Leave nothing behind.',
      'home.dropStatus': 'Drop 001 — checkout + pre-order',
      'drop.title': 'Gallery — Drop 001',
      'drop.center': 'sorted by families',
      'drop.right': 'subthemes / states',
      'drop.legend': 'Web gallery. Between the living and the unreal. With objects available, in gestation, and in the collective imaginary. Everything can exist if you want it to; just give it life with one click.',
      'original.title': 'Exclusive pieces',
      'original.copy': 'The seal marks pieces designed from the Simio Plateado universe: objects, characters, wearables, and models that do not come from a template and do not exist as generic products.',
      'original.note': 'Original design · small runs · experimental production',
      'filter.availability': 'Availability',
      'filter.family': 'Family',
      'filter.all': 'All',
      'filter.available': 'Available',
      'filter.gestating': 'In production',
      'filter.irreal': 'Irreal',
      'filter.impossible': 'Impossible',
      'filter.family.greatMinds': 'GREAT/MINDS',
	      'filter.family.literatos': 'LITERARY',
	      'filter.family.partyAnimals': 'PARTY ANIMALS',
	      'filter.family.simiugs': 'SIMIUGS',
	      'filter.family.speakers': 'SPEAKERS',
	      'filter.family.objects': 'OBJECTS',
      'filter.family.other': 'OTHER',
      'gallery.group.greatMinds': 'Authors, theories, ideologies, and small heads already inside the material lab.',
      'gallery.group.literatos': 'Writers and library creatures: figures between quotation, myth, and caricature.',
      'gallery.group.objects': 'Physical objects, vessels, monsters, and odd pieces already asking for their own scale.',
	      'gallery.group.partyAnimals': 'Sonic mascots and party characters: possible toys with a 3D model ready.',
	      'gallery.group.simiugs': 'Impossible cups and vessels: useful objects contaminated by gesture and fantasy.',
	      'gallery.group.speakers': 'Sound objects and sculptural speakers: masks, skulls, and creatures where sound gets a body too.',
	      'gallery.group.tuni': 'The house device: silicone, screen, and a tiny improbable companion.',
      'gallery.group.planti': 'Character planters and plants with attitude: home pieces with another temperature.',
      'gallery.group.colombia': 'Jokes, trophies, and small local allegories carrying party and defeat.',
      'gallery.group.audio': 'Impossible pieces for listening with the eyes: pure exhibition, without a fabrication promise.',
      'gallery.group.other': 'Satellite pieces, dialogues, and studies orbiting the main catalog.',
      'gallery.group.wearables': 'Made to be worn: shirts, cap, and textile objects closing the route.',
      'gallery.group.generic': 'Pieces grouped by family inside the living catalog.',
      'filter.empty': 'No pieces match this filter yet.',
      'wearables.center': 'made to be worn',
      'wearables.right': 'checkout open',
      'wearables.legend': 'T-shirts and cap are available for direct checkout. Parchao and Melísimo are in production: leave your email and we will notify you when reservations open.',
      'state.available': 'Available · checkout open',
      'state.buyOpen': 'Available · checkout open',
      'state.gestando': 'In production · pre-order soon',
      'state.printingTest': 'In production · print test',
	      'state.partyAnimalGestando': 'In gestation · 3D model ready',
	      'state.simiugGestando': 'In gestation · object prototype',
	      'state.visualOnly': 'In gestation · cutout image loaded',
	      'state.irrealDigital': 'IRREAL · digital existence',
      'state.impossible': 'IMPOSSIBLE · pure display',
      'price.punk': 'USD 74 · in production',
      'price.punkxl': 'USD 85 · in production',
      'price.k': 'USD 72 · in production',
      'price.kxl': 'USD 84 · in production',
      'price.parchao': 'USD 70 · in production',
      'price.melisimo': 'USD 70 · in production',
      'price.irreal188': 'USD 188 · limited run',
      'price.irreal64': 'USD 64 · limited run',
      'price.irreal108': 'USD 108 · limited run',
      'price.irreal84': 'USD 84 · limited run',
      'price.irreal132': 'USD 132 · very limited run',
      'price.irreal148': 'USD 148 · limited run',
      'price.nietzschesito': 'COP 230,000 · approx. USD 58 · initial run of 10',
      'price.marxito': 'COP 250,000 · approx. USD 63 · initial run of 10',
      'price.traumin': 'COP 220,000 · approx. USD 55 · initial run of 10',
	      'price.jarron': 'COP 220,000 · approx. USD 55 · initial run of 5',
				      'price.cthulito': 'COP 300,000 · approx. USD 75 · initial run of 3',
				      'price.quijotico': 'COP 260,000 · approx. USD 65 · available piece',
				      'price.gabito': 'COP 240,000 · approx. USD 60 · available piece',
			      'price.poesito': 'COP 230,000 · approx. USD 58 · available piece',
		      'price.dostoiecito': 'COP 230,000 · approx. USD 58 · available piece',
		      'price.acefalo': 'COP 200,000 · approx. USD 50 · available piece',
	      'price.camisetaBlanca': 'COP 81,600 · approx. USD 20.4',
      'price.camisetaNegra': 'COP 91,200 · approx. USD 22.8',
      'price.gorra': 'COP 105,600 · approx. USD 26.4',
      'desc.arturitoDigital': 'digital existence · model in queue',
      'desc.gramscitoDigital': 'digital existence · class lucha libre',
      'desc.lacancitoDigital': 'digital existence · symptom in queue',
      'desc.capitanNauseaDigital': 'digital existence · nausea with a captain',
      'desc.arturitoObject': 'model in queue',
      'desc.gramscitoObject': 'Class lucha libre',
      'desc.lacancitoObject': 'Sintomin / Lacancito',
      'desc.capitanNauseaObject': 'captained nausea',
		      'desc.partyAnimalDigital': 'animated design + 3D model',
		      'desc.simiugDigital': 'concept object · cup/vessel',
		      'desc.speakerCreature': 'sound object · speaking creature',
		      'desc.speakerEye': 'sound object · speaking eye',
		      'desc.speakerMask': 'sound object · listening mask',
		      'desc.speakerMind': 'sound object · translucent skull',
		      'desc.vidaYPena': 'ritual statue · Fatum et Dolor',
			      'desc.quijoticoPrinting': 'printing test · lance-bearing knight',
		      'desc.quijoticoFinished': 'hand-finished FDM piece · lance-bearing knight',
	      'desc.gotimonda': 'piece in gestation · elephant mask',
	      'desc.esponjaGPhysical': 'physical piece · gangster sponge',
			      'desc.cthulitoFinished': 'hand-finished FDM piece · golden abyssal creature',
				      'desc.gabitoFinished': 'hand-finished FDM piece · butterflies in orbit',
				      'desc.poesitoFinished': 'hand-finished FDM piece · portable heart',
			      'desc.dostoiecitoFinished': 'hand-finished FDM piece · Mini Fiodor',
				      'desc.acefaloFinished': 'hand-finished FDM piece · no box',
						      'measure.acefalo': 'Approx. dimensions: 25 cm high x 20 cm wide x 5 cm deep',
						      'measure.quijotico': 'Final dimensions to be confirmed before dispatch',
						      'measure.gabito': 'Approx. boxed dimensions: 16 cm high x 10 cm wide x 10 cm deep',
				      'measure.superhombresito': 'Approx. dimensions: 17.5 cm high x 10.5 cm wide x 9 cm deep',
	      'measure.marxito': 'Approx. dimensions: 18 cm high x 12 cm wide x 11 cm deep',
		      'measure.traumin': 'Approx. dimensions: 18 cm high x 11 cm wide x 11 cm deep',
		      'measure.poesito': 'Approx. dimensions: 18 cm high x 11 cm wide x 11 cm deep',
		      'measure.dostoiecito': 'Approx. dimensions: 18 cm high x 11 cm wide x 11 cm deep',
		      'measure.jarron': 'Approx. dimensions: 15.2 cm high x 9.9 cm wide x 10.3 cm deep',
		      'measure.cthulito': 'Approx. dimensions: 11 cm high x 18.5 cm wide x 16.5 cm deep',
      'phase.seen': 'Seen',
	      'phase.imagined': 'Imagined',
	      'phase.designed': 'Designed',
	      'phase.made': 'Made',
		      'phase.irreal': 'IRREAL',
		      'phase.printing': 'Printing',
	      'phase.gestating': 'In gestation',
	      'phase.linePiece': 'Line piece',
      'phase.intervened': 'Intervened',
      'impossible.title': 'Impossible',
      'impossible.center': 'pure display',
      'impossible.right': 'not for sale',
      'impossible.legend': 'Pieces that are not meant to be manufactured or sold. No button, no cart, no chase. They are here to be looked at and left pending: IRREAL in its most radical form.',
      'essays.title': 'Essays / texts / videos',
      'essays.one': 'Why limited editions, and why sign them',
      'essays.two': 'The enamel lied: notes on the first drop',
      'essays.three': 'Not collectible, usable',
      'essays.four': 'Destroy everything',
      'essays.five': 'The Cyborg Codex',
      'essays.text': 'Text',
      'essays.videoText': 'Video + text',
      'video.play': 'Watch video',
      'essays.presentation': 'Presentation',
      'essay.breadcrumb': 'Essay 004 / Manifesto-video',
      'essay.copyOne': 'Do you trust art? Do you believe it is revolutionary? Then destroy it. Destroy all the art that exists. Leave nothing behind. Everything that has been grouped and defined as art, destroy it. That is how it will be free. That is how it will reveal where it belongs: everywhere, nowhere. Destroy everything. Then we will see art in children’s crooked letters, art in the stains that dirty the dress, art in the dust filling the corners, art in the voice screaming its own cry, art in the straight line and the curved line, in the hollow of silence and the paths of the ant.',
      'essay.copyTwo': 'It was the non-artistic impulse that kidnapped art and confined it so it could be appreciated. I want the art that burns, but also the art that sleeps. Truth is in the fire, truth is in the dream. Let the art that refuses to be seen come in: the incomprehensible, the one that never arrives, the one that runs so it can never be caught. Agile and fast like desire. Productive like creativity, destructive like reason. Destroy everything. It will be there, I promise. We will be there. But first we must destroy ourselves so art can transform everything.',
      'cyborg.breadcrumb': 'Publication 005 / Visual-theoretical document',
      'cyborg.format': 'Presentation / PPTX',
      'cyborg.source': 'Anti Real Labs / Colibrí',
      'cyborg.copyOne': 'The Cyborg Codex works as a visual and theoretical support document: a notebook of signals about assembled bodies, everyday technology, material imagination, and subjectivities made between machine, archive, and gesture.',
      'cyborg.copyTwo': 'It enters the Simio Plateado / Anti Real Labs archive as a living publication. It is not a product or a checkout item: it is context for the figures, devices, and strange objects we are building.',
      'cyborg.download': 'Download presentation',
      'cyborg.open': 'Open file',
      'about.title': 'Manifesto / what this is',
      'about.quote': 'Do you trust art?',
      'about.fragment': 'Excerpt from the manifesto-video — ',
      'about.readFull': 'read full →',
      'about.copy': 'Simio Plateado is an aesthetic-material escape line toward the proliferation of new escapes and multiplicities. It is a joke. It is a web gallery. It is zeros and ones. It exists sporadically, but with intensity and passion across every possible time-space. It is a meme with strange words. For those who need to breathe. A new air.',
      'about.contact': 'talk to us:',
      'buy.title': 'How to buy / Pricing',
      'buy.copy': 'Available products are paid through Mercado Pago. Domestic shipping in Colombia is included. For purchases outside Colombia, the published price does not include international shipping: we contact you before dispatch with the exact quote. Pieces in production remain as availability notices or pre-order when applicable. Available prices are shown in COP with approximate USD references; charges are processed in COP.',
      'shipping.title': 'Shipping',
      'shipping.copy': 'Ships from Medellín, Colombia. Domestic shipping in Colombia is included. International shipping is quoted before dispatch and coordinated with you by email or WhatsApp. Wearables: 7-14 business days. Limited editions ship according to availability and hand-finishing time.',
      'returns.title': 'Returns',
      'returns.copy': '14-day return window for unworn wearables. Limited edition art objects: final sale, no returns.',
      'footer.catalog': 'Catalog',
      'footer.currentDrop': 'Current drop',
      'footer.wearables': 'Wearables',
      'footer.impossible': 'Impossible',
      'footer.reading': 'Reading',
      'footer.essays': 'Essays',
      'footer.destroy': 'Destroy everything',
      'footer.manifesto': 'Manifesto',
      'footer.store': 'Store',
      'footer.howToBuy': 'How to buy / pricing',
      'footer.shipping': 'Shipping',
      'footer.returns': 'Returns',
      'footer.legal': 'Legal',
      'footer.privacy': 'Privacy policy',
      'footer.terms': 'Terms and conditions',
      'footer.imageUse': 'Image use',
      'footer.language': 'Language',
      'footer.brand': '© Simio Plateado 2026 · an Anti Real Labs sub-brand',
      'footer.made': 'made with hands, neurons, 0s and 1s',
      'label.status': 'Status',
      'label.price': 'Price',
      'label.priceProjected': 'Projected price',
      'label.object': 'Object',
      'label.variant': 'variant',
      'label.year': 'Year',
      'label.format': 'Format',
      'label.archive': 'Archive',
      'label.inspiration': 'Inspiration',
      'desc.siliconeSmall': 'silicone · approx. 4.2 × 5.8 cm',
      'desc.paintedCardboard18': 'painted cardboard · 18 cm tall',
      'desc.paintedResin12': 'painted resin · 12 cm tall',
      'desc.whiteSiliconeRegular14': 'white silicone · regular · 14 cm tall',
      'desc.blackCeramicLarge22': 'black ceramic · large · 22 cm tall',
      'desc.paintedClayRegular12': 'painted clay · regular · 12 cm tall',
      'desc.blackCeramicLarge18': 'black ceramic · large · 18 cm tall',
      'desc.nietzscheFinished': 'hand-finished FDM figure · gold finish',
      'desc.marxitoFinished': 'hand-finished FDM figure · gold finish',
      'desc.trauminFinished': 'hand-finished FDM figure · gold finish',
	      'desc.marxitoPreview': 'color 3D model · real photo coming',
	      'desc.marxitoUpdated': 'collectible figure · updated image',
	      'desc.jarronFinished': 'hand-finished Kraken Florero FDM object · glossy black finish',
	      'desc.ositoWuTangPhysical': 'physical piece · golden Wu Tang bear',
	      'desc.vasijaAtlasPhysical': 'physical piece · held vessel',
	      'desc.cuatroMonosPhysical': 'physical piece · four gestures on one base',
	      'desc.tentative30': 'tentative edition 1 / 30',
      'desc.tentative50': 'tentative edition 1 / 50',
      'desc.tentative20': 'tentative edition 1 / 20',
      'subtitle.tuni.black': 'Piece 03 / Drop 001 / Device · BLACK variant',
      'subtitle.tuni.white': 'Piece 03 / Drop 001 / Device · WHITE variant',
      'subtitle.tuni.pink': 'Piece 03 / Drop 001 / Device · PINK variant',
      'subtitle.copa': 'Piece 04 / Drop 001 / Themed object · World Cup 2026',
      'subtitle.marxito': 'Piece 05 / Drop 001 / Collectible figure',
      'subtitle.traumin': 'Piece 10 / Drop 001 / Collectible figure',
      'subtitle.punk.regular': 'Piece 06 / Drop 001 / PLANTI family · regular',
      'subtitle.punk.xl': 'Piece 07 / Drop 001 / PLANTI family · large',
	      'subtitle.k.regular': 'Piece 08 / Drop 001 / PLANTI family · regular',
	      'subtitle.k.xl': 'Piece 09 / Drop 001 / PLANTI family · large',
	      'subtitle.jarron': 'Piece 14 / Drop 001 / Intervened line object',
	      'subtitle.cthulito': 'Premium physical piece / hand-finished FDM creature / Drop 001',
	      'subtitle.ositoWuTang': 'New physical entry / golden bear / profile in progress',
	      'subtitle.gotimonda': 'Original Simio Plateado design / ceremonial armor / profile in progress',
	      'subtitle.vasijaAtlas': 'New physical entry / domestic Atlas / profile in progress',
	      'subtitle.cuatroMonos': 'New physical entry / tabletop object / profile in progress',
	      'subtitle.esponjaG': 'New physical entry / intervened figure / real 3D photo as cover',
      'callout.dropBody': 'A · Drop body',
      'callout.speaker': 'C · Speaker',
      'callout.screen': 'B · Screen',
      'callout.rightButton': 'D · Right button',
      'callout.tuni.body': '"Too pretty for anyone to concentrate."',
      'callout.tuni.speaker': '"Button for playing back your dog voice in multiple forms, styles, and colors."',
      'callout.tuni.screen': '"Record whatever you want; it returns the important information so you can stay peacefully distracted."',
      'callout.tuni.button': '"Button for recording your voice, conversations, or meetings (with permission; do not be shady)."',
      'callout.flags': 'B · Tricolor flags',
      'callout.ball': 'A · Ball on top',
      'callout.baseLegend': 'C · Base inscription',
      'callout.copa.flags': '"Recognition for showing up. We still love them, and we will meet again in 4 years (if we qualify)."',
      'callout.copa.ball': '"Cardboard trophy for those who compete like never before and lose like always."',
      'callout.copa.base': '"A reminder that joy and the party are still ours."',
      'callout.cane': 'B · Cane',
      'callout.hat': 'A · Hat',
      'callout.coinBag': 'C · Coin bag',
      'callout.marxito.cane': '"Cane for stomping vampires."',
      'callout.marxito.hat': '"Button for replaying analytical, forceful, demolishing phrases."',
      'callout.marxito.coins': '"Chocolate coins for a sweet revolution."',
      'callout.head': 'A · Head',
      'callout.arms': 'C · Arms',
      'callout.paintedMouth': 'E · Painted mouth',
      'callout.screenEyes': 'B · Screen / eyes',
      'callout.sensorNose': 'D · Sensor / nose',
      'callout.plant': 'A · Plant',
      'callout.internalSensor': 'C · Internal sensor',
      'callout.faceScreen': 'B · Face screen',
      'callout.charging': 'D · Charging station',
      'callout.k.plant': '"Healthy, beautiful plant life thanks to Planti."',
      'callout.k.sensor': '"Analyzes compound status and gives you the best recommendations."',
      'callout.k.screen': '"Tells you when to water it, and not to let one more plant die."',
      'callout.k.charging': '"So you are never left without company or orientation."',
      'button.close': 'Close',
      'button.wantExist': 'I want it to exist',
      'button.wantHave': 'I want it',
      'button.notify': 'Notify me',
      'button.send': 'Send →',
      'button.thanks': 'Saved · thank you',
      'button.sending': 'Sending...',
      'button.noting': 'Saving...',
      'variant.black': '.black',
      'variant.white': '.white',
      'variant.pink': '.pink',
      'variant.clay': '.clay',
      'variant.silicone': '.silicone',
      'variant.obsidian': '.obsidian',
      'preorder.title': 'Pre-order open',
      'preorder.copy': 'Reserve this piece now. When the drop closes, we will write to process payment through Mercado Pago.',
      'preorder.nameLabel': 'Name (optional)',
      'preorder.namePlaceholder': 'name',
      'preorder.emailLabel': 'Email',
      'preorder.emailPlaceholder': 'you@email.com',
      'preorder.sizeLabel': 'Size',
      'preorder.editionLabel': 'Edition',
      'preorder.chooseSize': 'Choose size',
      'preorder.onesize': 'One size',
      'preorder.uniquePiece': 'Unique piece',
      'preorder.button': 'Pre-order / Reserve',
      'preorder.invalidEmail': 'We need a valid email to reserve.',
      'preorder.missingSize': 'Choose a size to continue.',
      'preorder.sending': 'Reserving...',
      'preorder.success': 'Pre-order registered. We sent confirmation to your email.',
      'preorder.error': 'There was a problem registering the pre-order. Please try again.',
      'preorder.rateLimited': 'Too many pre-orders from this address. Please wait one hour or contact us.',
      'checkout.title': 'Direct purchase',
      'checkout.copy': 'Secure payment through Mercado Pago. Initial run of 10 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
      'checkout.copySuperhombresito': 'Secure payment through Mercado Pago. Hand-finished FDM figure, 17.5 cm high x 10.5 cm wide x 9 cm deep. Initial run of 10 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
      'checkout.copyMarxito': 'Secure payment through Mercado Pago. Hand-finished FDM figure, 18 cm high x 12 cm wide x 11 cm deep. Initial run of 10 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
      'checkout.copyTraumin': 'Secure payment through Mercado Pago. Hand-finished FDM figure, 18 cm high x 11 cm wide x 11 cm deep. Initial run of 10 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
      'checkout.priceNote': 'Price: COP 230,000. Approx. USD 58 reference. Mercado Pago charges in COP.',
      'checkout.priceNoteMarxito': 'Price: COP 250,000. Approx. USD 63 reference. Mercado Pago charges in COP.',
      'checkout.priceNoteTraumin': 'Price: COP 220,000. Approx. USD 55 reference. Mercado Pago charges in COP.',
	      'checkout.copyJarron': 'Secure payment through Mercado Pago. Hand-finished Kraken Florero FDM object, 15.2 cm high x 9.9 cm wide x 10.3 cm deep. Initial run of 5 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
	      'checkout.priceNoteJarron': 'Price: COP 220,000. Approx. USD 55 reference. Mercado Pago charges in COP.',
		      'checkout.copyCthulito': 'Secure payment through Mercado Pago. Hand-finished CTHULITO.v01 FDM piece, glossy gold finish, 11 cm high x 18.5 cm wide x 16.5 cm deep. Initial run of 3 units, hand-finished in Medellín. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
		      'checkout.priceNoteCthulito': 'Price: COP 300,000. Approx. USD 75 reference. Mercado Pago charges in COP.',
		      'checkout.copyQuijotico': 'Secure payment through Mercado Pago. Hand-finished QUIJOTICO.v01 FDM piece, glossy gold finish, fine lance and high detail level. Final dimensions will be confirmed before dispatch. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
		      'checkout.priceNoteQuijotico': 'Price: COP 260,000. Approx. USD 65 reference. Mercado Pago charges in COP.',
	      'checkout.copyWearable': 'Secure payment through Mercado Pago. Domestic shipping in Colombia is included. International shipping is quoted before dispatch.',
      'checkout.sizesShirt': 'Available sizes: S, M, L and XL.',
      'checkout.priceNoteCamisetaBlanca': 'Price: COP 81,600. Approx. USD 20.4 reference. Mercado Pago charges in COP.',
      'checkout.priceNoteCamisetaNegra': 'Price: COP 91,200. Approx. USD 22.8 reference. Mercado Pago charges in COP.',
      'checkout.priceNoteGorra': 'Price: COP 105,600. Approx. USD 26.4 reference. Mercado Pago charges in COP.',
      'checkout.button': 'Buy now',
      'checkout.fastTitle': 'Direct payment',
      'checkout.fastCopy': 'Mercado Pago · domestic shipping included.',
      'checkout.fastButton': 'Pay with Mercado Pago',
      'checkout.nameLabel': 'Full name',
      'checkout.namePlaceholder': 'First and last name',
      'checkout.emailLabel': 'Email',
      'checkout.emailPlaceholder': 'you@email.com',
      'checkout.sizeLabel': 'Size',
      'checkout.chooseSize': 'Choose size',
      'checkout.onesize': 'One size',
      'checkout.phoneLabel': 'Phone / WhatsApp',
      'checkout.phonePlaceholder': '+57 ...',
      'checkout.addressLabel': 'Shipping address',
      'checkout.addressPlaceholder': 'Street, number, apartment',
      'checkout.cityLabel': 'City',
      'checkout.cityPlaceholder': 'Medellín',
      'checkout.stateLabel': 'State / Department',
      'checkout.statePlaceholder': 'Antioquia',
      'checkout.countryLabel': 'Country',
	      'checkout.countryPlaceholder': 'Colombia',
	      'checkout.postalLabel': 'Postal code (optional)',
	      'checkout.postalPlaceholder': '050001',
	      'checkout.notesLabel': 'Shipping notes (optional)',
	      'checkout.notesPlaceholder': 'Doorman, delivery window, references...',
	      'checkout.completeRequired': 'Complete these details to continue to payment.',
	      'checkout.requiredField': 'This field is required to continue.',
	      'checkout.invalidEmailField': 'Enter a valid email to continue.',
	      'checkout.missingShipping': 'Please complete name, phone and shipping address before payment.',
	      'checkout.missingSize': 'Please choose a size before continuing.',
	      'checkout.invalidEmail': 'We need a valid email to create the order.',
      'checkout.sending': 'Opening Mercado Pago...',
      'checkout.redirecting': 'Redirecting to Mercado Pago...',
      'checkout.error': 'We could not open checkout. Please try again or contact us.',
      'checkout.configMissing': 'Mercado Pago checkout still needs the production token in Cloudflare.',
      'checkout.rateLimited': 'Too many checkout attempts from this address. Please wait one hour or contact us.',
      'checkout.issueButton': 'I could not complete my purchase',
      'checkout.issueCopy': 'Leave your email and we will let you know as soon as we can correct it. Sorry for the friction.',
      'checkout.issueEmailLabel': 'Email for updates (optional)',
      'checkout.issueEmailPlaceholder': 'you@email.com',
      'checkout.issueSend': 'Notify me when fixed',
      'checkout.issueSending': 'Sending report...',
      'checkout.issueSuccess': 'Thank you. The issue was reported and we will let you know when checkout is smooth again.',
      'checkout.issueSuccessNoEmail': 'Thank you. The issue was reported. If you email us, we can notify you directly.',
      'checkout.issueError': 'We could not save the report. Please write to el@simioplateado.com.',
      'checkout.issueInvalidEmail': 'That email does not look valid. You can leave it empty or correct it.',
      'media.finished': 'Finished piece',
      'media.model3d': '3D model',
	      'media.illustration': 'Illustration',
	      'media.digitalVersion': 'Digital version',
	      'media.boxOpen': 'Box + piece',
	      'media.boxClosed': 'Closed box',
	      'media.nietzschePinkBox': 'Pink variant + box',
	      'media.realPhoto': 'Real photo',
      'media.real3dPhoto': 'Real 3D photo',
      'media.baseDesign': 'Base design',
      'media.jarronFinished': 'Finished Kraken Florero',
      'media.jarronModel3d': 'White 3D model',
      'media.partyIllustration': 'Illustration',
      'media.simiugIllustration': 'Visual study',
	      'notify.title': 'Production notice',
	      'notify.helper': 'One email only',
	      'notify.emailTitle': '→ Notify me when pre-order opens',
	      'notify.emailCopy': 'We will write once when this piece moves from production to open pre-order.',
      'notify.emailPhysicalTitle': '→ Notify me if it becomes a physical piece',
      'notify.emailPhysicalCopy': 'We will write once if this design enters production.',
      'notify.invalidEmail': 'We need a valid email to notify you.',
      'notify.error': 'There was a problem. Please try again.',
      'notify.registeredTitle': 'Notice registered.',
      'notify.registeredBody': 'We will write when {product} moves to pre-order. That is all. No newsletter.',
      'interest.title': 'Should {product} exist?',
      'interest.helper': 'choose the gesture',
      'interest.emailTitle': '→ Tell me if it starts becoming real',
      'interest.emailCopy': 'One email if {product} moves from digital existence into production.',
      'interest.silentTitle': '→ Just leave a trace',
      'interest.silentCopy': 'We save the gesture without asking for your email.',
      'interest.silentButton': 'Leave a trace',
      'interest.emailRegisteredTitle': 'Notice saved.',
      'interest.emailRegisteredBody': 'We will write if {product} starts becoming real. One email only.',
      'interest.registeredTitle': 'Trace registered.',
      'interest.registeredBody': 'No email, no chase. It is now noted among the possible becomings.',
      'interestHave.title': 'Do you want {product}?',
      'interestHave.helper': 'choose how',
      'interestHave.emailTitle': '→ Tell me when I can get it',
      'interestHave.emailCopy': 'One email if {product} opens for order, reservation, or production.',
      'interestHave.emailCopyGeneric': 'We will write once if this design opens for order, reservation, or production.',
      'interestHave.silentTitle': '→ I just want it',
      'interestHave.silentCopy': 'We save your interest without asking for your email.',
      'interestHave.silentButton': 'Register interest',
      'interestHave.emailRegisteredTitle': 'Interest saved.',
      'interestHave.emailRegisteredBody': 'We will write if {product} opens for order, reservation, or production. One email only.',
      'interestHave.registeredTitle': 'Interest registered.',
      'interestHave.registeredBody': 'No email, no chase. It is now noted that you want it.'
    }
  };

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.es[key] || key;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarMicrointeracciones);
  } else {
    iniciarMicrointeracciones();
  }

  const COMMERCIAL_TEXT_KEYS = {
    'IRREAL · existencia digital': 'state.irrealDigital',
    'IRREAL · digital existence': 'state.irrealDigital',
    'Disponible · pre-order abierto': 'state.available',
    'Available · pre-order open': 'state.available',
    'Disponible · compra abierta': 'state.buyOpen',
    'Available · checkout open': 'state.buyOpen',
	    'Gestándose · pre-order en camino': 'state.gestando',
	    'In production · pre-order soon': 'state.gestando',
	    'Gestándose · modelo 3D listo': 'state.partyAnimalGestando',
	    'In gestation · 3D model ready': 'state.partyAnimalGestando',
	    'Gestándose · imagen sin fondo cargada': 'state.visualOnly',
	    'In gestation · cutout image loaded': 'state.visualOnly',
	    'diseño animado + modelo 3D': 'desc.partyAnimalDigital',
	    'animated design + 3D model': 'desc.partyAnimalDigital',
	    'objeto sonoro · criatura parlante': 'desc.speakerCreature',
	    'sound object · speaking creature': 'desc.speakerCreature',
	    'objeto sonoro · ojo parlante': 'desc.speakerEye',
	    'sound object · speaking eye': 'desc.speakerEye',
	    'objeto sonoro · máscara de escucha': 'desc.speakerMask',
	    'sound object · listening mask': 'desc.speakerMask',
	    'objeto sonoro · cráneo translúcido': 'desc.speakerMind',
	    'sound object · translucent skull': 'desc.speakerMind',
	    'estatua ritual · Fatum et Dolor': 'desc.vidaYPena',
	    'ritual statue · Fatum et Dolor': 'desc.vidaYPena',
    'Gestándose · prototipo de objeto': 'state.simiugGestando',
    'In gestation · object prototype': 'state.simiugGestando',
	    'objeto conceptual · taza/recipiente': 'desc.simiugDigital',
	    'concept object · cup/vessel': 'desc.simiugDigital',
	    'pieza física · esponja gangster': 'desc.esponjaGPhysical',
	    'physical piece · gangster sponge': 'desc.esponjaGPhysical',
	    'pieza FDM intervenida · criatura abisal': 'desc.cthulitoFinished',
	    'hand-finished FDM piece · abyssal creature': 'desc.cthulitoFinished',
	    'Medidas aproximadas: 11 cm alto x 18,5 cm ancho x 16,5 cm profundo': 'measure.cthulito',
	    'Approx. dimensions: 11 cm high x 18.5 cm wide x 16.5 cm deep': 'measure.cthulito',
    'USD 70 · en producción': 'price.parchao',
    'USD 70 · in production': 'price.parchao',
    'USD 74 · en producción': 'price.punk',
    'USD 74 · in production': 'price.punk',
    'USD 85 · en producción': 'price.punkxl',
    'USD 85 · in production': 'price.punkxl',
    'USD 72 · en producción': 'price.k',
    'USD 72 · in production': 'price.k',
    'USD 84 · en producción': 'price.kxl',
    'USD 84 · in production': 'price.kxl',
    'USD 188 · tirada limitada': 'price.irreal188',
    'USD 188 · limited run': 'price.irreal188',
    'USD 64 · tirada limitada': 'price.irreal64',
    'USD 64 · limited run': 'price.irreal64',
    'USD 108 · tirada limitada': 'price.irreal108',
    'USD 108 · limited run': 'price.irreal108',
    'COP 230.000 · USD 58 ref. · tirada inicial 10': 'price.nietzschesito',
    'COP 230,000 · approx. USD 58 · initial run of 10': 'price.nietzschesito',
    'COP 250.000 · USD 63 ref. · tirada inicial 10': 'price.marxito',
    'COP 250,000 · approx. USD 63 · initial run of 10': 'price.marxito',
    'COP 220.000 · USD 55 ref. · tirada inicial 10': 'price.traumin',
    'COP 220,000 · approx. USD 55 · initial run of 10': 'price.traumin',
	    'COP 220.000 · USD 55 ref. · tirada inicial 5': 'price.jarron',
	    'COP 220,000 · approx. USD 55 · initial run of 5': 'price.jarron',
				    'COP 300.000 · USD 75 ref. · tirada inicial 3': 'price.cthulito',
				    'COP 300,000 · approx. USD 75 · initial run of 3': 'price.cthulito',
				    'COP 260.000 · USD 65 ref. · pieza disponible': 'price.quijotico',
				    'COP 260,000 · approx. USD 65 · available piece': 'price.quijotico',
				    'COP 240.000 · USD 60 ref. · pieza disponible': 'price.gabito',
			    'COP 240,000 · approx. USD 60 · available piece': 'price.gabito',
			    'COP 230.000 · USD 58 ref. · pieza disponible': 'price.poesito',
		    'COP 230,000 · approx. USD 58 · available piece': 'price.poesito',
		    'COP 200.000 · USD 50 ref. · pieza disponible': 'price.acefalo',
		    'COP 200,000 · approx. USD 50 · available piece': 'price.acefalo',
	    'COP 81.600 · USD 20.4 ref.': 'price.camisetaBlanca',
    'COP 81,600 · approx. USD 20.4': 'price.camisetaBlanca',
    'COP 91.200 · USD 22.8 ref.': 'price.camisetaNegra',
    'COP 91,200 · approx. USD 22.8': 'price.camisetaNegra',
    'COP 105.600 · USD 26.4 ref.': 'price.gorra',
    'COP 105,600 · approx. USD 26.4': 'price.gorra',
    'USD 84 · tirada limitada': 'price.irreal84',
    'USD 84 · limited run': 'price.irreal84',
    'USD 132 · tirada muy limitada': 'price.irreal132',
    'USD 132 · very limited run': 'price.irreal132',
    'USD 148 · tirada limitada': 'price.irreal148',
    'USD 148 · limited run': 'price.irreal148',
    'Precio proyectado': 'label.priceProjected',
    'Projected price': 'label.priceProjected',
    'Precio': 'label.price',
    'Price': 'label.price',
    'Estado': 'label.status',
    'Status': 'label.status',
    'Objeto': 'label.object',
    'Object': 'label.object',
    'modelo en cola': 'desc.arturitoObject',
    'model in queue': 'desc.arturitoObject',
    'Lucha Libre de Clases': 'desc.gramscitoObject',
    'Class lucha libre': 'desc.gramscitoObject',
    'Sintomin / Lacancito': 'desc.lacancitoObject',
    'náusea capitaneada': 'desc.capitanNauseaObject',
    'captained nausea': 'desc.capitanNauseaObject',
    'silicona · 4.2 × 5.8 cm aprox': 'desc.siliconeSmall',
    'silicone · approx. 4.2 × 5.8 cm': 'desc.siliconeSmall',
    'cartón pintado · 18 cm alto': 'desc.paintedCardboard18',
    'painted cardboard · 18 cm tall': 'desc.paintedCardboard18',
    'resina pintada · 12 cm alto': 'desc.paintedResin12',
    'painted resin · 12 cm tall': 'desc.paintedResin12',
    'figura FDM intervenida · acabado dorado': 'desc.marxitoFinished',
    'hand-finished FDM figure · gold finish': 'desc.marxitoFinished',
    'modelo 3D a color · foto real en camino': 'desc.marxitoPreview',
    'color 3D model · real photo coming': 'desc.marxitoPreview',
    'figura coleccionable · imagen actualizada': 'desc.marxitoUpdated',
    'collectible figure · updated image': 'desc.marxitoUpdated',
    'silicona blanca · regular · 14 cm alto': 'desc.whiteSiliconeRegular14',
    'white silicone · regular · 14 cm tall': 'desc.whiteSiliconeRegular14',
    'cerámica negra · grande · 22 cm alto': 'desc.blackCeramicLarge22',
    'black ceramic · large · 22 cm tall': 'desc.blackCeramicLarge22',
    'barro pintado · regular · 12 cm alto': 'desc.paintedClayRegular12',
    'painted clay · regular · 12 cm tall': 'desc.paintedClayRegular12',
    'cerámica negra · grande · 18 cm alto': 'desc.blackCeramicLarge18',
    'black ceramic · large · 18 cm tall': 'desc.blackCeramicLarge18',
    'edición tentativa 1 / 30': 'desc.tentative30',
    'tentative edition 1 / 30': 'desc.tentative30',
    'edición tentativa 1 / 50': 'desc.tentative50',
    'tentative edition 1 / 50': 'desc.tentative50',
    'edición tentativa 1 / 20': 'desc.tentative20',
    'tentative edition 1 / 20': 'desc.tentative20',
    'Pieza 03 / Drop 001 / Dispositivo · variante NEGRA': 'subtitle.tuni.black',
    'Piece 03 / Drop 001 / Device · BLACK variant': 'subtitle.tuni.black',
    'Pieza 03 / Drop 001 / Dispositivo · variante BLANCA': 'subtitle.tuni.white',
    'Piece 03 / Drop 001 / Device · WHITE variant': 'subtitle.tuni.white',
    'Pieza 03 / Drop 001 / Dispositivo · variante ROSA': 'subtitle.tuni.pink',
    'Piece 03 / Drop 001 / Device · PINK variant': 'subtitle.tuni.pink',
    'Pieza 04 / Drop 001 / Objeto temático · Mundial 2026': 'subtitle.copa',
    'Piece 04 / Drop 001 / Themed object · World Cup 2026': 'subtitle.copa',
    'Pieza 05 / Drop 001 / Figura coleccionable': 'subtitle.marxito',
    'Piece 05 / Drop 001 / Collectible figure': 'subtitle.marxito',
    'Pieza 10 / Drop 001 / Figura coleccionable': 'subtitle.traumin',
    'Piece 10 / Drop 001 / Collectible figure': 'subtitle.traumin',
    'Pieza 06 / Drop 001 / Familia PLANTI · regular': 'subtitle.punk.regular',
    'Piece 06 / Drop 001 / PLANTI family · regular': 'subtitle.punk.regular',
    'Pieza 07 / Drop 001 / Familia PLANTI · grande': 'subtitle.punk.xl',
    'Piece 07 / Drop 001 / PLANTI family · large': 'subtitle.punk.xl',
    'Pieza 08 / Drop 001 / Familia PLANTI · regular': 'subtitle.k.regular',
    'Piece 08 / Drop 001 / PLANTI family · regular': 'subtitle.k.regular',
    'Pieza 09 / Drop 001 / Familia PLANTI · grande': 'subtitle.k.xl',
    'Piece 09 / Drop 001 / PLANTI family · large': 'subtitle.k.xl',
    'A · Cuerpo gota': 'callout.dropBody',
    'A · Drop body': 'callout.dropBody',
    'C · Parlante': 'callout.speaker',
    'C · Speaker': 'callout.speaker',
    'B · Pantalla': 'callout.screen',
    'B · Screen': 'callout.screen',
    'D · Botón derecha': 'callout.rightButton',
    'D · Right button': 'callout.rightButton',
    '"Demasiado bonito como para que alguien se concentre."': 'callout.tuni.body',
    '"Too pretty for anyone to concentrate."': 'callout.tuni.body',
    '"Botón para reproducir y escuchar tu voz de perro en múltiples formas, estilos y colores."': 'callout.tuni.speaker',
    '"Button for playing back your dog voice in multiple forms, styles, and colors."': 'callout.tuni.speaker',
    '"Puedes grabar lo que quieras y te devuelve la información importante, para que te distraigas con tranquilidad."': 'callout.tuni.screen',
    '"Record whatever you want; it returns the important information so you can stay peacefully distracted."': 'callout.tuni.screen',
    '"Botón para grabar tu voz o conversaciones y reuniones (si tienes autorización, no seas descaradx)."': 'callout.tuni.button',
    '"Button for recording your voice, conversations, or meetings (with permission; do not be shady)."': 'callout.tuni.button',
    'B · Banderitas tricolor': 'callout.flags',
    'B · Tricolor flags': 'callout.flags',
    'A · Balón arriba': 'callout.ball',
    'A · Ball on top': 'callout.ball',
    'C · Base con leyenda': 'callout.baseLegend',
    'C · Base inscription': 'callout.baseLegend',
    '"Reconoce la participación. Igual los queremos, y nos veremos en 4 años (si pasamos)."': 'callout.copa.flags',
    '"Recognition for showing up. We still love them, and we will meet again in 4 years (if we qualify)."': 'callout.copa.flags',
    '"Copa de cartón, para quienes compiten como nunca y pierden como siempre."': 'callout.copa.ball',
    '"Cardboard trophy for those who compete like never before and lose like always."': 'callout.copa.ball',
    '"Para recordar que lo nuestro es la dicha y la fiesta."': 'callout.copa.base',
    '"A reminder that joy and the party are still ours."': 'callout.copa.base',
    'B · Bastón': 'callout.cane',
    'B · Cane': 'callout.cane',
    'A · Sombrero': 'callout.hat',
    'A · Hat': 'callout.hat',
    'C · Bolsa de monedas': 'callout.coinBag',
    'C · Coin bag': 'callout.coinBag',
    '"Bastón para pisotear vampiros."': 'callout.marxito.cane',
    '"Cane for stomping vampires."': 'callout.marxito.cane',
    '"Botón para reproducción de frases analíticas, contundentes y demoledoras."': 'callout.marxito.hat',
    '"Button for replaying analytical, forceful, demolishing phrases."': 'callout.marxito.hat',
    '"Monedas de chocolate para una dulce revolución."': 'callout.marxito.coins',
    '"Chocolate coins for a sweet revolution."': 'callout.marxito.coins',
    'A · Cabeza': 'callout.head',
    'A · Head': 'callout.head',
    'C · Brazos': 'callout.arms',
    'C · Arms': 'callout.arms',
    'E · Boca pintada': 'callout.paintedMouth',
    'E · Painted mouth': 'callout.paintedMouth',
    'B · Pantalla / ojos': 'callout.screenEyes',
    'B · Screen / eyes': 'callout.screenEyes',
    'D · Sensor / nariz': 'callout.sensorNose',
    'D · Sensor / nose': 'callout.sensorNose',
    'A · Planta': 'callout.plant',
    'A · Plant': 'callout.plant',
    'C · Sensor interno': 'callout.internalSensor',
    'C · Internal sensor': 'callout.internalSensor',
    'B · Pantalla con cara': 'callout.faceScreen',
    'B · Face screen': 'callout.faceScreen',
    'D · Estación de carga': 'callout.charging',
    'D · Charging station': 'callout.charging',
    '"Planta saludable y bonita gracias a Planti."': 'callout.k.plant',
    '"Healthy, beautiful plant life thanks to Planti."': 'callout.k.plant',
    '"Analiza el estado de los compuestos y te da las mejores recomendaciones."': 'callout.k.sensor',
    '"Analyzes compound status and gives you the best recommendations."': 'callout.k.sensor',
    '"Te dice cuándo regarla, y que no dejes morir una planta más."': 'callout.k.screen',
    '"Tells you when to water it, and not to let one more plant die."': 'callout.k.screen',
    '"Para que no te quedes nunca sin acompañamiento y orientación."': 'callout.k.charging',
    '"So you are never left without company or orientation."': 'callout.k.charging'
  };
  const COMMERCIAL_TEXT_REPLACEMENTS = Object.entries(COMMERCIAL_TEXT_KEYS)
    .sort(([a], [b]) => b.length - a.length);

  function traducirNodoTexto(node) {
    COMMERCIAL_TEXT_REPLACEMENTS.forEach(([texto, key]) => {
      node.nodeValue = node.nodeValue.replaceAll(texto, t(key));
    });
  }

  function productoDesdeBloqueInteres(block) {
    return block.closest('.modal-explosionado')?.querySelector('.codigo-pieza')?.textContent.trim() || 'esta pieza';
  }

  function modoInteresDesdeBloque(block) {
    return block?.dataset?.interestMode === 'have' ? 'have' : 'exist';
  }

  function llaveInteres(block, key) {
    return `${modoInteresDesdeBloque(block) === 'have' ? 'interestHave' : 'interest'}.${key}`;
  }

  function llaveBotonInteres(block) {
    return modoInteresDesdeBloque(block) === 'have' ? 'button.wantHave' : 'button.wantExist';
  }

  function traducirBloquesInteres() {
    document.querySelectorAll('.votar-bloque').forEach(block => {
      const esInteresDigital = block.querySelector('.silencio') && !block.querySelector('[data-i18n]');
      if (!esInteresDigital) return;

      const product = productoDesdeBloqueInteres(block);
      const buttonKey = llaveBotonInteres(block);
      const title = block.querySelector('.votar-titulo');
      const mainBtn = block.querySelector('.votar-principal');
      const panel = block.querySelector('.votar-panel');
      const helper = block.querySelector('.helper');
      const opciones = block.querySelectorAll('.votar-opcion');
      const emailInput = block.querySelector('input[type="email"]');
      const submitBtn = block.querySelector('.submit');
      const silentBtn = block.querySelector('.silencio');

      if (title) title.textContent = t(llaveInteres(block, 'title')).replace('{product}', product);
      if (mainBtn) {
        mainBtn.dataset.closedLabelKey = buttonKey;
        if (!mainBtn.disabled) mainBtn.textContent = panel?.classList.contains('abierto') ? t('button.close') : t(buttonKey);
      }
      if (helper) helper.textContent = t(llaveInteres(block, 'helper'));
      if (opciones[0]) {
        opciones[0].querySelector('h5').textContent = t(llaveInteres(block, 'emailTitle'));
        opciones[0].querySelector('p').textContent = t(llaveInteres(block, 'emailCopy')).replace('{product}', product);
      }
      if (opciones[1]) {
        opciones[1].querySelector('h5').textContent = t(llaveInteres(block, 'silentTitle'));
        opciones[1].querySelector('p').textContent = t(llaveInteres(block, 'silentCopy'));
      }
      if (emailInput) emailInput.setAttribute('placeholder', t('preorder.emailPlaceholder'));
      if (submitBtn && !submitBtn.disabled) submitBtn.textContent = t('button.send');
      if (silentBtn && !silentBtn.disabled) silentBtn.textContent = t(llaveInteres(block, 'silentButton'));
    });
  }

  function traducirTextosComerciales() {
    document.querySelectorAll('.exp-meta-row div, .pieza .meta .nota, .pieza .meta .precio, .exp-subtitulo, .callout .nota, .callout > div:not(.nota):not(.frase)').forEach(el => {
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) traducirNodoTexto(node);
      });
    });

    document.querySelectorAll('.exp-meta-row div').forEach(div => {
      const strong = div.querySelector('strong');
      if (strong && COMMERCIAL_TEXT_KEYS[strong.textContent.trim()]) {
        strong.textContent = t(COMMERCIAL_TEXT_KEYS[strong.textContent.trim()]);
      }
    });

    document.querySelectorAll('.modal-cerrar').forEach(btn => {
      btn.textContent = '← ' + t('button.close');
    });

    document.querySelectorAll('.variante-selector .label').forEach(label => {
      label.textContent = t('label.variant');
    });

    traducirBloquesInteres();
  }

  function aplicarIdioma(lang) {
    currentLang = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = currentLang;
    localStorage.setItem(LANG_STORAGE_KEY, currentLang);

	    document.querySelectorAll('[data-i18n]').forEach(el => {
	      el.textContent = t(el.dataset.i18n);
	    });
	    document.querySelectorAll('[data-view-link]').forEach(btn => {
	      const label = btn.querySelector('.vista-switch-sr')?.textContent?.trim();
	      if (label) btn.setAttribute('aria-label', label);
	    });
	    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
	      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
	    });
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.classList.toggle('activo', btn.dataset.langSwitch === currentLang);
    });
    document.querySelectorAll('.votar-principal:not(:disabled)').forEach(btn => {
      if (btn.closest('.votar-panel')) return;
      const panelId = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel?.classList.contains('abierto')) {
        btn.textContent = t('button.close');
      } else if (!btn.dataset.i18n) {
        btn.textContent = t(btn.dataset.closedLabelKey || 'button.wantExist');
      }
	    });
	    actualizarCtasCheckoutRapidas();
	    traducirTextosComerciales();
    if (document.getElementById('galeria-catalogo')?.dataset.ready === 'true') {
      actualizarGaleriaFiltrada();
    }
	  }

  function iniciarIdioma() {
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.addEventListener('click', () => aplicarIdioma(btn.dataset.langSwitch));
    });
    aplicarIdioma(estadoPathActual().isEnglish ? 'en' : (localStorage.getItem(LANG_STORAGE_KEY) || 'es'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarIdioma);
  } else {
    iniciarIdioma();
  }

	  function slugSondeoDesdeBoton(btnId) {
	    if (btnId === 'btn-votar-literato' && literatoActual?.slug) return literatoActual.slug;
	    if (btnId === 'btn-votar-party-animal' && partyAnimalActual?.sondeoSlug) return partyAnimalActual.sondeoSlug;
	    if (btnId === 'btn-votar-simiug' && simiugActual?.sondeoSlug) return simiugActual.sondeoSlug;
	    const key = btnId.replace('btn-votar-', '');
	    return SONDEO_SLUGS[key] || key;
	  }

  async function registrarSondeo(payload) {
    const resp = await fetch(SONDEO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error('No se pudo registrar el aviso');
    return resp.json();
  }

	  function abrirVotar(btn, panelId) {
	    const panel = document.getElementById(panelId);
	    panel.classList.toggle('abierto');
	    if (panel.classList.contains('abierto')) {
	      trackSimio('interest_started', slugSondeoDesdeBoton(btn.id || ''), { source: panelId });
	    }
	    btn.textContent = panel.classList.contains('abierto')
	      ? t('button.close')
	      : t(btn.dataset.closedLabelKey || 'button.wantExist');
	  }

  async function votarEmail(panelId, inputId, confId, btnId, nombre) {
    const input = document.getElementById(inputId);
    const email = input.value.trim();
    const submitBtn = input.closest('.form-row').querySelector('.submit');
    const submitText = submitBtn.textContent;

    if (!email || !SONDEO_EMAIL_RE.test(email)) {
      alert(t('notify.invalidEmail'));
      return;
    }

    submitBtn.textContent = t('button.sending');
    submitBtn.disabled = true;

	    try {
	      const sondeoSlug = slugSondeoDesdeBoton(btnId);
	      await registrarSondeo({
	        slug: sondeoSlug,
	        email,
	        modo: 'email',
	        lang: currentLang
	      });
	      trackPixel('Lead', { content_name: nombre || sondeoSlug, content_category: 'interest', status: 'email' });
	      trackSimio('interest_registered', sondeoSlug, { source: panelId, mode: 'email' });
	    } catch (err) {
	      submitBtn.textContent = submitText;
	      submitBtn.disabled = false;
	      alert(t('notify.error'));
      return;
    }

    const conf = document.getElementById(confId);
    const panel = document.getElementById(panelId);
    const interestBlock = panel?.closest('.votar-bloque');
    const isInterest = Boolean(interestBlock?.querySelector('.silencio') || interestBlock?.dataset?.interestMode);
    const titleKey = isInterest ? llaveInteres(interestBlock, 'emailRegisteredTitle') : 'notify.registeredTitle';
    const bodyKey = isInterest ? llaveInteres(interestBlock, 'emailRegisteredBody') : 'notify.registeredBody';
    const product = isInterest ? productoDesdeBloqueInteres(interestBlock) : nombre;
    conf.innerHTML = '<strong>' + t(titleKey) + '</strong> ' + t(bodyKey).replace('{product}', product);
    conf.classList.add('visible');
    panel.classList.remove('abierto');
    const btn = document.getElementById(btnId);
    btn.textContent = t('button.thanks');
    btn.disabled = true;
  }

  async function votarSilencio(panelId, confId, btnId) {
    const btn = document.getElementById(btnId);

    btn.textContent = t('button.noting');
	    btn.disabled = true;

	    try {
	      const sondeoSlug = slugSondeoDesdeBoton(btnId);
	      await registrarSondeo({
	        slug: sondeoSlug,
	        modo: 'silencio',
	        lang: currentLang
	      });
	      trackSimio('interest_registered', sondeoSlug, { source: panelId, mode: 'silent' });
	    } catch (err) {
	      // Si la red falla, el gesto anonimo no debe convertirse en una interrupcion.
	    }

    const conf = document.getElementById(confId);
    const interestBlock = document.getElementById(panelId)?.closest('.votar-bloque');
    conf.innerHTML = '<strong>' + t(llaveInteres(interestBlock, 'registeredTitle')) + '</strong> ' + t(llaveInteres(interestBlock, 'registeredBody'));
    conf.classList.add('visible');
    document.getElementById(panelId).classList.remove('abierto');
    btn.textContent = t('button.thanks');
  }

	  async function iniciarCompra(event, slug, source = 'checkout_form') {
	    event?.preventDefault?.();

	    const status = document.getElementById('checkout-conf-' + slug);
	    const btn = event?.currentTarget || null;
	    const originalText = btn ? btn.textContent : '';

	    if (status) {
	      status.className = 'preorder-status';
	      status.textContent = '';
	    }
	    limpiarCheckoutIssueWidget(slug);

		    const validation = validarCheckoutForm(slug, { showErrors: true });
		    if (!validation.ok) {
		      trackEventoComercioCustom('CheckoutValidationError', slug, {
		        source,
		        invalid_count: validation.invalidCount || 1
		      });
		      trackSimio('checkout_validation_error', slug, {
		        source,
		        invalid_count: validation.invalidCount || 1
		      });
		      if (status) {
		        status.textContent = t('checkout.completeRequired');
		        status.classList.add('error');
		      }
		      return;
	    }

		    const orderData = leerDatosCheckout(slug);
		    trackEventoComercio('InitiateCheckout', slug, { source, num_items: 1 });
		    trackSimio('initiate_checkout', slug, { source, num_items: 1 });

    if (btn) {
      btn.textContent = t('checkout.sending');
      btn.disabled = true;
    }

    try {
      const resp = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          lang: currentLang,
          customer: orderData.customer,
          shipping: orderData.shipping,
          talla: orderData.talla
        })
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data.checkout_url) {
        const message =
          data.error === 'checkout_no_configurado'
            ? t('checkout.configMissing')
            : resp.status === 429
              ? t('checkout.rateLimited')
              : (data.message || t('checkout.error'));
        throw new Error(message);
      }

		      if (status) {
		        status.textContent = t('checkout.redirecting');
		        status.classList.add('ok');
		      }
		      guardarUltimoCheckout(slug, data);
		      trackSimio('checkout_redirect', slug, {
		        source,
		        provider: data.provider || 'mercadopago'
		      });
		      window.setTimeout(() => {
		        window.location.href = data.checkout_url;
		      }, 200);
		    } catch (err) {
	      trackEventoComercioCustom('CheckoutError', slug, { message: err.message || 'checkout_error' });
	      trackSimio('checkout_error', slug, {
	        source,
	        message: err.message || 'checkout_error'
	      });
      if (status) {
        status.textContent = err.message || t('checkout.error');
        status.classList.add('error');
        mostrarCheckoutIssueWidget(status, slug, {
          source,
          status: 'checkout_error',
          message: err.message || t('checkout.error')
        });
      }
      if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
  }

  function leerDatosCheckout(slug) {
    const valor = (campo) => (document.getElementById('checkout-' + campo + '-' + slug)?.value || '').trim();

    return {
      customer: {
        nombre: valor('nombre'),
        email: valor('email').toLowerCase(),
        telefono: valor('telefono')
      },
      talla: valor('talla'),
      shipping: {
        linea1: valor('direccion'),
        ciudad: valor('ciudad'),
        departamento: valor('departamento'),
        pais: valor('pais'),
        codigo_postal: valor('postal'),
        notas: valor('notas')
      }
    };
  }

  async function enviarPreorder(event, slug, price) {
    event.preventDefault();

    const form = event.currentTarget;
    const product = PREORDER_PRODUCTS[slug];
    const nombreInput = document.getElementById('preorder-nombre-' + slug);
    const emailInput = document.getElementById('preorder-email-' + slug);
    const tallaInput = document.getElementById('preorder-talla-' + slug);
    const status = document.getElementById('preorder-conf-' + slug);
    const submitBtn = form ? form.querySelector('.submit') : null;
    const nombre = (nombreInput?.value || '').trim();
    const email = (emailInput?.value || '').trim().toLowerCase();
    const talla = (tallaInput?.value || '').trim();

    if (!status) return;

    status.className = 'preorder-status';
    status.textContent = '';

    if (!product || price !== product.price) {
      status.textContent = t('preorder.error');
      status.classList.add('error');
      return;
    }

    if (!email || !SONDEO_EMAIL_RE.test(email)) {
      status.textContent = t('preorder.invalidEmail');
      status.classList.add('error');
      return;
    }

    if (!talla || !product.sizes.includes(talla)) {
      status.textContent = t('preorder.missingSize');
      status.classList.add('error');
      return;
    }

	    const submitText = submitBtn ? submitBtn.textContent : '';
	    if (submitBtn) {
	      submitBtn.textContent = t('preorder.sending');
	      submitBtn.disabled = true;
	    }
	    trackSimio('preorder_started', slug, { source: 'preorder_form', price });

	    try {
	      const resp = await fetch(PREORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          product: product.name,
          nombre,
          email,
          talla,
          price,
          mode: 'preorder',
          lang: currentLang
        })
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const message = resp.status === 429 ? t('preorder.rateLimited') : (data.message || t('preorder.error'));
        throw new Error(message);
      }

	      status.textContent = t('preorder.success');
	      status.classList.add('ok');
	      trackPixel('Lead', { content_name: product.name, content_category: 'preorder', value: price, currency: 'USD' });
	      trackSimio('preorder_registered', slug, { source: 'preorder_form', price });
	      if (form && typeof form.reset === 'function') form.reset();
      if (slug === 'gorra' && tallaInput) tallaInput.value = 'unitalla';
    } catch (err) {
      status.textContent = err.message || t('preorder.error');
      status.classList.add('error');
    } finally {
      if (submitBtn) {
        submitBtn.textContent = submitText;
        submitBtn.disabled = false;
      }
    }
  }

  /* PLANTI_VARIANTS placeholder — sustituido en el inline */
  const PLANTI_VARIANTS = {
    "punk-regular-barro": "assets/optimized/inline/inline-png.4b5aa81683.webp",
    "punk-regular-silicona": "assets/optimized/inline/inline-png.67fb77ef4e.webp",
    "punk-regular-obsidiana": "assets/optimized/inline/inline-png.74fbb8bcb6.webp",
    "punk-xl-barro": "assets/optimized/inline/inline-png.7d9020e4c2.webp",
    "punk-xl-silicona": "assets/optimized/inline/inline-png.a21f8e5be7.webp",
    "punk-xl-obsidiana": "assets/optimized/inline/inline-png.9658816ff3.webp",
    "k-regular-barro": "assets/optimized/inline/inline-png.6fbf53ab2d.webp",
    "k-regular-silicona": "assets/optimized/inline/inline-png.99864c2bf9.webp",
    "k-regular-obsidiana": "assets/optimized/inline/inline-png.cbd8cdf230.webp",
    "k-xl-barro": "assets/optimized/inline/inline-png.554deed3bf.webp",
    "k-xl-silicona": "assets/optimized/inline/inline-png.76535bd3a7.webp",
    "k-xl-obsidiana": "assets/optimized/processed/planti/k-xl-obsidiana-card.893c0ddf33.webp",
  };

  function cambiarVariante(modeloKey, variante, btn) {
    const img = document.getElementById('img-' + modeloKey);
    if (!img) return;
    const skuMap = { 'punk': 'punk-regular', 'punk-xl': 'punk-xl', 'k': 'k-regular', 'k-xl': 'k-xl' };
    const sku = skuMap[modeloKey] || modeloKey;
    const key = sku + '-' + variante;
    if (PLANTI_VARIANTS[key]) {
      img.src = PLANTI_VARIANTS[key];
    } else {
      img.src = '../assets/processed/planti/' + sku + '-' + variante + '.png';
    }
    btn.parentElement.querySelectorAll('.variante-btn').forEach(b => b.classList.remove('activa'));
    btn.classList.add('activa');

    const modal = img.closest('.modal-explosionado');
    if (img.complete) {
      requestAnimationFrame(() => alinearLineasExplosionado(modal));
    } else {
      img.addEventListener('load', () => alinearLineasExplosionado(modal), { once: true });
    }
  }
