import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { OnboardingPage } from './onboarding.page';

describe('OnboardingPage', () => {
  let component: OnboardingPage;
  let fixture: ComponentFixture<OnboardingPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardingPage],
      imports: [IonicModule.forRoot(), CommonModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
