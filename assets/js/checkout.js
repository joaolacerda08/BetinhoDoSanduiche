/* Validação e composição dos dados do checkout. */
(function () {
  const paymentOptions = []; // Preencher somente depois de confirmar os meios aceitos pela loja.
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  function readForm(form) {
    const value = (name) => (form.elements[name]?.value || '').trim();
    const mode = form.querySelector('[name="fulfillment"]:checked')?.value || 'delivery';
    const fields = {
      name: value('customer-name'), phone: value('customer-phone'), mode,
      street: value('street'), number: value('number'), neighborhood: value('neighborhood'), reference: value('reference'),
      payment: paymentOptions.length ? value('payment') : value('payment-free'), change: value('change'), notes: value('notes')
    };
    const errors = {};
    if (fields.name.length < 2) errors['customer-name'] = 'Informe seu nome.';
    const digits = fields.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) errors['customer-phone'] = 'Confira o telefone com DDD.';
    if (mode === 'delivery') {
      if (fields.street.length < 2) errors.street = 'Informe a rua ou avenida.';
      if (!fields.number) errors.number = 'Informe o número.';
      if (fields.neighborhood.length < 2) errors.neighborhood = 'Informe o bairro.';
    }
    if (!fields.payment) errors['payment-free'] = 'Informe como prefere combinar o pagamento.';
    return { fields, errors, valid: Object.keys(errors).length === 0 };
  }
  function paymentFieldMarkup(currentValue = '') {
    if (paymentOptions.length) {
      return `<label class="field"><span>Forma de pagamento</span><select name="payment" required><option value="">Selecione</option>${paymentOptions.map((item) => `<option value="${escapeHtml(item)}" ${item === currentValue ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></label>`;
    }
    return `<div class="payment-note"><strong>Pagamento a confirmar.</strong> A loja ainda não informou os meios aceitos. Combine a forma de pagamento pelo WhatsApp.</div><label class="field" for="payment-free"><span>Forma de pagamento <b aria-hidden="true">*</b></span><input id="payment-free" name="payment-free" value="${escapeHtml(currentValue)}" autocomplete="off" placeholder="Informe ou combine pelo WhatsApp" required><small class="field-error" data-error="payment-free"></small></label>`;
  }
  window.BetinhoCheckout = { paymentOptions, readForm, paymentFieldMarkup };
})();
