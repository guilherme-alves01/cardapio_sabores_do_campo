import { useState, useEffect } from 'react';
import { ShoppingBag, Search, MapPin, Clock, Plus, Minus, X, Settings, Loader2 } from 'lucide-react';
import { CategoryFilter } from './components/CategoryFilter';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPage } from './components/AdminPage';
import type { CheckoutData } from './components/CheckoutModal';
import type { Product } from './types';
import type { StoreSettings } from './types/settings';
import { getStoreSettings } from './services/settings';
import { getCatalogProducts } from './services/catalog';
import logoImg from '../imagens para usar no projeto/logotipo.png';
import './App.css';

interface CartItem extends Product {
  quantity: number;
}

function Storefront() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('sabores-do-campo-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  useEffect(() => {
    localStorage.setItem('sabores-do-campo-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    Promise.all([
      getStoreSettings(),
      getCatalogProducts()
    ]).then(([settingsRes, productsRes]) => {
      setSettings(settingsRes);
      setSupabaseProducts(productsRes);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  // Agora usamos apenas os produtos vindos do Supabase
  const allProducts = supabaseProducts;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>
        <Loader2 className="spin" size={48} />
      </div>
    );
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  const isOpen = settings 
    ? settings.opening_days?.includes(currentDay) && currentHour >= settings.start_hour && currentHour < settings.end_hour
    : currentDay >= 1 && currentDay <= 6 && currentHour >= 8 && currentHour < 19;

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setDetailQuantity(1);
  };

  const handleAddProductDetail = () => {
    if (!selectedProduct) return;
    for (let index = 0; index < detailQuantity; index += 1) {
      addToCart(selectedProduct);
    }
    setSelectedProduct(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckoutSubmit = (checkoutData: CheckoutData) => {
    if (cart.length === 0) return;
    const itemsMessage = cart.map(item => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('%0A');
    let deliveryInfo = checkoutData.deliveryMethod === 'delivery' 
      ? `*Entrega:* ${checkoutData.address}, nº ${checkoutData.number}, ${checkoutData.neighborhood}`
      : `*Retirada:* Retirada no estabelecimento`;
    let paymentInfo = `*Pagamento:* ${checkoutData.paymentMethod.toUpperCase()}`;
    if (checkoutData.paymentMethod === 'card' && checkoutData.cardType) paymentInfo += ` (${checkoutData.cardType})`;
    if (checkoutData.paymentMethod === 'cash' && checkoutData.changeFor) paymentInfo += ` (Troco para ${checkoutData.changeFor})`;
    const fullMessage = `Olá, gostaria de fazer um pedido na *Sabores do Campo*:%0A%0A*Cliente:* ${checkoutData.name}%0A${deliveryInfo}%0A${paymentInfo}%0A%0A*Itens:*%0A${itemsMessage}%0A%0A*Total: R$ ${cartTotal.toFixed(2)}*`;
    window.open(`https://wa.me/5571993171586?text=${fullMessage}`, '_blank');
    setIsCheckoutOpen(false);
  };

  const groupedProducts = allProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const categoryOrder = ['Polpas', 'Biscoitos', 'Licores', 'Sorvetes', 'Diversos'];
  const otherCategories = Object.keys(groupedProducts).filter(cat => !categoryOrder.includes(cat));
  const finalCategoryOrder = [...categoryOrder.filter(cat => groupedProducts[cat]), ...otherCategories];
  const filterCategories = ['Todos', ...finalCategoryOrder];

  const scrollToCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === 'Todos') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <img src={logoImg} alt="Logo" className="nav-logo" />
            <span>Sabores do Campo</span>
          </div>
          <div className="nav-links">
            <a href="#" className="nav-item active">Início</a>
            <a href="#admin" className="nav-item nav-admin" onClick={() => window.location.hash = 'admin'}><Settings size={18} /> Admin</a>
          </div>
        </div>
      </nav>

      <main className="app-layout">
        <div className="content-area">
          <div className="compact-header">
            <div className="header-top-row">
              <h1>Produtos naturais</h1>
              <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
                {isOpen ? 'Aberto agora' : 'Fechado agora'}
              </span>
            </div>
            <div className="store-info-grid">
              <div className="info-item"><Clock size={16} /><span>{settings?.opening_hours || '08:00 - 19:00'}</span></div>
              <div className="info-item"><MapPin size={16} /><span>{settings?.address || 'Simões Filho, BA'}</span></div>
            </div>
          </div>

          <div className="controls-wrapper">
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={scrollToCategory} categories={filterCategories} />
            <div className="search-bar">
              <Search size={20} />
              <input type="text" placeholder="O que você deseja provar hoje?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {finalCategoryOrder.map(category => {
            const filtered = (groupedProducts[category] || []).filter(p => 
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <section key={category} id={`category-${category}`} style={{ marginTop: '40px' }}>
                <h2 className="section-heading">{category}</h2>
                <div className="products-grid">
                  {filtered.map(product => (
                    <button key={product.id} className="product-card" type="button" onClick={() => openProductModal(product)}>
                      <div className="product-image-container"><img src={product.image} alt={product.name} className="product-image" /></div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-footer">
                          <span className="product-price">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          <button className="add-btn" type="button" onClick={(event) => { event.stopPropagation(); addToCart(product); }}><Plus size={20} /></button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
        <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-container">
            <div className="cart-header">
              <ShoppingBag size={24} color="var(--primary)" />
              <h2>Sua Sacola</h2>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
            </div>
            <div className="cart-content">
              {cart.length === 0 ? <p>Sua sacola está vazia.</p> : cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-header"><h4>{item.name}</h4><span>{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    <div className="cart-item-details">
                      <div className="item-actions">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="total-row grand-total"><span>Total</span><span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                <button className="checkout-btn" onClick={() => setIsCheckoutOpen(true)}>Finalizar Pedido</button>
              </div>
            )}
          </div>
        </aside>
      </main>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmit={handleCheckoutSubmit} total={cartTotal} />
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <article className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="product-modal-close" type="button" onClick={() => setSelectedProduct(null)}><X size={22} /></button>
            <div className="product-modal-image-wrap">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="product-modal-image" />
            </div>
            <div className="product-modal-body">
              <span className="product-modal-category">{selectedProduct.category}</span>
              <h2>{selectedProduct.name}</h2>
              {selectedProduct.description && <p>{selectedProduct.description}</p>}
              <strong>{selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
              <div className="product-modal-actions">
                <div className="product-modal-quantity">
                  <button type="button" onClick={() => setDetailQuantity(quantity => Math.max(1, quantity - 1))}><Minus size={16} /></button>
                  <span>{detailQuantity}</span>
                  <button type="button" onClick={() => setDetailQuantity(quantity => quantity + 1)}><Plus size={16} /></button>
                </div>
                <button className="product-modal-add" type="button" onClick={handleAddProductDetail}>
                  Adicionar à sacola
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
      {cart.length > 0 && (
        <button className="mobile-cart-fab" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={24} /> <span>Ver Sacola</span> <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </button>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState(() => window.location.hash === '#admin' ? 'admin' : 'store');
  useEffect(() => {
    const handleHashChange = () => setView(window.location.hash === '#admin' ? 'admin' : 'store');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  return view === 'admin' ? <AdminPage /> : <Storefront />;
}

export default App;
