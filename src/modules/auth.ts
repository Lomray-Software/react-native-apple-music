import { NativeModules } from 'react-native';
import type { AuthStatus } from '../types/auth-status';
import type { ICheckSubscription } from '../types/check-subscription';

const { MusicModule } = NativeModules;

class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   * This function returns a promise that resolves to the authorization status.
   * @returns {Promise<AuthStatus>} A promise that resolves to the authorization status of the user's Apple Music account.
   */
  public static authorize(): Promise<AuthStatus> {
    return new Promise((res, rej) => {
      try {
        MusicModule.authorization(res);
      } catch (error) {
        console.error('Apple Music Kit: Authorize failed.', error);

        rej(error);
      }
    });
  }

  /**
   * Checks the user's subscription status for Apple Music via MusicSubscription.current.
   * @returns {Promise<ICheckSubscription>} A promise that resolves to the subscription capabilities.
   * @throws {MusicSubscriptionError} On failure. Error.code is one of: 'unknown' | 'permissionDenied' | 'privacyAcknowledgementRequired'. Use isMusicSubscriptionError() to narrow.
   */
  public static async checkSubscription(): Promise<ICheckSubscription> {
    const result: ICheckSubscription = await MusicModule.checkSubscription();

    return result;
  }
}

export default Auth;
