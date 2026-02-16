import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function SaleModal({ open, onClose }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    address: "",
    category: "edible",
    image: "",
    notes: "",
  });

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      setForm({
        title: "",
        price: "",
        address: "",
        category: "edible",
        image: "",
        notes: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const submitSale = async (e) => {
    e.preventDefault();

    if (!user) {
      addToast("Please log in to list an item for sale.", "error");
      return;
    }

    if (!form.title || !form.price || !form.address) {
      addToast("Please fill all required fields.", "error");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "food_listings"), {
        userId: user.uid,
        type: "sale",
        title: form.title,
        price: Number(form.price),
        address: form.address,
        category: form.category,
        image: form.image || null,
        notes: form.notes,
        status: "available",
        createdAt: serverTimestamp(),
      });

      addToast("Sale listing created!", "success");
      onClose();

    } catch (err) {
      addToast("Error posting sale item", "error");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">List Item for Sale</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-700 hover:text-gray-900" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={submitSale} className="space-y-4">

          {/* TITLE */}
          <input
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Item Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {/* PRICE */}
          <input
            type="number"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Price (₹)"
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          {/* ADDRESS */}
          <input
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Pickup Address"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          {/* CATEGORY */}
          <select
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="edible">Edible</option>
            <option value="non-edible">Non-Edible</option>
          </select>

          {/* IMAGE */}
          <input
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          {/* NOTES */}
          <textarea
            rows="3"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Additional notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          ></textarea>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold"
          >
            {loading ? "Posting..." : "Post Item"}
          </button>
        </form>

      </div>
    </div>
  );
}
