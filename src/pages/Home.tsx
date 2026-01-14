import Navbar from '../components/Navbar'
import Hero from '../components/Hero'

export default function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        {/* further sections (features, pricing, footer) go here */}
      </main>
    </div>
  )
}
