import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { GroupsPage } from './groups.page';
import { DataService } from '../../services/data.service';

describe('GroupsPage', () => {
  let component: GroupsPage;
  let fixture: ComponentFixture<GroupsPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getAllGroups', 'createGroup']);
    dataServiceSpy.getAllGroups.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [GroupsPage],
      imports: [IonicModule.forRoot(), CommonModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
