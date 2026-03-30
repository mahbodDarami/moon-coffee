import type { Tables } from './database'

// Base row types
export type MenuCategory = Tables<'menu_categories'>
export type MenuItem = Tables<'menu_items'>
export type Profile = Tables<'profiles'>
export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'>
export type CartItemOption = Tables<'cart_item_options'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderItemOption = Tables<'order_item_options'>
export type UserPreferences = Tables<'user_preferences'>
export type ProductOptionGroup = Tables<'product_option_groups'>
export type ProductOption = Tables<'product_options'>
export type Address = Tables<'addresses'>

// Composite types for joined queries
export type MenuItemWithCategory = MenuItem & {
  menu_categories: MenuCategory
}

export type ProductOptionGroupWithOptions = ProductOptionGroup & {
  product_options: ProductOption[]
}

export type MenuItemWithOptions = MenuItem & {
  menu_categories?: MenuCategory
  option_groups: ProductOptionGroupWithOptions[]
}

export type CartItemWithMenu = CartItem & {
  menu_items: MenuItem
}

export type CartItemOptionWithDetails = CartItemOption & {
  product_options: ProductOption & {
    product_option_groups: ProductOptionGroup
  }
}

export type CartItemWithMenuAndOptions = CartItem & {
  menu_items: MenuItem
  cart_item_options: CartItemOptionWithDetails[]
}

export type CartWithItems = Cart & {
  cart_items: CartItemWithMenu[]
}

export type OrderItemWithOptions = OrderItem & {
  order_item_options: OrderItemOption[]
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
}

export type OrderWithItemsAndOptions = Order & {
  order_items: OrderItemWithOptions[]
}

export type OrderWithItemsAndAddress = Order & {
  order_items: OrderItemWithOptions[]
  addresses: Address | null
}

// Guest cart (localStorage)
export type SelectedOption = {
  optionId: string
  groupName: string
  optionName: string
  priceModifier: number
  value?: string // for text type options (special instructions)
}

export type GuestCartItem = {
  itemId: string
  quantity: number
  selectedOptions?: SelectedOption[]
}

// Action response types
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// Re-export database types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database'
