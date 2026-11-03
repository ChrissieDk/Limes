import Navbar from '../components/Navbar'
import SubscriptionPlans from '../components/SubscriptionPlans'
import WhyChoose from '../components/WhyChoose'
import Footer from '../components/Footer'

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <SubscriptionPlans />
      <WhyChoose sectionId="build" title="Or build out your plan" />
      <Footer />
    </div>
  )
}
