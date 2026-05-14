import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const originalPrice = product.originalPrice ?? product.price;
  const hasPromotion = Boolean(product.promotionActive) && originalPrice > product.price;

  return (
    <div className="product-card" onClick={() => onAddToCart(product)}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price-group">
          {hasPromotion && (
            <span className="product-price-old">
              {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
          <div className={`product-price ${hasPromotion ? 'product-price--promo' : ''}`}>
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
      </div>
    </div>
  );
}
