import { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, MapPin, Clock, Plus, Minus, X } from 'lucide-react';
import { products } from './data/products';
import { CategoryFilter } from './components/CategoryFilter';
import type { Product } from './types';
import logoImg from '../imagens para usar no projeto/logotipo.png';
import './App.css';

interface CartItem extends Product {
  quantity: number;
}

function App() {
  // Inicialização preguiçosa do carrinho a partir do localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('sabores-do-campo-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sincroniza o carrinho com o localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('sabores-do-campo-cart', JSON.stringify(cart));
  }, [cart]);

  const isOpen = new Date().getHours() >= 8 && new Date().getHours() < 19;

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

  const sendWhatsApp = () => {
    if (cart.length === 0) return;

    const message = cart.map(item => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('%0A');
    const total = `%0A%0A*Total: R$ ${cartTotal.toFixed(2)}*`;
    const phoneNumber = '5571993171586'; 
    window.open(`https://wa.me/${phoneNumber}?text=Olá, gostaria de fazer um pedido na *Deliciosos Sabores do Campo*:%0A%0A${message}${total}`, '_blank');
  };

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Ordem desejada pelo usuário
  const categoryOrder = ['Polpas', 'Biscoitos', 'Licores', 'Diversos'];
  
  // Pega todas as categorias existentes que não estão na ordem preferida e adiciona ao final
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
        const navHeight = 80; // Altura aproximada da nav fixa
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: 'smooth'
        });
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
            <a href="#" className="nav-item">Promoções</a>
            <a href="#" className="nav-item">Pedidos</a>
            <a href="#" className="nav-item">
              <User size={18} />
              Entrar
            </a>
          </div>
        </div>
      </nav>

      <main className="app-layout">
        <div className="content-area">
          {/* Header Compacto com Info da Loja */}
          <div className="compact-header">
            <div className="header-top-row">
              <h1>Produtos orgânicos</h1>
              <span className={`badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
                {isOpen ? 'Aberto agora' : 'Fechado agora'}
              </span>
            </div>

            <div className="store-info-grid">
              <div className="info-item">
                <Clock size={16} />
                <span>08:00 - 19:00</span>
              </div>
              <div className="info-item">
                <MapPin size={16} />
                <span>Via Universitária, Simões Filho, BA</span>
              </div>
            </div>
          </div>


          {/* Filtros e Busca */}
          <div className="controls-wrapper" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <CategoryFilter 
              selectedCategory={selectedCategory} 
              onSelectCategory={scrollToCategory} 
              categories={filterCategories}
            />
            <div className="search-bar" style={{ width: '100%' }}>
              <Search size={20} />
              <input
                type="text"
                placeholder="O que você deseja provar hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Seção de Destaques - Apenas Licores */}
          <section>
            <h2 className="section-heading">Destaques</h2>
            <div className="products-grid">
              {products.filter(p => p.category === 'Licores').map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <button className="add-btn" onClick={() => addToCart(product)}>
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Produtos Agrupados por Categoria na Ordem Correta */}
          {finalCategoryOrder.map(category => {
            const categoryProducts = groupedProducts[category];
            if (!categoryProducts) return null;

            const filtered = categoryProducts.filter(product => 
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filtered.length === 0) return null;

            return (
              <section key={category} id={`category-${category}`} style={{ marginTop: '40px' }}>
                <h2 className="section-heading">{category}</h2>
                <div className="products-grid">
                  {filtered.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image-container">
                        <img src={product.image} alt={product.name} className="product-image" />
                      </div>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-footer">
                          <span className="product-price">
                            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <button className="add-btn" onClick={() => addToCart(product)}>
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Carrinho Lateral/Final */}
        <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
        <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-container">
            <div className="cart-header">
              <ShoppingBag size={24} color="var(--primary)" />
              <h2>Sua Sacola</h2>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
              {cart.length > 0 && (
                <span className="badge cart-badge-desktop" style={{ marginLeft: 'auto' }}>{cart.reduce((acc, item) => acc + item.quantity, 0)} itens</span>
              )}
            </div>

            <div className="cart-content">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Adicione itens para começar o seu pedido.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h4>{item.name}</h4>
                        <span className="cart-item-total-price">
                          {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      
                      <div className="cart-item-details">
                        <span className="cart-item-unit-price">
                          {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / un
                        </span>
                        
                        <div className="item-actions">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span className="item-qty">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total a Pagar</span>
                    <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
                <button className="checkout-btn" onClick={sendWhatsApp}>
                  Finalizar Pedido <ShoppingBag size={20} />
                </button>
              </div>
            )}
          </div>
        </aside>
      </main>

      {cart.length > 0 && (
        <button className="mobile-cart-fab" onClick={() => setIsCartOpen(true)}>
          <div className="fab-icon-wrapper">
            <ShoppingBag size={24} />
            <span className="fab-count">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
          </div>
          <span className="fab-label">Ver Sacola</span>
          <span className="fab-total">
            {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </button>
      )}
    </div>
  );
}

export default App;
