import { useCallback, useEffect, useState } from 'react';

interface SwitchToContractModalProps {
  open: boolean;
  onClose: () => void;
  msisdn: string;
  productId: string;
  onConfirm: (msisdn: string, productId: string) => void | Promise<void>;
}

export function SwitchToContractModal({ open, onClose, msisdn, productId, onConfirm }: SwitchToContractModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setIsSuccess(false);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  const handleConfirm = async () => {
    if (!msisdn || !productId) return;

    setIsLoading(true);
    setError(null);

    try {
      // productId here is the TARGET SIM-package ID (ending in P), not the
      // user's current plan. The backend migrate endpoint uses this to know
      // that we are upgrading an existing SIM to contract.
      //
      // BACKEND TODO: When the API supports passing the actual contract plan
      // product ID (e.g. a specific combo bundle), we should update this call
      // to include that second ID as well.
      await Promise.resolve(onConfirm(msisdn, productId));
      setIsSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to switch to subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    resetState();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={isLoading ? undefined : onClose} aria-hidden />

      <div className="relative w-full max-w-lg mx-0 sm:mx-4 rounded-[28px] bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200 bg-white">
          <div>
            <div className="font-grotesque text-[22px] font-semibold leading-[1.1]">Switch to Subscription</div>
            <div className="font-manrope text-sm text-neutral-500 mt-1">
              Upgrade your SIM from Prepaid to Subscription.
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="size-10 grid place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 text-2xl transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {isSuccess ? (
          <div className="px-6 pt-8 pb-10 text-center">
            <div className="flex justify-center mb-5">
              <img
                src={`${import.meta.env.BASE_URL}images/favicon.svg`}
                alt="Limes"
                className="w-16 h-16"
              />
            </div>
            <div className="font-grotesque text-[24px] font-semibold text-neutral-900">Upgrade in progress!</div>
            <div className="font-manrope mt-3 text-sm text-neutral-600 leading-relaxed">
              Your SIM <span className="font-semibold">{msisdn}</span> is being upgraded to Subscription.
              <br />
              This may take a few moments to complete.
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleDone}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#ABFF63] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.99] transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-7 space-y-5">
            <div className="rounded-2xl bg-neutral-50 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-manrope text-sm text-neutral-500">SIM Number</span>
                <span className="font-manrope text-sm font-semibold text-neutral-900">{msisdn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-manrope text-sm text-neutral-500">Target Package ID</span>
                <span className="font-manrope text-sm font-semibold text-neutral-900">{productId}</span>
              </div>
            </div>

            <p className="font-manrope text-sm text-neutral-600 leading-relaxed">
              You are about to switch this SIM from Prepaid to Subscription. Your monthly billing will begin once the upgrade is processed.
            </p>

            {error && (
              <p id="subscription-error" className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!msisdn || !productId || isLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#FDDA36] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block size-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin" aria-hidden />
                    Processing…
                  </>
                ) : (
                  'Confirm Upgrade'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
