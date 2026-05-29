'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getProducts } from '@/actions/product';
import { createTransaction, processPayment } from '@/actions/transaction';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMethod } from '@/generated/prisma/client';

export default function KasirRetailPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<{ product: any; qty: number }[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast.error('Gagal memuat produk');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const availableProducts = products.filter(p => p.stockStatus !== 'OUT_OF_STOCK');
  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.qty), 0);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error(`Cannot add more. Only ${product.stock} units available.`);
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.stock) {
      toast.error(`Cannot exceed available stock (${product.stock} units).`);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty } : item));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const items = cart.map(item => ({
        itemType: 'PRODUCT' as const,
        productId: item.product.id,
        itemName: item.product.name,
        quantity: item.qty,
        unitPrice: Number(item.product.price)
      }));

      const transaction = await createTransaction({
        transactionType: 'RETAIL',
        items
      });

      await processPayment(transaction.id, {
        paymentMethod,
        items
      });

      toast.success('Transaksi retail berhasil diproses!');
      setCart([]);
      
      // refresh products stock
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal memproses transaksi retail');
    }
  };

  const paymentMethods = [
    { id: 'QRIS' as PaymentMethod, icon: 'qr_code_2', label: 'QRIS' },
    { id: 'TRANSFER' as PaymentMethod, icon: 'account_balance', label: 'Transfer' },
    { id: 'CASH' as PaymentMethod, icon: 'payments', label: 'Cash' },
  ];

  return (
    <div className="p-margin max-w-container-max mx-auto w-full h-[calc(100vh-4rem)] flex flex-col space-y-gutter">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[32px]">point_of_sale</span>
            Beli Produk Satuan
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Layanan penjualan produk retail (tanpa pendaftaran pasien).</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-gutter overflow-hidden">
        {/* Left: Product List */}
        <div className="flex-1 flex flex-col bg-surface-container-low/30 rounded-2xl border border-outline-variant/30 overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-white/50 backdrop-blur-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="glass-card ambient-shadow p-4 rounded-xl flex flex-col gap-3 cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => addToCart(product)}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-container/50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">{product.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-on-surface font-bold line-clamp-2 leading-tight">{product.name}</h4>
                    <p className="text-[11px] text-on-surface-variant mt-1">{product.stock} tersisa • {product.category}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-outline-variant/20">
                    <span className="font-label-md text-primary font-bold">{formatCurrency(Number(product.price || 0))}</span>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant">
                  <p>Tidak ada produk ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cart/Checkout */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl border border-outline-variant/30 shadow-lg overflow-hidden shrink-0">
          <div className="p-4 bg-primary-container/20 border-b border-outline-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shopping_cart</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Keranjang Belanja</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-surface-container-lowest">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[48px] mb-2">production_quantity_limits</span>
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 bg-white border border-outline-variant/40 rounded-xl shadow-sm">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-label-md text-on-surface font-semibold truncate">{item.product.name}</h4>
                      <p className="text-[12px] text-primary">{formatCurrency(Number(item.product.price || 0))}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-low rounded-lg p-1">
                      <button 
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white shadow-sm transition-colors text-on-surface-variant"
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="font-label-md w-4 text-center">{item.qty}</span>
                      <button 
                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white shadow-sm transition-colors text-on-surface-variant"
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant/30 space-y-4">
            <div>
              <h4 className="font-label-md text-on-surface-variant uppercase mb-2">Metode Pembayaran</h4>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl border-2 transition-all ${paymentMethod === pm.id ? 'border-primary bg-white text-primary' : 'border-outline-variant/40 bg-white/50 text-on-surface-variant hover:border-primary/50'}`}
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <span className="material-symbols-outlined text-[20px]">{pm.icon}</span>
                    <span className="text-[10px] font-bold mt-1">{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end pt-2">
              <span className="text-on-surface-variant font-label-md uppercase">Total Pembayaran</span>
              <span className="font-headline-lg text-primary">{formatCurrency(subtotal)}</span>
            </div>

            <button
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-headline-sm hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Proses Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
