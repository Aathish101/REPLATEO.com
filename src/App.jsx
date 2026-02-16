import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./components/Home";
import GoodFood from "./components/GoodFood";
import NonEdible from "./components/NonEdible";
import PublicListings from "./components/PublicListings";
import Dashboard from "./components/Dashboard";
import Directory from "./components/Directory";
import Contact from "./components/Contact";
import AuthPage from "./components/AuthPage";
import ForgotPassword from "./components/ForgotPassword";

import AuthModal from "./components/AuthModal";
import DonationModal from "./components/DonationModal";
import SaleModal from "./components/SaleModal";

// PRODUCTS
import Products from "./pages/products/Products";
import Medications from "./pages/products/Medications";
import Accessories from "./pages/products/Accessories";
import ResalableClothes from "./pages/products/ResalableClothes";

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);

  const [donationType, setDonationType] = useState("null");
/////////////////////////
const openDonationModal = (type) => {
  setDonationType(type);
  setDonationOpen(true);
};
/////////////////////////////
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <Navbar openAuthModal={() => setAuthOpen(true)} />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/edible"
          element={
            <GoodFood
              openDonationModal={() => {
                setDonationType("food");
                setDonationOpen(true);
              }}
              openSaleModal={() => setSaleOpen(true)}
            />
          }
        />

        <Route
          path="/non-edible"
          element={
            <NonEdible
              openDonationModal={() => {
                setDonationType("non-edible");
                setDonationOpen(true);
              }}
            />
          }
        />

        <Route
          path="/listings"
          element={<PublicListings openAuthModal={() => setAuthOpen(true)} />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard openAuthModal={() => setAuthOpen(true)} />}
        />

        <Route path="/directory" element={<Directory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/products" element={<Products />} />

        <Route
          path="/products/medications"
          element={
            <Medications
              openDonationModal={() => {
                setDonationType("medications");
                setDonationOpen(true);
              }}
            />
          }
        />

        <Route
          path="/products/accessories"
          element={
            <Accessories
              openDonationModal={() => {
                setDonationType("accessories");
                setDonationOpen(true);
              }}
            />
          }
        />

        <Route
          path="/products/resalable-clothes"
          element={
            <ResalableClothes
              openDonationModal={() => {
                setDonationType("clothes");
                setDonationOpen(true);
              }}
            />
          }
        />
      </Routes>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <DonationModal
  open={donationOpen}
  type={donationType}
  onClose={() => {
    setDonationOpen(false);
    setDonationType(null);
  }}
/>


      <SaleModal open={saleOpen} onClose={() => setSaleOpen(false)} />
    </div>
  );
}