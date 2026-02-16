import { Watch } from "lucide-react";

export default function Accessories({ openDonationModal }) {
  return (
    <section className="page-section relative">
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="page-container text-center">
        <h1 className="text-5xl font-extrabold text-[#4A7F84] mb-10">
          Accessories
        </h1>

        <div className="mx-auto max-w-md bg-[#C3E5E7] rounded-3xl shadow-xl p-10">
          <Watch className="text-6xl mx-auto mb-6 text-[#4A7F84]" />

          <h2 className="text-2xl font-bold mb-3">START DONATION</h2>

          <p className="text-gray-700 mb-6">
            Donate bottles, containers and reusable accessories.
          </p>

          <button
            onClick={() => openDonationModal("accessories")}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold shadow hover:bg-gray-100"
          >
            Donate Accessories
          </button>
        </div>
      </div>
    </section>
  );
}
