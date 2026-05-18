import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { 
    Search, 
    Filter, 
    Edit2, 
    Shield, 
    User as UserIcon, 
    Store, 
    Monitor,
    X,
    CheckCircle2,
    AlertCircle,
    Plus
} from 'lucide-react';
import { User, Role } from '../../types';

interface UsersProps {
    users: {
        data: User[];
        links: any[];
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
    merchants: { id: number, name: string }[];
}

export default function Users({ users, filters, merchants }: UsersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const editForm = useForm({
        role: '' as Role,
        is_active: true,
        merchant_id: '' as string | number,
    });

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'customer' as Role,
        merchant_id: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/super-admin/users', { search, role: selectedRole }, { preserveState: true });
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        editForm.setData({
            role: user.role,
            is_active: user.is_active,
            merchant_id: user.merchant_id || '',
        });
    };

    const handleSubmitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        
        editForm.post(route('superadmin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            }
        });
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('superadmin.users.store'), {
            onSuccess: () => {
                setIsCreating(false);
                createForm.reset();
            }
        });
    };

    const getRoleBadge = (role: Role) => {
        switch (role) {
            case 'super_admin': return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase flex items-center w-fit"><Shield size={10} className="mr-1"/> Super Admin</span>;
            case 'admin': return <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] font-black uppercase flex items-center w-fit"><Store size={10} className="mr-1"/> Admin</span>;
            case 'kasir': return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black uppercase flex items-center w-fit"><Monitor size={10} className="mr-1"/> Kasir</span>;
            default: return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black uppercase flex items-center w-fit"><UserIcon size={10} className="mr-1"/> Customer</span>;
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-poppins font-bold text-charcoal">Users Control</h2>
                        <p className="text-gray-500 text-sm mt-1">Total {users.total} pengguna terdaftar di sistem.</p>
                    </div>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#00C48C] text-white font-black rounded-2xl shadow-lg shadow-[#00C48C]/20 hover:bg-[#00ab7a] transition-all transform active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span className="text-xs uppercase tracking-widest">Tambah User</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex-1 flex items-center space-x-3 w-full">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari Nama atau Email..."
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-[#1A1A1A] text-white font-bold rounded-xl text-sm hover:bg-black transition-all">
                            Cari
                        </button>
                    </form>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#00C48C]/20 outline-none appearance-none"
                                value={selectedRole}
                                onChange={e => setSelectedRole(e.target.value)}
                            >
                                <option value="">Semua Role</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="kasir">Kasir</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">Pengguna</th>
                                    <th className="px-8 py-5">Role</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5">Terdaftar</th>
                                    <th className="px-8 py-5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.data.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-charcoal">{user.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                        {user.merchant && (
                                                            <>
                                                                <span className="text-[10px] text-gray-300">•</span>
                                                                <span className="text-[10px] font-bold text-[#00C48C] flex items-center bg-[#F0FAF6] px-1.5 py-0.5 rounded">
                                                                    <Store size={8} className="mr-1"/> {user.merchant.name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                {user.is_active ? (
                                                    <span className="flex items-center text-[#00C48C] text-[10px] font-bold uppercase"><CheckCircle2 size={14} className="mr-1"/> Aktif</span>
                                                ) : (
                                                    <span className="flex items-center text-red-400 text-[10px] font-bold uppercase"><AlertCircle size={14} className="mr-1"/> Nonaktif</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-xs text-gray-500 font-medium">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-gray-400 hover:text-[#00C48C] hover:bg-[#F0FAF6] rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-poppins font-bold text-charcoal">Edit User Privileges</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitUpdate} className="p-8 space-y-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                    {editingUser.avatar_url ? <img src={editingUser.avatar_url} className="w-full h-full object-cover" /> : editingUser.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal">{editingUser.name}</p>
                                    <p className="text-xs text-gray-400">{editingUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign Role</label>
                                <select 
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                    value={editForm.data.role}
                                    onChange={e => editForm.setData('role', e.target.value as Role)}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="kasir">Kasir</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            {(editForm.data.role === 'admin' || editForm.data.role === 'kasir') && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign Merchant</label>
                                    <select 
                                        className="w-full px-4 py-4 bg-[#F0FAF6] border-none rounded-2xl text-sm font-bold text-[#2D6A4F] focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={editForm.data.merchant_id}
                                        onChange={e => editForm.setData('merchant_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Merchant...</option>
                                        {merchants.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1 italic">* Wajib untuk Admin dan Kasir agar dapat mengakses data merchant.</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</label>
                                <div className="flex items-center space-x-4">
                                    <button 
                                        type="button"
                                        onClick={() => editForm.setData('is_active', true)}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${editForm.data.is_active ? 'bg-[#F0FAF6] border-[#00C48C] text-[#00C48C]' : 'bg-white border-gray-100 text-gray-400'}`}
                                    >
                                        AKTIFF
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => editForm.setData('is_active', false)}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${!editForm.data.is_active ? 'bg-red-50 border-red-400 text-red-500' : 'bg-white border-gray-100 text-gray-400'}`}
                                    >
                                        NONAKTIF
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={editForm.processing}
                                className="w-full py-4 bg-[#1A1A1A] text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {editForm.processing ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#00C48C] rounded-xl flex items-center justify-center shadow-lg shadow-[#00C48C]/20">
                                    <Plus className="text-white" size={20} strokeWidth={3} />
                                </div>
                                <h3 className="font-poppins font-bold text-charcoal">Tambah Pengguna Baru</h3>
                            </div>
                            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitCreate} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="John Doe"
                                        value={createForm.data.name}
                                        onChange={e => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="john@example.com"
                                        value={createForm.data.email}
                                        onChange={e => createForm.setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        placeholder="••••••••"
                                        value={createForm.data.password}
                                        onChange={e => createForm.setData('password', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Role</label>
                                    <select 
                                        className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={createForm.data.role}
                                        onChange={e => createForm.setData('role', e.target.value as Role)}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="kasir">Kasir</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                            </div>

                            {(createForm.data.role === 'admin' || createForm.data.role === 'kasir') && (
                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign ke Merchant</label>
                                    <select 
                                        className="w-full px-5 py-3.5 bg-[#F0FAF6] border-none rounded-2xl text-sm font-bold text-[#2D6A4F] focus:ring-2 focus:ring-[#00C48C]/20 outline-none"
                                        value={createForm.data.merchant_id}
                                        onChange={e => createForm.setData('merchant_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Pilih Merchant...</option>
                                        {merchants.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={createForm.processing}
                                className="w-full py-4 bg-[#1A1A1A] text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-4 uppercase tracking-widest text-xs"
                            >
                                {createForm.processing ? 'Sedang Membuat...' : 'Buat User Sekarang'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
