'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getServices, createService, updateService, deleteService } from '@/actions/service';
import type { DiscountType } from '@/generated/prisma/client';

export default function OwnerServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    promoActive: boolean;
    promoType: 'PERCENTAGE' | 'FIXED';
    promoValue: string;
  }>({
    name: '',
    price: '',
    promoActive: false,
    promoType: 'PERCENTAGE',
    promoValue: '',
  });

  useEffect(() => {
    loadData();
  }, [search]);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await getServices(search);
      setServices(data);
      if (data.length > 0 && !selectedId && !search) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      toast.error('Gagal memuat layanan');
    } finally {
      setIsLoading(false);
    }
  }

  const selected = services.find(s => s.id === selectedId);

  const calculateFinalPrice = (service: any) => {
    const promo = service.promotions?.[0];
    if (!promo?.isActive) return Number(service.basePrice);
    const base = Number(service.basePrice);
    const discount = Number(promo.discountValue);
    if (promo.discountType === 'PERCENTAGE') {
      return base - (base * (discount / 100));
    }
    return Math.max(0, base - discount);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', promoActive: false, promoType: 'PERCENTAGE', promoValue: '' });
    setShowModal(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    const promo = service.promotions?.[0];
    setFormData({
      name: service.name,
      price: service.basePrice.toString(),
      promoActive: promo?.isActive ?? false,
      promoType: (promo?.discountType as 'PERCENTAGE' | 'FIXED') ?? 'PERCENTAGE',
      promoValue: (promo?.discountValue ?? '').toString(),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Nama layanan dan harga dasar wajib diisi.');
      return;
    }

    try {
      if (editingId) {
        await updateService(editingId, {
          name: formData.name,
          basePrice: Number(formData.price),
          promoActive: formData.promoActive,
          promoType: formData.promoType as DiscountType,
          promoValue: Number(formData.promoValue),
        });
        toast.success('Layanan berhasil diperbarui!');
      } else {
        const newService = await createService({
          name: formData.name,
          basePrice: Number(formData.price),
          promoActive: formData.promoActive,
          promoType: formData.promoType as DiscountType,
          promoValue: Number(formData.promoValue),
        });
        setSelectedId(newService.id);
        toast.success('Layanan baru berhasil ditambahkan!');
      }
      setShowModal(false);
      await loadData();
    } catch (error) {
      toast.error('Gagal menyimpan layanan');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus layanan ini? Seluruh pemetaan produk akan ikut terhapus.')) {
      try {
        await deleteService(id);
        if (selectedId === id) setSelectedId(null);
        toast.success('Layanan berhasil dihapus.');
        await loadData();
      } catch (error) {
        toast.error('Gagal menghapus layanan');
      }
    }
  };

  return (
    <div className="p-margin max-w-container-max mx-auto w-full space-y-stack-lg pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[32px]">account_tree</span>
            Manajemen Layanan
          </h2>
          <p className="font-body-md text-on-surface-variant mt-1">Kelola katalog layanan, promo khusus, dan pemetaan inventaris.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Cari layanan..."
              className="pl-10 pr-4 py-2.5 bg-white border border-outline-variant/60 rounded-xl text-body-sm w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-label-md flex items-center gap-2 hover:bg-primary/90 shadow-md active:scale-95 transition-all w-full sm:w-auto justify-center"
            onClick={openAddModal}
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            Tambah Layanan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left: Service List */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {isLoading && services.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">Memuat layanan...</div>
          ) : services.map(s => {
            const isSelected = selectedId === s.id;
            const finalPrice = calculateFinalPrice(s);
            const promo = s.promotions?.[0];
            const hasPromo = promo?.isActive;

            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl cursor-pointer transition-all ${isSelected ? 'glass-card ambient-shadow border-l-4 border-primary' : 'bg-white border border-outline-variant/20 hover:shadow-md'}`}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-body-md font-bold text-on-surface">{s.name}</h4>
                    <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{s.id}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {hasPromo ? (
                      <>
                        <span className="text-[11px] text-on-surface-variant line-through">{formatCurrency(Number(s.basePrice))}</span>
                        <span className="text-[14px] font-bold text-green-600">{formatCurrency(finalPrice)}</span>
                      </>
                    ) : (
                      <span className="text-[14px] font-bold text-primary">{formatCurrency(Number(s.basePrice))}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">link</span>
                    <span className="text-[11px] font-bold text-primary bg-primary-container/30 px-2 py-0.5 rounded-full">{s.linkedProducts?.length || 0} produk terhubung</span>
                  </div>
                  {hasPromo && (
                    <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">local_offer</span>
                      {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `Promo`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {!isLoading && services.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant bg-white rounded-2xl border border-outline-variant/20">
              Tidak ada layanan yang cocok dengan "{search}"
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="col-span-12 lg:col-span-7">
          {selected ? (
            <div className="glass-card ambient-shadow rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-primary/5 p-6 border-b border-outline-variant/30 flex justify-between items-start">
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold text-primary mb-1">{selected.name}</h3>
                  <p className="font-body-sm font-mono text-on-surface-variant flex items-center gap-2">
                    ID: {selected.id}
                  </p>
                </div>
                <div className="text-right bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm">
                  {selected.promotions?.[0]?.isActive ? (
                    <>
                      <p className="text-[12px] text-on-surface-variant uppercase tracking-wider mb-0.5 font-bold">Harga Promo</p>
                      <p className="text-[20px] font-bold text-green-600 leading-none mb-1">{formatCurrency(calculateFinalPrice(selected))}</p>
                      <p className="text-[12px] text-on-surface-variant line-through">{formatCurrency(Number(selected.basePrice))}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[12px] text-on-surface-variant uppercase tracking-wider mb-0.5 font-bold">Harga Normal</p>
                      <p className="text-[20px] font-bold text-primary leading-none">{formatCurrency(Number(selected.basePrice))}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">spa</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body-md font-bold text-on-surface">Produk & Obat Terhubung</p>
                      <p className="text-[11px] text-on-surface-variant">Otomatis terpotong dari stok saat layanan dilakukan</p>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-outline-variant/30 pt-4 space-y-3">
                    {selected.linkedProducts?.length > 0 ? selected.linkedProducts.map((link: any, idx: number) => {
                      const prod = link.product;
                      const stockStatus = prod.stockStatus;
                      const stockColor = stockStatus === 'IN_STOCK' ? 'text-green-600 bg-green-100' :
                                         stockStatus === 'LOW_STOCK' ? 'text-orange-600 bg-orange-100' :
                                         stockStatus === 'OUT_OF_STOCK' ? 'text-red-600 bg-red-100' :
                                         'text-on-surface-variant bg-surface-container';
                      return (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-outline-variant/20 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-body-md font-bold text-on-surface">{prod.name}</p>
                            <p className="text-[11px] text-on-surface-variant">{link.description || 'Tidak ada deskripsi'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <span className="text-[10px] uppercase text-outline-variant tracking-wider block">Jml/Pakai</span>
                              <span className="font-bold text-on-surface text-[16px]">x{link.defaultQty}</span>
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${stockColor}`}>
                              {prod.stock} tersisa
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-center text-on-surface-variant text-[12px] py-4">Belum ada produk yang dipetakan ke layanan ini.</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 py-3 bg-primary-container text-primary rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-primary/20 transition-all shadow-sm"
                    onClick={() => openEditModal(selected)}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Layanan & Promo
                  </button>
                  <button
                    className="flex-1 py-3 bg-error-container text-error rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-error/20 transition-all shadow-sm"
                    onClick={() => handleDelete(selected.id)}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Hapus Layanan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card ambient-shadow rounded-2xl p-12 text-center sticky top-24">
              <span className="material-symbols-outlined text-[64px] text-outline-variant/40">account_tree</span>
              <p className="font-headline-sm text-headline-sm text-on-surface mt-4 mb-2">Pilih Layanan</p>
              <p className="font-body-md text-on-surface-variant">Pilih layanan dari daftar untuk melihat detail harga, promo, dan pemetaan produk.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD Layanan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">{editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h3>
              <button className="text-on-surface-variant hover:text-error transition-colors" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nama Layanan</label>
                <input 
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., Facial Acne Treatment" 
                />
              </div>
              
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Harga Dasar (Rp)</label>
                <input 
                  type="number"
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: e.target.value })} 
                  placeholder="e.g., 150000" 
                />
              </div>

              <div className="pt-4 border-t border-outline-variant/30 mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-label-lg font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">local_offer</span>
                      Aktifkan Promo Khusus
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">Terapkan diskon spesial untuk layanan ini</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.promoActive}
                      onChange={(e) => setFormData({ ...formData, promoActive: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {formData.promoActive && (
                  <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Tipe Diskon</label>
                      <select 
                        className="w-full py-2.5 px-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px]"
                        value={formData.promoType}
                        onChange={(e) => setFormData({ ...formData, promoType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                      >
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Nilai Diskon</label>
                      <input 
                        type="number"
                        className="w-full py-2.5 px-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[14px]" 
                        value={formData.promoValue} 
                        onChange={e => setFormData({ ...formData, promoValue: e.target.value })} 
                        placeholder={formData.promoType === 'PERCENTAGE' ? "e.g., 20" : "e.g., 50000"} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              className="w-full bg-primary text-white py-3.5 rounded-xl font-headline-sm text-[15px] hover:opacity-95 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-4" 
              onClick={handleSave}
            >
              <span className="material-symbols-outlined text-[20px]">{editingId ? 'save' : 'add_box'}</span>
              {editingId ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
