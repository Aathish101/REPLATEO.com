import { Link } from "react-router-dom";

export default function Products() {
  return (
    <section className="page-section relative">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="page-container">
        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-#C3E5E7">
            Products
          </h1>
          <p className="text-lg text-gray-600 mt-3">
            Choose a product category to continue
          </p>
        </div>

        {/* PRODUCT BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* MEDICATIONS */}
          <Link
            to="/products/medications"
            className="group rounded-3xl border border-[#C3E5E7] bg-[#C3E5E7] p-10 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Medications
            </h2>
            <p className="text-gray-700">
              Unused medicines in sealed condition
            </p>
          </Link>

          {/* ACCESSORIES */}
          <Link
            to="/products/accessories"
            className="group rounded-3xl border border-[#C3E5E7] bg-[#C3E5E7] p-10 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Accessories
            </h2>
            <p className="text-gray-700">
              Bottles, containers, reusable items
            </p>
          </Link>

          {/* RESALABLE CLOTHES */}
          <Link
            to="/products/resalable-clothes"
            className="group rounded-3xl border border-[#C3E5E7] bg-[#C3E5E7] p-10 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Resalable Clothes
            </h2>
            <p className="text-gray-700">
              Clean, reusable clothing in good condition
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
