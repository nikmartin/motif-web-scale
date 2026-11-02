import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { filter, map, mergeMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScaleConnectionService, WEIGHT_SERVICE, WEIGHT_CHARACTERISTIC } from './scale-connection.service';

@Injectable({
  providedIn: 'root'
})
export class WeightService {


  static GATT_PRIMARY_SERVICE = WEIGHT_SERVICE;
  static GATT_CHARACTERISTIC_WEIGHT = WEIGHT_CHARACTERISTIC;

  private readonly weightSubject = new BehaviorSubject<number>(null);

  private readonly onWeightChanged = (event: Event) => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    if (characteristic.value) {
      this.weightSubject.next(characteristic.value.getInt32(0, true) * Math.pow(10, -6));
    }
  };


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
    return this.weightSubject.asObservable().pipe(filter(value => value !== null));
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
          return this.ble.getPrimaryService$(gatt, WeightService.GATT_PRIMARY_SERVICE);
        }),

        // 3) get the characteristic directly so the listener is attached
        // before notifications are enabled
        mergeMap((primaryService: BluetoothRemoteGATTService) => {
          return primaryService.getCharacteristic(WeightService.GATT_CHARACTERISTIC_WEIGHT);
        }),

        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.startNotifications(characteristic);
        }),

        // 4) read the initial value so the first displayed weight is available
        // even if the scale does not send a notification immediately
        mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
          return this.ble.readValue$(characteristic);
        }),

        // 5) on that DataView, get the right value
        map((value: DataView) => {
          const weight = value.getInt32(0, true) * Math.pow(10, -6);
          this.weightSubject.next(weight);
          return weight;
        })
      );
  }

  private startNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<BluetoothRemoteGATTCharacteristic> {
    characteristic.addEventListener('characteristicvaluechanged', this.onWeightChanged);
    return characteristic.startNotifications().then(() => characteristic);
  }
}
