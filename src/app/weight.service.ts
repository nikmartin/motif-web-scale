import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeightService {


  static GATT_PRIMARY_SERVICE = '1bc50001-0200-0aa5-e311-24cb004a98c5';
  static GATT_CHARACTERISTIC_WEIGHT = '1bc50002-0200-0aa5-e311-24cb004a98c5';

  constructor(public ble: BluetoothCore) {
    this.getDevice().subscribe(dev => {
      dev.gatt.connect();
    });
  }

  getDevice() {
    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  stream() {
    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$().pipe(map((value: DataView) => value.getInt32(0, true) * Math.pow(10, -6)));
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
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

    return this.ble

      // 1) call the discover method will trigger the discovery process (by the browser)
      .discover$({
        acceptAllDevices: true,
        optionalServices: [WeightService.GATT_PRIMARY_SERVICE]
      })
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
