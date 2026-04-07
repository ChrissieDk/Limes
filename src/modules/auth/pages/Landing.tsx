import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WhyChoose from '../components/WhyChoose'
import HowToJoin from '../components/HowToJoin'
import Packages from '../components/Packages'
import Partners from '../components/Partners'
import TelecomCta from '../components/TelecomCta'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />

      <div>
        <Hero />
        <WhyChoose />
        
        <Packages />
        <HowToJoin />
        <Partners />
        <TelecomCta />
        <Footer />
      </div>
    </div>
  )
}


