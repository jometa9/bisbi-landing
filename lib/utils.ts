import { User } from "@/lib/db/schema";
import { type ClassValue, clsx } from "clsx";
import crypto from "crypto";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSubscriptionType(user: User): string {
  if (user.role === "admin") {
    return "admin";
  }
  return "free";
}

export function getReadablePlanName(user: User): string {
  if (user.role === "admin") {
    return "Admin";
  }
  return "Free";
}

export function generateApiKey(): string {
  const prefix = "iptrade_lc_";
  const remainingLength = 50 - prefix.length;

  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  const randomBytes = crypto.randomBytes(remainingLength);

  let randomPart = "";
  for (let i = 0; i < remainingLength; i++) {
    randomPart += chars[randomBytes[i] % chars.length];
  }

  return prefix + randomPart;
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateInternalApiKey(): string {
  return "iptrade_int_" + crypto.randomBytes(24).toString("hex");
}

export function generateRandomPassword(length = 16): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

const backgroundColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function getAvatarBgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % backgroundColors.length;

  return backgroundColors[index];
}

export function getAvatarTextColor(bgColor: string): string {
  return bgColor.includes("yellow") || bgColor.includes("pink")
    ? "text-gray-900"
    : "text-white";
}

export function formatCurrency(amount: number): string {
  const parts = amount.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${integerPart},${parts[1]}`;
}

export function formatPrice(amount: number): string {
  if (Number.isInteger(amount)) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  const parts = amount.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1].replace(/0+$/, "");
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}
