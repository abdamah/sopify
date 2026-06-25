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

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  user_email?: string;
  total: number;
  status: string;
  stripe_session_id?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
};
