import type { User } from '../../../types'

/** True when the user has at least one MSISDN from GET /user (provisioned SIM on account). */
export function userHasProvisionedSim(user: User): boolean {
  return (user.msisdns?.length ?? 0) > 0
}
