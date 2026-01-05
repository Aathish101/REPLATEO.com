import { FaHandHoldingMedical } from "react-icons/fa";

export default function Medications({ openDonationModal }) {
  return (
    <section className="page-section relative">
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="page-container text-center">
        <h1 className="text-5xl font-extrabold text-[#4A7F84] mb-10">
          Medications
        </h1>

        <div className="mx-auto max-w-md bg-[#C3E5E7] rounded-3xl shadow-xl p-10">
          <FaHandHoldingMedical className="text-6xl mx-auto mb-6 text-[#4A7F84]" />

          <h2 className="text-2xl font-bold mb-3">
            START DONATION
          </h2>

          <p className="text-gray-700 mb-6">
            Donate surplus medications safely and help save lives.
          </p>

          <button
            onClick={() => openDonationModal("medications")}
            className="px-8 py-3 rounded-xl bg-white text-black font-semibold shadow hover:bg-gray-100"
          >
            Donate Medications
          </button>
        </div>
      </div>
    </section>
  );
}
