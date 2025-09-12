import Button from './Button'

export default function Navbar() {
  return (
    <div className="sticky top-3 z-10">
      <nav className="mx-auto max-w-6xl rounded-xl bg-white text-black shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-8">
            <img src="/images/Logo.png" alt="Limes" className="h-10" />
          </div>
          <ul className="hidden md:flex gap-8 text-[15px]">
            <li>Home</li>
            <li>Why Choose Limes</li>
            <li>Packages</li>
            <li>Why Partner With Us</li>
            <li>Who We Partner With</li>
          </ul>
          <div className="w-36">
            <Button variant="primary">Contact Us</Button>
          </div>
        </div>
      </nav>
    </div>
  )
}


