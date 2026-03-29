import Hero from './components/Hero'
import Quality from './components/Quality'
import SlashTransition from './components/SlashTransition'
import Story from './components/Story'
import ReviewsAndMap from './components/ReviewsAndMap'

export default function Home() {
  return (
    <main>
      <Hero />
      <SlashTransition />
      <Quality />
      <SlashTransition />
      <Story />
      <ReviewsAndMap />
    </main>
  )
}
