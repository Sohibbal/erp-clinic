'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PRODUCTS, type Product, type StockStatus, formatCurrency } from '../../../lib/mock-data';

export function InventoryView({ role = 'apoteker' }: { role?: 'apoteker' | 'kasir' | 'owner' }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Skincare', stock: '', price: '' });

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter === 'All' || p.status === statusFilter);

  const statusFilters: (StockStatus | 'All')[] = ['All', 'In Stock', 'Low Stock', 'Expiring', 'Out of Stock'];

  const getStatusBadge = (status: StockStatus) => {
    const map: Record<StockStatus, { bg: string; text: string }> = {
      'In Stock': { bg: 'bg-primary-container', text: 'text-on-primary-container' },
      'Low Stock': { bg: 'bg-error-container', text: 'text-on-error-container' },
      'Expiring': { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
      'Out of Stock': { bg: 'bg-error', text: 'text-white' },
    };
    return map[status];
  };

  const getDotColor = (status: StockStatus) => {
    const map: Record<StockStatus, string> = {
      'In Stock': 'bg-primary', 'Low Stock': 'bg-error', 'Expiring': 'bg-secondary', 'Out of Stock': 'bg-error',
    };
    return map[status];
  };

  const handleSaveProduct = () => {
    if (!newProduct.name) { toast.error('Nama produk wajib diisi.'); return; }
    
    if (editingProductId) {
      setProducts(prev => prev.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            name: newProduct.name,
            category: newProduct.category,
            stock: Number(newProduct.stock) || 0,
            price: Number(newProduct.price) || 0,
            status: Number(newProduct.stock) > 10 ? 'In Stock' : Number(newProduct.stock) > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return p;
      }));
      toast.success(`Produk "${newProduct.name}" berhasil diperbarui!`);
    } else {
      const id = `P${String(products.length + 1).padStart(3, '0')}`;
      const created: Product = {
        id, name: newProduct.name, category: newProduct.category, stock: Number(newProduct.stock) || 0,
        price: Number(newProduct.price) || 0, status: Number(newProduct.stock) > 10 ? 'In Stock' : Number(newProduct.stock) > 0 ? 'Low Stock' : 'Out of Stock',
        icon: 'medication', batchNo: `NEW-${Date.now()}`, lastRestock: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), expiryDate: 'Dec 2025',
      };
      setProducts(prev => [created, ...prev]);
      toast.success(`Produk "${created.name}" berhasil ditambahkan!`);
    }
    
    setShowModal(false);
    setNewProduct({ name: '', category: 'Skincare', stock: '', price: '' });
    setEditingProductId(null);
  };

  const handleRestock = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + 10, status: 'In Stock' as const } : p));
    toast.success('Stok produk berhasil ditambah (+10 unit)!');
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">inventory_2</span>
            Stok Barang
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Kelola stok barang klinik, harga, dan katalog produk.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input type="text" placeholder="Cari produk..." className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {role === 'apoteker' && (
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95" onClick={() => { setEditingProductId(null); setNewProduct({ name: '', category: 'Skincare', stock: '', price: '' }); setShowModal(true); }}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Produk
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(f => (
          <button key={f} className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${statusFilter === f ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'}`} onClick={() => setStatusFilter(f)}>{f === 'All' ? 'Semua' : f === 'In Stock' ? 'Tersedia' : f === 'Low Stock' ? 'Stok Menipis' : f === 'Expiring' ? 'Akan Kedaluwarsa' : 'Habis'}</button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {filtered.map(p => {
          const badge = getStatusBadge(p.status);
          const dot = getDotColor(p.status);
          return (
            <div key={p.id} className={`glass-card ambient-shadow p-5 rounded-2xl flex flex-col gap-4 border transition-all group ${p.status === 'Out of Stock' ? 'border-error/30 bg-surface-container-lowest opacity-80 hover:opacity-100' : 'border-outline-variant/40 hover:border-primary/40 bg-white/60'}`}>
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[28px]">{p.icon}</span>
                </div>
                <span className={`${badge.bg} ${badge.text} text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider`}>{p.status === 'In Stock' ? 'Tersedia' : p.status === 'Low Stock' ? 'Stok Menipis' : p.status === 'Expiring' ? 'Akan Kedaluwarsa' : 'Habis'}</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-[18px] text-on-surface font-bold leading-tight mb-1">{p.name}</h4>
                <p className="font-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                  {p.stock} Unit Tersisa • {p.category}
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center mt-auto">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Harga per unit</p>
                  <span className="font-label-md text-primary font-bold text-[14px]">{formatCurrency(p.price)}</span>
                </div>
                <div className="flex gap-1">
                  {role === 'apoteker' && (
                    <button className="p-2 hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Edit Produk" onClick={() => {
                      setEditingProductId(p.id);
                      setNewProduct({ name: p.name, category: p.category, stock: p.stock.toString(), price: p.price.toString() });
                      setShowModal(true);
                    }}>
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                  {role === 'apoteker' && (
                    <button className="p-2 hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Tambah Stok" onClick={() => handleRestock(p.id)}>
                      <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] text-outline-variant/40">search_off</span>
            <p className="mt-2">Produk tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => { setShowModal(false); setEditingProductId(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">{editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button className="text-on-surface-variant hover:text-error" onClick={() => { setShowModal(false); setEditingProductId(null); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nama Produk *</label>
                <input className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Masukkan nama produk" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Kategori</label>
                  <select className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" value={newProduct.category} onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}>
                    <option>Skincare</option><option>Injectables</option><option>Treatments</option><option>Clinical</option>
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Stok Awal</label>
                  <input type="number" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" value={newProduct.stock} onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Harga (Rp)</label>
                <input type="number" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" value={newProduct.price} onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} />
              </div>
            </div>
            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2" onClick={handleSaveProduct}>
              <span className="material-symbols-outlined text-[20px]">{editingProductId ? 'save' : 'add'}</span>
              {editingProductId ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
