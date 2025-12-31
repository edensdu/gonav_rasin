import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Group, Contribution } from '../../models';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.page.html',
  styleUrls: ['./group-detail.page.scss'],
  standalone: false
})
export class GroupDetailPage implements OnInit {
  groupId: string = '';
  group: Group | null = null;
  recentContributions: Contribution[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    this.loadGroup();
  }

  ionViewWillEnter() {
    this.loadGroup();
  }

  async loadGroup() {
    if (!this.groupId) return;

    this.group = await this.dataService.getGroup(this.groupId) || null;

    if (this.group) {
      const contributions = await this.dataService.getContributionsByGroup(this.groupId);
      this.recentContributions = contributions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    }
  }

  goToMembers() {
    this.router.navigate(['/members', this.groupId]);
  }

  goToContributions() {
    this.router.navigate(['/contributions', this.groupId]);
  }

  goToLoans() {
    this.router.navigate(['/loans', this.groupId]);
  }

  async showOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opsyon',
      buttons: [
        {
          text: 'Modifye Gwoup',
          icon: 'create-outline',
          handler: () => this.editGroup()
        },
        {
          text: 'Pataje sou WhatsApp',
          icon: 'logo-whatsapp',
          handler: () => this.shareOnWhatsApp()
        },
        {
          text: 'Efase Gwoup',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => this.confirmDelete()
        },
        {
          text: 'Anile',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async editGroup() {
    if (!this.group) return;

    const alert = await this.alertController.create({
      header: 'Modifye Gwoup',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: this.group.name,
          placeholder: 'Non gwoup la'
        },
        {
          name: 'meetingDay',
          type: 'text',
          value: this.group.meetingDay,
          placeholder: 'Jou reyinyon'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Anrejistre',
          handler: async (data) => {
            if (this.group && data.name) {
              this.group.name = data.name;
              this.group.meetingDay = data.meetingDay;
              await this.dataService.updateGroup(this.group);
              await this.showToast('Gwoup modifye!', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async shareOnWhatsApp() {
    if (!this.group) return;

    const text = `*${this.group.name}*\n` +
      `Tip: ${this.group.type}\n` +
      `Manm: ${this.group.memberCount}\n` +
      `Total Epay: ${this.group.totalSavings.toLocaleString()} HTG\n` +
      `Prè Aktif: ${this.group.activeLoans}\n\n` +
      `Jesyon gwoup epay ak Rasin Gonav 🌱`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Efase Gwoup',
      message: 'Ou sèten ou vle efase gwoup sa a? Aksyon sa a pa ka defèt.',
      buttons: [
        { text: 'Non', role: 'cancel' },
        {
          text: 'Wi, efase',
          role: 'destructive',
          handler: async () => {
            await this.dataService.deleteGroup(this.groupId);
            await this.showToast('Gwoup efase', 'success');
            this.router.navigate(['/groups']);
          }
        }
      ]
    });
    await alert.present();
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
