import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  User, Group, Member, Contribution, Loan, LoanPayment,
  VPCMember, Training, TrainingRecord, CommunityActionPlan,
  Workshop, SyncStatus
} from '../models';

const DB_NAME = 'fanm_gonav_db';
const DB_VERSION = 1;

const STORES = {
  users: 'users',
  groups: 'groups',
  members: 'members',
  contributions: 'contributions',
  loans: 'loans',
  vpcMembers: 'vpcMembers',
  trainings: 'trainings',
  actionPlans: 'actionPlans',
  workshops: 'workshops',
  syncQueue: 'syncQueue'
};

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private db: IDBDatabase | null = null;
  private syncStatus = new BehaviorSubject<SyncStatus>({
    lastSyncAt: null,
    pendingChanges: 0,
    isOnline: navigator.onLine
  });

  syncStatus$ = this.syncStatus.asObservable();

  constructor() {
    this.initDatabase();
    this.setupOnlineListener();
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.updateSyncStatus({ isOnline: true });
    });
    window.addEventListener('offline', () => {
      this.updateSyncStatus({ isOnline: false });
    });
  }

  private updateSyncStatus(partial: Partial<SyncStatus>): void {
    this.syncStatus.next({ ...this.syncStatus.value, ...partial });
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains(STORES.users)) {
          const userStore = db.createObjectStore(STORES.users, { keyPath: 'id' });
          userStore.createIndex('phone', 'phone', { unique: true });
        }

        // Groups store
        if (!db.objectStoreNames.contains(STORES.groups)) {
          const groupStore = db.createObjectStore(STORES.groups, { keyPath: 'id' });
          groupStore.createIndex('type', 'type', { unique: false });
          groupStore.createIndex('section', 'section', { unique: false });
        }

        // Members store
        if (!db.objectStoreNames.contains(STORES.members)) {
          const memberStore = db.createObjectStore(STORES.members, { keyPath: 'id' });
          memberStore.createIndex('groupId', 'groupId', { unique: false });
        }

        // Contributions store
        if (!db.objectStoreNames.contains(STORES.contributions)) {
          const contribStore = db.createObjectStore(STORES.contributions, { keyPath: 'id' });
          contribStore.createIndex('groupId', 'groupId', { unique: false });
          contribStore.createIndex('memberId', 'memberId', { unique: false });
          contribStore.createIndex('date', 'date', { unique: false });
        }

        // Loans store
        if (!db.objectStoreNames.contains(STORES.loans)) {
          const loanStore = db.createObjectStore(STORES.loans, { keyPath: 'id' });
          loanStore.createIndex('groupId', 'groupId', { unique: false });
          loanStore.createIndex('memberId', 'memberId', { unique: false });
          loanStore.createIndex('status', 'status', { unique: false });
        }

        // VPC Members store
        if (!db.objectStoreNames.contains(STORES.vpcMembers)) {
          const vpcStore = db.createObjectStore(STORES.vpcMembers, { keyPath: 'id' });
          vpcStore.createIndex('section', 'section', { unique: false });
        }

        // Trainings store
        if (!db.objectStoreNames.contains(STORES.trainings)) {
          db.createObjectStore(STORES.trainings, { keyPath: 'id' });
        }

        // Action Plans store
        if (!db.objectStoreNames.contains(STORES.actionPlans)) {
          const planStore = db.createObjectStore(STORES.actionPlans, { keyPath: 'id' });
          planStore.createIndex('section', 'section', { unique: false });
          planStore.createIndex('status', 'status', { unique: false });
        }

        // Workshops store
        if (!db.objectStoreNames.contains(STORES.workshops)) {
          const workshopStore = db.createObjectStore(STORES.workshops, { keyPath: 'id' });
          workshopStore.createIndex('type', 'type', { unique: false });
          workshopStore.createIndex('date', 'date', { unique: false });
        }

        // Sync queue for offline changes
        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.initDatabase();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generic CRUD operations
  private async add<T extends { id?: string }>(storeName: string, item: T): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    const itemWithId = { ...item, id: item.id || this.generateId() };

    return new Promise((resolve, reject) => {
      const request = store.add(itemWithId);
      request.onsuccess = () => {
        this.addToSyncQueue('add', storeName, itemWithId);
        resolve(itemWithId as T);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async update<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => {
        this.addToSyncQueue('update', storeName, item);
        resolve(item);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        this.addToSyncQueue('delete', storeName, { id });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = await this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const store = await this.getStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async addToSyncQueue(action: string, store: string, data: any): Promise<void> {
    const syncStore = await this.getStore(STORES.syncQueue, 'readwrite');
    const queueItem = {
      action,
      store,
      data,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve) => {
      const request = syncStore.add(queueItem);
      request.onsuccess = () => {
        const current = this.syncStatus.value;
        this.updateSyncStatus({ pendingChanges: current.pendingChanges + 1 });
        resolve();
      };
      request.onerror = () => resolve(); // Don't fail on sync queue errors
    });
  }

  // ============ USER OPERATIONS ============
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.add(STORES.users, newUser);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const users = await this.getByIndex<User>(STORES.users, 'phone', phone);
    return users[0];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.get(STORES.users, id);
  }

  async updateUser(user: User): Promise<User> {
    return this.update(STORES.users, { ...user, updatedAt: new Date() });
  }

  // ============ GROUP OPERATIONS ============
  async createGroup(group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> {
    const newGroup: Group = {
      ...group,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.add(STORES.groups, newGroup);
  }

  async getGroup(id: string): Promise<Group | undefined> {
    return this.get(STORES.groups, id);
  }

  async getAllGroups(): Promise<Group[]> {
    return this.getAll(STORES.groups);
  }

  async getGroupsByType(type: Group['type']): Promise<Group[]> {
    return this.getByIndex(STORES.groups, 'type', type);
  }

  async updateGroup(group: Group): Promise<Group> {
    return this.update(STORES.groups, { ...group, updatedAt: new Date() });
  }

  async deleteGroup(id: string): Promise<void> {
    return this.delete(STORES.groups, id);
  }

  // ============ MEMBER OPERATIONS ============
  async createMember(member: Omit<Member, 'id'>): Promise<Member> {
    const newMember: Member = {
      ...member,
      id: this.generateId()
    };
    return this.add(STORES.members, newMember);
  }

  async getMember(id: string): Promise<Member | undefined> {
    return this.get(STORES.members, id);
  }

  async getMembersByGroup(groupId: string): Promise<Member[]> {
    return this.getByIndex(STORES.members, 'groupId', groupId);
  }

  async updateMember(member: Member): Promise<Member> {
    return this.update(STORES.members, member);
  }

  async deleteMember(id: string): Promise<void> {
    return this.delete(STORES.members, id);
  }

  // ============ CONTRIBUTION OPERATIONS ============
  async createContribution(contribution: Omit<Contribution, 'id' | 'createdAt'>): Promise<Contribution> {
    const newContribution: Contribution = {
      ...contribution,
      id: this.generateId(),
      createdAt: new Date()
    };

    // Update member's total contributions
    const member = await this.getMember(contribution.memberId);
    if (member) {
      member.totalContributions += contribution.amount;
      member.balance += contribution.amount;
      await this.updateMember(member);
    }

    // Update group's total savings
    const group = await this.getGroup(contribution.groupId);
    if (group) {
      group.totalSavings += contribution.amount;
      await this.updateGroup(group);
    }

    return this.add(STORES.contributions, newContribution);
  }

  async getContributionsByGroup(groupId: string): Promise<Contribution[]> {
    return this.getByIndex(STORES.contributions, 'groupId', groupId);
  }

  async getContributionsByMember(memberId: string): Promise<Contribution[]> {
    return this.getByIndex(STORES.contributions, 'memberId', memberId);
  }

  // ============ LOAN OPERATIONS ============
  async createLoan(loan: Omit<Loan, 'id' | 'createdAt' | 'payments' | 'totalDue' | 'amountPaid'>): Promise<Loan> {
    const totalDue = loan.amount * (1 + loan.interestRate / 100);
    const newLoan: Loan = {
      ...loan,
      id: this.generateId(),
      totalDue,
      amountPaid: 0,
      payments: [],
      createdAt: new Date()
    };

    // Update member's loan balance
    const member = await this.getMember(loan.memberId);
    if (member) {
      member.totalLoans += loan.amount;
      member.balance -= loan.amount;
      await this.updateMember(member);
    }

    // Update group's active loans count
    const group = await this.getGroup(loan.groupId);
    if (group) {
      group.activeLoans += 1;
      group.totalSavings -= loan.amount;
      await this.updateGroup(group);
    }

    return this.add(STORES.loans, newLoan);
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    return this.get(STORES.loans, id);
  }

  async getLoansByGroup(groupId: string): Promise<Loan[]> {
    return this.getByIndex(STORES.loans, 'groupId', groupId);
  }

  async getLoansByMember(memberId: string): Promise<Loan[]> {
    return this.getByIndex(STORES.loans, 'memberId', memberId);
  }

  async addLoanPayment(loanId: string, payment: Omit<LoanPayment, 'id' | 'loanId'>): Promise<Loan> {
    const loan = await this.getLoan(loanId);
    if (!loan) throw new Error('Loan not found');

    const newPayment: LoanPayment = {
      ...payment,
      id: this.generateId(),
      loanId
    };

    loan.payments.push(newPayment);
    loan.amountPaid += payment.amount;

    if (loan.amountPaid >= loan.totalDue) {
      loan.status = 'paid';

      // Update group's active loans count
      const group = await this.getGroup(loan.groupId);
      if (group) {
        group.activeLoans -= 1;
        group.totalSavings += payment.amount;
        await this.updateGroup(group);
      }
    }

    return this.update(STORES.loans, loan);
  }

  // ============ VPC MEMBER OPERATIONS ============
  async createVPCMember(vpcMember: Omit<VPCMember, 'id'>): Promise<VPCMember> {
    const newMember: VPCMember = {
      ...vpcMember,
      id: this.generateId()
    };
    return this.add(STORES.vpcMembers, newMember);
  }

  async getVPCMember(id: string): Promise<VPCMember | undefined> {
    return this.get(STORES.vpcMembers, id);
  }

  async getAllVPCMembers(): Promise<VPCMember[]> {
    return this.getAll(STORES.vpcMembers);
  }

  async getVPCMembersBySection(section: string): Promise<VPCMember[]> {
    return this.getByIndex(STORES.vpcMembers, 'section', section);
  }

  async updateVPCMember(member: VPCMember): Promise<VPCMember> {
    return this.update(STORES.vpcMembers, member);
  }

  async addTrainingToVPC(vpcMemberId: string, record: Omit<TrainingRecord, 'id' | 'vpcMemberId'>): Promise<VPCMember> {
    const member = await this.getVPCMember(vpcMemberId);
    if (!member) throw new Error('VPC Member not found');

    const newRecord: TrainingRecord = {
      ...record,
      id: this.generateId(),
      vpcMemberId
    };

    member.trainingsCompleted.push(newRecord);
    member.trainingHours += record.hours;

    return this.update(STORES.vpcMembers, member);
  }

  // ============ TRAINING OPERATIONS ============
  async createTraining(training: Omit<Training, 'id'>): Promise<Training> {
    const newTraining: Training = {
      ...training,
      id: this.generateId()
    };
    return this.add(STORES.trainings, newTraining);
  }

  async getAllTrainings(): Promise<Training[]> {
    return this.getAll(STORES.trainings);
  }

  async getTraining(id: string): Promise<Training | undefined> {
    return this.get(STORES.trainings, id);
  }

  // ============ ACTION PLAN OPERATIONS ============
  async createActionPlan(plan: Omit<CommunityActionPlan, 'id' | 'createdAt' | 'updates'>): Promise<CommunityActionPlan> {
    const newPlan: CommunityActionPlan = {
      ...plan,
      id: this.generateId(),
      updates: [],
      createdAt: new Date()
    };
    return this.add(STORES.actionPlans, newPlan);
  }

  async getActionPlan(id: string): Promise<CommunityActionPlan | undefined> {
    return this.get(STORES.actionPlans, id);
  }

  async getAllActionPlans(): Promise<CommunityActionPlan[]> {
    return this.getAll(STORES.actionPlans);
  }

  async getActionPlansBySection(section: string): Promise<CommunityActionPlan[]> {
    return this.getByIndex(STORES.actionPlans, 'section', section);
  }

  async updateActionPlan(plan: CommunityActionPlan): Promise<CommunityActionPlan> {
    return this.update(STORES.actionPlans, plan);
  }

  // ============ WORKSHOP OPERATIONS ============
  async createWorkshop(workshop: Omit<Workshop, 'id' | 'createdAt'>): Promise<Workshop> {
    const newWorkshop: Workshop = {
      ...workshop,
      id: this.generateId(),
      createdAt: new Date()
    };
    return this.add(STORES.workshops, newWorkshop);
  }

  async getAllWorkshops(): Promise<Workshop[]> {
    return this.getAll(STORES.workshops);
  }

  async getWorkshopsByType(type: Workshop['type']): Promise<Workshop[]> {
    return this.getByIndex(STORES.workshops, 'type', type);
  }

  // ============ SYNC OPERATIONS ============
  async getPendingSyncItems(): Promise<any[]> {
    return this.getAll(STORES.syncQueue);
  }

  async clearSyncQueue(): Promise<void> {
    const store = await this.getStore(STORES.syncQueue, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        this.updateSyncStatus({ pendingChanges: 0, lastSyncAt: new Date() });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============ SEED DATA FOR DEMO ============
  async seedDemoData(): Promise<void> {
    const groups = await this.getAllGroups();
    if (groups.length > 0) return; // Already seeded

    // Create demo groups
    const group1 = await this.createGroup({
      name: 'Mutuelle Fanm Vanyan',
      type: 'mutuelle',
      description: 'Gwoup epay fanm nan Anse-a-Galets',
      section: 'Anse-a-Galets',
      leaderId: '',
      memberCount: 0,
      totalSavings: 0,
      activeLoans: 0,
      meetingDay: 'Samdi',
      meetingFrequency: 'weekly'
    });

    const group2 = await this.createGroup({
      name: 'Sol Lakay Gran Sous',
      type: 'sol',
      description: 'Sol kominote Gran Sous',
      section: 'Gran Sous',
      leaderId: '',
      memberCount: 0,
      totalSavings: 0,
      activeLoans: 0,
      meetingDay: 'Dimanch',
      meetingFrequency: 'biweekly'
    });

    // Create demo members for group 1
    const members = [
      { name: 'Marie Jean', role: 'leader' as const },
      { name: 'Rose Pierre', role: 'treasurer' as const },
      { name: 'Carla Paul', role: 'member' as const },
      { name: 'Jeanne Baptiste', role: 'member' as const },
      { name: 'Lucie Francois', role: 'member' as const }
    ];

    for (const m of members) {
      await this.createMember({
        groupId: group1.id,
        name: m.name,
        role: m.role,
        totalContributions: 0,
        totalLoans: 0,
        balance: 0,
        joinedAt: new Date(),
        isActive: true
      });
    }

    // Update group member count
    group1.memberCount = members.length;
    await this.updateGroup(group1);

    // Create demo trainings
    await this.createTraining({
      name: 'Leadership Fundamentals',
      nameCreole: 'Fondamantal Lidèchip',
      description: 'Basic leadership skills and principles',
      category: 'leadership',
      hours: 8,
      isActive: true
    });

    await this.createTraining({
      name: 'Project Management',
      nameCreole: 'Jesyon Pwojè',
      description: 'Planning and executing community projects',
      category: 'project_management',
      hours: 12,
      isActive: true
    });

    await this.createTraining({
      name: 'Civic Engagement',
      nameCreole: 'Angajman Sivik',
      description: 'Understanding civic responsibilities and participation',
      category: 'civic',
      hours: 6,
      isActive: true
    });

    console.log('Demo data seeded successfully');
  }
}
