import { Component, OnInit } from '@angular/core';

import { BatteryLevelService } from './battery-level.service';
import { WeightService } from './weight.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Web Scale';
  offset: number;
  public weight: number;
  public battery: number;
  public unit: string;
  public isMenuCollapsed: boolean;
  public foo = String.fromCodePoint(0x1F937);
  constructor(private ws: WeightService) {
    this.isMenuCollapsed = true;
    this.unit = 'kg';
  }
  ngOnInit(): void {

    this.zero();
  }


  zero(): void {
    this.ws.value().subscribe(val => {
      this.offset = val;
      this.stream();
    });
  }
  do(): void {
    this.ws.value().subscribe(val => {
      this.weight = +(val - this.offset).toFixed(6);
    });
  }
  stream() {

    this.ws.stream().subscribe(val => {

      switch (this.unit) {
        case 'kg':
          this.weight = +(val - this.offset).toFixed(4);
          break;
        case 'g':
          this.weight = +((val - this.offset) * (Math.pow(10, 3))).toFixed(1);
          break;
        case 'oz':
          this.weight = +(35.274 * (val - this.offset)).toFixed(2);
        default:
          break;
      }




    });
  }
  units(unit: string) {
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
