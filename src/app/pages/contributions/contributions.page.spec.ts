import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ContributionsPage } from './contributions.page';
import { DataService } from '../../services/data.service';

describe('ContributionsPage', () => {
  let component: ContributionsPage;
  let fixture: ComponentFixture<ContributionsPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getContributionsByGroup']);
    dataServiceSpy.getContributionsByGroup.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [ContributionsPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContributionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
