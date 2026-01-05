import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ExpiryTimer from "./ExpiryTimer";
import { MapPin } from "lucide-react";

export default function PublicListings() {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");       // donation | sale
  const [categoryFilter, setCategoryFilter] = useState("all"); // edible | non-edible | products

  const { user, authLoading } = useAuth();
  const { addToast } = useToast();

  const isNGO = user?.role === "ngo";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading listings...
      </div>
    );
  }

  useEffect(() => {
    const q = query(
      collection(db, "food_listings"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setItems(data);
    });

    return () => unsub();
  }, []);

  const claimItem = async (item) => {
    if (!isNGO) {
      addToast("Only NGOs can claim items", "error");
      return;
    }

    try {
      // 1. Update listing status
      await updateDoc(doc(db, "food_listings", item.id), {
        status: "claimed",
        claimedBy: user.uid,
        claimedAt: serverTimestamp(),
      });

      // 2. Notify the Donor
      if (item.userId) { // Ensure there is a donor ID
        console.log("Sending notification to:", item.userId);
        await addDoc(collection(db, "notifications"), {
          recipientId: item.userId,
          senderId: user.uid,
          senderName: user.displayName || user.email || "An NGO",
          senderEmail: user.email,
          itemId: item.id,
          itemName: item.title,
          message: `Your item "${item.title}" has been claimed by ${user.displayName || "an NGO"}.`,
          type: "claim",
          isRead: false,
          createdAt: serverTimestamp(),
        });
      } else {
        console.warn("No userId found on item, skipping notification");
      }

      addToast("Item claimed successfully & Donor notified", "success");
    } catch (error) {
      console.error("Claim error:", error);
      addToast("Failed to claim item", "error");
    }
  };

  /* 🔍 APPLY FILTERS */
  const filteredItems = items.filter((item) => {
    const typeMatch =
      typeFilter === "all" || item.type === typeFilter;

    const categoryMatch =
      categoryFilter === "all" || item.category === categoryFilter;

    return typeMatch && categoryMatch;
  });

  return (
    <section className="min-h-screen bg-white pt-28">
      <div className="page-container">

        {/* TITLE */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-orange-700">
            Public Listings
          </h2>
          <p className="text-gray-600 mt-2">
            Available food & items shared by users
          </p>
        </div>

        {/* 🔽 FILTERS (NEW) */}
        <div className="flex justify-center gap-4 mb-12">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Types</option>
            <option value="donation">Donation</option>
            <option value="sale">Sale</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Categories</option>
            <option value="edible">Edible</option>
            <option value="non-edible">Non-Edible</option>
            <option value="products">Products</option>
          </select>
        </div>

        {/* LISTINGS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-2xl shadow-sm p-5 bg-white"
            >
              <div className="h-40 bg-gray-100 rounded overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mt-3">{item.title}</h3>

              {/* NGO-only: Expiry Timer for AI-analyzed food */}
              {isNGO && item.aiAnalysis && item.preparationTime && (
                <div className="mt-2">
                  <ExpiryTimer
                    preparationTime={item.preparationTime}
                    riskLevel={item.aiAnalysis.riskLevel}
                  />
                </div>
              )}

              {item.quantity && (
                <p className="text-sm mt-1">
                  <b>Quantity:</b> {item.quantity}
                </p>
              )}

              {item.notes && (
                <p className="text-sm text-gray-600 mt-1">
                  <b>Notes:</b> {item.notes}
                </p>
              )}



              {/* Directions Button */}
              {(item.pickupAddress || (item.createdBy && item.createdBy.address)) && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    item.pickupAddress || item.createdBy.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition"
                >
                  <MapPin size={18} />
                  Get Directions
                </a>
              )}

              {isNGO && item.createdBy && (
                <div className="mt-4 bg-orange-50 p-4 rounded-lg text-sm">
                  <p><b>User:</b> {item.createdBy.name}</p>
                  <p><b>Email:</b> {item.createdBy.email}</p>
                  <p><b>Address:</b> {item.createdBy.address || "N/A"}</p>
                </div>
              )}

              {isNGO && item.status === "available" && (
                <button
                  onClick={() => claimItem(item)}
                  className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg"
                >
                  Claim
                </button>
              )}

              {item.status === "claimed" && (
                <p className="mt-4 text-green-600 font-semibold">
                  Already Claimed
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 mt-16">
            No listings found
          </p>
        )}
      </div>
    </section >
  );
}