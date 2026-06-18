import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../../config/firebase";
import { confirmPasswordReset, checkActionCode } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Footer from "../components/Footer";
import MobilePage from "../../../components/MobilePage";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseAuthErrorMessage";

const schema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validLink, setValidLink] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const validateLink = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");

      if (mode !== "resetPassword" || !oobCode) {
        setValidating(false);
        setValidLink(false);
        return;
      }

      try {
        await checkActionCode(auth, oobCode);
        setValidLink(true);
      } catch (error) {
        console.error("Invalid reset link:", error);
        setValidLink(false);
      } finally {
        setValidating(false);
      }
    };

    validateLink();
  }, [searchParams]);

  const onSubmit = async (values: FormValues) => {
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setSubmitError("Invalid reset link");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setSuccess(true);
    } catch (err: unknown) {
      setSubmitError(getFirebaseAuthErrorMessage(err, "accountAction"));
    } finally {
      setSubmitting(false);
    }
  };

  const desktopHeading = validating
    ? "Validating Reset Link..."
    : !validLink
      ? "Invalid Reset Link"
      : success
        ? "Password Reset!"
        : "Reset Your Password";

  const desktopSubheading = validating
    ? "Please wait while we verify your password reset link."
    : !validLink
      ? "This password reset link is invalid or has expired."
      : success
        ? "Your password has been successfully reset. You can now sign in with your new password."
        : "Enter your new password below.";

  const spinner = (
    <div className="p-4 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#ABFF63]"></div>
    </div>
  );

  const invalidLinkContent = (
    <div className="grid gap-4">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400 text-sm text-center">
          Please request a new password reset link.
        </p>
      </div>
      <Button
        onClick={() => navigate("/forgot-password")}
        className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
      >
        Request New Reset Link
      </Button>
    </div>
  );

  const successContent = (
    <div className="grid gap-4">
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="font-manrope text-green-400 text-sm text-center">
          ✓ Your password has been reset successfully!
        </p>
      </div>
      <Button
        onClick={() => navigate("/signin")}
        className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
      >
        Sign In
      </Button>
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <TextField
        variant="dark"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        {...register("password")}
        error={errors.password?.message}
      />

      <TextField
        variant="dark"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your new password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        disabled={submitting}
        className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
      >
        {submitting ? "Resetting..." : "Reset Password"}
      </Button>

      {submitError && (
        <div className="font-manrope text-sm text-red-400 text-center">
          {submitError}
        </div>
      )}
    </form>
  );

  // Determine which content to show
  let mainContent: React.ReactNode;
  if (validating) {
    mainContent = spinner;
  } else if (!validLink) {
    mainContent = invalidLinkContent;
  } else {
    mainContent = success ? successContent : formContent;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">
        <AuthLayout
          variant="signin"
          footer={<Footer />}
          heading={desktopHeading}
          subheading={desktopSubheading}
        >
          {mainContent}
        </AuthLayout>
      </div>

      {/* Mobile */}
      <MobilePage title="New password" backTo="/signin">
        <div className="flex flex-col justify-center min-h-[calc(100vh-180px)] px-6">
          {validating ? (
            <>
              <h1 className="font-grotesque font-bold text-white text-[32px] leading-tight mb-2">
                Validating Reset Link...
              </h1>
              <p className="font-manrope text-neutral-400 text-sm mb-8">
                Please wait while we verify your password reset link.
              </p>
              {spinner}
            </>
          ) : !validLink ? (
            <>
              <h1 className="font-grotesque font-bold text-white text-[32px] leading-tight mb-2">
                Invalid Reset Link
              </h1>
              <p className="font-manrope text-neutral-400 text-sm mb-8">
                This password reset link is invalid or has expired.
              </p>
              {invalidLinkContent}
            </>
          ) : success ? (
            <>
              <h1 className="font-grotesque font-bold text-white text-[32px] leading-tight mb-2">
                Password Reset!
              </h1>
              <p className="font-manrope text-neutral-400 text-sm mb-8">
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>
              {successContent}
            </>
          ) : (
            <>
              <h1 className="font-grotesque font-bold text-white text-[32px] leading-tight mb-2">
                Reset Your Password
              </h1>
              <p className="font-manrope text-neutral-400 text-sm mb-8">
                Enter your new password below.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <TextField
                  variant="dark"
                  type="password"
                  placeholder="New password"
                  {...register("password")}
                  error={errors.password?.message}
                />

                <TextField
                  variant="dark"
                  type="password"
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 h-10 rounded-lg border border-white/10 shadow-none"
                >
                  {submitting ? "Resetting..." : "Reset Password"}
                </Button>

                {submitError && (
                  <div className="font-manrope text-sm text-red-400 text-center">
                    {submitError}
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </MobilePage>
    </>
  );
}
