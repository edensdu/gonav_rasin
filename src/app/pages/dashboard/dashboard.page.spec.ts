import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardPage } from './dashboard.page';
import { DataService } from '../../services/data.service';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  const mockGroups = [
    {
      id: '1',
      name: 'Test Group 1',
      type: 'mutuelle' as const,
      description: 'Test description',
      section: 'Anse-à-Galets',
      leaderId: '',
      memberCount: 10,
      totalSavings: 50000,
      activeLoans: 2,
      meetingDay: 'Samdi',
      meetingFrequency: 'weekly' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Test Group 2',
      type: 'sol' as const,
      description: 'Test description 2',
      section: 'Gran Sous',
      leaderId: '',
      memberCount: 15,
      totalSavings: 75000,
      activeLoans: 3,
      meetingDay: 'Dimanch',
      meetingFrequency: 'biweekly' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockTrainings = [
    {
      id: '1',
      name: 'Leadership',
      nameCreole: 'Lidèchip',
      description: '',
      category: 'leadership' as const,
      hours: 8,
      isActive: true
    }
  ];

  const mockVPCMembers = [
    {
      id: '1',
      name: 'Marie Jean',
      section: 'Anse-à-Galets',
      role: 'vpc' as const,
      trainingHours: 24,
      trainingsCompleted: [],
      projectsLed: [],
      joinedAt: new Date(),
      isActive: true
    }
  ];

  const mockActionPlans = [
    {
      id: '1',
      section: 'Gran Sous',
      title: 'Test Plan',
      description: '',
      status: 'in_progress' as const,
      priority: 'medium' as const,
      sector: 'water' as const,
      leadVpcId: '',
      participants: [],
      updates: [],
      createdAt: new Date()
    }
  ];

  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('DataService', [
      'getAllGroups',
      'getAllTrainings',
      'getAllVPCMembers',
      'getAllActionPlans',
      'getMembersByGroup',
      'getContributionsByGroup',
      'getLoansByGroup',
      'getGroup',
      'createGroup',
      'createMember',
      'createContribution',
      'createLoan',
      'createVPCMember',
      'createTraining',
      'createActionPlan',
      'updateGroup',
      'deleteGroup',
      'deleteMember'
    ]);

    TestBed.configureTestingModule({
      declarations: [DashboardPage],
      imports: [IonicModule.forRoot(), CommonModule, FormsModule],
      providers: [
        { provide: DataService, useValue: spy }
      ]
    }).compileComponents();

    dataServiceSpy = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    dataServiceSpy.getAllGroups.and.returnValue(Promise.resolve(mockGroups));
    dataServiceSpy.getAllTrainings.and.returnValue(Promise.resolve(mockTrainings));
    dataServiceSpy.getAllVPCMembers.and.returnValue(Promise.resolve(mockVPCMembers));
    dataServiceSpy.getAllActionPlans.and.returnValue(Promise.resolve(mockActionPlans));
    dataServiceSpy.getMembersByGroup.and.returnValue(Promise.resolve([]));
    dataServiceSpy.getContributionsByGroup.and.returnValue(Promise.resolve([]));
    dataServiceSpy.getLoansByGroup.and.returnValue(Promise.resolve([]));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.groupCount).toBe(0);
    expect(component.totalSavings).toBe(0);
    expect(component.totalMembers).toBe(0);
  });

  it('should load all data on init', async () => {
    await component.loadAllData();

    expect(component.groups.length).toBe(2);
    expect(component.groupCount).toBe(2);
    expect(component.totalSavings).toBe(125000);
    expect(component.totalMembers).toBe(25);
  });

  it('should calculate bar height correctly', () => {
    component.maxSavings = 100000;
    const height = component.getBarHeight(50000);
    expect(height).toBe(50);
  });

  it('should return 0 bar height when maxSavings is 0', () => {
    component.maxSavings = 0;
    const height = component.getBarHeight(50000);
    expect(height).toBe(0);
  });

  it('should calculate group progress correctly', () => {
    const group = mockGroups[0];
    const progress = component.getGroupProgress(group);
    expect(progress).toBe(10); // 50000 / 500000 * 100 = 10%
  });

  it('should cap group progress at 100%', () => {
    const group = { ...mockGroups[0], totalSavings: 600000 };
    const progress = component.getGroupProgress(group);
    expect(progress).toBe(100);
  });

  it('should return correct category icon', () => {
    expect(component.getCategoryIcon('leadership')).toBe('👑');
    expect(component.getCategoryIcon('project_management')).toBe('📋');
    expect(component.getCategoryIcon('civic')).toBe('🏛️');
    expect(component.getCategoryIcon('technical')).toBe('🔧');
    expect(component.getCategoryIcon('entrepreneurship')).toBe('💼');
    expect(component.getCategoryIcon('unknown')).toBe('📚');
  });

  it('should return correct category label', () => {
    expect(component.getCategoryLabel('leadership')).toBe('Lidèchip');
    expect(component.getCategoryLabel('project_management')).toBe('Jesyon Pwojè');
    expect(component.getCategoryLabel('civic')).toBe('Angajman Sivik');
    expect(component.getCategoryLabel('unknown')).toBe('unknown');
  });

  it('should calculate donut segment correctly', () => {
    component.groups = mockGroups;
    component.totalMembers = 25;

    const segment = component.getDonutSegment(0);
    expect(segment).toContain('100.53'); // (10/25) * circumference
  });

  it('should return empty donut segment for invalid index', () => {
    component.groups = [];
    component.totalMembers = 0;

    const segment = component.getDonutSegment(0);
    expect(segment).toBe('0 251.2');
  });

  it('should calculate VPC stats correctly', async () => {
    await component.loadAllData();

    expect(component.vpcCount).toBe(1);
    expect(component.totalTrainingHours).toBe(24);
    expect(component.actionPlanCount).toBe(1);
  });

  it('should load trainings correctly', async () => {
    await component.loadAllData();

    expect(component.trainings.length).toBe(1);
    expect(component.trainingCount).toBe(1);
  });
});
