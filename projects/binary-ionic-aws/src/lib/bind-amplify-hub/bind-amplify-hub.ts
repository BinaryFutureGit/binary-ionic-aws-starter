import { Hub } from "@aws-amplify/core";
import { HubCallback, HubCapsule } from "@aws-amplify/core/lib-esm/Hub";
import { Observable } from "rxjs";

export function bindHub(channel: string | RegExp = "*") {
  return new Observable<HubCapsule>(observer => {
    const listener: HubCallback = capsule => observer.next(capsule);
    Hub.listen(channel, listener);
    return () => Hub.remove(channel, listener);
  });
}
