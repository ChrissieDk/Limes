import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WhyChoose from '../components/WhyChoose'
import Packages from '../components/Packages'

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />

      <div>
        <Hero />
        <WhyChoose />
        <Packages />
      </div>
    </div>
  )
}


