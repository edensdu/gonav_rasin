import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { LoansPage } from './loans.page';
import { DataService } from '../../services/data.service';

describe('LoansPage', () => {
  let component: LoansPage;
  let fixture: ComponentFixture<LoansPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getLoansByGroup']);
    dataServiceSpy.getLoansByGroup.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [LoansPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
