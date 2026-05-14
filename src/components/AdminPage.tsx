import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Loader2, LogOut, Save, Settings, Trash2, Upload, Edit2, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { getStoreSettings, updateStoreSettings } from '../services/settings';
import { getAllAdminProducts } from '../services/catalog';
import type { StoreSettings } from '../types/settings';
import logoImg from '../../imagens para usar no projeto/logotipo.png';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  promotionPrice: string;
  promotionActive: boolean;
  category: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  promotionPrice: '',
  promotionActive: false,
  category: '',
  featured: false,
  active: true,
  sortOrder: '0',
};

const formatCurrency = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getAdminProductPricing = (product: any) => {
  const originalPrice = Number(product.price);
  const promotionPrice = product.promotion_price != null ? Number(product.promotion_price) : null;
  const hasPromotion = Boolean(product.promotion_active) && promotionPrice != null && promotionPrice > 0 && promotionPrice < originalPrice;

  return { originalPrice, promotionPrice, hasPromotion };
};

type FeedbackType = 'info' | 'success' | 'error';

const getSafeFileName = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'produto';

  return `${baseName}.${extension}`;
};

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<FeedbackType>('info');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsMessageType, setSettingsMessageType] = useState<FeedbackType>('info');

  const categories = useMemo(
    () => Array.from(new Set(products.map(product => product.category))).sort(),
    [products],
  );

  const loadData = useCallback(async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        getAllAdminProducts(),
        getStoreSettings(),
      ]);
      setProducts(productsRes);
      setSettings(settingsRes);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
      if (data.session) {
        void loadData();
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void loadData();
      } else {
        setProducts([]);
        setSettings(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [loadData]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setLoginMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSaving(false);
    if (error) {
      setLoginMessage(`Erro no login: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProducts([]);
    setSettings(null);
  };

  const uploadImage = async () => {
    if (!supabase || !imageFile) return '';
    const normalizedImage = await new Promise<{ body: Blob; contentType: string; extension: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth || image.width;
          canvas.height = image.naturalHeight || image.height;
          const context = canvas.getContext('2d');
          if (!context) {
            resolve({
              body: imageFile,
              contentType: imageFile.type || 'application/octet-stream',
              extension: getSafeFileName(imageFile.name).split('.').pop() || 'jpg',
            });
            return;
          }

          context.drawImage(image, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve({
                body: imageFile,
                contentType: imageFile.type || 'application/octet-stream',
                extension: getSafeFileName(imageFile.name).split('.').pop() || 'jpg',
              });
              return;
            }

            resolve({ body: blob, contentType: 'image/jpeg', extension: 'jpg' });
          }, 'image/jpeg', 0.92);
        };
        image.onerror = () => {
          resolve({
            body: imageFile,
            contentType: imageFile.type || 'application/octet-stream',
            extension: getSafeFileName(imageFile.name).split('.').pop() || 'jpg',
          });
        };
        image.src = String(reader.result || '');
      };
      reader.onerror = () => {
        resolve({
          body: imageFile,
          contentType: imageFile.type || 'application/octet-stream',
          extension: getSafeFileName(imageFile.name).split('.').pop() || 'jpg',
        });
      };
      reader.readAsDataURL(imageFile);
    });

    const fileBaseName = getSafeFileName(imageFile.name).replace(/\.[^.]+$/, '');
    const path = `products/${Date.now()}-${fileBaseName}.${normalizedImage.extension}`;
    const { error } = await supabase.storage.from('product-images').upload(path, normalizedImage.body, {
      contentType: normalizedImage.contentType,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleEditClick = (product: any) => {
    const pricing = getAdminProductPricing(product);
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString().replace('.', ','),
      promotionPrice: pricing.promotionPrice != null ? pricing.promotionPrice.toString().replace('.', ',') : '',
      promotionActive: pricing.hasPromotion,
      category: product.category,
      featured: product.featured || false,
      active: product.active ?? true,
      sortOrder: (product.sort_order || 0).toString(),
    });
    setImageFile(null);
    setMessage('');
    setMessageType('info');
    setIsProductModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setIsProductModalOpen(false);
  };

  const handleNewProductClick = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setMessage('');
    setMessageType('info');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setMessageType('info');
    setMessage(imageFile ? 'Enviando imagem...' : 'Salvando produto...');

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
        setMessage('Imagem enviada. Salvando produto...');
      }
      
      const price = Number(form.price.replace(',', '.'));
      const promotionPrice = form.promotionPrice ? Number(form.promotionPrice.replace(',', '.')) : null;
      const sortOrder = Number(form.sortOrder || 0);
      const hasPromotion = form.promotionActive && promotionPrice != null && promotionPrice > 0 && promotionPrice < price;

      if (form.promotionActive && !hasPromotion) {
        throw new Error('O preço promocional precisa ser menor que o preço normal.');
      }

      const productData: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        promotion_active: hasPromotion,
        promotion_price: hasPromotion ? promotionPrice : null,
        category: form.category.trim(),
        featured: form.featured,
        active: form.active,
        sort_order: sortOrder,
      };

      if (imageUrl) {
        productData.image_url = imageUrl;
      }

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
        if (error) throw new Error(error.message);
        setMessageType('success');
        setMessage('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw new Error(error.message);
        setMessageType('success');
        setMessage('Produto cadastrado com sucesso!');
      }

      await loadData();
    } catch (error) {
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase) return;
    if (!window.confirm('Deseja realmente remover este produto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      setMessageType('error');
      setMessage(`Erro ao remover: ${error.message}`);
      return;
    }
    setMessageType('success');
    setMessage('Produto removido.');
    await loadData();
  };

  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;

    setIsSavingSettings(true);
    setSettingsMessageType('info');
    setSettingsMessage('Salvando configurações...');

    try {
      await updateStoreSettings(settings);
      setSettingsMessageType('success');
      setSettingsMessage('Configurações salvas com sucesso!');
    } catch (error) {
      setSettingsMessageType('error');
      setSettingsMessage(error instanceof Error ? error.message : 'Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <section className="admin-card admin-setup">
          <img src={logoImg} alt="Logo" className="admin-logo" />
          <h1>Supabase não configurado</h1>
          <p>Preencha o arquivo `.env.local` com as chaves do seu novo projeto.</p>
          <a href="/" className="admin-link-button">Voltar ao cardápio</a>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="admin-page admin-loading">
        <Loader2 className="spin" size={28} />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-page">
        <form className="admin-card admin-login" onSubmit={handleLogin}>
          <img src={logoImg} alt="Logo" className="admin-logo" />
          <h1>Administração</h1>
          <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
          <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          {loginMessage && <p className="admin-message error">{loginMessage}</p>}
          <button className="admin-primary-btn" type="submit" disabled={isSaving}>
            {isSaving ? <><Loader2 className="spin" size={18} /> Entrando...</> : 'Entrar'}
          </button>
          <a href="/" className="admin-secondary-link">Voltar ao cardápio</a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-title-group">
          <img src={logoImg} alt="Logo" className="admin-topbar-logo" />
          <div><h1>Administração</h1><span>{session.user.email}</span></div>
        </div>
        <div className="admin-actions">
          <a href="/" className="admin-secondary-link">Ver Site</a>
          <button className="admin-icon-btn" onClick={handleLogout}><LogOut size={18} /></button>
        </div>
      </header>

      <section className="admin-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <button className="settings-trigger" type="button" onClick={() => settings && setIsSettingsModalOpen(true)} disabled={!settings}>
              <span><Settings size={20} />Configurações da Loja</span>
              <span>{settings ? 'Editar' : 'Carregando...'}</span>
          </button>

          <button className="settings-trigger" type="button" onClick={handleNewProductClick}>
            <span><Upload size={20} />Novo Produto</span>
            <span>Cadastrar</span>
          </button>
        </div>

        <section className="admin-panel">
          <h2>Produtos no Banco de Dados</h2>
          <div className="admin-product-list">
            {products.map(p => {
              const pricing = getAdminProductPricing(p);

              return (
                <article className={`admin-product-row ${editingId === p.id ? 'editing' : ''} ${p.featured ? 'featured' : ''}`} key={p.id}>
                  <div className="admin-product-thumb">{p.image_url && <img src={p.image_url} alt="" />}</div>
                  <div className="admin-product-info">
                    <strong>{p.name}</strong>
                    <span>{p.category} · {formatCurrency(pricing.hasPromotion ? pricing.promotionPrice! : p.price)}</span>
                    {pricing.hasPromotion && (
                      <span className="admin-badge admin-badge-promo">
                        {formatCurrency(p.price)} → {formatCurrency(pricing.promotionPrice!)}
                      </span>
                    )}
                    {p.featured && <span className="admin-badge">Destaque</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="admin-icon-btn" onClick={() => handleEditClick(p)} title="Editar"><Edit2 size={16} /></button>
                    <button className="admin-danger-btn" onClick={() => handleDeleteProduct(p.id)} title="Excluir"><Trash2 size={16} /></button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      {settings && isSettingsModalOpen && (
        <div className="settings-modal-overlay" role="presentation">
          <form className="settings-modal" onSubmit={handleSaveSettings}>
            <div className="settings-modal-header">
              <h2><Settings size={20} />Configurações da Loja</h2>
              <button type="button" className="admin-icon-btn" onClick={() => setIsSettingsModalOpen(false)} title="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="settings-modal-body">
              <label>Endereço<input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} required /></label>
              <label>Horário (Texto)<input value={settings.opening_hours} onChange={e => setSettings({ ...settings, opening_hours: e.target.value })} required /></label>
              <div className="settings-hours-grid">
                <label>Hora Abertura<input type="number" value={settings.start_hour} onChange={e => setSettings({ ...settings, start_hour: parseInt(e.target.value) || 0 })} /></label>
                <label>Hora Fechamento<input type="number" value={settings.end_hour} onChange={e => setSettings({ ...settings, end_hour: parseInt(e.target.value) || 0 })} /></label>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <span style={{ display: 'block', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>Dias de Funcionamento</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                    const isChecked = settings.opening_days?.includes(index);
                    return (
                      <label key={day} style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: '6px', 
                        margin: 0,
                        padding: '6px 12px',
                        background: isChecked ? 'var(--primary)' : 'var(--bg-main)',
                        color: isChecked ? 'white' : 'var(--text-dark)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        border: '1px solid',
                        borderColor: isChecked ? 'var(--primary)' : 'var(--border-light)'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          style={{ accentColor: 'white' }}
                          onChange={e => {
                            const days = settings.opening_days || [];
                            if (e.target.checked) {
                              setSettings({ ...settings, opening_days: [...days, index].sort() });
                            } else {
                              setSettings({ ...settings, opening_days: days.filter(d => d !== index) });
                            }
                          }}
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
              </div>

              {settingsMessage && <p className={`admin-message ${settingsMessageType}`}>{settingsMessage}</p>}
              <button className="admin-primary-btn" type="submit" disabled={isSavingSettings}>
                {isSavingSettings ? <><Loader2 className="spin" size={18} /> Salvando...</> : <><Save size={18} /> Salvar Configurações</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {isProductModalOpen && (
        <div className="settings-modal-overlay" role="presentation">
          <form className="settings-modal" onSubmit={handleSaveProduct}>
            <div className="settings-modal-header">
              <h2>{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button type="button" className="admin-icon-btn" onClick={handleCancelEdit} title="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="settings-modal-body">
              <label>Nome<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Categoria<input list="cats" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required /><datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist></label>
              <label>Preço<input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="19,90" required /></label>
              <label>Descrição<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
              <div className="admin-checks">
                <label className={`admin-toggle ${form.promotionActive ? 'checked' : ''}`}>
                  <input type="checkbox" checked={form.promotionActive} onChange={e => setForm({ ...form, promotionActive: e.target.checked })} />
                  <span>Promoção</span>
                  <strong>{form.promotionActive ? 'Sim' : 'Não'}</strong>
                </label>
              </div>
              <label>Preço promocional<input value={form.promotionPrice} onChange={e => setForm({ ...form, promotionPrice: e.target.value })} placeholder="14,90" disabled={!form.promotionActive} /></label>
              <label className="admin-file-field">Imagem<span><Upload size={18} /> {imageFile ? imageFile.name : (editingId ? 'Trocar Foto' : 'Upload Foto')}</span><input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} /></label>
              <div className="admin-checks">
                <label className={`admin-toggle ${form.featured ? 'checked' : ''}`}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  <span>Destaque</span>
                  <strong>{form.featured ? 'Sim' : 'Não'}</strong>
                </label>
                <label className={`admin-toggle ${form.active ? 'checked' : ''}`}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                  <span>Ativo</span>
                  <strong>{form.active ? 'Sim' : 'Não'}</strong>
                </label>
              </div>
              {message && <p className={`admin-message ${messageType}`}>{message}</p>}
              <button className="admin-primary-btn" type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="spin" size={18} /> Salvando...</> : <><Save size={18} /> {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
