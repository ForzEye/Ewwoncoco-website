import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../../Layouts/SuperAdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Mail, 
    MessageSquare, 
    RefreshCcw,
    AlertCircle,
    Terminal,
    Trash2,
    ShieldAlert
} from 'lucide-react';

interface OtpLog {
    id: number;
    identifier: string;
    type: string;
    channel: string;
    status: 'pending' | 'sent' | 'failed';
    error_message: string | null;
    is_used: boolean;
    created_at: string;
}

interface ErrorLog {
    id: number;
    timestamp: string;
    env: string;
    level: string;
    message: string;
}

import { confirmAction, toastSuccess } from '@/lib/swal';

export default function Monitoring() {
    const [activeTab, setActiveTab] = useState<'otp' | 'errors'>('otp');
    const [logs, setLogs] = useState<OtpLog[]>([]);
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchLogs = async () => {
        try {
            const response = await axios.get('/super-admin/api/monitoring/otp-logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch OTP logs', error);
        }
    };

    const fetchErrorLogs = async () => {
        try {
            const response = await axios.get('/super-admin/api/monitoring/error-logs');
            setErrorLogs(response.data);
        } catch (error) {
            console.error('Failed to fetch error logs', error);
        }
    };

    const refreshAll = async () => {
        setIsLoading(true);
        await Promise.all([fetchLogs(), fetchErrorLogs()]);
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    const handleClearLogs = async () => {
        confirmAction(
            'Hapus Log Error?',
            'Apakah Anda yakin ingin menghapus semua log error Laravel?',
            'Ya, Hapus'
        ).then(async (result) => {
            if (result.isConfirmed) {
                setIsClearing(true);
                try {
                    await axios.post('/super-admin/api/monitoring/error-logs/clear');
                    setErrorLogs([]);
                    setLastUpdated(new Date());
                    toastSuccess('Log error Laravel berhasil dibersihkan!');
                } catch (error) {
                    console.error('Failed to clear error logs', error);
                } finally {
                    setIsClearing(false);
                }
            }
        });
    };

    useEffect(() => {
        refreshAll();
        const interval = setInterval(() => {
            fetchLogs();
            fetchErrorLogs();
            setLastUpdated(new Date());
        }, 5000); // Polling every 5 seconds for "real-time" feel
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={14} /> Terkirim
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle size={14} /> Gagal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock size={14} /> Pending
                    </span>
                );
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="System Monitoring" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('otp')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    activeTab === 'otp'
                                        ? 'bg-amber-500 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                OTP & Registration Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('errors')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    activeTab === 'errors'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                Laravel Error Logs ({errorLogs.length})
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            {activeTab === 'errors' && errorLogs.length > 0 && (
                                <button
                                    onClick={handleClearLogs}
                                    disabled={isClearing}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    Clear Laravel Logs
                                </button>
                            )}
                            <div className="flex items-center gap-2 text-xs font-bold text-[#B5AFA6] uppercase tracking-widest">
                                <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                                Auto update 5s
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total OTP Terkirim</p>
                                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                                        {logs.filter(l => l.status === 'sent').length}
                                    </h3>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Activity size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {activeTab === 'otp' ? 'Gagal Kirim OTP' : 'Total Error Logs'}
                                    </p>
                                    <h3 className={`text-2xl font-bold mt-1 ${activeTab === 'otp' ? 'text-red-500' : 'text-rose-600'}`}>
                                        {activeTab === 'otp' 
                                            ? logs.filter(l => l.status === 'failed').length 
                                            : errorLogs.length
                                        }
                                    </h3>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-red-600">
                                    {activeTab === 'otp' ? <AlertCircle size={24} /> : <ShieldAlert size={24} />}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Update Terakhir</p>
                                    <h3 className="text-lg font-bold text-gray-700 mt-1">
                                        {lastUpdated.toLocaleTimeString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Clock size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    {activeTab === 'otp' ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-gray-800">Log Pengiriman OTP & Registrasi</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Identitas</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600">{log.created_at}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{log.identifier}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        {log.channel === 'email' ? <Mail size={16} /> : <MessageSquare size={16} />}
                                                        {log.channel.toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{log.type}</td>
                                                <td className="px-6 py-4">{getStatusBadge(log.status)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    {log.status === 'failed' ? (
                                                        <span className="text-red-500 font-medium">{log.error_message}</span>
                                                    ) : log.is_used ? (
                                                        <span className="text-emerald-600 font-medium">Sudah Verifikasi</span>
                                                    ) : (
                                                        <span className="text-gray-400">Menunggu Input User</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    Belum ada data pengiriman hari ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Laravel Application logs</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="w-1/6 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="w-1/12 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                                            <th className="w-1/12 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Env</th>
                                            <th className="w-2/3 px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-mono text-xs">
                                        {errorLogs.map((error) => (
                                            <tr key={error.id} className="hover:bg-red-50/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{error.timestamp}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        error.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                                                        error.level === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {error.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{error.env}</td>
                                                <td className="px-6 py-4 text-gray-800 break-words leading-relaxed max-w-0" title={error.message}>
                                                    <div className="max-h-24 overflow-y-auto whitespace-pre-wrap">
                                                        {error.message}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {errorLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-sans text-sm">
                                                    Log bersih! Tidak ada error yang terdeteksi di laravel.log.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
