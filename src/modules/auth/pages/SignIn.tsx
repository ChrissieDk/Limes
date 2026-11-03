import AuthShell from '../layouts/AuthShell'
import LoginForm from '../components/LoginForm'
import Footer from '../components/Footer'

export default function SignIn() {
  return (
    <AuthShell
      eyebrow="Log in"
      heading="Welcome back"
      subheading="Log in to manage your data, earn rewards, and keep the good stuff rolling."
      footer={<Footer />}
    >
      <LoginForm />
    </AuthShell>
  )
}
