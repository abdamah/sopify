export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: string;
  category: Category;
  created_at: string;
  updated_at: string;
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
};

export type User = {
  id: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
  line_total: number;
};

export type CartResponse = {
  items: CartItem[];
  total: number;
};
