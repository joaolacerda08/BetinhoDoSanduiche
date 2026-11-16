/* Interface, acessibilidade e ligação entre catálogo, sacola e checkout. */
(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const state = {
    category: 'promocoes',
    editingKey: null,
    draftProduct: null,
    selections: {},
    drawerView: 'cart',
    fulfillment: 'delivery',
    checkoutDraft: {},
    fallbackUrl: '',
    drawerReturnFocus: null,
    modalReturnFocus: null
  };

  const grid = $('#product-grid');
  const modal = $('#product-modal');
  const modalBackdrop = $('#product-modal-backdrop');
  const cartDrawer = $('#cart-drawer');
  const drawerBackdrop = $('#drawer-backdrop');

  function toast(message, kind = 'success') {
    const node = document.createElement('div');
    node.className = `toast ${kind}`;
    node.textContent = message;
    $('#toast-region').append(node);
    window.setTimeout(() => { node.classList.add('toast-out'); node.remove(); }, 3000);
  }

  function renderProducts() {
    const products = BetinhoCatalog.products.filter((product) => product.category === state.category);
    $('#menu-count').textContent = `${String(products.length).padStart(2, '0')} opções`;
    grid.innerHTML = products.map((product, index) => `
      <article class="product-card" style="animation-delay:${Math.min(index * 65, 260)}ms">
        <div class="product-media">
          <span class="product-tag">${escapeHtml(product.tag)}</span>
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.parentElement.classList.add('image-fallback')">
          <span class="product-image-fallback" aria-hidden="true">${escapeHtml(product.name)}</span>
        </div>
        <div class="product-info">
          <div class="product-topline"><h3>${escapeHtml(product.name)}</h3><span class="product-price">${BetinhoCart.money(product.price)}</span></div>
          ${product.description ? `<p class="product-desc">${escapeHtml(product.description)}</p>` : ''}
          ${product.ingredients ? `<p class="product-ingredients">${escapeHtml(product.ingredients)}</p>` : ''}
          <div class="product-actions"><span class="customize-hint">Personalize seu pedido</span><button class="add-product" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Personalizar ${escapeHtml(product.name)}">Personalizar <span aria-hidden="true">+</span></button></div>
        </div>
      </article>`).join('');
  }

  function initialSelections(product) {
    const result = {};
    (product.groups || []).forEach((group) => {
      if (group.type === 'multi' || group.type === 'quantity') result[group.id] = {};
    });
    return result;
  }

  function getSelectionValue(groupId, optionId) {
    const value = state.selections[groupId]?.[optionId];
    return Math.max(0, Number(value) || 0);
  }

  function groupSelectionCount(group) {
    if (group.type !== 'quantity') return 0;
    return group.options.reduce((sum, option) => sum + getSelectionValue(group.id, option.id), 0);
  }

  function groupIsValid(group) {
    if (!group.required) return true;
    if (group.type === 'single') return Boolean(state.selections[group.id]);
    if (group.type === 'quantity') return groupSelectionCount(group) === group.exact;
    return true;
  }

  function selectionsAreValid(product) {
    return (product.groups || []).every(groupIsValid);
  }

  function getDraftTotal() {
    const product = state.draftProduct;
    return product ? product.price + BetinhoCart.optionCost(product, state.selections) : 0;
  }

  function formatOptionPrice(price) {
    return price === 0 ? '<span class="option-price free">Incluído</span>' : `<span class="option-price">+ ${BetinhoCart.money(price)}</span>`;
  }

  function renderGroup(group) {
    const requiredLabel = group.required ? (group.type === 'quantity' ? `Obrigatório · ${group.exact} itens` : 'Obrigatório') : 'Opcional';
    let optionMarkup = '';
    if (group.type === 'single') {
      const options = group.required ? group.options : [{ id: '', label: 'Não quero combo', price: 0 }, ...group.options];
      optionMarkup = options.map((option) => `
        <label class="option-row">
          <span class="option-label"><input type="radio" name="option-${escapeHtml(group.id)}" value="${escapeHtml(option.id)}" data-single-group="${escapeHtml(group.id)}" ${state.selections[group.id] === option.id || (!state.selections[group.id] && option.id === '' && !group.required) ? 'checked' : ''}>
            <span>${escapeHtml(option.label)}</span></span>${formatOptionPrice(option.price)}
        </label>`).join('');
    } else {
      optionMarkup = group.options.map((option) => {
        const quantity = getSelectionValue(group.id, option.id);
        return `<div class="option-row">
          <span class="option-label"><span>${escapeHtml(option.label)}</span></span>
          <span class="option-quantity">${formatOptionPrice(option.price)}<button class="qty-button" type="button" data-modal-qty="-1" data-group="${escapeHtml(group.id)}" data-option="${escapeHtml(option.id)}" aria-label="Diminuir ${escapeHtml(option.label)}" ${quantity === 0 ? 'disabled' : ''}>−</button><span class="qty-number" data-qty-count="${escapeHtml(group.id)}:${escapeHtml(option.id)}">${quantity}</span><button class="qty-button" type="button" data-modal-qty="1" data-group="${escapeHtml(group.id)}" data-option="${escapeHtml(option.id)}" aria-label="Adicionar ${escapeHtml(option.label)}">+</button></span>
        </div>`;
      }).join('');
    }
    const countHint = group.type === 'quantity' ? `<p class="group-hint" data-group-count="${escapeHtml(group.id)}">${group.hint} <strong>${groupSelectionCount(group)} de ${group.exact} selecionados</strong></p>` : group.hint ? `<p class="group-hint">${escapeHtml(group.hint)}</p>` : '';
    return `<section class="option-group" data-group-section="${escapeHtml(group.id)}">
      <div class="option-group-head"><h3>${escapeHtml(group.title)}</h3><span class="group-rule ${group.required ? '' : 'optional'}">${requiredLabel}</span></div>${countHint}<div class="option-list">${optionMarkup}</div></section>`;
  }

  function renderModal() {
    const product = state.draftProduct;
    if (!product) return;
    const groupMarkup = (product.groups || []).map(renderGroup).join('');
    const editMode = Boolean(state.editingKey);
    $('#modal-content').innerHTML = `
      <div class="modal-product-head">
        <div class="modal-product-image"><img src="${escapeHtml(product.image)}" alt="" onerror="this.style.opacity='.15'"></div>
        <div class="modal-product-copy"><p class="eyebrow">${escapeHtml(product.tag)}</p><h2 id="modal-title">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.description || product.ingredients || 'Escolha suas opções e personalize seu pedido.')}</p><strong class="modal-base-price">${BetinhoCart.money(product.price)}</strong></div>
      </div>
      ${groupMarkup}
      <div class="modal-footer"><div class="modal-total"><small>Total deste item</small><strong id="modal-total-value">${BetinhoCart.money(getDraftTotal())}</strong></div><button class="button button-primary modal-submit" id="save-product" type="button" ${selectionsAreValid(product) ? '' : 'disabled'}>${editMode ? 'Salvar alterações' : 'Adicionar à sacola'} <span aria-hidden="true">↗</span></button></div>`;
  }

  function openProductModal(productId, editKey = null) {
    const product = BetinhoCatalog.productById(productId);
    if (!product) return;
    state.modalReturnFocus = document.activeElement;
    state.editingKey = editKey;
    state.draftProduct = product;
    const item = editKey ? BetinhoCart.list().find((entry) => entry.key === editKey) : null;
    state.selections = item ? JSON.parse(JSON.stringify(item.selections || {})) : initialSelections(product);
    renderModal();
    modal.hidden = false; modalBackdrop.hidden = false;
    document.body.classList.add('overlay-open');
    $('#close-product-modal').focus();
  }

  function closeProductModal() {
    modal.hidden = true; modalBackdrop.hidden = true;
    if (state.modalReturnFocus?.focus) state.modalReturnFocus.focus();
    if (!cartDrawer.hidden) return;
    document.body.classList.remove('overlay-open');
  }

  function syncModal() {
    const product = state.draftProduct;
    if (!product) return;
    (product.groups || []).filter((group) => group.type !== 'single').forEach((group) => {
      group.options.forEach((option) => {
        const quantity = getSelectionValue(group.id, option.id);
        const counter = $(`[data-qty-count="${group.id}:${option.id}"]`, modal);
        if (counter) counter.textContent = quantity;
        const minus = $(`[data-modal-qty="-1"][data-group="${group.id}"][data-option="${option.id}"]`, modal);
        if (minus) minus.disabled = quantity === 0;
      });
      if (group.type === 'quantity') {
        const hint = $(`[data-group-count="${group.id}"]`, modal);
        if (hint) hint.innerHTML = `${escapeHtml(group.hint)} <strong>${groupSelectionCount(group)} de ${group.exact} selecionados</strong>`;
      }
    });
    $('#modal-total-value').textContent = BetinhoCart.money(getDraftTotal());
    $('#save-product').disabled = !selectionsAreValid(product);
  }

  function saveProductToCart() {
    const product = state.draftProduct;
    if (!product || !selectionsAreValid(product)) return;
    const wasEditing = Boolean(state.editingKey);
    if (wasEditing) BetinhoCart.update(state.editingKey, product.id, state.selections);
    else BetinhoCart.add(product.id, state.selections);
    closeProductModal();
    updateBagCount();
    renderCart();
    toast(wasEditing ? 'Personalização atualizada.' : 'Adicionado à sua sacola.');
  }

  function groupSelectionText(product, selections) {
    const labels = [];
    (product.groups || []).forEach((group) => {
      const selected = selections[group.id];
      if (!selected) return;
      if (group.type === 'single') {
        const option = group.options.find((entry) => entry.id === selected);
        if (option) labels.push(option.label);
      } else {
        group.options.forEach((option) => {
          const quantity = Number(selected[option.id]) || 0;
          if (quantity) labels.push(`${option.label}${quantity > 1 ? ` x${quantity}` : ''}`);
        });
      }
    });
    return labels;
  }

  function renderCart() {
    const cartItems = BetinhoCart.list();
    $('#drawer-count').textContent = `(${BetinhoCart.count()})`;
    if (!cartItems.length) {
      $('#cart-view').innerHTML = `<div class="empty-cart"><div class="empty-bag-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg></div><h3>Sua sacola está vazia</h3><p>Encontre seu próximo favorito e personalize do seu jeito.</p><button class="button button-primary" type="button" data-close-cart>Ver cardápio</button></div>`;
      $('#drawer-foot').innerHTML = '';
      return;
    }
    $('#cart-view').innerHTML = cartItems.map((item) => {
      const product = BetinhoCatalog.productById(item.productId);
      const options = groupSelectionText(product, item.selections);
      return `<article class="cart-line" data-cart-key="${escapeHtml(item.key)}">
        <div class="cart-line-top"><h3>${escapeHtml(product.name)}</h3><span class="cart-line-price">${BetinhoCart.money(BetinhoCart.itemUnitPrice(item) * item.quantity)}</span></div>
        ${options.length ? `<div class="cart-line-options">${options.map((option) => `<span>• ${escapeHtml(option)}</span>`).join('')}</div>` : ''}
        <div class="cart-line-bottom"><div class="cart-line-buttons"><div class="line-qty"><button type="button" class="qty-button" data-cart-qty="-1" data-key="${escapeHtml(item.key)}" aria-label="Diminuir quantidade">−</button><strong>${item.quantity}</strong><button type="button" class="qty-button" data-cart-qty="1" data-key="${escapeHtml(item.key)}" aria-label="Aumentar quantidade">+</button></div><button class="text-button" type="button" data-edit-key="${escapeHtml(item.key)}">Editar</button></div><button class="text-button" type="button" data-remove-key="${escapeHtml(item.key)}">Remover</button></div>
      </article>`;
    }).join('');
    if (state.drawerView === 'cart') renderCartFoot();
  }

  function updateBagCount() {
    const count = BetinhoCart.count();
    $('#bag-count').textContent = count;
    $('#bag-count').setAttribute('aria-label', `${count} itens`);
    $('#drawer-count').textContent = `(${count})`;
  }

  function totalsMarkup(mode) {
    const subtotal = BetinhoCart.subtotal();
    const fee = BetinhoDelivery.fee(mode);
    const total = BetinhoDelivery.total(subtotal, mode);
    return { subtotal, fee, total, html: `<div class="totals"><div class="total-row"><span>Subtotal</span><strong>${BetinhoCart.money(subtotal)}</strong></div><div class="total-row"><span>${mode === 'delivery' ? 'Entrega' : 'Retirada'}</span><strong>${mode === 'delivery' ? BetinhoCart.money(fee) : 'Grátis'}</strong></div><div class="total-row final"><span>Total</span><strong>${BetinhoCart.money(total)}</strong></div></div>` };
  }

  function renderCartFoot() {
    const totals = totalsMarkup(state.fulfillment);
    $('#drawer-foot').innerHTML = `${totals.html}<button class="button button-primary drawer-cta" type="button" id="go-checkout">Continuar para ${state.fulfillment === 'delivery' ? 'entrega' : 'retirada'} <span aria-hidden="true">→</span></button><button class="button button-outline drawer-secondary" type="button" data-close-cart>Continuar escolhendo</button>`;
  }

  function openCart() {
    state.drawerReturnFocus = document.activeElement;
    state.drawerView = 'cart';
    $('#cart-view').hidden = false; $('#checkout-view').hidden = true;
    renderCart();
    cartDrawer.hidden = false; drawerBackdrop.hidden = false;
    document.body.classList.add('overlay-open');
    $('#close-cart').focus();
  }

  function closeCart() {
    cartDrawer.hidden = true; drawerBackdrop.hidden = true;
    document.body.classList.remove('overlay-open');
    if (state.drawerReturnFocus?.focus) state.drawerReturnFocus.focus();
  }

  function openCheckout() {
    if (BetinhoCart.count() < 1) return;
    state.drawerView = 'checkout';
    state.fallbackUrl = '';
    $('#cart-view').hidden = true; $('#checkout-view').hidden = false;
    renderCheckout();
    $('#checkout-view').scrollTop = 0;
  }

  function field(name, label, type = 'text', placeholder = '', autocomplete = '') {
    const value = escapeHtml(state.checkoutDraft[name] || '');
    const control = type === 'textarea'
      ? `<textarea id="${name}" name="${name}" placeholder="${escapeHtml(placeholder)}">${value}</textarea>`
      : `<input id="${name}" name="${name}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}" ${autocomplete ? `autocomplete="${autocomplete}"` : ''}>`;
    return `<label class="field" for="${name}"><span>${label}</span>${control}<small class="field-error" data-error="${name}"></small></label>`;
  }

  function checkoutAddressMarkup() {
    if (state.fulfillment !== 'delivery') return '';
    return `<div class="checkout-section"><h4>Onde entregamos?</h4><div class="checkout-form"><div class="field-row">${field('street', 'Rua ou avenida *', 'text', 'Ex.: Rua das Flores', 'street-address')}${field('number', 'Número *', 'text', 'Nº', 'off')}</div>${field('neighborhood', 'Bairro *', 'text', 'Seu bairro', 'address-level3')}${field('reference', 'Ponto de referência', 'text', 'Opcional', 'off')}</div></div>`;
  }

  function renderCheckout() {
    const checkoutView = $('#checkout-view');
    const totals = totalsMarkup(state.fulfillment);
    checkoutView.innerHTML = `
      <div class="checkout-top"><button type="button" id="back-to-cart">← Sacola</button><h3>Finalizar pedido</h3></div>
      <section class="checkout-section"><h4>Como prefere receber?</h4><div class="mode-switch" role="radiogroup" aria-label="Modalidade do pedido">
        <button class="mode-option ${state.fulfillment === 'delivery' ? 'is-selected' : ''}" type="button" data-fulfillment="delivery" aria-pressed="${state.fulfillment === 'delivery'}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M9 17.5h5l-3-8H7l-2 8m6-8h4l3.5 8"/></svg><span><strong>Entrega</strong><small>30 a 50 min · R$ 5,90</small></span></button>
        <button class="mode-option ${state.fulfillment === 'pickup' ? 'is-selected' : ''}" type="button" data-fulfillment="pickup" aria-pressed="${state.fulfillment === 'pickup'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18l-1.5-6h-15L3 10Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg><span><strong>Retirada</strong><small>Sem taxa de entrega</small></span></button>
      </div></section>
      <form id="checkout-form" novalidate>
        <div class="checkout-section"><h4>Seus dados</h4><div class="checkout-form">${field('customer-name', 'Nome completo *', 'text', 'Como podemos chamar você?', 'name')}${field('customer-phone', 'Telefone com DDD *', 'tel', '(31) 99999-9999', 'tel')}
          ${checkoutAddressMarkup()}
          <div class="checkout-section"><h4>Pagamento</h4><div class="checkout-form">${BetinhoCheckout.paymentFieldMarkup(state.checkoutDraft['payment-free'] || state.checkoutDraft.payment || '')}${field('change', 'Troco (se necessário)', 'text', 'Ex.: troco para R$ 50,00')}</div></div>
          <div class="checkout-section">${field('notes', 'Observações do pedido', 'textarea', 'Alguma instrução para a loja?')}</div>
        </div></div>
        <small class="field-error" id="checkout-general-error" role="alert"></small>
        ${thisPendingMarkup()}
      </form>`;
    $('#drawer-foot').innerHTML = `${totals.html}<button class="button button-primary drawer-cta" type="submit" form="checkout-form" id="send-order">${sendOrderButtonMarkup(Boolean(state.fallbackUrl))}</button><p class="whatsapp-disclaimer">O WhatsApp abrirá com a mensagem pronta. Revise e toque em enviar por lá.</p>`;
  }

  function thisPendingMarkup() {
    if (!state.fallbackUrl) return '';
    return `<div class="payment-note" id="pending-retry" role="status">O navegador bloqueou a nova aba. <a href="${escapeHtml(state.fallbackUrl)}" target="_blank" rel="noopener noreferrer"><strong>Abrir conversa do WhatsApp</strong></a></div>`;
  }

  function sendOrderButtonMarkup(retry) {
    const label = retry ? 'Tentar abrir WhatsApp novamente' : 'Preparar pedido no WhatsApp';
    return `${label} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.6A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8 8.5c.5 2.4 2.1 4 4.5 5l1.3-1.1 2.1 1c-.2 1.1-.9 1.8-2.1 1.8-3.7-.1-7.8-4-7.9-7.5 0-1.2.7-2 1.8-2.2l1 2.1L8 8.5Z"/></svg>`;
  }

  function clearPendingNotice() {
    if (!state.fallbackUrl) return;
    state.fallbackUrl = '';
    $('#pending-retry')?.remove();
    const button = $('#send-order');
    if (button) button.innerHTML = sendOrderButtonMarkup(false);
  }

  function captureCheckoutDraft(form) {
    Array.from(form.elements).forEach((element) => {
      if (element.name && element.type !== 'radio' && element.type !== 'submit') state.checkoutDraft[element.name] = element.value;
    });
  }

  function showCheckoutErrors(form, errors) {
    $$('.field-error', form).forEach((node) => { node.textContent = ''; });
    $$('[aria-invalid="true"]', form).forEach((node) => node.removeAttribute('aria-invalid'));
    Object.entries(errors).forEach(([name, message]) => {
      const input = form.elements[name];
      const error = $(`[data-error="${name}"]`, form);
      if (input) input.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = message;
    });
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
  }

  function submitOrder(form) {
    captureCheckoutDraft(form);
    const result = BetinhoCheckout.readForm(form);
    if (!result.valid) {
      showCheckoutErrors(form, result.errors);
      toast('Confira os campos destacados para continuar.', 'error');
      return;
    }
    const date = new Date();
    const orderNumber = BetinhoWhatsApp.makeOrderNumber(date);
    const subtotal = BetinhoCart.subtotal();
    const fee = BetinhoDelivery.fee(state.fulfillment);
    const total = BetinhoDelivery.total(subtotal, state.fulfillment);
    const totals = { subtotal, fee, total };
    const items = BetinhoCart.list();
    const message = BetinhoWhatsApp.createMessage(result.fields, items, totals, orderNumber, date);
    const url = BetinhoWhatsApp.conversationUrl(message);
    const pending = { orderNumber, date: date.toISOString(), message, url, form: result.fields, totals, items };
    try { localStorage.setItem('betinho-sanduiche-pending-order', JSON.stringify(pending)); } catch (_) { /* O link continua funcional mesmo sem espaço local. */ }
    const opened = window.open(url, '_blank');
    if (!opened) {
      state.fallbackUrl = url;
      renderCheckout();
      toast('O navegador bloqueou a nova aba. Use o link exibido para abrir o WhatsApp.', 'error');
      return;
    }
    clearPendingNotice();
    toast(`Pedido #${orderNumber} preparado. Revise e envie pelo WhatsApp.`);
  }

  function setFulfillment(mode) {
    const form = $('#checkout-form');
    if (form) captureCheckoutDraft(form);
    clearPendingNotice();
    state.fulfillment = mode;
    renderCheckout();
  }

  function closeAnyOverlay() {
    if (!modal.hidden) closeProductModal();
    if (!cartDrawer.hidden) closeCart();
  }

  function keepFocusInside(event, root) {
    const focusable = $$('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', root)
      .filter((element) => !element.hidden && element.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.matches('[data-category]')) {
      state.category = target.dataset.category;
      $$('.category-tab').forEach((tab) => { const active = tab === target; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
      renderProducts();
    } else if (target.matches('[data-open-product]')) {
      openProductModal(target.dataset.openProduct);
    } else if (target.matches('[data-modal-qty]')) {
      const { group, option } = target.dataset;
      const groupData = state.draftProduct.groups.find((item) => item.id === group);
      if (groupData.type === 'quantity') {
        const totalSelected = groupSelectionCount(groupData);
        if (Number(target.dataset.modalQty) > 0 && totalSelected >= groupData.exact) {
          const hint = $(`[data-group-count="${group}"]`, modal);
          if (hint) { hint.classList.remove('shake'); void hint.offsetWidth; hint.classList.add('shake'); }
          toast(`Escolha exatamente ${groupData.exact} itens neste grupo.`, 'error');
          return;
        }
      }
      if (!state.selections[group]) state.selections[group] = {};
      state.selections[group][option] = Math.max(0, getSelectionValue(group, option) + Number(target.dataset.modalQty));
      syncModal();
    } else if (target.id === 'save-product') {
      saveProductToCart();
    } else if (target.id === 'open-cart') {
      openCart();
    } else if (target.id === 'close-cart' || target.matches('[data-close-cart]')) {
      closeCart();
    } else if (target.id === 'close-product-modal') {
      closeProductModal();
    } else if (target.id === 'go-checkout') {
      openCheckout();
    } else if (target.id === 'back-to-cart') {
      state.drawerView = 'cart'; $('#checkout-view').hidden = true; $('#cart-view').hidden = false; renderCart();
    } else if (target.matches('[data-cart-qty]')) {
      BetinhoCart.updateQuantity(target.dataset.key, Number(target.dataset.cartQty));
      renderCart(); updateBagCount();
    } else if (target.matches('[data-remove-key]')) {
      BetinhoCart.remove(target.dataset.removeKey); renderCart(); updateBagCount(); toast('Item removido da sacola.');
    } else if (target.matches('[data-edit-key]')) {
      const item = BetinhoCart.list().find((entry) => entry.key === target.dataset.editKey);
      if (item) openProductModal(item.productId, item.key);
    } else if (target.matches('[data-fulfillment]')) {
      setFulfillment(target.dataset.fulfillment);
    }
  });

  document.addEventListener('change', (event) => {
    const radio = event.target.closest('[data-single-group]');
    if (radio) {
      if (radio.value) state.selections[radio.dataset.singleGroup] = radio.value;
      else delete state.selections[radio.dataset.singleGroup];
      syncModal();
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.closest('#checkout-form')) {
      state.checkoutDraft[event.target.name] = event.target.value;
      clearPendingNotice();
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id !== 'checkout-form') return;
    event.preventDefault();
    submitOrder(event.target);
  });

  modalBackdrop.addEventListener('click', closeProductModal);
  drawerBackdrop.addEventListener('click', closeCart);
  $('#close-product-modal').addEventListener('click', closeProductModal);
  $('#close-cart').addEventListener('click', closeCart);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (!modal.hidden || !cartDrawer.hidden)) closeAnyOverlay();
    if (event.key === 'Tab' && !modal.hidden) keepFocusInside(event, modal);
    else if (event.key === 'Tab' && !cartDrawer.hidden) keepFocusInside(event, cartDrawer);
  });

  document.body.classList.add('app-ready');
  renderProducts();
  updateBagCount();
  renderCart();
})();
