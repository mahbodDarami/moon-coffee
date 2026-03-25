import type { Tables } from './database'

// Base row types
export type MenuCategory = Tables<'menu_categories'>
export type MenuItem = Tables<'menu_items'>
export type Profile = Tables<'profiles'>
export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type UserPreferences = Tables<'user_preferences'>

// Composite types for joined queries
export type MenuItemWithCategory = MenuItem & {
  menu_categories: MenuCategory
}

export type CartItemWithMenu = CartItem & {
  menu_items: MenuItem
}

export type CartWithItems = Cart & {
  cart_items: CartItemWithMenu[]
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

// Guest cart (localStorage)
export type GuestCartItem = {
  itemId: string
  quantity: number
}

// Action response types
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// Re-export database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database'
