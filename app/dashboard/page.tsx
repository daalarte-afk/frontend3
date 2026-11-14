"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { clearTokens, isAuthenticated } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface Position {
    id: number;
    position_code: string;
    position_name: string;
    created_at?: string;
    createdAt?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const [positionCode, setPositionCode] = useState("");
    const [positionName, setPositionName] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push(CONFIG.ROUTES.LOGIN);
            return;
        }
        fetchPositions();
    }, [router]);

    const fetchPositions = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiClient<Position[]>(CONFIG.ENDPOINTS.POSITIONS, {
                method: "GET",
                requiresAuth: true,
            });
            setPositions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || "Failed to fetch positions.");
        } finally {
            setLoading(false);
        }
    };

    const handleReadSingle = async (id: number) => {
        setError("");
        setIsCreating(false);
        setEditingPosition(null);
        try {
            const data = await apiClient<Position>(`${CONFIG.ENDPOINTS.POSITIONS}/${id}`, {
                method: "GET",
                requiresAuth: true,
            });
            setSelectedPosition(Array.isArray(data) ? data[0] : data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch position details.");
        }
    };

    const openCreateForm = () => {
        setSelectedPosition(null);
        setEditingPosition(null);
        setPositionCode("");
        setPositionName("");
        setIsCreating(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await apiClient(CONFIG.ENDPOINTS.POSITIONS, {
                method: "POST",
                requiresAuth: true,
                body: JSON.stringify({ position_code: positionCode, position_name: positionName }),
            });
            setIsCreating(false);
            setPositionCode("");
            setPositionName("");
            await fetchPositions();
        } catch (err: any) {
            setError(err.message || "Failed to create position.");
        } finally {
            setSubmitting(false);
        }
    };

    const openUpdateForm = (pos: Position) => {
        setSelectedPosition(null);
        setIsCreating(false);
        setEditingPosition(pos);
        setPositionCode(pos.position_code);
        setPositionName(pos.position_name);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPosition) return;
        setSubmitting(true);
        setError("");
        try {
            await apiClient(`${CONFIG.ENDPOINTS.POSITIONS}/${editingPosition.id}`, {
                method: "PUT",
                requiresAuth: true,
                body: JSON.stringify({ position_code: positionCode, position_name: positionName }),
            });
            setEditingPosition(null);
            setPositionCode("");
            setPositionName("");
            await fetchPositions();
        } catch (err: any) {
            setError(err.message || "Failed to update position.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Are you sure you want to delete Position #${id}?`)) return;
        setError("");
        try {
            await apiClient(`${CONFIG.ENDPOINTS.POSITIONS}/${id}`, {
                method: "DELETE",
                requiresAuth: true,
            });
            if (selectedPosition?.id === id) setSelectedPosition(null);
            if (editingPosition?.id === id) setEditingPosition(null);
            await fetchPositions();
        } catch (err: any) {
            setError(err.message || "Failed to delete position.");
        }
    };

    const handleLogout = () => {
        clearTokens();
        router.push(CONFIG.ROUTES.LOGIN);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-gray-900">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">Manage organization positions</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                {isCreating && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold">Create New Position</h2>
                                <p className="text-xs text-gray-500">Fill in the details to add a new position.</p>
                            </div>
                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Position Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Pres"
                                        value={positionCode}
                                        onChange={(e) => setPositionCode(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Position Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. President"
                                        value={positionName}
                                        onChange={(e) => setPositionName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Position"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {selectedPosition && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold">Position Details (#{selectedPosition.id})</h2>
                                <p className="text-xs text-gray-500">Fetched directly from GET /positions/{selectedPosition.id}</p>
                            </div>
                            <button onClick={() => setSelectedPosition(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                                ×
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Position ID</p>
                                <p className="font-medium">{selectedPosition.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Code</p>
                                <p className="font-medium">{selectedPosition.position_code}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Name</p>
                                <p className="font-medium">{selectedPosition.position_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="font-medium">{formatDate(selectedPosition.created_at || selectedPosition.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {editingPosition && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold">Update Position #{editingPosition.id}</h2>
                                <p className="text-xs text-gray-500">Modify the position code and name below.</p>
                            </div>
                            <button onClick={() => setEditingPosition(null)} className="text-gray-400 hover:text-gray-600 text-lg font-bold">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Position Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={positionCode}
                                        onChange={(e) => setPositionCode(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Position Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={positionName}
                                        onChange={(e) => setPositionName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingPosition(null)}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {submitting ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 flex items-center justify-between border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-semibold">Positions ({positions.length})</h2>
                            <p className="text-xs text-gray-500">A list of all positions in your database.</p>
                        </div>
                        <button
                            onClick={openCreateForm}
                            className="px-4 py-2 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                        >
                            + Create Position
                        </button>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Code</th>
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Created At</th>
                                <th className="py-3 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Loading positions...
                                    </td>
                                </tr>
                            ) : positions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        No positions found. Click &quot;+ Create Position&quot; to add one.
                                    </td>
                                </tr>
                            ) : (
                                positions.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 font-medium">{pos.id}</td>
                                        <td className="py-3 px-6">{pos.position_code}</td>
                                        <td className="py-3 px-6">{pos.position_name}</td>
                                        <td className="py-3 px-6 text-gray-500">
                                            {formatDate(pos.created_at || pos.createdAt)}
                                        </td>
                                        <td className="py-3 px-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleReadSingle(pos.id)}
                                                className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                Read
                                            </button>
                                            <button
                                                onClick={() => openUpdateForm(pos)}
                                                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pos.id)}
                                                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
