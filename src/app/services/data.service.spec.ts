import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataService]
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have syncStatus$ observable', () => {
    expect(service.syncStatus$).toBeTruthy();
  });

  it('should emit initial sync status', (done) => {
    service.syncStatus$.subscribe(status => {
      expect(status.pendingChanges).toBe(0);
      expect(status.lastSyncAt).toBeNull();
      expect(typeof status.isOnline).toBe('boolean');
      done();
    });
  });

  // Note: Full IndexedDB integration tests are skipped in headless browser
  // The service is tested functionally in the running app
});
