import { TestBed } from '@angular/core/testing';

import { BatteryLevelService } from './battery-level.service';

describe('BatteryLevelService', () => {
  let service: BatteryLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatteryLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
