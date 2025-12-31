import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { LeadershipPage } from './leadership.page';
import { DataService } from '../../services/data.service';

describe('LeadershipPage', () => {
  let component: LeadershipPage;
  let fixture: ComponentFixture<LeadershipPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getAllVPCMembers', 'getAllActionPlans']);
    dataServiceSpy.getAllVPCMembers.and.returnValue(Promise.resolve([]));
    dataServiceSpy.getAllActionPlans.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [LeadershipPage],
      imports: [IonicModule.forRoot(), CommonModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
