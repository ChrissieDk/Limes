import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { crmService } from "../../crm/services/crmService";
import { getAxiosErrorMessage } from "../../../utils/errorMessage";
import type { GetAccountCustomerResponse, RicaAddress } from "../../../types";
import DashboardNavbar, {
  clearDashboardDisplayNameCache,
} from "../components/DashboardNavbar";
import MobilePage from "../../../components/MobilePage";
import Footer from "../components/Footer";
import TextField from "../components/TextField";
import Button from "../components/Button";

const schema = z.object({
  firstname: z.string().min(1, "First name is required").max(120),
  lastname: z.string().min(1, "Last name is required").max(120),
  streetNo: z.string().min(1, "Street number is required"),
  streetName: z.string().min(1, "Street name is required"),
  suburb: z.string(),
  city: z.string().min(1, "City is required"),
  stateOrProvince: z.string().min(1, "Province / state is required"),
  postCode: z.string().min(1, "Postal code is required"),
});

type FormValues = z.infer<typeof schema>;

function pickPrimaryAddress(
  data: GetAccountCustomerResponse,
): RicaAddress | null {
  return data.customer?.address?.[0] ?? data.address?.[0] ?? null;
}

function mapResponseToFormDefaults(
  data: GetAccountCustomerResponse,
): FormValues {
  const addr = pickPrimaryAddress(data);
  return {
    firstname: data.detail?.firstname?.trim() ?? "",
    lastname: data.detail?.lastname?.trim() ?? "",
    streetNo: addr?.streetNo?.trim() ?? "",
    streetName: addr?.streetName?.trim() ?? "",
    suburb: addr?.suburb?.trim() ?? "",
    city: addr?.city?.trim() ?? "",
    stateOrProvince: addr?.stateOrProvince?.trim() ?? "",
    postCode: addr?.postCode?.trim() ?? "",
  };
}

export default function AccountDetails() {
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  };
  const countryRef = useRef<string>("ZA");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: "",
      lastname: "",
      streetNo: "",
      streetName: "",
      suburb: "",
      city: "",
      stateOrProvince: "",
      postCode: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadError(null);
      setLoading(true);
      try {
        const data = await crmService.getAccountCustomer();
        if (cancelled) return;
        reset(mapResponseToFormDefaults(data));
        countryRef.current =
          data.address?.[0]?.country ||
          data.customer?.address?.[0]?.country ||
          "ZA";
      } catch (err) {
        if (cancelled) return;
        setLoadError(getAxiosErrorMessage(err, "Failed to load your details"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await crmService.updateCustomer({
        isResidential: true,
        detail: {
          firstname: values.firstname.trim(),
          lastname: values.lastname.trim(),
          requireSecurityQuestions: false,
        },
        address: [
          {
            addressType: 1,
            streetNo: values.streetNo.trim(),
            streetName: values.streetName.trim(),
            suburb: values.suburb.trim(),
            city: values.city.trim(),
            stateOrProvince: values.stateOrProvince.trim(),
            postCode: values.postCode.trim(),
            country: countryRef.current,
          },
        ],
      } as any);
      setSuccess(true);
      const uid = auth.currentUser?.uid;
      if (uid) clearDashboardDisplayNameCache(uid);
    } catch (err) {
      setSubmitError(getAxiosErrorMessage(err, "Failed to save your details"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(
      () => e.target.scrollIntoView({ block: "center", behavior: "smooth" }),
      350,
    );
  };

  const formContent = (
    <div
      onPointerDown={(e) => {
        if (
          !(e.target as HTMLElement).closest("input,button,a,textarea,select")
        ) {
          (document.activeElement as HTMLElement)?.blur();
        }
      }}
    >
      {loading && (
        <p className="font-manrope text-neutral-400 text-sm text-center py-12">
          Loading your details…
        </p>
      )}
      {!loading && loadError && (
        <p className="text-red-400 text-sm text-center py-6 px-4">
          {loadError}
        </p>
      )}
      {!loading && !loadError && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Personal section */}
            <div className="mobile-form-section">
              <div className="mobile-form-section-title">Personal</div>
              <div className="grid gap-4">
                <TextField
                  label="First name"
                  variant="dark"
                  error={errors.firstname?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("firstname")}
                />
                <TextField
                  label="Last name"
                  variant="dark"
                  error={errors.lastname?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("lastname")}
                />
              </div>
            </div>

            {/* Address section */}
            <div className="mobile-form-section">
              <div className="mobile-form-section-title">Address</div>
              <div className="grid gap-4">
                <TextField
                  label="Street number"
                  variant="dark"
                  error={errors.streetNo?.message}
                  inputMode="numeric"
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("streetNo")}
                />
                <TextField
                  label="Street name"
                  variant="dark"
                  error={errors.streetName?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("streetName")}
                />
                <TextField
                  label="Suburb"
                  variant="dark"
                  error={errors.suburb?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("suburb")}
                />
                <TextField
                  label="City"
                  variant="dark"
                  error={errors.city?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("city")}
                />
                <TextField
                  label="Province / state"
                  variant="dark"
                  error={errors.stateOrProvince?.message}
                  enterKeyHint="next"
                  onFocus={handleFieldFocus}
                  {...register("stateOrProvince")}
                />
                <TextField
                  label="Postal code"
                  variant="dark"
                  error={errors.postCode?.message}
                  inputMode="numeric"
                  enterKeyHint="done"
                  onFocus={handleFieldFocus}
                  {...register("postCode")}
                />
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-red-400 px-4 pt-3">{submitError}</p>
            )}
            {success && (
              <p className="font-manrope text-sm text-[#ABFF63] px-4 pt-3">
                Your details were saved.
              </p>
            )}

            <div className="px-4 pt-6 pb-2">
              <Button
                type="submit"
                disabled={submitting}
                fullWidth
                className="h-12 text-sm"
              >
                {submitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>

          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full h-12 rounded-xl bg-red-600/20 text-red-400 font-semibold text-sm hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              {loggingOut ? "Signing out…" : "Logout"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: card-based layout */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-neutral-900">
          <DashboardNavbar />
          <div className="py-12 px-6">
            <div className="max-w-4xl mx-auto mt-5 rounded-[28px] bg-white/5 ring-1 ring-white/10 p-8 sm:p-10">
              {formContent}
            </div>
          </div>
          <Footer />
        </div>
      </div>

      {/* Mobile: iOS-style grouped form */}
      <MobilePage title="Edit details" backTo="/dashboard">
        {formContent}
      </MobilePage>
    </>
  );
}
