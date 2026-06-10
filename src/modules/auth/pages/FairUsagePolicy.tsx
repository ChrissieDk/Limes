import { useEffect } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import Footer from '../components/Footer'

export default function FairUsagePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <AuthLayout
      variant="policy"
      tone="dark"
      footer={<Footer />}
      heading="Fair Usage Policy"
      subheading="Please review the fair usage policy below."
    >
      <div className="space-y-4">
        <div className="font-manrope space-y-3 text-sm sm:text-[15px] leading-7 text-neutral-200">
          <p className="font-grotesque font-semibold text-white">1. Application</p>
          <p>
            The terms and conditions recorded in this document apply in conjunction and must be read with the Limes Network Mobile Subscriber terms and conditions (&quot;Mobile Subscriber terms and conditions&quot;), save that where there is a conflict between the Mobile Subscriber terms and conditions and these terms and conditions, these terms and conditions shall prevail. We reserve the right to change the terms and conditions recorded herein, with 60 days&apos; notice to you.
          </p>

          <p className="font-grotesque font-semibold text-white">2. Qualifying subscriptions</p>
          <p>2.1 These terms and conditions apply to qualifying subscriptions that we offer (&quot;the subscription&quot; or &quot;the subscriptions&quot;).</p>
          <p>2.2 If you have subscribed for a qualifying subscription you shall be entitled to the benefits set out in your subscription, subject to clauses 3 and 4 below, and upon payment of the applicable monthly fee (&quot;the monthly fee&quot;). Increases to and the method of payment of the monthly fee are provided for in the Mobile Subscriber terms and conditions.</p>
          <p>2.3 The subscription shall subsist for as long as you remain a customer of Limes Network, but the subscription may be terminated in terms of these terms and conditions and the termination provisions of the Mobile Subscriber terms and conditions.</p>
          <p>2.4 Subscription benefits are as specified in your chosen subscription. All other services provided by us will be charged at the rates provided for in the Limes Network Mobile Subscriber terms and conditions.</p>

          <p className="font-grotesque font-semibold text-white">3. Restrictions</p>
          <p>3.1 The subscription must be used for personal or business use. If used for business purposes the additional restrictions in clause 4 apply.</p>
          <p>3.2 Benefits under the subscription do not apply to calls made to premium rated numbers or international numbers. These will be charged at the applicable rates prescribed in the Limes Network Mobile Subscriber terms and conditions.</p>
          <p>3.3 You must utilise the SIM provided by us to you in a device that is capable of making and receiving calls as well as sending and receiving data.</p>
          <p>3.4 We may set per-call duration limits for voice calls. Where such limits apply, you will be charged for usage beyond the limit. We will communicate any applicable limits to you at sign-up or via your account.</p>
          <p>3.5 We may require minimum usage (for example, minimum data usage) on a monthly basis. Where such requirements apply, they will be set out in your subscription terms.</p>
          <p>3.6 If your usage falls below any minimums specified for your subscription, you will be in breach of this policy.</p>
          <p>3.7 You may not create a call connection for purposes other than person-to-person communication or leave a call connection in an unattended state for a prolonged period of time, for example as a passive listening device. If you do so, you will be in breach of this policy.</p>
          <p>3.8 We may limit the number of unique numbers you may call. Where such limits apply, they will be communicated to you. Exceeding the limit will constitute a breach of this policy.</p>
          <p>3.9 We may require balanced usage (for example, a minimum ratio of incoming to outgoing calls). Where such requirements apply, they will be set out in your subscription terms. Incoming calls from us are excluded from such calculations.</p>

          <p className="font-grotesque font-semibold text-white">4. Business users</p>
          <p>4.1 If you are a juristic entity we deem you to be a business user and the provisions which follow will apply to you. If you are a natural person, you will also be deemed to be a business user if usage is for commercial purposes. We will be entitled to monitor your usage and will be entitled in our discretion to conclude that you are a business user (if your usage reasonably supports that conclusion).</p>
          <p>4.2 In addition to any other terms and conditions in this policy, business users:</p>
          <p>4.2.1 May not restrict the device to a fixed, geographical location; and/or</p>
          <p>4.2.2 May not use the device for least cost routing, server hosting, in the operation of an internet cafe or Wi-Fi hotspot, as an international bypass, payphone or call centre.</p>

          <p className="font-grotesque font-semibold text-white">5. Breach</p>
          <p>5.1 If you are in breach of any of the restrictions identified in section 3:</p>
          <p>5.1.1 You will be migrated to an alternative subscription which we may offer from time to time, on the terms and conditions that apply to that subscription, to come into effect from the beginning of the following month; and/or</p>
          <p>5.1.2 You have the option to cancel your subscription with Limes Network.</p>
          <p>5.1.3 We may suspend your subscription either temporarily or indefinitely; and/or</p>
          <p>5.1.4 We may preclude you from purchasing the same or similar subscriptions in future.</p>
          <p>5.2 In the event that you breach a provision of this policy we will notify you of your breach via SMS (to the associated number) and/or email (recorded on your Limes Network account profile) and advise you of our election in terms of clause 5.1.</p>

          <p>
            <strong>IMPORTANT:</strong> Some clauses above relate to issues which may pose some risk for you, or which may limit our liability or which you may not ordinarily expect. Please pay special attention to these clauses. By entering into the Agreement, you, in addition to accepting all the terms of the Agreement, also specifically signify that you understand the bold clauses and accept them.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
