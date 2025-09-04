import React, { useEffect, useMemo, useState } from 'react';
import { productsAPI, extractErrorMessage } from '../../api/api';

type ProductForm = {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number | string;
  stockQuantity: number | string;
  imageUrl: string;
};

const emptyForm: ProductForm = {
  name: '', description: '', category: '',
  price: 0, stockQuantity: 0, imageUrl: ''
};

const AdminProducts: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(undefined);
    try {
      const data = await productsAPI.getAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name ?? '',
      description: p.description ?? '',
      category: p.category ?? '',
      price: p.price ?? 0,
      stockQuantity: p.stockQuantity ?? 0,
      imageUrl: p.imageUrl ?? ''
    });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true); setError(undefined);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl.trim()
      };
      if (!payload.name) throw new Error('Name is required');
      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }
      await load();
      cancelEdit();
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      await load();
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  };

  const importMock = async () => {
    // Optional: uncomment + put your mock list here, or call the admin seed endpoint if backend provides it
    try {
      setSaving(true);
      await fetch('/api/admin-seed/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify(MY_MOCK_PRODUCTS)
      });
      await load();
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally { setSaving(false); }
  };

  const isEditing = useMemo(() => !!editingId, [editingId]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin · Products</h1>
        <div className="flex gap-3">
          <button onClick={load} disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Refresh</button>
          <button onClick={() => { cancelEdit(); setEditingId(null); }}
            className="px-4 py-2 border rounded hover:bg-gray-50">New</button>
          <button onClick={importMock} disabled={saving}
            className="px-4 py-2 border rounded hover:bg-gray-50">Import mock</button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded border border-red-300 text-red-700">{error}</div>}

      {/* Form */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="name" value={form.name} onChange={onChange} placeholder="Product name" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input name="category" value={form.category} onChange={onChange} placeholder="Product category" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} placeholder="0.00" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
          <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={onChange} placeholder="0" className="w-full border rounded p-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://example.com/image.jpg" className="w-full border rounded p-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Product description" className="w-full border rounded p-2" rows={3} />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button onClick={save} disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{isEditing ? 'Update' : 'Create'}</button>
          {isEditing && (
            <button onClick={cancelEdit} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  {p.imageUrl && <img src={p.imageUrl} className="w-16 h-16 object-cover rounded" />}
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">${Number(p.price).toFixed(2)}</td>
                <td className="p-3">{p.stockQuantity}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="px-3 py-1 border rounded hover:bg-gray-50">Edit</button>
                    <button onClick={() => del(p.id)} className="px-3 py-1 border rounded text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={6}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;