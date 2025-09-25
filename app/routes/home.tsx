import type { Route } from "./+types/home";
import { Catalog } from "../views/catalog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Product Catalog - Vbelle PO Bangkok 2025" },
    { name: "description", content: "Welcome to Vbelle PO Bangkok 2025!" },
  ];
}

export default function Home() {
  return <Catalog />;
}
