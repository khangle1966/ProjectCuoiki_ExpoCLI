import { Database } from "./database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
  export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type Product = {
  id: number;
  image: string | null;
  name: string;
  price: number;
};

export type Size = "S" | "M" | "L" | "XL";

export type CartItem = {
  id: string;
  product: Product;
  product_id: number;
  size: Size;
  quantity: number;
};

export type OrderStatus = "New" | "Cooking" | "Delivered";

export const OrderStatusList: OrderStatus[] = [
  "New",
  "Cooking",
 
  "Delivered",
];

export type OrderItem = {
  id: number;
  product_id: number;
  products: Product;
  order_id: number;
  size: Size;
  quantity: number;
};

export type Order = {
  id: number;
  created_at: string;
  total: number;
  user_id: string;
  status: OrderStatus;
  order_items?: OrderItem[];
};
