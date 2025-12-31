import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Group, Training, VPCMember, CommunityActionPlan, Member, Contribution, Loan } from '../../models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  @ViewChild('content', { static: false }) content!: IonContent;

  // Active nav item
  activeNav = 'home';

  // Stats
  groupCount = 0;
  activeLoans = 0;
  totalSavings = 0;
  totalMembers = 0;
  trainingCount = 0;
  vpcCount = 0;
  totalTrainingHours = 0;
  actionPlanCount = 0;

  // Data
  groups: Group[] = [];
  trainings: Training[] = [];
  vpcMembers: VPCMember[] = [];
  actionPlans: CommunityActionPlan[] = [];

  // Modal states
  showGroupModal = false;
  showVPCModal = false;
  showTrainingModal = false;
  showGroupDetailModal = false;
  showMemberModal = false;
  showContributionModal = false;
  showLoanModal = false;
  fabOpen = false;
  showVPCs = false;

  // Selected items
  selectedGroup: Group | null = null;
  selectedMember: Member | null = null;
  groupMembers: Member[] = [];
  groupContributions: Contribution[] = [];
  groupLoans: Loan[] = [];

  // Form data
  newGroup = {
    name: '',
    type: 'mutuelle' as 'mutuelle' | 'sol',
    section: '',
    meetingDay: 'Samdi',
    description: ''
  };

  newVPC = {
    name: '',
    section: '',
    phone: ''
  };

  newTraining = {
    name: '',
    nameCreole: '',
    category: 'leadership' as 'leadership' | 'project_management' | 'civic' | 'technical' | 'entrepreneurship',
    hours: 8
  };

  newMember = {
    name: '',
    phone: '',
    role: 'member' as 'leader' | 'treasurer' | 'secretary' | 'member'
  };

  newContribution = {
    memberId: '',
    amount: 0,
    notes: ''
  };

  newLoan = {
    memberId: '',
    amount: 0,
    interestRate: 10,
    dueMonths: 3
  };

  // Section options for La Gonâve
  sections = [
    'Anse-à-Galets',
    'Gran Sous',
    'Palma',
    'Nan Kafe',
    'Trou Louiz',
    'Pointe-à-Raquette',
    'Petite Anse',
    'Anse Galette',
    'Bassin Bleu',
    'Source Philippe',
    'Mapou'
  ];

  // Chart data
  maxSavings = 0;
  circumference = 2 * Math.PI * 40; // For donut chart

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.initializeDemoData();
  }

  async initializeDemoData() {
    const existingGroups = await this.dataService.getAllGroups();

    if (existingGroups.length === 0) {
      await this.seedRichDemoData();
    }

    await this.loadAllData();
  }

  async seedRichDemoData() {
    // Create realistic demo groups with actual savings data
    const groupData = [
      {
        name: 'Fanm Vanyan Ansanm',
        type: 'mutuelle' as const,
        description: 'Gwoup fanm vanyan nan zòn Anse-à-Galets ki ap travay ansanm pou yon avni miyò',
        section: 'Anse-à-Galets',
        leaderId: '',
        memberCount: 5,
        totalSavings: 187500,
        activeLoans: 1,
        meetingDay: 'Samdi',
        meetingFrequency: 'weekly' as const
      },
      {
        name: 'Sol Tèt Ansanm',
        type: 'sol' as const,
        description: 'Sol pou jèn antreprenè nan Gran Sous',
        section: 'Gran Sous',
        leaderId: '',
        memberCount: 4,
        totalSavings: 126000,
        activeLoans: 0,
        meetingDay: 'Dimanch',
        meetingFrequency: 'biweekly' as const
      },
      {
        name: 'Kore Solidarite',
        type: 'mutuelle' as const,
        description: 'Kore pou ijans ak sante nan Palma',
        section: 'Palma',
        leaderId: '',
        memberCount: 6,
        totalSavings: 224000,
        activeLoans: 2,
        meetingDay: 'Vandredi',
        meetingFrequency: 'weekly' as const
      }
    ];

    const createdGroups: Group[] = [];
    for (const g of groupData) {
      const group = await this.dataService.createGroup(g);
      createdGroups.push(group);
    }

    // Create members for each group
    const memberSets = [
      // Group 1 members
      [
        { name: 'Marie Jean-Baptiste', role: 'leader' as const, balance: 45000 },
        { name: 'Rose Pierre', role: 'treasurer' as const, balance: 38000 },
        { name: 'Carla Paul', role: 'secretary' as const, balance: 35000 },
        { name: 'Jeanne Louis', role: 'member' as const, balance: 32000 },
        { name: 'Lucie Francois', role: 'member' as const, balance: 37500 }
      ],
      // Group 2 members
      [
        { name: 'Pierre Auguste', role: 'leader' as const, balance: 35000 },
        { name: 'Jean Michel', role: 'treasurer' as const, balance: 31000 },
        { name: 'Jacques Beauvoir', role: 'member' as const, balance: 30000 },
        { name: 'Marc Antoine', role: 'member' as const, balance: 30000 }
      ],
      // Group 3 members
      [
        { name: 'Josette Beauvoir', role: 'leader' as const, balance: 42000 },
        { name: 'Claudette Jean', role: 'treasurer' as const, balance: 38000 },
        { name: 'Martine Pierre', role: 'secretary' as const, balance: 36000 },
        { name: 'Nicole Charles', role: 'member' as const, balance: 36000 },
        { name: 'Suzanne Louis', role: 'member' as const, balance: 36000 },
        { name: 'Yvonne Paul', role: 'member' as const, balance: 36000 }
      ]
    ];

    for (let i = 0; i < createdGroups.length; i++) {
      const group = createdGroups[i];
      const members = memberSets[i];

      for (const m of members) {
        await this.dataService.createMember({
          groupId: group.id,
          name: m.name,
          role: m.role,
          totalContributions: m.balance,
          totalLoans: 0,
          balance: m.balance,
          joinedAt: new Date(),
          isActive: true
        });
      }
    }

    // Create VPC members
    const vpcData = [
      { name: 'Marie Jean-Baptiste', section: 'Anse-à-Galets', trainingHours: 48 },
      { name: 'Pierre Louis', section: 'Gran Sous', trainingHours: 36 },
      { name: 'Josette Beauvoir', section: 'Palma', trainingHours: 52 },
      { name: 'Jean-Claude Michel', section: 'Nan Kafe', trainingHours: 24 },
      { name: 'Rose Francois', section: 'Trou Louiz', trainingHours: 40 }
    ];

    for (const v of vpcData) {
      await this.dataService.createVPCMember({
        name: v.name,
        section: v.section,
        role: 'vpc',
        trainingHours: v.trainingHours,
        trainingsCompleted: [],
        projectsLed: [],
        joinedAt: new Date(),
        isActive: true
      });
    }

    // Create trainings
    const trainingData = [
      { name: 'Leadership Fundamentals', nameCreole: 'Fondamantal Lidèchip', category: 'leadership' as const, hours: 8 },
      { name: 'Project Management', nameCreole: 'Jesyon Pwojè', category: 'project_management' as const, hours: 12 },
      { name: 'Civic Engagement', nameCreole: 'Angajman Sivik', category: 'civic' as const, hours: 6 },
      { name: 'Financial Literacy', nameCreole: 'Konesans Finansye', category: 'entrepreneurship' as const, hours: 10 },
      { name: 'Community Health', nameCreole: 'Sante Kominotè', category: 'technical' as const, hours: 8 }
    ];

    for (const t of trainingData) {
      await this.dataService.createTraining({
        name: t.name,
        nameCreole: t.nameCreole,
        description: '',
        category: t.category,
        hours: t.hours,
        isActive: true
      });
    }

    // Create action plans
    const planData = [
      { title: 'Pwojè Dlo Pwòp', section: 'Gran Sous', sector: 'water' as const, status: 'in_progress' as const },
      { title: 'Reparasyon Lekòl', section: 'Anse-à-Galets', sector: 'education' as const, status: 'planning' as const },
      { title: 'Klinik Mobil', section: 'Palma', sector: 'health' as const, status: 'completed' as const }
    ];

    for (const p of planData) {
      await this.dataService.createActionPlan({
        section: p.section,
        title: p.title,
        description: '',
        status: p.status,
        priority: 'medium',
        sector: p.sector,
        leadVpcId: '',
        participants: []
      });
    }
  }

  async loadAllData() {
    // Load groups
    this.groups = await this.dataService.getAllGroups();
    this.groupCount = this.groups.length;
    this.totalSavings = this.groups.reduce((sum, g) => sum + g.totalSavings, 0);
    this.activeLoans = this.groups.reduce((sum, g) => sum + g.activeLoans, 0);
    this.totalMembers = this.groups.reduce((sum, g) => sum + g.memberCount, 0);
    this.maxSavings = Math.max(...this.groups.map(g => g.totalSavings), 1);

    // Load trainings
    this.trainings = await this.dataService.getAllTrainings();
    this.trainingCount = this.trainings.length;

    // Load VPC members
    this.vpcMembers = await this.dataService.getAllVPCMembers();
    this.vpcCount = this.vpcMembers.length;
    this.totalTrainingHours = this.vpcMembers.reduce((sum, v) => sum + v.trainingHours, 0);

    // Load action plans
    this.actionPlans = await this.dataService.getAllActionPlans();
    this.actionPlanCount = this.actionPlans.length;
  }

  // Chart helper methods
  getBarHeight(savings: number): number {
    if (this.maxSavings === 0) return 0;
    return (savings / this.maxSavings) * 100;
  }

  getGroupProgress(group: Group): number {
    const goal = 500000;
    return Math.min((group.totalSavings / goal) * 100, 100);
  }

  // Donut chart methods
  getDonutSegment(index: number): string {
    if (!this.groups[index] || this.totalMembers === 0) return '0 251.2';
    const percentage = this.groups[index].memberCount / this.totalMembers;
    const segmentLength = percentage * this.circumference;
    return `${segmentLength} ${this.circumference}`;
  }

  getDonutOffset(index: number): number {
    let offset = this.circumference * 0.25;
    for (let i = 0; i < index; i++) {
      if (this.groups[i] && this.totalMembers > 0) {
        const percentage = this.groups[i].memberCount / this.totalMembers;
        offset -= percentage * this.circumference;
      }
    }
    return offset;
  }

  // Category helpers
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'leadership': '👑',
      'project_management': '📋',
      'civic': '🏛️',
      'technical': '🔧',
      'entrepreneurship': '💼'
    };
    return icons[category] || '📚';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'leadership': 'Lidèchip',
      'project_management': 'Jesyon Pwojè',
      'civic': 'Angajman Sivik',
      'technical': 'Teknik',
      'entrepreneurship': 'Antreprenarya'
    };
    return labels[category] || category;
  }

  // Navigation methods
  scrollToTop() {
    this.activeNav = 'home';
    this.content?.scrollToTop(500);
  }

  scrollToSection(sectionId: string) {
    this.activeNav = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // FAB Menu
  toggleFabMenu() {
    this.fabOpen = !this.fabOpen;
  }

  // ============ GROUP MODAL METHODS ============
  openAddGroupModal() {
    this.fabOpen = false;
    this.resetGroupForm();
    this.showGroupModal = true;
  }

  resetGroupForm() {
    this.newGroup = {
      name: '',
      type: 'mutuelle',
      section: '',
      meetingDay: 'Samdi',
      description: ''
    };
  }

  async createGroup() {
    if (!this.newGroup.name || !this.newGroup.section) return;

    await this.dataService.createGroup({
      name: this.newGroup.name,
      type: this.newGroup.type,
      description: this.newGroup.description,
      section: this.newGroup.section,
      leaderId: '',
      memberCount: 0,
      totalSavings: 0,
      activeLoans: 0,
      meetingDay: this.newGroup.meetingDay,
      meetingFrequency: 'weekly'
    });

    this.showGroupModal = false;
    await this.loadAllData();
  }

  async openGroupDetail(group: Group) {
    this.selectedGroup = group;
    await this.loadGroupDetails(group.id);
    this.showGroupDetailModal = true;
  }

  async loadGroupDetails(groupId: string) {
    this.groupMembers = await this.dataService.getMembersByGroup(groupId);
    this.groupContributions = await this.dataService.getContributionsByGroup(groupId);
    this.groupLoans = await this.dataService.getLoansByGroup(groupId);
  }

  async deleteGroup(group: Group) {
    if (confirm(`Ou sèten ou vle efase "${group.name}"?`)) {
      await this.dataService.deleteGroup(group.id);
      this.showGroupDetailModal = false;
      await this.loadAllData();
    }
  }

  // ============ MEMBER MODAL METHODS ============
  openAddMemberModal() {
    this.resetMemberForm();
    this.showMemberModal = true;
  }

  resetMemberForm() {
    this.newMember = {
      name: '',
      phone: '',
      role: 'member'
    };
  }

  async createMember() {
    if (!this.newMember.name || !this.selectedGroup) return;

    await this.dataService.createMember({
      groupId: this.selectedGroup.id,
      name: this.newMember.name,
      phone: this.newMember.phone || undefined,
      role: this.newMember.role,
      totalContributions: 0,
      totalLoans: 0,
      balance: 0,
      joinedAt: new Date(),
      isActive: true
    });

    // Update group member count
    this.selectedGroup.memberCount += 1;
    await this.dataService.updateGroup(this.selectedGroup);

    this.showMemberModal = false;
    await this.loadGroupDetails(this.selectedGroup.id);
    await this.loadAllData();
  }

  async deleteMember(member: Member) {
    if (!this.selectedGroup) return;
    if (confirm(`Ou sèten ou vle retire "${member.name}"?`)) {
      await this.dataService.deleteMember(member.id);
      this.selectedGroup.memberCount -= 1;
      await this.dataService.updateGroup(this.selectedGroup);
      await this.loadGroupDetails(this.selectedGroup.id);
      await this.loadAllData();
    }
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'leader': 'Lidè',
      'treasurer': 'Trezorye',
      'secretary': 'Sekretè',
      'member': 'Manm'
    };
    return labels[role] || role;
  }

  // ============ CONTRIBUTION MODAL METHODS ============
  openContributionModal() {
    this.resetContributionForm();
    this.showContributionModal = true;
  }

  resetContributionForm() {
    this.newContribution = {
      memberId: '',
      amount: 0,
      notes: ''
    };
  }

  async createContribution() {
    if (!this.newContribution.memberId || !this.newContribution.amount || !this.selectedGroup) return;

    const member = this.groupMembers.find(m => m.id === this.newContribution.memberId);
    if (!member) return;

    await this.dataService.createContribution({
      groupId: this.selectedGroup.id,
      memberId: this.newContribution.memberId,
      memberName: member.name,
      amount: this.newContribution.amount,
      date: new Date(),
      meetingNumber: this.groupContributions.length + 1,
      notes: this.newContribution.notes || undefined,
      recordedBy: 'app'
    });

    this.showContributionModal = false;

    // Reload data
    this.selectedGroup = await this.dataService.getGroup(this.selectedGroup.id) || this.selectedGroup;
    await this.loadGroupDetails(this.selectedGroup.id);
    await this.loadAllData();
  }

  // ============ LOAN MODAL METHODS ============
  openLoanModal() {
    this.resetLoanForm();
    this.showLoanModal = true;
  }

  resetLoanForm() {
    this.newLoan = {
      memberId: '',
      amount: 0,
      interestRate: 10,
      dueMonths: 3
    };
  }

  async createLoan() {
    if (!this.newLoan.memberId || !this.newLoan.amount || !this.selectedGroup) return;

    const member = this.groupMembers.find(m => m.id === this.newLoan.memberId);
    if (!member) return;

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + this.newLoan.dueMonths);

    await this.dataService.createLoan({
      groupId: this.selectedGroup.id,
      memberId: this.newLoan.memberId,
      memberName: member.name,
      amount: this.newLoan.amount,
      interestRate: this.newLoan.interestRate,
      status: 'active',
      disbursedAt: new Date(),
      dueDate: dueDate,
      approvedBy: 'app'
    });

    this.showLoanModal = false;

    // Reload data
    this.selectedGroup = await this.dataService.getGroup(this.selectedGroup.id) || this.selectedGroup;
    await this.loadGroupDetails(this.selectedGroup.id);
    await this.loadAllData();
  }

  getLoanStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Aktif',
      'paid': 'Peye',
      'overdue': 'An reta'
    };
    return labels[status] || status;
  }

  // ============ VPC MODAL METHODS ============
  openAddVPCModal() {
    this.fabOpen = false;
    this.resetVPCForm();
    this.showVPCModal = true;
  }

  resetVPCForm() {
    this.newVPC = {
      name: '',
      section: '',
      phone: ''
    };
  }

  async createVPC() {
    if (!this.newVPC.name || !this.newVPC.section) return;

    await this.dataService.createVPCMember({
      name: this.newVPC.name,
      section: this.newVPC.section,
      role: 'vpc',
      trainingHours: 0,
      trainingsCompleted: [],
      projectsLed: [],
      joinedAt: new Date(),
      isActive: true
    });

    this.showVPCModal = false;
    await this.loadAllData();
  }

  showVPCList() {
    this.showVPCs = !this.showVPCs;
  }

  openVPCDetail(vpc: VPCMember) {
    console.log('VPC Detail:', vpc);
  }

  // ============ TRAINING MODAL METHODS ============
  openAddTrainingModal() {
    this.fabOpen = false;
    this.resetTrainingForm();
    this.showTrainingModal = true;
  }

  resetTrainingForm() {
    this.newTraining = {
      name: '',
      nameCreole: '',
      category: 'leadership',
      hours: 8
    };
  }

  async createTraining() {
    if (!this.newTraining.nameCreole || !this.newTraining.hours) return;

    await this.dataService.createTraining({
      name: this.newTraining.name || this.newTraining.nameCreole,
      nameCreole: this.newTraining.nameCreole,
      description: '',
      category: this.newTraining.category,
      hours: this.newTraining.hours,
      isActive: true
    });

    this.showTrainingModal = false;
    await this.loadAllData();
  }

  openTrainingDetail(training: Training) {
    console.log('Training Detail:', training);
  }

  showActionPlans() {
    console.log('Show Action Plans');
  }

  // ============ QUICK ACTIONS (from group card) ============
  addContribution(group: Group) {
    this.openGroupDetail(group).then(() => {
      setTimeout(() => this.openContributionModal(), 300);
    });
  }

  addMemberToGroup(group: Group) {
    this.openGroupDetail(group).then(() => {
      setTimeout(() => this.openAddMemberModal(), 300);
    });
  }

  addLoan(group: Group) {
    this.openGroupDetail(group).then(() => {
      setTimeout(() => this.openLoanModal(), 300);
    });
  }

  // ============ HELPER METHODS ============
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getMeetingFrequency(frequency: string): string {
    const labels: { [key: string]: string } = {
      'weekly': 'Chak semèn',
      'biweekly': 'Chak 2 semèn',
      'monthly': 'Chak mwa'
    };
    return labels[frequency] || frequency;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-HT', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
