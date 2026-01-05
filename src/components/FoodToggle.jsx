import { useNavigate, useLocation } from "react-router-dom";

export default function FoodToggle() {
  const navigate = useNavigate();
  const location = useLocation();

  const isEdible = location.pathname === "/edible";

  return (
    <div className="flex justify-center my-10">
      <div className="bg-white rounded-full shadow-md p-1 flex w-[340px]">

        {/* EDIBLE */}
        <button
          onClick={() => navigate("/edible")}
          className={`w-1/2 py-3 rounded-full font-semibold transition-all duration-300 ${
            isEdible
              ? "bg-purple-900 text-white"
              : "text-gray-600"
          }`}
        >
          Edible
        </button>

        {/* NON-EDIBLE */}
        <button
          onClick={() => navigate("/non-edible")}
          className={`w-1/2 py-3 rounded-full font-semibold transition-all duration-300 ${
            !isEdible
              ? "bg-orange-400 text-white"
              : "text-gray-600"
          }`}
        >
          Non-Edible
        </button>

      </div>
    </div>
  );
}
