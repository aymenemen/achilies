import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { HOME_CSS, HOME_BODY, DUST_DATA } from "@/lib/home-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar Irradiance Forecasting — Clearness Index Kt over Ouarzazate" },
      {
        name: "description",
        content:
          "A comparative study of eight machine-learning architectures forecasting the Clearness Index Kt in the hyper-arid Saharan environment of Ouarzazate, Morocco.",
      },
      { property: "og:title", content: "Predicting Solar Irradiance Through Dust" },
      {
        property: "og:description",
        content:
          "Eight ML architectures benchmarked for forecasting the Clearness Index Kt under Saharan dust conditions.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  useEffect(() => {
    // Build dust bars
    const container = document.getElementById("dustBars");
    if (container && container.childElementCount === 0) {
      const maxVal = 0.2;
      DUST_DATA.forEach((d) => {
        const penaltyColor =
          d.penalty > 200 ? "#E07060" : d.penalty > 100 ? "#D4A060" : "#7BB88C";
        container.innerHTML += `
          <div class="dust-bar-row">
            <div class="dust-bar-label">${d.label}</div>
            <div class="dust-bar-tracks">
              <div class="dust-bar-track"><div class="dust-bar-clean" style="width:${((d.clean / maxVal) * 100).toFixed(1)}%"></div></div>
              <div class="dust-bar-track"><div class="dust-bar-dust-fill" style="width:${((d.dust / maxVal) * 100).toFixed(1)}%"></div></div>
            </div>
            <div class="dust-penalty-label" style="color:${penaltyColor}">${d.penalty.toFixed(0)}%</div>
          </div>`;
      });
    }

    // Fade-up observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document.querySelectorAll(".home-root .fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HOME_CSS }} />
      <div className="home-root" dangerouslySetInnerHTML={{ __html: HOME_BODY }} />
    </>
  );
}
