const products = [
  { id: 1, category: 'zlom', name: 'Skup złomu stalowego', description: 'Odbiór od 500 kg, uczciwa wycena na miejscu.', price: 'od 0,80 zł', unit: '/ kg', image: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=900&q=80' },
  { id: 2, category: 'zlom', name: 'Metale kolorowe', description: 'Miedź, aluminium, mosiądz i przewody.', price: 'od 8,00 zł', unit: '/ kg', image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80' },
  { id: 3, category: 'zlom', name: 'Konstrukcje stalowe', description: 'Demontaż i odbiór ciężkich konstrukcji przemysłowych.', price: 'wycena', unit: 'indywidualna', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80' },
  { id: 4, category: 'zlom', name: 'Przewody i okablowanie', description: 'Odbiór przewodów, kabli i odpadów elektroinstalacyjnych.', price: 'od 4,00 zł', unit: '/ kg', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80' },
  { id: 5, category: 'zlom', name: 'Stalowa rura i profile', description: 'Wywóz i skup rur, profili i elementów stalowych.', price: 'od 0,95 zł', unit: '/ kg', image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d6c1?auto=format&fit=crop&w=900&q=80' },
  { id: 6, category: 'transport', name: 'Transport HDS', description: 'Bezpieczny załadunek i dostawa z rozładunkiem.', price: 'od 250 zł', unit: '/ kurs', image: 'https://images.unsplash.com/photo-1586191582151-f73872dfd183?auto=format&fit=crop&w=900&q=80' },
  { id: 7, category: 'transport', name: 'Wywrotka 4-osiowa', description: 'Kruszywa, ziemia i ładunki sypkie do 14 ton.', price: 'od 180 zł', unit: '/ kurs', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80' },
  { id: 8, category: 'transport', name: 'Transport gabarytów', description: 'Elastyczne terminy dla trudnych ładunków i elementów dużych.', price: 'wycena', unit: 'indywidualna', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80' },
  { id: 9, category: 'transport', name: 'Dostawa na budowę', description: 'Transport materiałów i urządzeń na teren inwestycji.', price: 'od 300 zł', unit: '/ kurs', image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80' },
  { id: 10, category: 'transport', name: 'Usługa przewozu drobnicowy', description: 'Krótki termin, sprawny odbiór z miejsca i szybki dojazd.', price: 'od 220 zł', unit: '/ kurs', image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=900&q=80' },
  { id: 11, category: 'koparka', name: 'Koparka gąsienicowa', description: 'Wykopy, fundamenty i prace ziemne o dużej precyzji.', price: 'od 180 zł', unit: '/ h', image: 'https://images.unsplash.com/photo-1579412690850-bd41cd0af397?auto=format&fit=crop&w=900&q=80' },
  { id: 12, category: 'koparka', name: 'Rozbiórka obiektu', description: 'Sprawna rozbiórka z wywozem gruzu i zabezpieczeniem terenu.', price: 'wycena', unit: 'indywidualna', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80' },
  { id: 13, category: 'koparka', name: 'Niwelacja terenu', description: 'Przygotowanie działki pod inwestycję i płaskie podjazdy.', price: 'od 160 zł', unit: '/ h', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80' },
  { id: 14, category: 'koparka', name: 'Wykopy pod fundamenty', description: 'Wąskie i szerokie wykopy, szybką realizacja na miejscu.', price: 'od 220 zł', unit: '/ h', image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d6c1?auto=format&fit=crop&w=900&q=80' },
  { id: 15, category: 'koparka', name: 'Prace ziemne i odspojenie', description: 'Uzbrojenie i przygotowanie terenu pod inwestycje.', price: 'wycena', unit: 'indywidualna', image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80' },
  { id: 16, category: 'materialy', name: 'Kruszywo drogowe', description: 'Stabilne podjazdy, drogi i place budowlane.', price: 'od 65 zł', unit: '/ t', image: 'https://images.unsplash.com/photo-1590644365607-1c5a2c4c3d5d?auto=format&fit=crop&w=900&q=80' },
  { id: 17, category: 'materialy', name: 'Piasek budowlany', description: 'Czysty materiał do fundamentów i zasypek.', price: 'od 45 zł', unit: '/ t', image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=900&q=80' },
  { id: 18, category: 'materialy', name: 'Kostka brukowa', description: 'Materiały do podjazdów i ciągów pieszych.', price: 'wycena', unit: 'transport', image: 'https://images.unsplash.com/photo-1584622781867-0c2d4d4e4a92?auto=format&fit=crop&w=900&q=80' },
  { id: 19, category: 'materialy', name: 'Żwir i otoczka', description: 'Mieszanka do prac budowlanych i odwadniania terenu.', price: 'od 52 zł', unit: '/ t', image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80' },
  { id: 20, category: 'materialy', name: 'Cegła i bloczki', description: 'Materiały do murów, ścian i konstrukcji ogrodowych.', price: 'wycena', unit: 'na zamówienie', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80' },
  { id: 21, category: 'zlom', name: 'Złom samochodowy', description: 'Odbiór aut, elementów i zużytego osprzętu.', price: 'od 1,10 zł', unit: '/ kg', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80' },
  { id: 22, category: 'zlom', name: 'Stal i konstrukcje', description: 'Drobne i duże elementy stalowe z obiektów oraz zakładów.', price: 'wycena', unit: 'na miejscu', image: 'https://images.unsplash.com/photo-1565610222536-ef125c59da2e?auto=format&fit=crop&w=900&q=80' },
  { id: 23, category: 'transport', name: 'Dostawa materiału sypkiego', description: 'Kruszywo, ziemia i piasek na miejsce realizacji.', price: 'od 240 zł', unit: '/ kurs', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80' },
  { id: 24, category: 'materialy', name: 'Piasek i żwir do drenażu', description: 'Materiały do drenów, podjazdów i przyłączy budowlanych.', price: 'od 58 zł', unit: '/ t', image: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=900&q=80' },
  { id: 25, category: 'koparka', name: 'Roboty ziemne i wykopy', description: 'Prace dla inwestycji mieszkaniowych i przemysłowych.', price: 'od 240 zł', unit: '/ h', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80' }
];

let selectedFilter = 'all';
let cart = [];

const grid = document.querySelector('#product-grid');
const empty = document.querySelector('#empty-state');
const search = document.querySelector('#search');

function formatCategory(value) {
  return value === 'zlom' ? 'Złom' : value === 'transport' ? 'Transport' : value === 'koparka' ? 'Koparka' : 'Materiały';
}

function renderProducts() {
  const term = search.value.toLowerCase().trim();
  const visible = products.filter((product) => {
    const matchesCategory = selectedFilter === 'all' || product.category === selectedFilter;
    const matchesSearch = `${product.name} ${product.description} ${formatCategory(product.category)}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  empty.hidden = visible.length > 0;

  grid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-photo" style="background-image:url('${product.image}')">
        <span>${formatCategory(product.category)}</span>
      </div>
      <div class="product-body">
        <small>GREMPOOL / OFERTA</small>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-foot">
          <div class="price">${product.price}<small>${product.unit}</small></div>
          <button class="add-product" data-add="${product.id}" aria-label="Dodaj ${product.name} do zapytania">+</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.add)));
  });
}

function addToCart(id) {
  if (!cart.includes(id)) {
    cart.push(id);
  }

  renderCart();
  showToast('Dodano do zapytania');
}

function renderCart() {
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('#cart-total');
  const cartItems = document.querySelector('#cart-items');

  cartCount.textContent = cart.length;
  cartTotal.textContent = cart.length;

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Twoja lista jest pusta.<br>Dodaj ofertę z marketplace.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((id) => {
    const product = products.find((item) => item.id === id);
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <b>${product.name}</b>
          <small>${product.price} ${product.unit}</small>
        </div>
        <button class="remove-item" data-remove="${product.id}" aria-label="Usuń ${product.name}">×</button>
      </div>
    `;
  }).join('');

  document.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => {
      cart = cart.filter((item) => item !== Number(button.dataset.remove));
      renderCart();
    });
  });
}

function openCart() {
  const panel = document.querySelector('#cart');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel = document.querySelector('#cart');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showToast(text) {
  const toast = document.querySelector('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    button.classList.add('active');
    selectedFilter = button.dataset.filter;
    renderProducts();
  });
});

document.querySelectorAll('.category-card').forEach((button) => {
  button.addEventListener('click', () => {
    selectedFilter = button.dataset.category;
    document.querySelectorAll('.filter').forEach((filter) => {
      filter.classList.toggle('active', filter.dataset.filter === selectedFilter);
    });
    document.querySelector('#marketplace').scrollIntoView({ behavior: 'smooth' });
    renderProducts();
  });
});

search.addEventListener('input', renderProducts);

document.querySelectorAll('[data-open-cart]').forEach((button) => {
  button.addEventListener('click', openCart);
});

document.querySelectorAll('[data-close-cart]').forEach((button) => {
  button.addEventListener('click', closeCart);
});

document.querySelector('#quote-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const contact = form.get('contact');
  showToast(`Dziękujemy. Wrócimy z wyceną na ${contact}.`);
  cart = [];
  event.currentTarget.reset();
  renderCart();
  setTimeout(closeCart, 500);
});

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const nav = document.querySelector('.main-nav');
  const isOpen = nav.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => document.querySelector('.main-nav').classList.remove('open'));
});

renderProducts();
renderCart();

