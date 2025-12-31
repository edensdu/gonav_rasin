import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Group } from '../../models';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  standalone: false
})
export class GroupsPage implements OnInit {
  groups: Group[] = [];

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
    this.loadGroups();
  }

  ionViewWillEnter() {
    this.loadGroups();
  }

  async loadGroups() {
    this.groups = await this.dataService.getAllGroups();
  }

  openGroup(group: Group) {
    this.router.navigate(['/group-detail', group.id]);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'mutuelle': 'Mutuelle',
      'sol': 'Sol',
      'vpc': 'VPC',
      'cbo': 'CBO'
    };
    return labels[type] || type;
  }

  getMeetingFrequency(freq: string): string {
    const labels: { [key: string]: string } = {
      'weekly': 'chak semèn',
      'biweekly': 'chak 2 semèn',
      'monthly': 'chak mwa'
    };
    return labels[freq] || freq;
  }

  async addGroup() {
    const alert = await this.alertController.create({
      header: 'Kreye Gwoup Nouvo',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Non gwoup la'
        },
        {
          name: 'type',
          type: 'text',
          placeholder: 'Tip (mutuelle, sol)',
          value: 'mutuelle'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (data) => {
            if (!data.name) {
              await this.showToast('Tanpri antre non gwoup la', 'warning');
              return false;
            }
            await this.showSectionSelector(data.name, data.type || 'mutuelle');
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async showSectionSelector(name: string, type: string) {
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
            if (!section) {
              await this.showToast('Tanpri chwazi yon seksyon', 'warning');
              return false;
            }
            await this.createGroup(name, type, section);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async createGroup(name: string, type: string, section: string) {
    try {
      await this.dataService.createGroup({
        name,
        type: type as Group['type'],
        description: '',
        section,
        leaderId: '',
        memberCount: 0,
        totalSavings: 0,
        activeLoans: 0,
        meetingDay: 'Samdi',
        meetingFrequency: 'weekly'
      });

      await this.showToast('Gwoup kreye avèk siksè!', 'success');
      await this.loadGroups();
    } catch (error) {
      await this.showToast('Te gen yon erè', 'danger');
    }
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
