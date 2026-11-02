import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { Observable } from 'rxjs';
import { ScaleConnectionService, BATTERY_SERVICE, BATTERY_CHARACTERISTIC } from './scale-connection.service';

@Injectable({
  providedIn: 'root'
})
export class BatteryLevelService {
  static GATT_CHARACTERISTIC_BATTERY_LEVEL = BATTERY_CHARACTERISTIC;
  static GATT_PRIMARY_SERVICE = BATTERY_SERVICE;

  constructor(public ble: BluetoothCore, private connection: ScaleConnectionService) { }

  getDevice(): Observable<BluetoothDevice> {
    // call this method to get the connected device
    return this.connection.device$;
  }

  stream(): Observable<number> {
    // call this method to get a stream of values emitted by the device

    return this.ble.streamValues$().pipe(map((value: DataView) => value.getUint8(0)));
  }

  disconnectDevice(): void {
    this.connection.disconnect();
  }

  /**
   * Get Battery Level GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics they want.
   *
   * @return Emites the value of the requested service read from the device
   */
  value() {
    console.log('Getting Battery level...');

    return this.connection
      .connect()
      .pipe(

        // 2) get that service
        mergeMap((gatt: BluetoothRemoteGATTServer) => {
          return this.ble.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE);
        }),

        // 3) get a specific characteristic on that service
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return this.ble.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL);
        }),

        // 4) ask for the value of that characteristic (will return a DataView)
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.ble.readValue$(characteristic);
        }),

        // 5) on that DataView, get the right value
        map((value: DataView) => {
          return value.getUint8(0);
        })
      );
  }
}
