"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  title: string;
  description: string | null;
  price_paise: number | null;
  price_label: string | null;
  position: number;
  hidden: boolean;
};

type FormState = {
  title: string;
  description: string;
  price_paise: string;
  price_label: string;
};

const EMPTY: FormState = { title: "", description: "", price_paise: "", price_label: "" };

export default function CatalogueClient({ businessId, items: initial }: { businessId: string; items: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() { setEditId(null); setForm(EMPTY); setShowForm(true); setError(""); }
  function openEdit(item: Item) {
    setEditId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      price_paise: item.price_paise != null ? String(item.price_paise / 100) : "",
      price_label: item.price_label ?? "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");

    const payload = {
      business_id: businessId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      price_paise: form.price_paise ? Math.round(parseFloat(form.price_paise) * 100) : null,
      price_label: form.price_label.trim() || null,
    };

    const res = await fetch("/api/catalogue", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { ...payload, id: editId } : payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    router.refresh();
    setShowForm(false);
    setSaving(false);

    // Refresh list
    const listRes = await fetch(`/api/catalogue?business_id=${businessId}`);
    if (listRes.ok) setItems((await listRes.json()).items ?? []);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch("/api/catalogue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function toggleHidden(item: Item) {
    await fetch("/api/catalogue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, business_id: businessId, hidden: !item.hidden }),
    });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, hidden: !i.hidden } : i));
  }

  return (
    <div>
      {/* Add item button */}
      {!showForm && (
        <button
          onClick={openNew}
          className="w-full h-12 rounded-xl border-2 border-dashed border-[#0B5D63] text-sm font-medium text-[#0B5D63] mb-4 transition-colors hover:bg-[#E8F2F2]"
        >
          + Add item
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] mb-4">
          <h2 className="font-semibold text-sm text-[#15201E] mb-4">{editId ? "Edit item" : "New item"}</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#15201E] mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Logo design, 1-hour consultation"
                className="w-full h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#15201E] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#15201E] mb-1">Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.price_paise}
                  onChange={e => setForm(f => ({ ...f, price_paise: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#15201E] mb-1">Or price label</label>
                <input
                  value={form.price_label}
                  onChange={e => setForm(f => ({ ...f, price_label: e.target.value }))}
                  placeholder="e.g. From ₹10,000"
                  className="w-full h-10 px-3 rounded-xl border border-[#E5E7E6] text-sm outline-none focus:border-[#0B5D63]"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 h-10 rounded-xl border border-[#E5E7E6] text-sm text-[#4F5B59]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-10 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                style={{ background: "#0B5D63" }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items list */}
      {items.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">🛍</p>
          <p className="text-sm text-[#4F5B59]">No items yet. Add your services, products or packages.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 border border-[#E5E7E6] flex items-start gap-3 ${item.hidden ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#15201E]">{item.title}</p>
                {item.description && <p className="text-xs text-[#4F5B59] mt-0.5 line-clamp-1">{item.description}</p>}
                <p className="text-xs font-medium text-[#0B5D63] mt-1">
                  {item.price_paise
                    ? "₹" + (item.price_paise / 100).toLocaleString("en-IN")
                    : item.price_label ?? "Price on enquiry"}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleHidden(item)}
                  className="text-xs px-2 py-1 rounded-lg border border-[#E5E7E6] text-[#4F5B59]"
                  title={item.hidden ? "Show" : "Hide"}
                >
                  {item.hidden ? "Show" : "Hide"}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="text-xs px-2 py-1 rounded-lg border border-[#E5E7E6] text-[#4F5B59]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs px-2 py-1 rounded-lg border border-[#E5E7E6] text-red-500"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
