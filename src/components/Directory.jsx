import { useToast } from "../context/ToastContext";

export default function Directory() {
  const { addToast } = useToast();

  return (
    <section className="page-section relative">

      {/* WHITE BACKGROUND */}
      <div className="absolute inset-0 -z-10 bg-white" />

      <div className="page-container">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h2 className="text-5xl font-extrabold text-orange-800 drop-shadow-sm">
            Recycling & NGO Directory
          </h2>
          <p className="text-lg text-orange-700 mt-3 max-w-2xl mx-auto">
            Connect with trusted recycling partners, NGOs, and agricultural organizations
            who responsibly manage food waste.
          </p>
        </div>

        {/* GRID LAYOUT FIXED FOR 3 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">

          {/* REUSABLE CARD COMPONENT STYLE */}
          {[
            {
              img: "https://i.ibb.co/8D9F3L14/24721219-6896001.jpg",
              title: "Community Food Bank",
              text: "Accepts edible surplus food and distributes to shelters & child-care centers.",
              action: "Contact",
              toast: "Contact request sent!",
              color: "orange",
            },
            {
              img: "https://i.ibb.co/hRhnYrLb/assortment-compost-made-rotten-food-with-copy-space.jpg",
              title: "GreenCycle Composters",
              text: "Transforms non-edible food waste into compost and bio-organic fertilizer.",
              action: "Request Pickup",
              toast: "Pickup request created!",
              color: "emerald",
            },
            {
              img: "https://i.ibb.co/n8rjK4kF/Idyllic-farm-sunset-with-red-barn-tractor-and-freerange-chickens-Premium-AI-generated-image.jpg",
              title: "AgroFarm Collective",
              text: "Works with farmers to recycle food byproducts into soil boosters.",
              action: "Send Request",
              toast: "Farm request submitted!",
              color: "emerald",
            },
          ].map((p, index) => (
            <div
              key={index}
              className="
                flex gap-6 p-8 rounded-3xl 
                bg-gradient-to-br from-white/40 to-white/20 
                backdrop-blur-xl border border-white/30 
                shadow-xl shadow-orange-200/30 transition-all
                hover:scale-[1.02] hover:shadow-orange-300/40
              "
            >
              {/* IMAGE */}
              <div className="w-28 h-28 flex-shrink-0">
                <img
                  src={p.img}
                  className="w-full h-full rounded-2xl object-cover shadow-md"
                />
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-orange-800">{p.title}</h3>
                <p className="text-orange-700 mt-3">{p.text}</p>

                <button
                  onClick={() => addToast(p.toast, "success")}
                  className={`mt-6 py-2 px-6 rounded-xl text-white shadow-md hover:shadow-lg transition
                    ${p.color === "orange" ? "bg-orange-600 hover:bg-orange-700" : ""}
                    ${p.color === "emerald" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    ${p.color === "purple" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  `}
                >
                  {p.action}
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
