import { useCallback, useEffect, useState } from 'react';

interface PortNumberModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled Limes MSISDN (destination SIM we're porting to) */
  currentMsisdn: string;
  onConfirm: (limesMsisdn: string, numberToPortFrom: string) => void | Promise<void>;
}

export function PortNumberModal({ open, onClose, currentMsisdn, onConfirm }: PortNumberModalProps) {
  const [limesMsisdn, setLimesMsisdn] = useState('');
  const [numberToPortFrom, setNumberToPortFrom] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setLimesMsisdn('');
    setNumberToPortFrom('');
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
      setLimesMsisdn(currentMsisdn);
    }
  }, [open, resetState, currentMsisdn]);

  const handleConfirm = async () => {
    const trimmedLimes = limesMsisdn.trim();
    const trimmedPortFrom = numberToPortFrom.trim();
    if (!trimmedLimes || !trimmedPortFrom) return;

    setIsLoading(true);
    setError(null);

    try {
      await Promise.resolve(onConfirm(trimmedLimes, trimmedPortFrom));
      setIsSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit porting request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    resetState();
    onClose();
  };

  const canConfirm =
    limesMsisdn.trim().length > 0 &&
    numberToPortFrom.trim().length > 0 &&
    !isLoading;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />

      <div className="relative w-full max-w-3xl mx-0 sm:mx-4 rounded-[28px] bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200 bg-white">
          <div>
            <div className="font-grotesque text-[22px] font-semibold leading-[1.1]">Port your number</div>
            <div className="font-manrope text-sm text-neutral-500 mt-1">
              Enter your Limes number (destination), then the number you&apos;re porting from another provider.
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
          <div className="px-6 pt-6 pb-7 text-center">
            <div className="font-grotesque text-[28px] font-semibold text-neutral-900">Success!</div>
            <div className="font-manrope mt-3 text-sm text-neutral-600 leading-relaxed">
              Your porting request has been submitted successfully.
              <br />
              Porting can take between 24 and 48 hours
            </div>

            <div className="mt-7 flex justify-center">
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
            <div>
              <label htmlFor="port-limes-msisdn" className="font-manrope block text-sm text-neutral-700 font-medium mb-2">
                1. Limes number to port to (your current Limes SIM)
              </label>
              <input
                id="port-limes-msisdn"
                type="tel"
                value={limesMsisdn}
                onChange={(e) => setLimesMsisdn(e.target.value)}
                placeholder="098 898 8989"
                className="w-full h-12 rounded-2xl border border-neutral-300 px-5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="port-from-msisdn" className="font-manrope block text-sm text-neutral-700 font-medium mb-2">
                2. Number you&apos;re porting from (your current number at another provider)
              </label>
              <input
                id="port-from-msisdn"
                type="tel"
                value={numberToPortFrom}
                onChange={(e) => setNumberToPortFrom(e.target.value)}
                placeholder="082 323 4500"
                className="w-full h-12 rounded-2xl border border-neutral-300 px-5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-invalid={!!error}
                aria-describedby={error ? 'port-error' : undefined}
              />
            </div>

            {error && (
              <p id="port-error" className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#ABFF63] px-12 text-sm font-semibold text-neutral-900 hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block size-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
