import { auth } from '../../../config/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import type { UserCredential } from 'firebase/auth'

export type EmailPasswordCredentials = { email: string; password: string }

export const firebaseAuthService = {
  async signInWithEmailPassword({ email, password }: EmailPasswordCredentials): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password)
  },

  async signUpWithEmailPassword({ email, password }: EmailPasswordCredentials): Promise<UserCredential> {
    return await createUserWithEmailAndPassword(auth, email, password)
  },
}


