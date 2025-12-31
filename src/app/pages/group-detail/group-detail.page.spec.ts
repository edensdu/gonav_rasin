import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupDetailPage } from './group-detail.page';
import { DataService } from '../../services/data.service';

describe('GroupDetailPage', () => {
  let component: GroupDetailPage;
  let fixture: ComponentFixture<GroupDetailPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'getGroup',
      'getMembersByGroup',
      'getContributionsByGroup',
      'getLoansByGroup'
    ]);
    dataServiceSpy.getGroup.and.returnValue(Promise.resolve(null));
    dataServiceSpy.getMembersByGroup.and.returnValue(Promise.resolve([]));
    dataServiceSpy.getContributionsByGroup.and.returnValue(Promise.resolve([]));
    dataServiceSpy.getLoansByGroup.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [GroupDetailPage],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
