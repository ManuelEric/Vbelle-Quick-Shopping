import type { Route } from "./+types/home";
import { Login } from "@/views/admin/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "" },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Login />
    </main>
  )
}
