import Navbar from '../components/Navbar'
import SubscriptionPlans from '../components/SubscriptionPlans'
import BuildYourPlan from '../components/BuildYourPlan'
import Footer from '../components/Footer'

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <SubscriptionPlans />
      <BuildYourPlan />
      <Footer />
    </div>
  )
}
