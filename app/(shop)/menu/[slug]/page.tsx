import { getMenuItemWithOptions, getCategories } from '@/app/actions/menu'
import { notFound } from 'next/navigation'
import MenuItemDetail from '@/app/components/menu/MenuItemDetail'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function MenuItemRoute({ params }: Props) {
  const { slug } = await params
  const [item, categories] = await Promise.all([
    getMenuItemWithOptions(slug),
    getCategories(),
  ])

  if (!item) notFound()

  return <MenuItemDetail item={item} categories={categories} />
}
