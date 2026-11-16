/* Link oficial de conversa do WhatsApp, sem credenciais ou envio por API. */
(function () {
  const WHATSAPP_NUMBER = '5531989040893';
  const pad = (value) => String(value).padStart(2, '0');
  function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }
  function selectionLabels(product, selections) {
    const lines = [];
    (product.groups || []).forEach((group) => {
      const selected = selections[group.id];
      if (!selected) return;
      if (group.type === 'single') {
        const option = group.options.find((item) => item.id === selected);
        if (option) lines.push(`${group.title}: ${option.label}${option.price ? ` (${BetinhoCart.money(option.price)})` : ' (grátis)'}`);
      } else {
        group.options.forEach((option) => {
          const quantity = Number(selected[option.id]) || 0;
          if (quantity) lines.push(`${group.title}: ${option.label}${quantity > 1 ? ` x${quantity}` : ''}${option.price ? ` (${BetinhoCart.money(option.price * quantity)})` : ''}`);
        });
      }
    });
    return lines;
  }
  function createMessage(order, cartItems, totals, orderNumber, date) {
    const f = order;
    const lines = [
      `*PEDIDO BETINHO SANDUÍCHE #${orderNumber}*`,
      `Data e horário: ${formatDate(date)}`,
      '', `Cliente: ${f.name}`, `Telefone: ${f.phone}`,
      `Modalidade: ${f.mode === 'delivery' ? 'Entrega' : 'Retirada'}`
    ];
    if (f.mode === 'delivery') {
      lines.push(`Endereço: ${f.street}, ${f.number}`, `Bairro: ${f.neighborhood}`);
      if (f.reference) lines.push(`Referência: ${f.reference}`);
    }
    lines.push('', '*Itens do pedido:*');
    cartItems.forEach((item) => {
      const product = BetinhoCatalog.productById(item.productId);
      const unitPrice = BetinhoCart.itemUnitPrice(item);
      lines.push(`• ${item.quantity}x ${product.name} — ${BetinhoCart.money(unitPrice)} un.`);
      selectionLabels(product, item.selections).forEach((label) => lines.push(`  - ${label}`));
    });
    lines.push('', `Subtotal: ${BetinhoCart.money(totals.subtotal)}`);
    if (f.mode === 'delivery') lines.push(`Taxa de entrega: ${BetinhoCart.money(totals.fee)}`);
    lines.push(`*Total: ${BetinhoCart.money(totals.total)}*`, `Pagamento: ${f.payment || 'A combinar pelo WhatsApp'}`);
    if (f.change) lines.push(`Troco para: ${f.change}`);
    if (f.notes) lines.push(`Observações: ${f.notes}`);
    return lines.join('\n');
  }
  function conversationUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
  function makeOrderNumber(date) {
    const datePart = `${pad(date.getDate())}${pad(date.getMonth() + 1)}`;
    const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}`;
    const salt = Math.floor(10 + Math.random() * 90);
    return `${datePart}-${timePart}-${salt}`;
  }
  window.BetinhoWhatsApp = { WHATSAPP_NUMBER, createMessage, conversationUrl, makeOrderNumber };
})();
