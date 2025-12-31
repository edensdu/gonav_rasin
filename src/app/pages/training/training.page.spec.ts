import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainingPage } from './training.page';
import { DataService } from '../../services/data.service';

describe('TrainingPage', () => {
  let component: TrainingPage;
  let fixture: ComponentFixture<TrainingPage>;

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getAllTrainings']);
    dataServiceSpy.getAllTrainings.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      declarations: [TrainingPage],
      imports: [IonicModule.forRoot(), CommonModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
