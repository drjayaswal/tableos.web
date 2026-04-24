import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const generatePlaceholder = (x:number, type: "restaurant" | "cafe" | "hotel") => {
  const dictionary = {
    restaurant: ["fat fish", "sizzling platter", "aged wine", "herb crust", "truffle oil", "farm-to-table", "zesty lemon", "seared scallops", "rustic bread", "garlic butter"],
    cafe: ["cream cheese", "roasted bean", "velvety foam", "artisan pastry", "cold brew", "steaming mug", "cinnamon swirl", "flaky croissant", "espresso shot", "clover honey"],
    hotel: ["fluffy pillow", "concierge desk", "ocean view", "thread count", "morning robe", "valet service", "infinity pool", "suite life", "velvet curtains", "marble lobby"]
  };

  const words = dictionary[type] || dictionary.restaurant;
  let result = type === "restaurant" ? "This is the fat fish " : type === "cafe" ? "This is the cream cheese " : "This is the fluffy pillow ";
  
  for (let i = 0; i < x; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    result += randomWord + (i % 8 === 0 ? ". " : " ");
  }
  
  return result.trim();
};