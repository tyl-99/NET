import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MobileActionBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateVisibility = () => {
      setVisible(mediaQuery.matches && window.scrollY > 160);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateVisibility);
    } else {
      mediaQuery.addListener(updateVisibility);
    }

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateVisibility);
      } else {
        mediaQuery.removeListener(updateVisibility);
      }
    };
  }, []);

  const handleStartAssessment = () => {
    if (user) {
      navigate("/assessment");
      return;
    }

    navigate("/login", { state: { from: "/assessment" } });
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="pointer-events-auto mx-auto w-full max-w-7xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[120px]">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">Ready to continue?</p>
              <p className="text-sm text-[color:var(--color-ink)]">Jump back in without scrolling to the top.</p>
            </div>
            <div className="flex flex-1 min-w-[220px] justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full bg-[#FFE55A] px-4 text-xs font-semibold text-[#1F1F1F] shadow-sm hover:bg-[#FFE55A]/90"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-full px-4 text-xs"
                onClick={handleStartAssessment}
              >
                Start assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileActionBar;
