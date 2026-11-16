# Betinho Sanduíche — cardápio digital

Website estático para catálogo, personalização dos itens, sacola persistente, escolha entre entrega e retirada e preparação do pedido para envio pelo WhatsApp.

## Abrir localmente

Abra `index.html` em um navegador moderno. Para testar com um endereço local, inicie um servidor estático nesta pasta, por exemplo:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`. O projeto não exige instalação de pacotes, compilação ou backend.

## Publicar no GitHub Pages

Copie o conteúdo desta pasta para a raiz do repositório (ou para uma pasta `docs`) e habilite GitHub Pages para a branch e diretório escolhidos. Os caminhos dos arquivos são relativos e o site não depende de um processo de build.

## Organização

- `index.html`: estrutura e carregamento dos arquivos.
- `data/`: reservado para dados adicionais do catálogo.
- `assets/js/catalog.js`: nove produtos, ingredientes e grupos de personalização.
- `assets/js/cart.js`: sacola, preços e persistência em `localStorage`.
- `assets/js/delivery.js`: modalidade, prazo e taxa de entrega.
- `assets/js/checkout.js`: validação do checkout e configuração de pagamento.
- `assets/js/whatsapp.js`: formatação do pedido e link de conversa.
- `assets/js/app.js`: renderização da interface e interações.
- `assets/css/`: reset, tema, layout, componentes, animações e ajustes responsivos.

## Configurações pendentes da loja

- **Pagamento:** `paymentOptions` está vazio em `assets/js/checkout.js`. Enquanto os meios aceitos não forem confirmados, o cliente informa como prefere combinar pelo WhatsApp.
- **WhatsApp:** o número de demonstração `5531989040893` está em `assets/js/whatsapp.js`.
- **Entrega:** R$ 5,90 e prazo de 30 a 50 minutos ficam em `assets/js/delivery.js`.
- **Marca e cardápio:** cores, imagens e descrição do projeto seguem o briefing; confirme com a loja antes de apresentar como informação oficial.

O checkout abre o link oficial `wa.me` com a mensagem preenchida. O site mantém a sacola e guarda localmente a última tentativa; ele não confirma que a mensagem foi enviada.

## Imagens e fontes

As fotografias dos produtos e a referência do logo usam os endereços originais informados no briefing. Se esses endereços estiverem indisponíveis, a interface mostra alternativas visuais discretas. As fontes Fraunces e DM Sans carregam do Google Fonts quando há conexão; alternativas locais são definidas no CSS.
