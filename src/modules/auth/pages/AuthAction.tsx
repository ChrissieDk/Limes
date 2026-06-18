import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Footer from "../components/Footer";
import MobilePage from "../../../components/MobilePage";

/**
 * Single entry point for Firebase email action links (verification + password reset).
 * Firebase Console only allows one custom action URL, so both link types hit this route.
 * We read `mode` and redirect to the correct page with the same params.
 */
export default function AuthAction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    if (!mode || !oobCode) {
      navigate("/signin", { replace: true });
      return;
    }

    if (mode === "verifyEmail") {
      navigate(`/auth/verify-email?${searchParams.toString()}`, {
        replace: true,
      });
      return;
    }

    if (mode === "resetPassword") {
      navigate(`/auth/reset-password?${searchParams.toString()}`, {
        replace: true,
      });
      return;
    }

    // Unknown mode
    navigate("/signin", { replace: true });
  }, [searchParams, navigate]);

  const spinner = (
    <div className="p-4 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ABFF63]" />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <AuthLayout
          variant="signin"
          footer={<Footer />}
          heading="Taking you there..."
          subheading="One moment."
        >
          {spinner}
        </AuthLayout>
      </div>

      {/* Mobile */}
      <MobilePage title="Account" backTo="/signin">
        <div className="flex flex-col justify-center min-h-[calc(100vh-180px)] px-6">
          <h1 className="font-grotesque font-bold text-white text-[32px] leading-tight mb-2">
            Taking you there...
          </h1>
          <p className="font-manrope text-neutral-400 text-sm mb-8">
            One moment.
          </p>
          {spinner}
        </div>
      </MobilePage>
    </>
  );
}
