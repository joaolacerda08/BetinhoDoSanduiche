/* Regras logísticas da demonstração comercial. */
(function () {
  const DELIVERY_FEE = 5.9;
  const DELIVERY_MINUTES = '30 a 50 minutos';
  function fee(mode) { return mode === 'delivery' ? DELIVERY_FEE : 0; }
  function total(subtotal, mode) { return subtotal + fee(mode); }
  window.BetinhoDelivery = { DELIVERY_FEE, DELIVERY_MINUTES, fee, total };
})();
