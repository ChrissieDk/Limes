import { httpsCallable } from 'firebase/functions'
import Navbar from '../components/Navbar'
import Partners from '../components/Partners'
import ApiDocsTeaser from '../components/ApiDocsTeaser'
import PartnerContactForm, { type PartnerContactValues } from '../components/PartnerContactForm'
import PartnerFaqs from '../components/PartnerFaqs'
import Footer from '../components/Footer'
import { functions } from '../../../config/firebase'

async function submitInquiry(values: PartnerContactValues): Promise<void> {
  const submitContact = httpsCallable(functions, 'submitContactInquiry')
  await submitContact({
    fullName: values.fullName,
    email: values.email,
    phone: values.phone ?? '',
    company: values.company ?? '',
    queryType: values.queryType,
    message: values.message,
  })
}

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <div className="pt-24">
        <Partners />
        <ApiDocsTeaser />
        <section id="contact" className="mx-auto max-w-6xl px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <PartnerContactForm onSubmit={submitInquiry} />
          <PartnerFaqs />
        </section>
      </div>
      <Footer />
    </div>
  )
}
