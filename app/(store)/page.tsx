import { connection } from "next/server";
import { HomePage } from "@/components/store/home-page";

export const instant = false;

export const metadata = {
  title: "Wearism",
  description: "Everyday Indian fashion — coats, tops, and knitwear.",
};

export default async function StoreHome() {
  await connection();
  return <HomePage />;
}
