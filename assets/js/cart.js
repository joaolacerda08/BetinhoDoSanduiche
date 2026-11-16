/* Sacola persistente e cálculos de preço. */
(function () {
  const STORAGE_KEY = 'betinho-sanduiche-cart-v1';
  const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const safeParse = (value) => { try { return JSON.parse(value); } catch (_) { return null; } };
  let items = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(items)) items = [];

  function optionCost(product, selections) {
    let total = 0;
    (product.groups || []).forEach((group) => {
      const selection = selections[group.id];
      if (group.type === 'single' && selection) {
        const option = group.options.find((item) => item.id === selection);
        if (option) total += option.price;
      } else if ((group.type === 'multi' || group.type === 'quantity') && selection) {
        group.options.forEach((option) => { total += option.price * Math.max(0, Number(selection[option.id]) || 0); });
      }
    });
    return total;
  }
  function itemUnitPrice(item) {
    const product = BetinhoCatalog.productById(item.productId);
    return product ? product.price + optionCost(product, item.selections || {}) : 0;
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  function list() { return items.map((item) => ({ ...item, selections: structuredCloneSafe(item.selections) })); }
  function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value || {})); }
  function count() { return items.reduce((sum, item) => sum + item.quantity, 0); }
  function subtotal() { return items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0); }
  function add(productId, selections) {
    const product = BetinhoCatalog.productById(productId);
    if (!product) return null;
    const normalized = structuredCloneSafe(selections);
    const existing = items.find((item) => item.productId === productId && JSON.stringify(item.selections) === JSON.stringify(normalized));
    if (existing) existing.quantity += 1;
    else items.push({ key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, productId, quantity: 1, selections: normalized });
    save(); return items[items.length - 1];
  }
  function updateQuantity(key, delta) {
    const item = items.find((entry) => entry.key === key);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity < 1) items = items.filter((entry) => entry.key !== key);
    save();
  }
  function remove(key) { items = items.filter((item) => item.key !== key); save(); }
  function update(key, productId, selections) {
    const item = items.find((entry) => entry.key === key);
    if (!item) return;
    item.productId = productId; item.selections = structuredCloneSafe(selections); save();
  }
  function clear() { items = []; save(); }

  window.BetinhoCart = { money, list, count, subtotal, optionCost, itemUnitPrice, add, updateQuantity, remove, update, clear };
})();
