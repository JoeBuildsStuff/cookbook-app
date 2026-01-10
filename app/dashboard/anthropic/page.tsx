import { redirect } from "next/navigation";

export default function AnthropicPage() {
  redirect("/dashboard/anthropic/new");
  // This page never renders; redirect occurs server-side
  return null;
}
