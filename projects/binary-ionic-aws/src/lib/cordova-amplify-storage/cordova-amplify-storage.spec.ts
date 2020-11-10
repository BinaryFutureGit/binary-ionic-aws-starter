import { TestBed } from "@angular/core/testing";
import { Platform } from "@ionic/angular";
import { IonicStorageModule, Storage } from "@ionic/storage";
import {
  AMPLIFY_STORAGE_KEY_PREFIX,
  CordovaAmplifyStorage,
} from "./cordova-amplify-storage.service";

describe("AwsAmplifyAuthStorage", () => {
  let cordovaAmplifyStorage: CordovaAmplifyStorage;
  let storage: Storage;
  let platform: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    const platformSpy = jasmine.createSpyObj("Platform", ["ready"]);
    platformSpy.ready.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      declarations: [],
      imports: [IonicStorageModule.forRoot()],
      providers: [
        CordovaAmplifyStorage,
        { provide: Platform, useValue: platformSpy },
      ],
    });
    cordovaAmplifyStorage = TestBed.get(CordovaAmplifyStorage);
    storage = TestBed.get(Storage);
    await storage.clear();
    platform = TestBed.get(Platform);
  });

  describe("set", () => {
    it("should set a value to memory & storage", () => {
      const key = "test";
      const value = "value";

      const storageSetSpy = spyOn(storage, "set");
      storageSetSpy.and.callThrough();

      const result = cordovaAmplifyStorage.setItem(key, value);

      expect(result).toBe(value);
      expect(storageSetSpy).toHaveBeenCalledWith(getStorageKey(key), value);
    });
  });

  describe("sync", () => {
    it("should sync data from storage", async () => {
      const key1 = "test";
      const value1 = 1;
      const key2 = "test2";
      const value2 = 2;

      await storage.set(getStorageKey(key1), value1);
      await storage.set(getStorageKey(key2), value2);

      await cordovaAmplifyStorage.sync();

      const result1 = cordovaAmplifyStorage.getItem(key1);
      const result2 = cordovaAmplifyStorage.getItem(key2);
      expect(result1).toBe(value1);
      expect(result2).toBe(value2);
    });
  });

  describe("clear", () => {
    it("should remove all storage keys on clear", async done => {
      const key1 = getStorageKey("test");
      const value1 = 1;
      const key2 = getStorageKey("test2");
      const value2 = 2;
      const nonAuthKey = "1234";
      const nonAuthValue = 3;

      await storage.set(key1, value1);
      await storage.set(key2, value2);
      await storage.set(nonAuthKey, nonAuthValue);

      const spy = spyOn(storage, "remove");

      spy.and.callThrough();

      const result = cordovaAmplifyStorage.clear();
      expect(result).toBeUndefined();
      // Use a timeout to allow all promises to resolve. As clear returns void,
      // not a promise, we have to wait till the next process tick to check that
      // .remove has been called
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(key1);
        expect(spy).toHaveBeenCalledWith(key2);
        done();
      }, 100);
    });
  });
});

function getStorageKey(memoryKey) {
  return AMPLIFY_STORAGE_KEY_PREFIX + memoryKey;
}
