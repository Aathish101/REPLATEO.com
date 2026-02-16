import { Recycle, Sprout } from "lucide-react";

export default function NonEdible({ openDonationModal }) {
  return (
    <section className="page-section">

      {/* GREEN GRADIENT BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="page-container">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-5xl font-extrabold text-emerald-800 drop-shadow-sm">
            Non-Edible Waste Management
          </h2>
          <p className="text-lg text-emerald-700 mt-3 max-w-2xl mx-auto">
            Repurpose non-edible waste into valuable resources through modern recycling 
            and agricultural reuse partnerships.
          </p>
        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* RECYCLING CARD */}
          <div
            className="
              relative p-10 rounded-3xl shadow-xl 
              bg-gradient-to-br from-white/40 to-white/20 
              backdrop-blur-xl border border-white/30 
              hover:shadow-emerald-400/40 transition-all 
              hover:scale-[1.02]
            "
          >
            <div className="absolute -top-6 left-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/40">
              <Recycle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-emerald-800 mt-6">
              Recycling & Composting
            </h3>
            <p className="text-emerald-700 mt-3">
              Convert unavoidable non-edible food waste into compost, fertilizer, or bio-energy.
            </p>

            <a
              href="/directory"
              className="inline-block mt-6 bg-emerald-600 text-white py-3 px-8 rounded-xl 
                         hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
            >
              Find Recycling Partners
            </a>
          </div>

          {/* AGRICULTURE CARD */}
          <div
            className="
              relative p-10 rounded-3xl shadow-xl 
              bg-gradient-to-br from-white/40 to-white/20 
              backdrop-blur-xl border border-white/30 
              hover:shadow-emerald-400/40 transition-all 
              hover:scale-[1.02]
            "
          >
            <div className="absolute -top-6 left-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/40">
              <Sprout className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-emerald-800 mt-6">
              Agricultural Use
            </h3>
            <p className="text-emerald-700 mt-3">
              Many non-edible food byproducts can support soil health and farm-based sustainability.
            </p>

            <button
              onClick={openDonationModal}
              className="inline-block mt-6 bg-emerald-600 text-white py-3 px-8 rounded-xl 
                         hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
            >
              Donate Waste to Farms
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
