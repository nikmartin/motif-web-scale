import { Component, OnInit } from '@angular/core';

import { BatteryLevelService } from './battery-level.service';
import { WeightService } from './weight.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Web Scale';
  offset: number;
  public weight: number;

  public unit: string;
  public isMenuCollapsed: boolean;
  public isConnected = false;
  private streamSub: Subscription;
  constructor(private ws: WeightService, private batt: BatteryLevelService) {
    this.isMenuCollapsed = true;
    this.unit = 'kg';
  }
  ngOnInit(): void { }

  zero(): void {
    const sub = this.ws.stream().subscribe(val => {
      this.offset = val;
      sub.unsubscribe();
      this.stream();
    });
  }
  connect(): void {
    this.ws.listen();
    const sub = this.ws.value().subscribe(val => {
      console.log('connected:', val);
      this.offset = val;
      sub.unsubscribe();
      this.stream();
    });
  }
  disconnect(): void {
    this.ws.disconnectDevice();
    this.weight = null;
  }


  stream(): void {

    if (this.streamSub) {
      this.streamSub.unsubscribe();
    }
    this.streamSub = this.ws.stream().subscribe(val => {

      switch (this.unit) {
        case 'kg':
          this.weight = +(val - this.offset).toFixed(4);
          break;
        case 'g':
          this.weight = +((val - this.offset) * (Math.pow(10, 3))).toFixed(1);
          break;
        case 'oz':
          this.weight = +(35.274 * (val - this.offset)).toFixed(2);
          break;
        default:
          break;
      }




    });
  }
  units(unit: string): void {
    this.unit = unit;
  }

  /*
  Getting Characteristics...
  > Service: 0000180a-0000-1000-8000-00805f9b34fb "Device Information"
    >> Characteristic: 00002a29-0000-1000-8000-00805f9b34fb [READ] "Manufacturer Name String"
    >> Characteristic: 00002a24-0000-1000-8000-00805f9b34fb [READ] "Model Number String"
    >> Characteristic: 00002a27-0000-1000-8000-00805f9b34fb [READ] "Hardware Revision String"
    >> Characteristic: 00002a26-0000-1000-8000-00805f9b34fb [READ] "Firmware Revision String"
  > Service: 1bc50001-0200-0aa5-e311-24cb004a98c5 "Custom Weight Service"
    >> Characteristic: 1bc50002-0200-0aa5-e311-24cb004a98c5 [NOTIFY, READ] "Weight" 32 bit float in kg
  > Service: 00001801-0000-1000-8000-00805f9b34fb "Generic Attribute"
    >> Characteristic: 00002a05-0000-1000-8000-00805f9b34fb [INDICATE] "Service Changed"
  */
}
