import Navbar from '../components/Navbar'
import Partners from '../components/Partners'
import Footer from '../components/Footer'

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <Partners />
      </div>
      <Footer />
    </div>
  )
}
