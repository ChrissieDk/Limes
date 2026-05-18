import { userService } from '../services/userService'
import { userHasProvisionedSim } from './userProvisioning'

/**
 * Checks whether the current user has a provisioned SIM and returns
 * the appropriate post-auth redirect path.
 *
 * Has SIM  → /dashboard
 * No SIM   → /dashboard/packages
 * Error    → /dashboard/packages (safe fallback)
 */
export async function getPostAuthRedirectPath(): Promise<string> {
  try {
    const user = await userService.getCurrentUser()
    return userHasProvisionedSim(user) ? '/dashboard' : '/dashboard/packages'
  } catch {
    return '/dashboard/packages'
  }
}
