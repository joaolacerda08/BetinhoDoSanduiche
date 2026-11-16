/* Catálogo e regras comerciais. Edite este arquivo para atualizar produtos e opções. */
(function () {
  const sauces = {
    id: 'molhos', title: 'Molhos', type: 'multi', required: false,
    options: [
      { id: 'grill', label: 'Molho Grill', price: 1.5 },
      { id: 'verde', label: 'Molho Verde', price: 1.5 },
      { id: 'barbecue', label: 'Barbecue', price: 2 }
    ]
  };
  const sides = {
    id: 'acompanhamentos', title: 'Acompanhamentos', type: 'multi', required: false,
    options: [
      { id: 'aneis', label: 'Anéis de Cebola', price: 11 },
      { id: 'nuggets', label: 'Nuggets', price: 11 }
    ]
  };
  const heinz = {
    id: 'heinz', title: 'Sachê Heinz', type: 'single', required: true,
    hint: 'Escolha uma opção para continuar.',
    options: [
      { id: 'kit-heinz', label: '2 Maioneses Heinz + 2 Ketchups Heinz', price: 1.5 },
      { id: 'sem-heinz', label: 'Não tenho interesse', price: 0 }
    ]
  };
  const artisanCombo = {
    id: 'combo', title: 'Combo — batata pequena + bebida', type: 'single', required: false,
    hint: 'Opcional · escolha até uma opção.',
    options: [
      { id: 'coca', label: 'Batata Pequena + Coca-Cola Lata', price: 12 },
      { id: 'coca-zero', label: 'Batata Pequena + Coca-Cola Zero Lata', price: 12 },
      { id: 'guarana', label: 'Batata Pequena + Guaraná Lata', price: 12 },
      { id: 'guarana-zero', label: 'Batata Pequena + Guaraná Zero Lata', price: 12 },
      { id: 'suco', label: 'Batata Pequena + Suco de Laranja 500 ml', price: 14 },
      { id: 'fanta', label: 'Batata Pequena + Fanta Laranja Lata', price: 12 }
    ]
  };
  const truffles = {
    id: 'trufa', title: 'Trufa Delicatto', type: 'multi', required: false,
    options: [
      { id: 'coco', label: 'Coco', price: 5 },
      { id: 'brigadeiro', label: 'Brigadeiro', price: 5 },
      { id: 'ninho', label: 'Ninho', price: 5 }
    ]
  };

  const products = [
    {
      id: 'dois-x-bacon', name: 'Dois X-BACON + Refri 1L', price: 49.9, category: 'promocoes', tag: 'Promo da casa',
      description: 'Dois X-BACON + Guaraná 1 Litro.',
      ingredients: 'Pão, carne 90g, bacon, queijo, alface, tomate, milho, batata e molho especial.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/71af35536633037733e89e8a0cd8424e.png',
      groups: [sauces, sides, heinz]
    },
    {
      id: 'combo-dois-artesanais', name: 'Combo 2 Hambúrgueres Artesanais', price: 59.9, category: 'promocoes', tag: 'Escolha 2',
      description: 'Escolha dois Artesanais por apenas R$ 59,90.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/cdcc80242984c59182896e0bac6e39b0.png',
      groups: [{
        id: 'hamburgueres', title: 'Escolha seus 2 hambúrgueres', type: 'quantity', required: true, exact: 2,
        hint: 'Selecione exatamente 2 unidades. Pode repetir.',
        options: [
          { id: 'bets', label: 'Bets Burguer', price: 0 },
          { id: 'chicken', label: 'Chicken Burguer', price: 0 },
          { id: 'onion', label: 'Onion Burguer', price: 0 },
          { id: 'coalho', label: 'Coalho Burguer', price: 0 }
        ]
      }]
    },
    {
      id: 'promocao-familia', name: 'Promoção Família + Refri 1L', price: 65.9, category: 'promocoes', tag: 'Pra compartilhar',
      description: 'Três hambúrgueres + Mate Couro de 1 Litro.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/b179e4489b639fc6b7a9f24dfb891d7c.jpeg',
      groups: [
        {
          id: 'hamburgueres', title: 'Escolha seus 3 hambúrgueres', type: 'quantity', required: true, exact: 3,
          hint: 'Selecione exatamente 3 unidades. Pode repetir.',
          options: [
            { id: 'x-tudo', label: 'X-Tudo', price: 0 },
            { id: 'x-bacon', label: 'X-Bacon', price: 0 },
            { id: 'x-galinha', label: 'X-Galinha', price: 0 }
          ]
        }, sauces, sides, heinz
      ]
    },
    {
      id: 'dois-triplos', name: '2 Triplos + Refrigerante 1L', price: 49.9, category: 'promocoes', tag: 'Promo da casa',
      ingredients: 'Pão, 3 carnes 56g, cheddar, bacon, ovo, alface, tomate, barbecue e molho especial.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/2911095957e87b8619189a7821d3b899.png',
      groups: [heinz, sauces, sides, truffles]
    },
    {
      id: 'bets-burguer', name: 'Bets Burguer', price: 31.9, category: 'artesanais', tag: 'Artesanal',
      ingredients: 'Pão, carne artesanal bovina 120g, bacon, cream cheese, cebola caramelizada, alface, tomate e molho barbecue.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/278b29be820b620951c8e7f6a05447f8.png',
      groups: [artisanCombo, sauces, sides, heinz]
    },
    {
      id: 'chickenn-burguer', name: 'Chickenn Burguer', price: 31.9, category: 'artesanais', tag: 'Artesanal',
      ingredients: 'Pão, filé de peito empanado, bacon, cream cheese, cebola caramelizada, barbecue, alface, tomate e molho especial.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/5728fb1eaa254d2d0bff1033fec0cba5.png',
      groups: [artisanCombo, sauces, sides, heinz]
    },
    {
      id: 'coalho-burguer', name: 'Coalho Burguer', price: 31.9, category: 'artesanais', tag: 'Artesanal',
      ingredients: 'Pão, carne artesanal bovina 120g, molho especial, bacon, queijo coalho, cebola marinada, melaço, alface e tomate.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/ec756b88c26743e3afc9b038d545e355.png',
      groups: [artisanCombo, sauces, sides, heinz]
    },
    {
      id: 'onion-burguer', name: 'Onion Burguer', price: 31.9, category: 'artesanais', tag: 'Artesanal',
      ingredients: 'Pão, carne artesanal bovina 120g, bacon, onion rings, ovo, 2 fatias de queijo prato, barbecue, alface, tomate e molho especial.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/b2fd3303b59aa7eec55cd88a6b1b4e0c.png',
      groups: [artisanCombo, sauces, sides, heinz]
    },
    {
      id: 'duplo-bets', name: 'Duplo Bets', price: 34.9, category: 'artesanais', tag: 'Artesanal',
      ingredients: 'Pão, 2 carnes artesanais bovinas 120g, bacon, cheddar, catupiry, alface, tomate, cebola caramelizada, molho barbecue e molho especial.',
      image: 'https://static.saipos.com/saipos-estatico/img-items/10332/store_item/9465881d0de4ca3965db7f8a7f30e647.png',
      groups: [artisanCombo, sauces, sides, heinz]
    }
  ];

  window.BetinhoCatalog = {
    products,
    productById: (id) => products.find((product) => product.id === id),
    categories: { promocoes: 'Promoções', artesanais: 'Hambúrgueres Artesanais' }
  };
})();
