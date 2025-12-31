// Sol Lakay & Rasin Connect Models
// Data models for savings groups and leadership tracking

export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string; // Hashed PIN
  role: 'leader' | 'member' | 'vpc' | 'admin';
  groupIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  type: 'mutuelle' | 'sol' | 'vpc' | 'cbo';
  description: string;
  section: string; // Communal section (1-11)
  leaderId: string;
  memberCount: number;
  totalSavings: number;
  activeLoans: number;
  meetingDay: string;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  whatsappLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  groupId: string;
  name: string;
  phone?: string;
  role: 'leader' | 'treasurer' | 'secretary' | 'member';
  totalContributions: number;
  totalLoans: number;
  balance: number;
  joinedAt: Date;
  isActive: boolean;
}

export interface Contribution {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: Date;
  meetingNumber: number;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

export interface Loan {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  amount: number;
  interestRate: number; // Percentage
  totalDue: number;
  amountPaid: number;
  status: 'active' | 'paid' | 'overdue';
  disbursedAt: Date;
  dueDate: Date;
  payments: LoanPayment[];
  approvedBy: string;
  createdAt: Date;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: Date;
  recordedBy: string;
}

// Leadership/VPC Models
export interface VPCMember {
  id: string;
  name: string;
  phone?: string;
  section: string;
  role: 'vpc' | 'coordinator' | 'trainer';
  trainingHours: number;
  trainingsCompleted: TrainingRecord[];
  projectsLed: string[];
  joinedAt: Date;
  isActive: boolean;
}

export interface TrainingRecord {
  id: string;
  vpcMemberId: string;
  trainingId: string;
  trainingName: string;
  hours: number;
  completedAt: Date;
  certificate?: boolean;
}

export interface Training {
  id: string;
  name: string;
  nameCreole: string;
  description: string;
  category: 'leadership' | 'project_management' | 'civic' | 'technical' | 'entrepreneurship';
  hours: number;
  materials?: string[];
  isActive: boolean;
}

export interface CommunityActionPlan {
  id: string;
  section: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  sector: 'health' | 'education' | 'water' | 'infrastructure' | 'economic' | 'environment';
  leadVpcId: string;
  participants: string[];
  budget?: number;
  startDate?: Date;
  completedDate?: Date;
  updates: PlanUpdate[];
  createdAt: Date;
}

export interface PlanUpdate {
  id: string;
  planId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  images?: string[];
}

export interface Workshop {
  id: string;
  name: string;
  nameCreole: string;
  type: 'pase_mayet' | 'fanm_djanm' | 'dyalog' | 'ankadre' | 'other';
  date: Date;
  section: string;
  location: string;
  facilitatorId: string;
  attendeeCount: number;
  description?: string;
  topics: string[];
  createdAt: Date;
}

// Sync status for offline-first
export interface SyncStatus {
  lastSyncAt: Date | null;
  pendingChanges: number;
  isOnline: boolean;
}
