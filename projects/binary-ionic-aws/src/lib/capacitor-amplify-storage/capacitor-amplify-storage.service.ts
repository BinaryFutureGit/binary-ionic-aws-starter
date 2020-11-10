import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { platformReady } from "../utils/platform-ready";

const { Storage } = Plugins;

export const AMPLIFY_STORAGE_KEY_PREFIX = "@AmplifyStorage:";

export const CAPACITOR_AMPLIFY_STORAGE_INITIAL_MEMORY_CACHE =
  "CapacitorAmplifyStorageInitialMemoryCache";

export interface CapacitorAmplifyStorageConfig {
  storageKeyPrefix: string;
}

export const DEFAULT_CONFIG: CapacitorAmplifyStorageConfig = {
  storageKeyPrefix: AMPLIFY_STORAGE_KEY_PREFIX,
};

export class CapacitorAmplifyStorage {
  private syncPromise = null;
  private dataMemory: { [key: string]: any } = {};

  constructor(private config: CapacitorAmplifyStorageConfig = DEFAULT_CONFIG) {}

  /**
   * This is used to set a specific item in storage
   * @param {string} key - the key for the item
   * @param {object} value - the value
   * @returns {string} value that was set
   */
  setItem(key: string, value: string): string {
    Storage.set({ key: this.getStorageKey(key), value });
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
      : null;
  }

  /**
   * This is used to remove an item from storage
   * @param {string} key - the key being set
   * @returns {string} value - value that was deleted
   */
  removeItem(key: string) {
    Storage.remove({ key: this.getStorageKey(key) });
    return delete this.dataMemory[key];
  }

  /**
   * This is used to clear the storage
   * @returns {string} nothing
   */
  clear(): any {
    Storage.keys().then(async ({ keys }) => {
      const authKeys = keys.filter(k =>
        k.startsWith(AMPLIFY_STORAGE_KEY_PREFIX)
      );
      // note - do this in series so that any concurrent issues are prevented
      for (const key of authKeys) {
        try {
          await Storage.remove({ key });
        } catch (error) {
          // silently ignore errors when removing keys
        }
      }
    });
    this.dataMemory = {};
  }

  /**
   * Will sync the MemoryStorage data from @ionic/storage to MemoryStorage
   * @returns {void}
   */
  sync(): Promise<void> {
    if (!this.syncPromise) {
      this.syncPromise = platformReady
        .then(() => this.loadDataFromStorage())
        .then(memoryCache => (this.dataMemory = memoryCache));
    }

    return this.syncPromise;
  }

  private async loadDataFromStorage(): Promise<any> {
    const dataStore = {};
    const { keys } = await Storage.keys();
    const getPromises = keys
      .filter(key => key.startsWith(DEFAULT_CONFIG.storageKeyPrefix))
      .map(async key => {
        try {
          const { value } = await Storage.get({ key });
          const memoryKey = this.getKeyFromStorageKey(key);
          dataStore[memoryKey] = value;
        } catch (error) {
          // silently swallow any error
        }
      });
    await Promise.all(getPromises);
    return dataStore;
  }

  private getStorageKey(memoryKey) {
    return DEFAULT_CONFIG.storageKeyPrefix + memoryKey;
  }

  private getKeyFromStorageKey(storageKey: string) {
    return storageKey.replace(DEFAULT_CONFIG.storageKeyPrefix, "");
  }
}
