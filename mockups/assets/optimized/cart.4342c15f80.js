(() => {
  if (window.__simioCartReady) return;
  window.__simioCartReady = true;

  const STORAGE_KEY = "simio-cart-v1";
  const CHECKOUT_ENDPOINT = "https://api.simioplateado.com/api/checkout";
  const MAX_QUANTITY = 10;
  const FELI_INDIVIDUALS = ["venus-feli", "pensador-feli", "david-feli"];
  const RECOMMENDED_SLUGS = ["sphinx-tenebrosa", "cthulito", "quijotico", "marxito", "coleccion-feli"];

  const PRODUCTS = {
    "camiseta-blanca": { name: "CAMISETA_BLANCA", priceCop: 81600, modalSlug: "wearables/camiseta-blanca", sizes: ["S", "M", "L", "XL"], stock: null },
    "camiseta-negra": { name: "CAMISETA_NEGRA", priceCop: 91200, modalSlug: "wearables/camiseta-negra", sizes: ["S", "M", "L", "XL"], stock: null },
    gorra: { name: "GORRA", priceCop: 105600, modalSlug: "wearables/gorra", sizes: ["unitalla"], stock: null },
    marxito: { name: "MARXITO.v01", priceCop: 250000, modalSlug: "marxito", stock: 10 },
    traumin: { name: "TRAUMIN.v01", priceCop: 220000, modalSlug: "traumin", stock: 10 },
    superhombresito: { name: "NIETZSCHESITO.v01", priceCop: 230000, modalSlug: "superhombresito", stock: 10 },
    jarron: { name: "KRAKEN_FLORERO.v01", priceCop: 220000, modalSlug: "jarron", stock: 5 },
    cthulito: { name: "CTHULITO.v01", priceCop: 300000, modalSlug: "cthulito", stock: 3 },
    quijotico: { name: "QUIJOTICO.v01", priceCop: 260000, modalSlug: "quijotico", stock: 1 },
    gabito: { name: "GABITO.v01", priceCop: 240000, modalSlug: "gabito", stock: 1 },
    poesito: { name: "POESITO.v01", priceCop: 230000, modalSlug: "poesito", stock: 1 },
    dostoiecito: { name: "MINI_FIODOR.v01", priceCop: 230000, modalSlug: "mini-fiodor", stock: 1 },
    acefalo: { name: "ACEFALO.v01", priceCop: 200000, modalSlug: "acefalo", stock: 1 },
    "sphinx-tenebrosa": { name: "PA-002 · SPHINX TENEBROSA", priceCop: 250000, modalSlug: "sphinx-tenebrosa", stock: 1 },
    "coleccion-feli": { name: "COLECCION_FELI.v01", priceCop: 400000, modalSlug: "coleccion-feli", stock: 1 },
    "venus-feli": { name: "VENUS_FELI.v01", priceCop: 150000, modalSlug: "venus-feli", stock: 1 },
    "pensador-feli": { name: "PENSADOR_FELI.v01", priceCop: 180000, modalSlug: "pensador-feli", stock: 1 },
    "david-feli": { name: "DAVID_FELI.v01", priceCop: 150000, modalSlug: "david-feli", stock: 1 },
  };

  const COPY = {
    es: {
      cart: "Carrito",
      openCart: "Abrir carrito",
      close: "Cerrar",
      add: "Agregar al carrito",
      addShort: "Agregar",
      added: "Agregado al carrito.",
      empty: "Tu carrito esta esperando pieza.",
      sizeNeeded: "Elegí talla antes de agregar esta pieza.",
      limit: "No hay mas unidades visibles para esta pieza.",
      remove: "Quitar",
      total: "Total",
      checkout: "Pagar carrito",
      discountTitle: "Combo automatico",
      discountRule: "La pieza de mayor valor queda completa; la 2a tiene 20% off, la 3a 30%, la 4a 40% y la 5a+ 50%.",
      discountPending: "Agrega otra pieza y el descuento se aplica solo.",
      discountApplied: "Descuento aplicado",
      discountSavings: "Ahorro",
      profileDiscount: "Combo automatico: al sumar varias piezas, la 2a va con -20%, la 3a -30%, la 4a -40% y la 5a+ -50%.",
      name: "Nombre completo",
      email: "Email",
      phone: "Telefono / WhatsApp",
      address: "Direccion de envio",
      city: "Ciudad",
      state: "Departamento / Estado",
      country: "Pais",
      postal: "Codigo postal",
      notes: "Notas de envio",
      required: "Completa nombre, email, telefono y direccion para seguir.",
      invalidEmail: "Revisa el email antes de seguir.",
      international: "El carrito directo esta disponible para Colombia. Para internacional cotizamos antes de cobrar.",
      sending: "Creando checkout...",
      redirecting: "Redirigiendo a Mercado Pago...",
      error: "No pude crear el checkout. Intentá de nuevo.",
      feliTitle: "Coleccion Feli",
      feliCopy: "Las tres Feli juntas quedan en COP 400.000.",
      feliSwitch: "Cambiar por coleccion",
      recTitle: "Tambien mira",
      placeholderName: "Nombre y apellido",
      placeholderEmail: "tu@email.com",
      placeholderPhone: "+57 ...",
      placeholderAddress: "Calle, numero, apto",
      placeholderCity: "Medellin",
      placeholderState: "Antioquia",
      placeholderCountry: "Colombia",
      placeholderPostal: "050001",
      placeholderNotes: "Porteria, horario, referencias...",
    },
    en: {
      cart: "Cart",
      openCart: "Open cart",
      close: "Close",
      add: "Add to cart",
      addShort: "Add",
      added: "Added to cart.",
      empty: "Your cart is waiting for a piece.",
      sizeNeeded: "Choose a size before adding this piece.",
      limit: "No more visible units for this piece.",
      remove: "Remove",
      total: "Total",
      checkout: "Checkout",
      discountTitle: "Automatic combo",
      discountRule: "The highest-priced piece stays full price; the 2nd gets 20% off, the 3rd 30%, the 4th 40% and the 5th+ 50%.",
      discountPending: "Add another piece and the discount applies automatically.",
      discountApplied: "Discount applied",
      discountSavings: "Savings",
      profileDiscount: "Automatic combo: add multiple pieces and the 2nd gets -20%, the 3rd -30%, the 4th -40% and the 5th+ -50%.",
      name: "Full name",
      email: "Email",
      phone: "Phone / WhatsApp",
      address: "Shipping address",
      city: "City",
      state: "State / Region",
      country: "Country",
      postal: "Postal code",
      notes: "Shipping notes",
      required: "Complete name, email, phone and shipping address before continuing.",
      invalidEmail: "Check the email before continuing.",
      international: "Direct cart checkout is available for Colombia. International orders are quoted before payment.",
      sending: "Creating checkout...",
      redirecting: "Redirecting to Mercado Pago...",
      error: "Checkout could not be created. Please try again.",
      feliTitle: "Feli collection",
      feliCopy: "The three Feli pieces together are COP 400,000.",
      feliSwitch: "Switch to collection",
      recTitle: "Also look at",
      placeholderName: "First and last name",
      placeholderEmail: "you@email.com",
      placeholderPhone: "+57 ...",
      placeholderAddress: "Street, number, apt",
      placeholderCity: "Medellin",
      placeholderState: "Antioquia",
      placeholderCountry: "Colombia",
      placeholderPostal: "050001",
      placeholderNotes: "Doorman, delivery window, references...",
    },
  };

  const state = {
    items: [],
    open: false,
    submitting: false,
  };
  let pendingSizeSlug = "";
  const els = {};

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "es";
  }

  function t(key) {
    const lang = currentLang();
    return COPY[lang][key] || COPY.es[key] || key;
  }

  function formatCop(value) {
    const locale = currentLang() === "en" ? "en-US" : "es-CO";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function keyFor(slug, talla = "") {
    return `${slug}::${talla || ""}`;
  }

  function productMax(product) {
    return Number.isFinite(product.stock) ? Math.min(product.stock, MAX_QUANTITY) : MAX_QUANTITY;
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item) => ({
          slug: String(item.slug || ""),
          talla: String(item.talla || ""),
          quantity: Math.max(1, Math.min(MAX_QUANTITY, Number.parseInt(item.quantity, 10) || 1)),
        }))
        .filter((item) => PRODUCTS[item.slug])
        .map((item) => {
          const max = productMax(PRODUCTS[item.slug]);
          return { ...item, quantity: Math.min(item.quantity, max) };
        });
    } catch {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }

  function quantityTotal() {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }

  function priceTotal() {
    return cartPricing().total;
  }

  function discountMultiplier(position) {
    if (position <= 1) return 1;
    if (position === 2) return 0.8;
    if (position === 3) return 0.7;
    if (position === 4) return 0.6;
    return 0.5;
  }

  function cartPricing(items = state.items) {
    const lines = new Map();
    const units = [];

    items.forEach((item, lineIndex) => {
      const product = PRODUCTS[item.slug];
      if (!product) return;
      const key = keyFor(item.slug, item.talla);
      lines.set(key, { subtotal: 0, discount: 0, total: 0 });
      for (let unitIndex = 0; unitIndex < item.quantity; unitIndex += 1) {
        units.push({
          key,
          lineIndex,
          unitIndex,
          price: product.priceCop || 0,
        });
      }
    });

    units.sort((a, b) => (
      b.price - a.price ||
      a.lineIndex - b.lineIndex ||
      a.unitIndex - b.unitIndex
    ));

    const totals = { lines, subtotal: 0, discount: 0, total: 0, quantity: units.length };
    units.forEach((unit, index) => {
      const multiplier = discountMultiplier(index + 1);
      const discounted = Math.max(0, Math.round(unit.price * multiplier));
      const saving = Math.max(0, unit.price - discounted);
      const line = lines.get(unit.key);
      if (!line) return;
      line.subtotal += unit.price;
      line.discount += saving;
      line.total += discounted;
      totals.subtotal += unit.price;
      totals.discount += saving;
      totals.total += discounted;
    });

    return totals;
  }

  function ensureShell() {
    if (els.root) return;
    const root = document.createElement("div");
    root.className = "simio-cart";
    root.dataset.simioCartRoot = "true";
    root.innerHTML = [
      '<button class="simio-cart-fab" type="button" data-cart-open>',
      '<span data-cart-text="cart"></span>',
      '<span class="simio-cart-count" data-cart-count>0</span>',
      '</button>',
      '<div class="simio-cart-overlay" data-cart-overlay hidden></div>',
      '<aside class="simio-cart-drawer" data-cart-drawer aria-hidden="true">',
      '<header class="simio-cart-header">',
      '<h3 class="simio-cart-title" data-cart-text="cart"></h3>',
      '<button class="simio-cart-close" type="button" data-cart-close aria-label="Cerrar">X</button>',
      '</header>',
      '<div class="simio-cart-body">',
      '<div data-cart-items></div>',
      '<div data-cart-nudges></div>',
      '<form class="simio-cart-form" data-cart-form novalidate>',
      '<label><span data-cart-text="name"></span><input name="nombre" autocomplete="name" data-cart-placeholder="placeholderName"></label>',
      '<label><span data-cart-text="email"></span><input name="email" type="email" autocomplete="email" data-cart-placeholder="placeholderEmail"></label>',
      '<label><span data-cart-text="phone"></span><input name="telefono" autocomplete="tel" data-cart-placeholder="placeholderPhone"></label>',
      '<label><span data-cart-text="address"></span><input name="direccion" autocomplete="street-address" data-cart-placeholder="placeholderAddress"></label>',
      '<div class="simio-cart-pair">',
      '<label><span data-cart-text="city"></span><input name="ciudad" autocomplete="address-level2" data-cart-placeholder="placeholderCity"></label>',
      '<label><span data-cart-text="state"></span><input name="departamento" autocomplete="address-level1" data-cart-placeholder="placeholderState"></label>',
      '</div>',
      '<div class="simio-cart-pair">',
      '<label><span data-cart-text="country"></span><input name="pais" autocomplete="country-name" value="Colombia" data-cart-placeholder="placeholderCountry"></label>',
      '<label><span data-cart-text="postal"></span><input name="postal" autocomplete="postal-code" data-cart-placeholder="placeholderPostal"></label>',
      '</div>',
      '<label><span data-cart-text="notes"></span><textarea name="notas" data-cart-placeholder="placeholderNotes"></textarea></label>',
      '<button class="simio-cart-submit" type="submit" data-cart-text="checkout"></button>',
      '<div class="simio-cart-status" data-cart-status aria-live="polite"></div>',
      '</form>',
      '</div>',
      '<footer class="simio-cart-footer">',
      '<div class="simio-cart-discount-line" data-cart-discount hidden></div>',
      '<div class="simio-cart-total"><span data-cart-text="total"></span><strong data-cart-total></strong></div>',
      '</footer>',
      '</aside>',
      '<div class="simio-cart-toast" data-cart-toast hidden></div>',
    ].join("");

    document.body.appendChild(root);
    els.root = root;
    els.fab = root.querySelector("[data-cart-open]");
    els.count = root.querySelector("[data-cart-count]");
    els.overlay = root.querySelector("[data-cart-overlay]");
    els.drawer = root.querySelector("[data-cart-drawer]");
    els.close = root.querySelector("[data-cart-close]");
    els.items = root.querySelector("[data-cart-items]");
    els.nudges = root.querySelector("[data-cart-nudges]");
    els.form = root.querySelector("[data-cart-form]");
    els.status = root.querySelector("[data-cart-status]");
    els.total = root.querySelector("[data-cart-total]");
    els.discount = root.querySelector("[data-cart-discount]");
    els.toast = root.querySelector("[data-cart-toast]");

    els.fab.addEventListener("click", () => setOpen(true));
    els.close.addEventListener("click", () => setOpen(false));
    els.overlay.addEventListener("click", () => setOpen(false));
    els.drawer.addEventListener("click", handleDrawerClick);
    els.form.addEventListener("submit", submitCart);
  }

  function enhanceProductButtons() {
    document.querySelectorAll(".tienda-card[data-product]").forEach((card) => {
      const slug = card.dataset.product;
      if (!PRODUCTS[slug]) return;
      const actions = card.querySelector(".tienda-actions");
      if (!actions || actions.querySelector(`[data-cart-add="${slug}"]`)) return;
      if (PRODUCTS[slug].sizes?.length > 1 && !actions.querySelector(`[data-cart-size="${slug}"]`)) {
        const select = document.createElement("select");
        select.className = "simio-cart-size";
        select.dataset.cartSize = slug;
        select.setAttribute("aria-label", `Talla ${PRODUCTS[slug].name}`);
        select.innerHTML = [
          '<option value="">Talla</option>',
          ...PRODUCTS[slug].sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`),
        ].join("");
        const primary = actions.querySelector(".primario");
        if (primary) primary.insertAdjacentElement("afterend", select);
        else actions.appendChild(select);
      }
      const button = document.createElement("button");
      button.className = "simio-cart-secondary";
      button.type = "button";
      button.dataset.cartAdd = slug;
      button.addEventListener("click", () => addToCart(slug, { source: "store_card" }));
      const primary = actions.querySelector(".primario");
      if (primary) primary.insertAdjacentElement("afterend", button);
      else actions.appendChild(button);
    });
  }

  function enhanceCheckoutForms() {
    document.querySelectorAll(".checkout-form").forEach((form) => {
      const slug = findFormSlug(form);
      if (!slug || !PRODUCTS[slug] || form.querySelector(`[data-cart-modal-add="${slug}"]`)) return;
      const submit = form.querySelector(".submit, [data-literato-checkout-submit]");
      if (!submit) return;
      const button = document.createElement("button");
      button.className = "simio-cart-secondary";
      button.type = "button";
      button.dataset.cartModalAdd = slug;
      button.textContent = t("add");
      button.setAttribute("onclick", "window.SimioCartAdd && window.SimioCartAdd(this.dataset.cartModalAdd, 'modal_cart_button')");
      button.addEventListener("click", () => addToCart(slug, { source: "modal_cart_button" }));
      const sizeLabel = form.querySelector(`#checkout-talla-${slug}`)?.closest("label");
      const fields = form.querySelector(".checkout-fields");
      if (sizeLabel) sizeLabel.insertAdjacentElement("afterend", button);
      else if (fields) form.insertBefore(button, fields);
      else submit.insertAdjacentElement("beforebegin", button);
    });
  }

  function enhanceProductDiscountProfiles() {
    document.querySelectorAll(".checkout-form").forEach((form) => {
      const slug = findFormSlug(form);
      if (!slug || !PRODUCTS[slug]) return;
      const container = form.closest(".modal-contenido, .producto-presentacion, .modal, section, article") || form.parentElement;
      if (!container || container.querySelector(`[data-cart-profile-discount="${slug}"]`)) return;
      const notice = document.createElement("p");
      notice.className = "simio-cart-profile-discount";
      notice.dataset.cartProfileDiscount = slug;
      notice.textContent = t("profileDiscount");
      const fastRow = container.querySelector(".checkout-fast-row");
      if (fastRow) fastRow.insertAdjacentElement("afterend", notice);
      else form.insertAdjacentElement("beforebegin", notice);
    });
  }

  function findFormSlug(form) {
    const fromDataset = form.dataset.checkoutFormSlug;
    if (fromDataset && PRODUCTS[fromDataset]) return fromDataset;
    const onclick = form.querySelector("[onclick*='iniciarCompra']")?.getAttribute("onclick") || "";
    const match = onclick.match(/iniciarCompra\([^,]+,\s*['"]([^'"]+)['"]/);
    if (match && PRODUCTS[match[1]]) return match[1];
    const nameField = form.querySelector('[id^="checkout-nombre-"]');
    if (!nameField) return "";
    const slug = nameField.id.replace("checkout-nombre-", "");
    return PRODUCTS[slug] ? slug : "";
  }

  function updateTexts() {
    if (!els.root) return;
    els.root.querySelectorAll("[data-cart-text]").forEach((node) => {
      node.textContent = t(node.dataset.cartText);
    });
    els.root.querySelectorAll("[data-cart-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.cartPlaceholder));
    });
    els.fab.setAttribute("aria-label", t("openCart"));
    els.close.setAttribute("aria-label", t("close"));
    document.querySelectorAll("[data-cart-add], [data-cart-modal-add]").forEach((button) => {
      button.textContent = t("add");
    });
    document.querySelectorAll("[data-cart-profile-discount]").forEach((node) => {
      node.textContent = t("profileDiscount");
    });
  }

  function render() {
    ensureShell();
    updateTexts();
    const pricing = cartPricing();
    const count = quantityTotal();
    els.count.textContent = String(count);
    els.total.textContent = formatCop(pricing.total);
    if (els.discount) {
      els.discount.hidden = pricing.discount <= 0;
      els.discount.textContent = pricing.discount > 0
        ? `${t("discountSavings")}: ${formatCop(pricing.discount)}`
        : "";
    }
    els.form.hidden = count === 0;

    if (!state.items.length) {
      els.items.innerHTML = `<p class="simio-cart-empty">${escapeHtml(t("empty"))}</p>`;
    } else {
      els.items.innerHTML = state.items.map((item) => renderItem(item, pricing)).join("");
    }

    renderNudges(pricing);
    wireCartControls();
    document.body.classList.toggle("simio-cart-open", state.open);
    els.overlay.hidden = !state.open;
    els.drawer.setAttribute("aria-hidden", state.open ? "false" : "true");
  }

  function renderItem(item, pricing) {
    const product = PRODUCTS[item.slug];
    const key = keyFor(item.slug, item.talla);
    const max = productMax(product);
    const variant = item.talla ? ` · ${item.talla}` : "";
    const line = pricing?.lines.get(key) || {
      subtotal: product.priceCop * item.quantity,
      discount: 0,
      total: product.priceCop * item.quantity,
    };
    const linePrice = line.discount > 0
      ? [
          `<span class="simio-cart-price-before">${escapeHtml(formatCop(line.subtotal))}</span>`,
          `<strong>${escapeHtml(formatCop(line.total))}</strong>`,
          `<span class="simio-cart-savings">${escapeHtml(t("discountSavings"))} ${escapeHtml(formatCop(line.discount))}</span>`,
        ].join("")
      : escapeHtml(formatCop(line.total));
    return [
      `<div class="simio-cart-item" data-cart-key="${escapeHtml(key)}">`,
      "<div>",
      `<strong>${escapeHtml(product.name)}</strong>`,
      `<small>${escapeHtml(formatCop(product.priceCop))}${escapeHtml(variant)}</small>`,
      `<button class="simio-cart-remove" type="button" data-cart-remove="${escapeHtml(key)}">${escapeHtml(t("remove"))}</button>`,
      "</div>",
      "<div>",
      '<div class="simio-cart-qty">',
      `<button type="button" data-cart-dec="${escapeHtml(key)}" aria-label="-">-</button>`,
      `<span>${item.quantity}</span>`,
      `<button type="button" data-cart-inc="${escapeHtml(key)}" aria-label="+">+</button>`,
      "</div>",
      `<small>${linePrice}</small>`,
      max <= 1 ? "" : `<small>${item.quantity}/${max}</small>`,
      "</div>",
      "</div>",
    ].join("");
  }

  function renderNudges(pricing = cartPricing()) {
    const inCart = new Set(state.items.map((item) => item.slug));
    const hasFeliSingle = FELI_INDIVIDUALS.some((slug) => inCart.has(slug));
    const hasFeliCollection = inCart.has("coleccion-feli");
    const parts = [];

    parts.push([
      '<div class="simio-cart-nudge simio-cart-nudge-discount">',
      `<strong>${escapeHtml(t("discountTitle"))}</strong>`,
      `<span>${escapeHtml(pricing.discount > 0 ? `${t("discountApplied")}: ${formatCop(pricing.discount)}.` : t("discountPending"))}</span>`,
      `<span>${escapeHtml(t("discountRule"))}</span>`,
      "</div>",
    ].join(""));

    if (hasFeliSingle && !hasFeliCollection) {
      parts.push([
        '<div class="simio-cart-nudge">',
        `<strong>${escapeHtml(t("feliTitle"))}</strong>`,
        `<span>${escapeHtml(t("feliCopy"))}</span>`,
        `<button class="simio-cart-secondary" type="button" data-cart-feli-switch>${escapeHtml(t("feliSwitch"))}</button>`,
        "</div>",
      ].join(""));
    }

    const recs = RECOMMENDED_SLUGS.filter((slug) => PRODUCTS[slug] && !inCart.has(slug)).slice(0, 3);
    if (recs.length) {
      parts.push([
        '<div class="simio-cart-nudge">',
        `<strong>${escapeHtml(t("recTitle"))}</strong>`,
        '<div class="simio-cart-recs">',
        ...recs.map((slug) => (
          `<button class="simio-cart-secondary" type="button" data-cart-reco="${escapeHtml(slug)}">${escapeHtml(t("addShort"))} ${escapeHtml(PRODUCTS[slug].name)}</button>`
        )),
        "</div>",
        "</div>",
      ].join(""));
    }

    els.nudges.innerHTML = parts.join("");
  }

  function wireCartControls() {
    els.items.querySelectorAll("[data-cart-inc]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        changeQuantity(button.dataset.cartInc, 1);
      });
    });
    els.items.querySelectorAll("[data-cart-dec]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        changeQuantity(button.dataset.cartDec, -1);
      });
    });
    els.items.querySelectorAll("[data-cart-remove]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeItem(button.dataset.cartRemove);
      });
    });
    els.nudges.querySelectorAll("[data-cart-reco]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart(button.dataset.cartReco, { source: "cart_recommendation" });
      });
    });
    els.nudges.querySelectorAll("[data-cart-feli-switch]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        switchToFeliCollection();
      });
    });
  }

  function setOpen(open) {
    state.open = Boolean(open);
    render();
    if (state.open) window.setTimeout(() => els.close?.focus({ preventScroll: true }), 80);
  }

  function resolveTalla(product) {
    if (!product.sizes?.length) return "";
    const storeSize = document.querySelector(`select[data-cart-size="${product.slug}"]`)?.value || "";
    if (storeSize) return storeSize;
    const field = document.getElementById(`checkout-talla-${product.slug}`);
    const selected = (field?.value || "").trim();
    if (selected) return selected;
    if (product.sizes.length === 1) return product.sizes[0];
    armPendingSizeAdd(product);
    openProductModal(product);
    showToast(t("sizeNeeded"), "error");
    return null;
  }

  function armPendingSizeAdd(product) {
    pendingSizeSlug = product.slug;
    const tryPendingAdd = () => {
      const field = document.getElementById(`checkout-talla-${product.slug}`);
      if (!field || pendingSizeSlug !== product.slug || !(field.value || "").trim()) return;
      pendingSizeSlug = "";
      addToCart(product.slug, { source: "size_selected_after_cart" });
    };
    const attach = () => {
      const field = document.getElementById(`checkout-talla-${product.slug}`);
      if (!field) return;
      tryPendingAdd();
      if (field.dataset.cartPendingSizeReady === "true") return;
      field.dataset.cartPendingSizeReady = "true";
      field.dataset.cartPendingSize = product.slug;
      const onVariantPicked = () => {
        const slug = field.dataset.cartPendingSize;
        if (!slug || pendingSizeSlug !== slug || !(field.value || "").trim()) return;
        pendingSizeSlug = "";
        addToCart(slug, { source: "size_selected_after_cart" });
      };
      field.addEventListener("input", onVariantPicked);
      field.addEventListener("change", onVariantPicked);
    };
    attach();
    [220, 520, 900, 1400].forEach((delay) => window.setTimeout(() => {
      attach();
      tryPendingAdd();
    }, delay));
  }

  function openProductModal(product) {
    try {
      if (typeof window.abrirModal === "function") window.abrirModal(product.modalSlug || product.slug);
    } catch {}
    window.setTimeout(() => {
      enhanceCheckoutForms();
      enhanceProductDiscountProfiles();
      document.getElementById(`checkout-talla-${product.slug}`)?.focus({ preventScroll: false });
    }, 180);
  }

  function addToCart(slug, options = {}) {
    const product = PRODUCTS[slug];
    if (!product) return;

    if (FELI_INDIVIDUALS.includes(slug) && state.items.some((item) => item.slug === "coleccion-feli")) {
      setOpen(true);
      showToast(t("feliCopy"), "ok");
      return;
    }

    const talla = resolveTalla(product);
    if (talla === null) return;
    if (slug === "coleccion-feli") {
      state.items = state.items.filter((item) => !FELI_INDIVIDUALS.includes(item.slug));
    }

    const key = keyFor(slug, talla);
    const existing = state.items.find((item) => keyFor(item.slug, item.talla) === key);
    const max = productMax(product);
    if (existing) {
      if (existing.quantity >= max) {
        showToast(t("limit"), "error");
        setOpen(true);
        return;
      }
      existing.quantity += 1;
    } else {
      state.items.push({ slug, talla, quantity: 1 });
    }

    saveCart();
    setOpen(true);
    showToast(t("added"), "ok");
    trackCommerce("AddToCart", slug, { source: options.source || "cart", num_items: quantityTotal() });
    trackSimio("cart_add", slug, { source: options.source || "cart", num_items: quantityTotal() });
  }

  function changeQuantity(key, delta) {
    const item = state.items.find((entry) => keyFor(entry.slug, entry.talla) === key);
    if (!item) return;
    const product = PRODUCTS[item.slug];
    const next = item.quantity + delta;
    if (next <= 0) {
      removeItem(key);
      return;
    }
    const max = productMax(product);
    if (next > max) {
      showToast(t("limit"), "error");
      return;
    }
    item.quantity = next;
    saveCart();
    render();
  }

  function removeItem(key) {
    state.items = state.items.filter((item) => keyFor(item.slug, item.talla) !== key);
    saveCart();
    render();
  }

  function switchToFeliCollection() {
    state.items = state.items.filter((item) => !FELI_INDIVIDUALS.includes(item.slug) && item.slug !== "coleccion-feli");
    state.items.push({ slug: "coleccion-feli", talla: "", quantity: 1 });
    saveCart();
    showToast(t("added"), "ok");
    render();
  }

  function handleDrawerClick(event) {
    const target = event.target;
    const inc = target.closest("[data-cart-inc]");
    const dec = target.closest("[data-cart-dec]");
    const remove = target.closest("[data-cart-remove]");
    const reco = target.closest("[data-cart-reco]");
    const feli = target.closest("[data-cart-feli-switch]");

    if (inc) changeQuantity(inc.dataset.cartInc, 1);
    if (dec) changeQuantity(dec.dataset.cartDec, -1);
    if (remove) removeItem(remove.dataset.cartRemove);
    if (reco) addToCart(reco.dataset.cartReco, { source: "cart_recommendation" });
    if (feli) switchToFeliCollection();
  }

  function handleCapturedCartClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const modalAdd = target?.closest("[data-cart-modal-add]");
    if (!modalAdd) return;
    event.preventDefault();
    event.stopPropagation();
    addToCart(modalAdd.dataset.cartModalAdd, { source: "modal_cart_button" });
  }

  function readCartForm() {
    const field = (name) => (els.form.elements[name]?.value || "").trim();
    const country = normalizeCountry(field("pais"));
    return {
      customer: {
        nombre: field("nombre"),
        email: field("email").toLowerCase(),
        telefono: field("telefono"),
      },
      shipping: {
        linea1: field("direccion"),
        ciudad: field("ciudad"),
        departamento: field("departamento"),
        pais: country.name,
        country_code: country.code,
        codigo_postal: field("postal"),
        notas: field("notas"),
      },
    };
  }

  function normalizeCountry(value) {
    const raw = String(value || "Colombia").trim();
    const upper = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const aliases = {
      CO: "CO",
      COLOMBIA: "CO",
      US: "US",
      USA: "US",
      "UNITED STATES": "US",
      "ESTADOS UNIDOS": "US",
    };
    const code = aliases[upper] || upper.slice(0, 2) || "CO";
    return {
      code,
      name: code === "CO" ? "Colombia" : raw,
    };
  }

  function validatePayload(payload) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer.email);
    if (
      !payload.customer.nombre ||
      !payload.customer.email ||
      !payload.customer.telefono ||
      !payload.shipping.linea1 ||
      !payload.shipping.ciudad ||
      !payload.shipping.departamento ||
      !payload.shipping.pais
    ) {
      return t("required");
    }
    if (!emailOk) return t("invalidEmail");
    if (payload.shipping.country_code !== "CO") return t("international");
    return "";
  }

  async function submitCart(event) {
    event.preventDefault();
    if (state.submitting || !state.items.length) return;
    const details = readCartForm();
    const payload = {
      lang: currentLang(),
      items: state.items.map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
        talla: item.talla || undefined,
      })),
      customer: details.customer,
      shipping: details.shipping,
    };
    const invalid = validatePayload(payload);
    if (invalid) {
      setStatus(invalid, "error");
      return;
    }

    state.submitting = true;
    setStatus(t("sending"), "ok");
    setSubmitDisabled(true);
    trackCommerce("InitiateCheckout", "cart", { source: "cart_drawer", num_items: quantityTotal() });
    trackSimio("cart_checkout_start", "cart", { source: "cart_drawer", num_items: quantityTotal() });

    try {
      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.message || t("error"));
      }
      setStatus(t("redirecting"), "ok");
      trackSimio("cart_checkout_redirect", "cart", {
        provider: data.provider || "mercadopago",
        num_items: quantityTotal(),
      });
      window.setTimeout(() => {
        window.location.href = data.checkout_url;
      }, 180);
    } catch (error) {
      setStatus(error.message || t("error"), "error");
      trackSimio("cart_checkout_error", "cart", { message: error.message || "checkout_error" });
      state.submitting = false;
      setSubmitDisabled(false);
    }
  }

  function setSubmitDisabled(disabled) {
    const submit = els.form?.querySelector(".simio-cart-submit");
    if (submit) submit.disabled = disabled;
  }

  function setStatus(message, type = "") {
    els.status.textContent = message || "";
    els.status.className = `simio-cart-status ${type}`.trim();
  }

  function showToast(message, type = "") {
    els.toast.textContent = message;
    els.toast.className = `simio-cart-toast ${type}`.trim();
    els.toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 2600);
  }

  function trackSimio(event, slug, data) {
    try {
      if (typeof window.trackSimio === "function") window.trackSimio(event, slug, data);
    } catch {}
  }

  function trackCommerce(event, slug, data) {
    try {
      if (typeof window.trackEventoComercio === "function") window.trackEventoComercio(event, slug, data);
    } catch {}
  }

  function init() {
    state.items = loadCart();
    ensureShell();
    window.SimioCartAdd = (slug, source = "cart") => addToCart(slug, { source });
    enhanceProductButtons();
    enhanceCheckoutForms();
    enhanceProductDiscountProfiles();
    render();
    document.addEventListener("click", handleCapturedCartClick, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.open) setOpen(false);
    });
    const observer = new MutationObserver(() => {
      updateTexts();
      enhanceProductDiscountProfiles();
      render();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    window.setTimeout(() => {
      enhanceCheckoutForms();
      enhanceProductDiscountProfiles();
    }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
