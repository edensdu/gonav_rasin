import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { VPCMember, CommunityActionPlan } from '../../models';

@Component({
  selector: 'app-leadership',
  templateUrl: './leadership.page.html',
  styleUrls: ['./leadership.page.scss'],
  standalone: false
})
export class LeadershipPage implements OnInit {
  vpcMembers: VPCMember[] = [];
  actionPlans: CommunityActionPlan[] = [];
  totalTrainingHours = 0;

  sections = [
    'Anse-a-Galets', 'Palma', 'Gran Sous', 'Peti Sous',
    'Nan Kafe', 'Nan Mango', 'Trou Louiz', 'Karenaj',
    'Pon Palmis', 'Gwomòn', 'Baie de Henne'
  ];

  constructor(
    private router: Router,
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    this.vpcMembers = await this.dataService.getAllVPCMembers();
    this.actionPlans = await this.dataService.getAllActionPlans();
    this.totalTrainingHours = this.vpcMembers.reduce((sum, v) => sum + v.trainingHours, 0);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'planning': 'warning',
      'in_progress': 'primary',
      'completed': 'success'
    };
    return colors[status] || 'medium';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'planning': 'Planifikasyon',
      'in_progress': 'An kou',
      'completed': 'Fini'
    };
    return labels[status] || status;
  }

  getSectorLabel(sector: string): string {
    const labels: { [key: string]: string } = {
      'health': 'Sante',
      'education': 'Edikasyon',
      'water': 'Dlo',
      'infrastructure': 'Enfrastrikti',
      'economic': 'Ekonomi',
      'environment': 'Anviwònman'
    };
    return labels[sector] || sector;
  }

  async viewVPC(vpc: VPCMember) {
    const alert = await this.alertController.create({
      header: vpc.name,
      message: `
        <strong>Seksyon:</strong> ${vpc.section}<br>
        <strong>Wòl:</strong> ${vpc.role === 'vpc' ? 'VPC' : vpc.role}<br>
        <strong>Èdtan Fòmasyon:</strong> ${vpc.trainingHours}<br>
        <strong>Fòmasyon Konplete:</strong> ${vpc.trainingsCompleted.length}<br>
        <strong>Pwojè Dirije:</strong> ${vpc.projectsLed.length}
      `,
      buttons: ['Fèmen']
    });
    await alert.present();
  }

  async viewPlan(plan: CommunityActionPlan) {
    const alert = await this.alertController.create({
      header: plan.title,
      message: `
        <strong>Seksyon:</strong> ${plan.section}<br>
        <strong>Sektè:</strong> ${this.getSectorLabel(plan.sector)}<br>
        <strong>Estati:</strong> ${this.getStatusLabel(plan.status)}<br>
        <strong>Priyorite:</strong> ${plan.priority}<br>
        ${plan.description ? `<br>${plan.description}` : ''}
      `,
      buttons: [
        { text: 'Fèmen', role: 'cancel' },
        {
          text: 'Modifye Estati',
          handler: () => this.updatePlanStatus(plan)
        }
      ]
    });
    await alert.present();
  }

  async updatePlanStatus(plan: CommunityActionPlan) {
    const alert = await this.alertController.create({
      header: 'Chanje Estati',
      inputs: [
        { type: 'radio', label: 'Planifikasyon', value: 'planning', checked: plan.status === 'planning' },
        { type: 'radio', label: 'An kou', value: 'in_progress', checked: plan.status === 'in_progress' },
        { type: 'radio', label: 'Fini', value: 'completed', checked: plan.status === 'completed' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Anrejistre',
          handler: async (status) => {
            plan.status = status;
            if (status === 'completed') {
              plan.completedDate = new Date();
            }
            await this.dataService.updateActionPlan(plan);
            await this.showToast('Estati modifye!', 'success');
            await this.loadData();
          }
        }
      ]
    });
    await alert.present();
  }

  async addVPCMember() {
    const alert = await this.alertController.create({
      header: 'Ajoute VPC Nouvo',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Non konplè' },
        { name: 'phone', type: 'tel', placeholder: 'Telefòn (opsyonèl)' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (data) => {
            if (!data.name) {
              await this.showToast('Tanpri antre non an', 'warning');
              return false;
            }
            await this.selectSection(data.name, data.phone);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async selectSection(name: string, phone: string) {
    const alert = await this.alertController.create({
      header: 'Chwazi Seksyon',
      inputs: this.sections.map(s => ({
        type: 'radio',
        label: s,
        value: s
      })),
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kreye',
          handler: async (section) => {
            await this.dataService.createVPCMember({
              name,
              phone: phone || undefined,
              section,
              role: 'vpc',
              trainingHours: 0,
              trainingsCompleted: [],
              projectsLed: [],
              joinedAt: new Date(),
              isActive: true
            });
            await this.showToast('VPC ajoute!', 'success');
            await this.loadData();
          }
        }
      ]
    });
    await alert.present();
  }

  async addActionPlan() {
    const alert = await this.alertController.create({
      header: 'Nouvo Plan Aksyon',
      inputs: [
        { name: 'title', type: 'text', placeholder: 'Tit plan an' },
        { name: 'description', type: 'textarea', placeholder: 'Deskripsyon (opsyonèl)' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (data) => {
            if (!data.title) {
              await this.showToast('Tanpri antre tit la', 'warning');
              return false;
            }
            await this.selectPlanDetails(data.title, data.description);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async selectPlanDetails(title: string, description: string) {
    const alert = await this.alertController.create({
      header: 'Detay Plan',
      inputs: [
        { type: 'radio', label: 'Sante', value: 'health' },
        { type: 'radio', label: 'Edikasyon', value: 'education' },
        { type: 'radio', label: 'Dlo', value: 'water' },
        { type: 'radio', label: 'Enfrastrikti', value: 'infrastructure' },
        { type: 'radio', label: 'Ekonomi', value: 'economic' },
        { type: 'radio', label: 'Anviwònman', value: 'environment' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (sector) => {
            await this.selectPlanSection(title, description, sector);
          }
        }
      ]
    });
    await alert.present();
  }

  async selectPlanSection(title: string, description: string, sector: string) {
    const alert = await this.alertController.create({
      header: 'Chwazi Seksyon',
      inputs: this.sections.map(s => ({
        type: 'radio',
        label: s,
        value: s
      })),
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kreye',
          handler: async (section) => {
            await this.dataService.createActionPlan({
              section,
              title,
              description,
              status: 'planning',
              priority: 'medium',
              sector: sector as CommunityActionPlan['sector'],
              leadVpcId: '',
              participants: []
            });
            await this.showToast('Plan aksyon kreye!', 'success');
            await this.loadData();
          }
        }
      ]
    });
    await alert.present();
  }

  goToTraining() {
    this.router.navigate(['/training']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
