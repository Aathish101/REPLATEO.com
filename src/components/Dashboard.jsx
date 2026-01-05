import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Dashboard({ openAuthModal }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // overview | notifications | claimed
  const [listings, setListings] = useState([]);
  const [claimedListings, setClaimedListings] = useState([]);
  const [stats, setStats] = useState({
    donations: 0,
    claimed: 0,
    pending: 0,
  });

  // 🚫 Not logged in
  if (!user) {
    return (
      <section className="page-section">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold text-orange-800 mb-4">
            Access Required
          </h2>
          <button
            onClick={openAuthModal}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl"
          >
            Login / Register
          </button>
        </div>
      </section>
    );
  }

  // 🔹 USER DONATIONS
  useEffect(() => {
    const q = query(
      collection(db, "food_listings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      let donations = 0;
      let pending = 0;
      let claimed = 0;

      const arr = snap.docs.map((d) => {
        const data = { id: d.id, ...d.data() };

        if (data.type === "donation") donations++;
        if (data.status === "available") pending++;
        if (data.status === "claimed") claimed++;

        return data;
      });

      setListings(arr);
      setStats({ donations, pending, claimed });
    });

    return () => unsub();
  }, [user.uid]);

  // 🔹 ITEMS CLAIMED (NGO ONLY)
  useEffect(() => {
    if (user.role !== "ngo") return;

    const q = query(
      collection(db, "food_listings"),
      where("claimedBy", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      // Sort client-side to avoid index issues
      arr.sort((a, b) => (b.claimedAt?.seconds || 0) - (a.claimedAt?.seconds || 0));
      setClaimedListings(arr);
    });

    return () => unsub();
  }, [user]);

  // 🔹 NOTIFICATIONS (ALL USERS)
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      // Sort by createdAt desc in JS to avoid missing index
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(data);
    });

    return () => unsub();
  }, [user]);

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), {
        isRead: true,
      });
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section className="page-section">
      <div className="page-container">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-orange-800">
            Welcome, {user.displayName || user.email}
          </h2>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-8 border-b pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-semibold ${activeTab === "overview" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 font-semibold relative ${activeTab === "notifications" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {user.role === "ngo" && (
            <button
              onClick={() => setActiveTab("claimed")}
              className={`px-4 py-2 font-semibold ${activeTab === "claimed" ? "text-orange-600 border-b-2 border-orange-600" : "text-gray-500"}`}
            >
              Claimed Items
            </button>
          )}
        </div>

        {/* CONTENT */}

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <>
            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
              <Stat label="Donations" value={stats.donations} />
              <Stat label="Claimed" value={stats.claimed} />
              <Stat label="Pending" value={stats.pending} />
            </div>

            {/* USER LISTINGS */}
            <h3 className="text-2xl font-bold text-orange-800 mb-4">
              Your Listings
            </h3>

            {listings.length === 0 ? (
              <p>You haven’t posted anything yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((item) => (
                  <div key={item.id} className="border rounded-xl p-5">
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm">{item.notes}</p>

                    <span className="text-sm font-semibold text-orange-700">
                      Status: {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div>
            <h3 className="text-2xl font-bold text-orange-800 mb-4">
              Notifications
            </h3>
            {notifications.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-xl text-gray-500">
                No new notifications
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl flex justify-between items-center border ${notif.isRead ? "bg-white border-gray-200" : "bg-orange-50 border-orange-200"
                      }`}
                  >
                    <div>
                      <p className={`text-md ${notif.isRead ? "text-gray-700" : "text-orange-900 font-semibold"}`}>
                        {notif.message}
                      </p>
                      {notif.senderEmail && (
                        <p className="text-sm text-gray-600 mt-1">
                          <b>Contact:</b> {notif.senderEmail}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.createdAt?.seconds
                          ? new Date(notif.createdAt.seconds * 1000).toLocaleString()
                          : "Just now"}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full hover:bg-orange-300 transition"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: CLAIMED ITEMS (NGO ONLY) */}
        {activeTab === "claimed" && user.role === "ngo" && (
          <>
            <h3 className="text-2xl font-bold text-orange-800 mb-4">
              Items You Claimed
            </h3>

            {claimedListings.length === 0 ? (
              <p>No items claimed yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {claimedListings.map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}

/* SMALL COMPONENTS */
function Stat({ label, value }) {
  return (
    <div className="bg-orange-50 p-6 rounded-xl text-center">
      <p className="text-sm text-orange-700">{label}</p>
      <p className="text-3xl font-bold text-orange-800">{value}</p>
    </div>
  );
}

function Card({ item }) {
  return (
    <div className="border rounded-xl p-5">
      <h4 className="font-bold">{item.title}</h4>
      <p className="text-sm">{item.notes}</p>
      <span className="text-green-700 font-semibold">Claimed</span>
    </div>
  );
}