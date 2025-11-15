import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TrustSignals from "@/components/TrustSignals";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in and on root page, redirect to onboarding
    if (user && window.location.pathname === "/" && !window.location.hash.includes("access_token")) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="flex flex-col gap-12 sm:gap-16">
        <Hero />
        <TrustSignals />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
};

export default Index;