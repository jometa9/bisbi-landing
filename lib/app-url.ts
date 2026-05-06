export function getAppUrl(): string {
  let u = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();
  u = u.replace(/\/+$/, "");
  u = u.replace(/:8080/g, "") || u;
  if (!u || u === "http://" || u === "https://") return "http://localhost:3000";
  return u;
}
