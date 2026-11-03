import { httpsCallable } from 'firebase/functions'
import Navbar from '../components/Navbar'
import ContactForm, { type ContactFormValues } from '../components/ContactForm'
import FaqAccordion from '../components/FaqAccordion'
import { CONTACT_FAQS } from '../components/contactFaqs'
import Footer from '../components/Footer'
import { functions } from '../../../config/firebase'

async function submitInquiry(values: ContactFormValues): Promise<void> {
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

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white overflow-x-hidden">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <ContactForm onSubmit={submitInquiry} showCompany={false} />
        <FaqAccordion title="FAQs" items={CONTACT_FAQS} />
      </section>
      <Footer />
    </div>
  )
}
