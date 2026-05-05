import React, { useState } from 'react';
import { X, MapPin, Store, CreditCard, Banknote, ClipboardCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => void;
  total: number;
}

export interface CheckoutData {
  name: string;
  deliveryMethod: 'delivery' | 'pickup';
  address: string;
  neighborhood: string;
  number: string;
  paymentMethod: 'pix' | 'card' | 'cash';
  cardType?: 'debito' | 'credito';
  changeFor?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSubmit, total }) => {
  const [data, setData] = useState<CheckoutData>({
    name: '',
    deliveryMethod: 'delivery',
    address: '',
    neighborhood: '',
    number: '',
    paymentMethod: 'pix',
    cardType: 'debito',
    changeFor: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name) return alert('Por favor, informe seu nome.');
    if (data.deliveryMethod === 'delivery' && (!data.address || !data.neighborhood)) {
      return alert('Por favor, preencha os dados de entrega.');
    }
    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="checkout-modal">
        <div className="modal-header">
          <h3>Finalizar Pedido</h3>
          <button className="close-modal" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <label>Seu Nome</label>
            <input 
              type="text" 
              placeholder="Como podemos te chamar?" 
              value={data.name}
              onChange={e => setData({...data, name: e.target.value})}
              required
            />
          </div>

          <div className="form-section">
            <label>Como deseja receber?</label>
            <div className="toggle-group">
              <button 
                type="button" 
                className={data.deliveryMethod === 'delivery' ? 'active' : ''}
                onClick={() => setData({...data, deliveryMethod: 'delivery'})}
              >
                <MapPin size={18} /> Entrega
              </button>
              <button 
                type="button" 
                className={data.deliveryMethod === 'pickup' ? 'active' : ''}
                onClick={() => setData({...data, deliveryMethod: 'pickup'})}
              >
                <Store size={18} /> Retirada
              </button>
            </div>
          </div>

          {data.deliveryMethod === 'delivery' && (
            <div className="form-section address-grid">
              <div className="field-full">
                <label>Endereço / Rua</label>
                <input 
                  type="text" 
                  placeholder="Ex: Rua das Flores" 
                  value={data.address}
                  onChange={e => setData({...data, address: e.target.value})}
                />
              </div>
              <div className="field-half">
                <label>Número</label>
                <input 
                  type="text" 
                  placeholder="Ex: 123" 
                  value={data.number}
                  onChange={e => setData({...data, number: e.target.value})}
                />
              </div>
              <div className="field-half">
                <label>Bairro</label>
                <input 
                  type="text" 
                  placeholder="Ex: Centro" 
                  value={data.neighborhood}
                  onChange={e => setData({...data, neighborhood: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="form-section">
            <label>Forma de Pagamento</label>
            <div className="payment-grid">
              <button 
                type="button" 
                className={data.paymentMethod === 'pix' ? 'active' : ''}
                onClick={() => setData({...data, paymentMethod: 'pix'})}
              >
                <ClipboardCheck size={18} /> Pix
              </button>
              <button 
                type="button" 
                className={data.paymentMethod === 'card' ? 'active' : ''}
                onClick={() => setData({...data, paymentMethod: 'card'})}
              >
                <CreditCard size={18} /> Cartão
              </button>
              <button 
                type="button" 
                className={data.paymentMethod === 'cash' ? 'active' : ''}
                onClick={() => setData({...data, paymentMethod: 'cash'})}
              >
                <Banknote size={18} /> Dinheiro
              </button>
            </div>
          </div>

          {data.paymentMethod === 'card' && (
            <div className="form-section">
              <label>Tipo de Cartão</label>
              <div className="toggle-group">
                <button 
                  type="button" 
                  className={data.cardType === 'debito' ? 'active' : ''}
                  onClick={() => setData({...data, cardType: 'debito'})}
                >
                  Débito
                </button>
                <button 
                  type="button" 
                  className={data.cardType === 'credito' ? 'active' : ''}
                  onClick={() => setData({...data, cardType: 'credito'})}
                >
                  Crédito
                </button>
              </div>
            </div>
          )}

          {data.paymentMethod === 'cash' && (
            <div className="form-section">
              <label>Precisa de troco para quanto?</label>
              <input 
                type="text" 
                placeholder="Ex: Troco para R$ 50,00" 
                value={data.changeFor}
                onChange={e => setData({...data, changeFor: e.target.value})}
              />
            </div>
          )}

          <div className="modal-footer">
            <div className="total-info">
              <span>Total do Pedido</span>
              <strong>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <button type="submit" className="confirm-order-btn">
              Confirmar e Enviar WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
