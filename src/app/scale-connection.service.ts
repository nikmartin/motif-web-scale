import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { finalize, shareReplay } from 'rxjs/operators';

export const WEIGHT_SERVICE = '1bc50001-0200-0aa5-e311-24cb004a98c5';
export const WEIGHT_CHARACTERISTIC = '1bc50002-0200-0aa5-e311-24cb004a98c5';
export const BATTERY_SERVICE = 0x180f;
export const BATTERY_CHARACTERISTIC = 0x2a19;

interface BluetoothWithDevices extends Bluetooth {
  getDevices?: () => Promise<BluetoothDevice[]>;
}

@Injectable({
  providedIn: 'root'
})
export class ScaleConnectionService {
  private readonly deviceSubject = new BehaviorSubject<BluetoothDevice>(null);
  private readonly connectedSubject = new BehaviorSubject<boolean>(false);

  readonly device$ = this.deviceSubject.asObservable();
  readonly connected$ = this.connectedSubject.asObservable();

  private device: BluetoothDevice = null;
  private gatt: BluetoothRemoteGATTServer = null;
  private connect$: Observable<BluetoothRemoteGATTServer> = null;

  private readonly onDisconnected = () => {
    this.gatt = null;
    this.connectedSubject.next(false);
  };

  connect(): Observable<BluetoothRemoteGATTServer> {
    if (this.gatt && this.gatt.connected) {
      return of(this.gatt);
    }

    if (!this.connect$) {
      this.connect$ = from(this.openGatt()).pipe(
        finalize(() => {
          this.connect$ = null;
        }),
        shareReplay(1)
      );
    }

    return this.connect$;
  }

  disconnect(): void {
    const gatt = this.gatt;
    this.gatt = null;
    this.connectedSubject.next(false);

    if (gatt && gatt.connected) {
      gatt.disconnect();
    }
  }

  async restoreKnownDevice(): Promise<void> {
    if (this.device || !navigator.bluetooth) {
      return;
    }

    const bluetooth = navigator.bluetooth as BluetoothWithDevices;

    if (typeof bluetooth.getDevices !== 'function') {
      return;
    }

    try {
      const devices = await bluetooth.getDevices();
      const scale = devices.find(device => (device.name || '').toLowerCase().includes('motif'));
      this.device = scale || (devices.length === 1 ? devices[0] : null);
    } catch {
      this.device = null;
    }
  }

  private openGatt(): Promise<BluetoothRemoteGATTServer> {
    if (!navigator.bluetooth) {
      return Promise.reject(new Error('Your browser does not support Bluetooth. Try Chrome over HTTPS or localhost.'));
    }

    if (this.device) {
      return this.connectToDevice(this.device).catch(error => {
        this.device = null;
        throw error;
      });
    }

    try {
      const request = navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [WEIGHT_SERVICE, BATTERY_SERVICE]
      });

      return request.then(device => this.connectToDevice(device));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async connectToDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer> {
    const server = device.gatt;

    if (!server) {
      throw new Error('The selected device does not expose a GATT server.');
    }

    const gatt = await server.connect();

    this.device = device;
    this.gatt = gatt;
    device.addEventListener('gattserverdisconnected', this.onDisconnected);
    this.deviceSubject.next(device);
    this.connectedSubject.next(true);

    return gatt;
  }
}
