import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { 
    Search, 
    Plus, 
    MapPin, 
    Store, 
    Phone, 
    Edit2, 
    Trash2, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Navigation
} from 'lucide-react';
import { Branch, Merchant } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BranchesProps {
    branches: {
        data: (Branch & { merchant: Merchant })[];
        links: any[];
        total: number;
    };
    merchants: Merchant[];
    filters: {
        search?: string;
    };
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Branches({ branches, merchants, filters }: BranchesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);

    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        merchant_id: '',
        name: '',
        address: '',
        phone: '',
        is_active: true,
        lat: '',
        lng: '',
    });

    const mapRef = React.useRef<HTMLDivElement>(null);
    const leafletMap = React.useRef<L.Map | null>(null);
    const markerRef = React.useRef<L.Marker | null>(null);
    const reverseGeocodeRef = React.useRef<(lat: number, lng: number) => void>(undefined);

    reverseGeocodeRef.current = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'Ewwon-Coco-Admin-App/1.0'
                    }
                }
            );
            const result = await response.json();
            if (result && result.display_name) {
                setData((prev: any) => ({
                    ...prev,
                    lat: lat.toFixed(8),
                    lng: lng.toFixed(8),
                    address: result.display_name
                }));
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    };

    React.useEffect(() => {
        if (!isModalOpen || !mapRef.current) return;

        // Default coordinates
        const latVal = parseFloat(data.lat) || -6.2088;
        const lngVal = parseFloat(data.lng) || 106.8456;

        // Fix for default marker icon issues in Leaflet with Vite
        const DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        // Initialize map
        leafletMap.current = L.map(mapRef.current, {
            center: [latVal, lngVal],
            zoom: 14,
            zoomControl: true,
            attributionControl: false
        });

        // Add OSM tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(leafletMap.current);

        // Add draggable marker
        markerRef.current = L.marker([latVal, lngVal], {
            draggable: true
        }).addTo(leafletMap.current);

        // Update coordinates on drag end
        markerRef.current.on('dragend', (event) => {
            const marker = event.target;
            const position = marker.getLatLng();
            setData((prev: any) => ({
                ...prev,
                lat: position.lat.toFixed(8),
                lng: position.lng.toFixed(8)
            }));
            reverseGeocodeRef.current?.(position.lat, position.lng);
        });

        // Update coordinates on map click
        leafletMap.current.on('click', (event) => {
            const position = event.latlng;
            markerRef.current?.setLatLng(position);
            setData((prev: any) => ({
                ...prev,
                lat: position.lat.toFixed(8),
                lng: position.lng.toFixed(8)
            }));
            reverseGeocodeRef.current?.(position.lat, position.lng);
        });

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, [isModalOpen]);

    // Sync manual coordinate inputs to map marker position
    React.useEffect(() => {
        if (!leafletMap.current || !markerRef.current) return;

        const latVal = parseFloat(data.lat);
        const lngVal = parseFloat(data.lng);

        if (!isNaN(latVal) && !isNaN(lngVal)) {
            const currentPosition = markerRef.current.getLatLng();
            if (currentPosition.lat.toFixed(8) !== latVal.toFixed(8) || currentPosition.lng.toFixed(8) !== lngVal.toFixed(8)) {
                markerRef.current.setLatLng([latVal, lngVal]);
                leafletMap.current.setView([latVal, lngVal]);
            }
        }
    }, [data.lat, data.lng]);

    const handleSearchAddress = async () => {
        if (!data.address.trim()) return;
        setIsSearchingAddress(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.address)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'Ewwon-Coco-Admin-App/1.0'
                    }
                }
            );
            const results = await response.json();
            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                const latVal = parseFloat(lat);
                const lngVal = parseFloat(lon);
                setData((prev: any) => ({
                    ...prev,
                    lat: latVal.toFixed(8),
                    lng: lngVal.toFixed(8)
                }));
            } else {
                alert('Alamat tidak ditemukan di peta. Coba perjelas nama jalan, kota, atau daerah.');
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
            alert('Terjadi kesalahan saat mencari alamat. Silakan coba lagi.');
        } finally {
            setIsSearchingAddress(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/super-admin/branches', { search }, { preserveState: true });
    };

    const handleOpenModal = (branch: any = null) => {
        if (branch) {
            setEditingBranch(branch);
            setData({
                merchant_id: branch.merchant_id.toString(),
                name: branch.name,
                address: branch.address,
                phone: branch.phone,
                is_active: branch.is_active,
                lat: branch.lat || '',
                lng: branch.lng || '',
            });
        } else {
            setEditingBranch(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBranch) {
            post(route('superadmin.branches.update', editingBranch.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toastSuccess('Cabang berhasil diperbarui!');
                }
            });
        } else {
            post(route('superadmin.branches.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toastSuccess('Cabang baru berhasil dibuat!');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        confirmAction(
            'Hapus Cabang?',
            'Apakah Anda yakin ingin menghapus cabang ini?',
            'Ya, Hapus'
        ).then((result) => {
            if (result.isConfirmed) {
                destroy(route('superadmin.branches.destroy', id), {
                    onSuccess: () => {
                        toastSuccess('Cabang berhasil dihapus!');
                    }
                });
            }
        });
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Cabang Global" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold text-charcoal">Global Branch Network</h2>
                        <p className="text-gray-500 text-sm mt-1">Kelola seluruh jaringan outlet di bawah ekosistem Ewwon Coco.</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3 bg-[#00C48C] text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-[#00C48C]/20 hover:bg-[#00ab7a] transition-all"
                    >
                        <Plus size={20} />
                        <span>Tambah Cabang</span>
                    </button>
                </div>


                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Cari Nama Cabang..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Nama Cabang</th>
                                <th className="px-8 py-5">Merchant Parent</th>
                                <th className="px-8 py-5">Kontak & Lokasi</th>
                                <th className="px-8 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {branches.data.map(branch => (
                                <tr key={branch.id} className="hover:bg-gray-50 transition-all group">
                                    <td className="px-8 py-5 font-bold text-charcoal text-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F0FAF6] text-[#00C48C] flex items-center justify-center">
                                                <MapPin size={16} />
                                            </div>
                                            <span>{branch.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2">
                                            <Store size={14} className="text-gray-300" />
                                            <span className="text-xs font-bold text-gray-500 uppercase">{branch.merchant?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 space-y-1">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Phone size={12} className="mr-2" />
                                            {branch.phone}
                                        </div>
                                        <div className="flex items-center text-[10px] text-gray-400">
                                            <Navigation size={12} className="mr-2" />
                                            {branch.address}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {branch.is_active ? (
                                            <span className="text-[#00C48C] text-[10px] font-black uppercase tracking-widest">Aktif</span>
                                        ) : (
                                            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Tutup</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenModal(branch)}
                                                className="p-2 text-gray-400 hover:text-blue-500 transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(branch.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Branch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-poppins font-bold text-charcoal">{editingBranch ? 'Update Cabang' : 'Registrasi Cabang Baru'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[78vh] overflow-y-auto">
                            {!editingBranch && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Merchant</label>
                                    <select 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.merchant_id}
                                        onChange={e => setData('merchant_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Toko --</option>
                                        {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Cabang</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telepon Cabang</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
                                    <button
                                        type="button"
                                        onClick={handleSearchAddress}
                                        disabled={isSearchingAddress || !data.address.trim()}
                                        className="px-3 py-1.5 bg-[#F0FAF6] hover:bg-[#00C48C] text-[#00C48C] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSearchingAddress ? 'Mencari...' : 'Cari di Peta'}
                                    </button>
                                </div>
                                <textarea 
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none h-24"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    required
                                />
                            </div>

                            {/* GPS Coordinates & Picker for Branch */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Koordinat GPS Cabang</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition((position) => {
                                                    setData((prev: any) => ({
                                                        ...prev,
                                                        lat: position.coords.latitude.toFixed(8),
                                                        lng: position.coords.longitude.toFixed(8)
                                                    }));
                                                }, (error) => {
                                                    alert('Gagal mendeteksi lokasi otomatis. Silakan masukkan koordinat secara manual.');
                                                });
                                            } else {
                                                alert('Geolocation tidak didukung oleh browser Anda.');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-[#F0FAF6] hover:bg-[#00C48C] text-[#00C48C] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        Deteksi GPS Otomatis
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-gray-400">Latitude (Lintang)</span>
                                        <input 
                                            type="text"
                                            value={data.lat}
                                            onChange={e => setData('lat', e.target.value)}
                                            placeholder="-6.20880000"
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold text-gray-400">Longitude (Bujur)</span>
                                        <input 
                                            type="text"
                                            value={data.lng}
                                            onChange={e => setData('lng', e.target.value)}
                                            placeholder="106.84560000"
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Interactive OpenStreetMap (Leaflet) Picker */}
                                <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner relative z-10">
                                    <div ref={mapRef} className="w-full h-full" />
                                </div>

                                <p className="text-[9px] text-[#00C48C] font-semibold bg-[#F0FAF6] p-2.5 rounded-lg">
                                    💡 Tip: Koordinat GPS ini wajib diisi dengan akurat agar peta jarak pengantaran mobile apps berfungsi 100% normal. Klik di peta atau geser pin merah untuk menandai lokasi.
                                </p>
                            </div>

                            {editingBranch && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Operasional</label>
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            type="button"
                                            onClick={() => setData('is_active', true)}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${data.is_active ? 'bg-[#F0FAF6] border-[#00C48C] text-[#00C48C]' : 'bg-white border-gray-100 text-gray-400'}`}
                                        >
                                            BUKA
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setData('is_active', false)}
                                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${!data.is_active ? 'bg-red-50 border-red-400 text-red-500' : 'bg-white border-gray-100 text-gray-400'}`}
                                        >
                                            TUTUP
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {editingBranch ? 'Update Cabang' : 'Simpan Cabang Baru'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
