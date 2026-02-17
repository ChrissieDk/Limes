import { Link } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import Footer from '../components/Footer'

export default function TermsAndConditions() {
  return (
    <AuthLayout
      variant="signup"
      tone="dark"
      footer={<Footer />}
      heading={
        <>
          Terms &
          <br />
          Conditions
        </>
      }
      subheading="Please review the terms and conditions below."
    >
      <div className="space-y-4">
        <div className="space-y-3 text-sm sm:text-[15px] leading-7 text-neutral-200">
          <p>
            These terms and conditions apply to your use of the Website and by accessing this Website, you agree to be
            bound by the terms and conditions set out below. Before you place an order, if you have any questions
            relating to these terms and conditions, please contact our customer service representatives.
          </p>

          <p className="font-semibold text-white">1. Definitions</p>
          <p>1.1 &quot;Limes Mobile&quot; means Limes Mobile , a division of Simpal (Pty) Ltd, registration number 2014/017358/07.</p>
          <p>1.2 &quot;The Website&quot; https://www.limes.network/ which is owned and operated by Limes Mobile, a division of Simpal (Pty) Ltd.</p>
          <p>1.3 &quot;User&quot; means any person that enters or uses the Website.</p>
          <p>1.4 &quot;we&quot;, &quot;us&quot; and &quot;our&quot; means Limes Mobile Mobile, its affiliates, subsidiaries or its successors-in-title;</p>
          <p>1.5 &quot;you&quot; and/or &quot;your&quot; means you the User</p>

          <p className="font-semibold text-white">2. Electronic Communications</p>
          <p>
            When you visit the Website, you consent to receiving communications from us electronically and agree that
            all agreements, notices, disclosures and other communications sent by us satisfies any legal requirements
            including, but not limited to, the requirement that such communications should be in writing.
          </p>

          <p className="font-semibold text-white">
            3. Disclosures in terms of section 43 of the electronic communications and transactions act, 2002
          </p>
          <p>
            Any transactions concluded on this website will qualify as &quot;electronic transactions&quot; as defined in terms of the ECT Act and the
            following information is therefore disclosed in terms of section 43 of the ECT Act:
          </p>
          <p>3.1 Street address: Unit 7B OLD MILL BUSINESS PARK, Cape Town, 7405, Western Cape, South Africa.</p>
          <p>3.2 The website address is: https://www.limes.network/</p>

          <p className="font-semibold text-white">4. Disclaimer</p>
          <p>
            4.1 Whilst every effort has been made by us to ensure the proper performance of this Website, the accuracy of the information,
            prices and images and their liability of the binary data on this Website, we do not guarantee the availability of services, stock,
            content and information offered on this website or the accuracy of the information and/or images on this Website.
          </p>
          <p>
            4.2 Website may contain hyper-links to third party sites. We are not responsible for the content of, or the services offered by those
            sites. The hyper-link(s) are provided solely for your convenience and should not be construed as an express or implied endorsement
            by us of the site(s) or the products or services provided therein. You access those sites and use those respective products and services
            solely at your own risk.
          </p>

          <p className="font-semibold text-white">5. Indemnification</p>
          <p>
            You indemnify and holds us harmless against all and any loss, liability, actions, suites, proceedings, costs, demands and damages of all
            and every kind, (including direct, indirect, special or consequential damages), and whether in an action based on contract, negligence or
            any other action, arising out of or in connection with the failure or delay in the performance of this Website, or the use of or information
            and/or images available on this Website, whether due to our negligence or not.
          </p>

          <p className="font-semibold text-white">6. Variation</p>
          <p>
            These terms and conditions may change from time to time. The obligation therefore is on you to review these terms and conditions at
            regular intervals.
          </p>

          <p className="font-semibold text-white">7. General</p>
          <p>7.1 These terms and conditions will be governed by and construed in accordance with the laws of South Africa, and you shall submit to the jurisdiction of the South African Courts.</p>
          <p>7.2 These terms and conditions are severable, in that if any provision is determined to be illegal or unenforceable by any court of competent jurisdiction, then such provision shall be deemed to have been deleted without affecting the remaining provisions of these terms and conditions.</p>
          <p>7.3 Our failure to exercise any particular rights or provision of these terms and conditions shall not constitute a waiver of such right or provision, unless acknowledged and agreed to by us in writing.</p>
          <p>7.4 These terms and conditions, as varied by us from time to time pursuant to section 5, above constitute the sole agreement between yourself and ourselves.</p>
          <p>7.5 These terms and conditions shall be for the benefit of Limes Mobile and may be waived by us in our discretion.</p>

          <p className="font-semibold text-white">8. Payment options</p>
          <p>All transactions will be processed in South African Rands (ZAR). We accept credit card and cheque card payments via the website.</p>

          <p className="font-semibold text-white">9. Monitoring</p>
          <p>
            We have the right, but not the obligation, to monitor any activity and content associated with the Website. We may investigate any
            reported violation of these terms and conditions or complaints and take any action that we deem appropriate (which may include, but is
            not limited to, issuing warnings, suspending, terminating or attaching conditions to your access and/or removing any materials from
            the Website).
          </p>

          <p className="font-semibold text-white">10. Customer and credit card and security policy</p>
          <p>
            10.1 Credit card and cheque card transactions will be processed via Paystack (Pty) Ltd who are the approved payment gateway for
            Standard Bank of South Africa. Paystack uses the strictest form of encryption, namely Secure Socket Layer 3 (SSL3), and no credit card
            and cheque card details are stored on the Website. Users may go to www.paystack.com to view their security certificate and security policy.
          </p>
          <p>
            10.2 Your details will be stored by us separately from card details which are entered by the client on Paystack&apos;s secure site. For more detail
            on Paystack refer to www.paystack.com.
          </p>

          <p className="font-semibold text-white">11. Contact details</p>
          <p>Telephone Number – 080 039 0009</p>
          <p>General Enquiries – wayne@simpal.co.za</p>
          <p>Short Code - 135</p>
          <p>
            IMPORTANT: The clauses printed in bold relate to issues which may pose some risk for you or which may limit our liability or which
            you may not ordinarily expect. Please pay special attention to these clauses. By accessing the website you, in addition to accepting all
            the above terms and conditions, also specifically signify that you understand the bold clauses and accept them.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Back to Sign Up
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
