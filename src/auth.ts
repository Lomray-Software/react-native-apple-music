import { NativeModules } from 'react-native';

const { MusicModule } = NativeModules;

enum AuthStatus {
  AUTHORIZED = 'authorized',
  DENIED = 'denied',
  NOT_DETERMINED = 'notDetermined',
  RESTRICTED = 'restricted',
  UNKNOWN = 'unknown',
}

interface ISubscriptionResult {
  canPlayCatalogContent: boolean;
  hasCloudLibraryEnabled: boolean;
}

class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   * @param {function(AuthStatus):void} callback - The callback function to handle the authorization status.
   */
  public static authorize(callback: (status: AuthStatus) => void) {
    MusicModule.authorization(callback);
  }

  /**
   * Checks the user's subscription status for Apple Music.
   * @returns {Promise<ISubscriptionResult>} A promise that resolves to the subscription status.
   */
  public static async checkSubscription(): Promise<ISubscriptionResult> {
    try {
      const result: ISubscriptionResult = await MusicModule.checkSubscription();

      return result;
    } catch (error) {
      console.log('Check subscription failed');

      return {
        canPlayCatalogContent: false,
        hasCloudLibraryEnabled: false,
      };
    }
  }
}

export default Auth;
