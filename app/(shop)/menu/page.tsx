import { getCategories, getMenuItems } from '@/app/actions/menu'
import MenuPage from '@/app/components/menu/MenuPage'

export default async function MenuRoute() {
  const [categories, items] = await Promise.all([
    getCategories(),
    getMenuItems(),
  ])

  return <MenuPage categories={categories} items={items} />
}
