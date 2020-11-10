import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";

export const AMPLIFY_STORAGE_KEY_PREFIX = "@AuthStorage:";

@Injectable()
export class CordovaAmplifyStorage {
  private syncPromise = null;
  private dataMemory: { [key: string]: any } = {};

  constructor(private storage: Storage, private platform: Platform) {}

  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem<T>(key: string, value: T): T {
    this.storage.set(this.getStorageKey(key), value);
    this.dataMemory[key] = value;
    return this.dataMemory[key];
  }

  /**
   * This is used to get a specific key from storage
   * @param {string} key - the key for the item
   * This is used to clear the storage
   * @returns {string} the data item
   */
  getItem<T>(key: string): T {
    return Object.prototype.hasOwnProperty.call(this.dataMemory, key)
      ? this.dataMemory[key]
      : undefined;
  }

  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key: string) {
    this.storage.remove(this.getStorageKey(key));
    return delete this.dataMemory[key];
  }

  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear(): any {
    this.storage.keys().then(keys => this.clearAllStorageKeys(keys));
    this.dataMemory = {};
  }

  /**
   * Will sync the MemoryStorage data from @ionic/storage to MemoryStorage
   * @returns {void}
   */
  sync(): Promise<void> {
    if (!this.syncPromise) {
      this.syncPromise = this.platform.ready().then(() => {
        return this.storage.forEach((value, key) => {
          if (key.startsWith(AMPLIFY_STORAGE_KEY_PREFIX)) {
            const memoryKey = this.getKeyFromStorageKey(key);
            this.dataMemory[memoryKey] = value;
          }
        });
      });
    }

    return this.syncPromise;
  }

  private getStorageKey(memoryKey) {
    return AMPLIFY_STORAGE_KEY_PREFIX + memoryKey;
  }

  private getKeyFromStorageKey(storageKey: string) {
    return storageKey.replace(AMPLIFY_STORAGE_KEY_PREFIX, "");
  }

  private async clearAllStorageKeys(keys: string[]) {
    const authKeys = keys.filter(k => k.startsWith(AMPLIFY_STORAGE_KEY_PREFIX));
    // note - do this in series so that any concurrent issues are prevented
    for (const key of authKeys) {
      try {
        await this.storage.remove(key);
      } catch (error) {
        // silently ignore errors when removing keys
      }
    }
  }
}
