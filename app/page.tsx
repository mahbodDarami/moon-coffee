import Hero from './components/Hero'
import WaveTransition from './components/WaveTransition'
import Quality from './components/Quality'
import SlashTransition from './components/SlashTransition'
import Story from './components/Story'

export default function Home() {
  return (
    <main>
      <Hero />
      <WaveTransition />
      <Quality />
      <SlashTransition />
      <Story />
    </main>
  )
}
