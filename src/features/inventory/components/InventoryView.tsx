'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getProducts, createProduct, updateProduct, restockProduct, getAllStockMovements } from '@/actions/product';
import { formatCurrency } from '@/lib/utils';
import type { StockStatus } from '@/generated/prisma/client';

export function InventoryView({ role = 'apoteker' }: { role?: 'apoteker' | 'kasir' | 'owner' }) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Skincare', stock: '', price: '', expiryDate: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Stock Movements State
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'activity'>('catalog');

  useEffect(() => {
    loadData(false);
    
    // Auto-refresh data every 3 seconds for real-time updates
    const intervalId = setInterval(() => {
      loadData(true);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [role]);

  async function loadData(silent = false) {
    try {
      if (!silent) setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      if (role === 'owner') {
        const moves = await getAllStockMovements();
        setMovements(moves);
      }
    } catch (error) {
      if (!silent) toast.error('Gagal memuat produk');
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter === 'ALL' || p.stockStatus === statusFilter);

  const statusFilters: (StockStatus | 'ALL')[] = ['ALL', 'IN_STOCK', 'LOW_STOCK', 'EXPIRING', 'OUT_OF_STOCK'];

  const getStatusBadge = (status: StockStatus) => {
    const map: Record<StockStatus, { bg: string; text: string }> = {
      'IN_STOCK': { bg: 'bg-primary-container', text: 'text-on-primary-container' },
      'LOW_STOCK': { bg: 'bg-error-container', text: 'text-on-error-container' },
      'EXPIRING': { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
      'OUT_OF_STOCK': { bg: 'bg-error', text: 'text-white' },
    };
    return map[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const getDotColor = (status: StockStatus) => {
    const map: Record<StockStatus, string> = {
      'IN_STOCK': 'bg-primary', 'LOW_STOCK': 'bg-error', 'EXPIRING': 'bg-secondary', 'OUT_OF_STOCK': 'bg-error',
    };
    return map[status] || 'bg-gray-400';
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name) { toast.error('Nama produk wajib diisi.'); return; }
    
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, {
          name: newProduct.name,
          category: newProduct.category,
          stock: Number(newProduct.stock) || 0,
          price: Number(newProduct.price) || 0,
          expiryDate: newProduct.expiryDate || undefined,
        });
        toast.success(`Produk "${newProduct.name}" berhasil diperbarui!`);
      } else {
        await createProduct({
          name: newProduct.name,
          category: newProduct.category,
          stock: Number(newProduct.stock) || 0,
          price: Number(newProduct.price) || 0,
          expiryDate: newProduct.expiryDate || undefined,
        });
        toast.success(`Produk "${newProduct.name}" berhasil ditambahkan!`);
      }
      setShowModal(false);
      setNewProduct({ name: '', category: 'Skincare', stock: '', price: '', expiryDate: '' });
      setEditingProductId(null);
      await loadData();
    } catch (error) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleRestock = async (id: string) => {
    try {
      await restockProduct(id, 10);
      toast.success('Stok produk berhasil ditambah (+10 unit)!');
      await loadData();
    } catch (error) {
      toast.error('Gagal menambah stok');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat inventaris...</div>;
  }

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
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95" onClick={() => { setEditingProductId(null); setNewProduct({ name: '', category: 'Skincare', stock: '', price: '', expiryDate: '' }); setShowModal(true); }}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Produk
            </button>
          )}
        </div>
      </div>

      {role === 'owner' && (
        <div className="flex border-b border-outline-variant/30 mt-4">
          <button 
            className={`px-6 py-3 font-label-md transition-all border-b-2 ${activeTab === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
            onClick={() => setActiveTab('catalog')}
          >
            Katalog Produk
          </button>
          <button 
            className={`px-6 py-3 font-label-md transition-all border-b-2 ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:bg-surface-container-low'}`}
            onClick={() => setActiveTab('activity')}
          >
            Aktivitas Stok
          </button>
        </div>
      )}

      {activeTab === 'catalog' && (
        <>
          {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map(f => (
          <button key={f} className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${statusFilter === f ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'}`} onClick={() => setStatusFilter(f)}>{f === 'ALL' ? 'Semua' : f === 'IN_STOCK' ? 'Tersedia' : f === 'LOW_STOCK' ? 'Stok Menipis' : f === 'EXPIRING' ? 'Akan Kedaluwarsa' : 'Habis'}</button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {filtered.map(p => {
          const badge = getStatusBadge(p.stockStatus);
          const dot = getDotColor(p.stockStatus);
          return (
            <div key={p.id} className={`glass-card ambient-shadow p-5 rounded-2xl flex flex-col gap-4 border transition-all group ${p.stockStatus === 'OUT_OF_STOCK' ? 'border-error/30 bg-surface-container-lowest opacity-80 hover:opacity-100' : 'border-outline-variant/40 hover:border-primary/40 bg-white/60'}`}>
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[28px]">{p.icon || 'medication'}</span>
                </div>
                <span className={`${badge.bg} ${badge.text} text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider`}>{p.stockStatus === 'IN_STOCK' ? 'Tersedia' : p.stockStatus === 'LOW_STOCK' ? 'Stok Menipis' : p.stockStatus === 'EXPIRING' ? 'Akan Kedaluwarsa' : 'Habis'}</span>
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
                  <span className="font-label-md text-primary font-bold text-[14px]">{formatCurrency(Number(p.price || 0))}</span>
                </div>
                <div className="flex gap-1">
                  {role === 'apoteker' && (
                    <button className="p-2 hover:bg-primary-container/30 rounded-lg text-primary transition-all" title="Edit Produk" onClick={() => {
                      setEditingProductId(p.id);
                      setNewProduct({ 
                        name: p.name, 
                        category: p.category, 
                        stock: p.stock.toString(), 
                        price: Number(p.price || 0).toString(),
                        expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : ''
                      });
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
        </>
      )}

      {activeTab === 'activity' && role === 'owner' && (
        <div className="glass-card ambient-shadow rounded-2xl overflow-hidden mt-4">
          <table className="w-full text-left">
            <thead className="bg-primary-container/10 border-b border-outline-variant/30">
              <tr>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Nama Produk</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Kuantitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {movements.map((move: any) => {
                const isDeduction = move.stockAfter < move.stockBefore;
                const time = new Date(move.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={move.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-6 py-4 font-body-sm text-on-surface-variant">{time}</td>
                    <td className="px-6 py-4 font-body-md font-bold text-on-surface">{move.product?.name || 'Produk Dihapus'}</td>
                    <td className="px-6 py-4">
                      {isDeduction ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-orange-100 text-orange-700 border-orange-200">
                            KURANG
                          </span>
                          <div className="text-[11px] text-on-surface-variant mt-1.5 font-mono">
                            {move.referenceNote || '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
                          TAMBAH
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-headline-sm font-bold ${isDeduction ? 'text-orange-600' : 'text-green-600'}`}>
                      {isDeduction ? '-' : '+'}{move.quantity}
                    </td>
                  </tr>
                );
              })}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">Belum ada aktivitas stok yang tercatat.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Harga (Rp)</label>
                  <input type="number" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" value={newProduct.price} onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Tgl Kedaluwarsa</label>
                  <input type="date" className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface-variant" value={newProduct.expiryDate} onChange={(e) => setNewProduct(prev => ({ ...prev, expiryDate: e.target.value }))} />
                </div>
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
