import * as Sentry from "@sentry/react";

export function openSentryFeedback() {
  const feedback = Sentry.getFeedback();
  if (feedback) {
    feedback.createForm();
  }
}
