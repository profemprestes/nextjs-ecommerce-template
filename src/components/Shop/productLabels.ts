import { useEffect, useState } from "react";
import { Product } from "@/types/product";

export const PLACEHOLDER_IMAGE = "/images/placeholder-jersey.svg";

export function productHref(item: Pick<Product, "slug">): string {
  return item.slug
    ? `/shop-details?slug=${encodeURIComponent(item.slug)}`
    : "/shop-details";
}

export function versionLabel(version?: Product["version"]): string {
  if (version === "Retro") return "Retro";
  if (!version || version === "A confirmar") return "Versión a confirmar";
  return `Versión ${version}`;
}

export function availabilityLabel(modalidad?: Product["modalidad"]): string {
  return modalidad === "entrega_inmediata" ? "entrega inmediata" : "por encargo";
}

/** Short confirmation state for "add" buttons: true for ~1.6s after trigger(). */
export function useFlash(duration = 1600): [boolean, () => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => setOn(false), duration);
    return () => window.clearTimeout(t);
  }, [on, duration]);
  return [on, () => setOn(true)];
}
