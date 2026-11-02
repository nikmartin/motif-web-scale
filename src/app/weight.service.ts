import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ScaleConnectionService, WEIGHT_SERVICE, WEIGHT_CHARACTERISTIC } from './scale-connection.service';

@Injectable({
  providedIn: 'root'
})
export class WeightService {


  static GATT_PRIMARY_SERVICE = WEIGHT_SERVICE;
  static GATT_CHARACTERISTIC_WEIGHT = WEIGHT_CHARACTERISTIC;


  // 00002902-0000-1000-8000-00805f9b34fb
  // 00002904-0000-1000-8000-00805f9b34fb
  constructor(public ble: BluetoothCore, private connection: ScaleConnectionService) {

  }

  listen(): Observable<boolean> {
    return this.connection.connected$;
  }

  getDevice(): Observable<BluetoothDevice> {

    return this.connection.device$;
  }


  stream(): Observable<number> {
    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$().pipe(map((value: DataView) => value.getInt32(0, true) * Math.pow(10, -6)));
  }

  disconnectDevice(): void {
    this.connection.disconnect();
  }
  /**
   * Get Weight GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics they want.
   *
   * @return Emits the value of the requested service read from the device
   */
  value() {
    console.log('Getting Weight...');

    return this.connection
      .connect()
      .pipe(

        // 2) get that service
        mergeMap((gatt: BluetoothRemoteGATTServer) => {
          // gatt.connect();
          return this.ble.getPrimaryService$(gatt, WeightService.GATT_PRIMARY_SERVICE);
        }),

        // 3) get a specific characteristic on that service
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return this.ble.getCharacteristic$(primaryService, WeightService.GATT_CHARACTERISTIC_WEIGHT);
        }),

        // 4) ask for the value of that characteristic (will return a DataView)
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.ble.readValue$(characteristic);
        }),

        // 5) on that DataView, get the right value
        map((value: DataView) => {
          return value.getInt32(0, true) * Math.pow(10, -6);
        })
      );
  }
}
