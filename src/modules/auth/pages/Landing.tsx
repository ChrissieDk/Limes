import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WhyChoose from '../components/WhyChoose'
import BudgetBuilder from '../components/BudgetBuilder'
import Packages from '../components/Packages'

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      <Hero />

      <WhyChoose />

      <BudgetBuilder />
      <Packages />
    </div>
  )
}


