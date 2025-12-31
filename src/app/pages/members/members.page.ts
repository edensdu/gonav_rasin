import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Member, Group } from '../../models';

@Component({
  selector: 'app-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  standalone: false
})
export class MembersPage implements OnInit {
  groupId: string = '';
  group: Group | null = null;
  members: Member[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  async loadData() {
    if (!this.groupId) return;
    this.group = await this.dataService.getGroup(this.groupId) || null;
    this.members = await this.dataService.getMembersByGroup(this.groupId);
    this.members.sort((a, b) => a.name.localeCompare(b.name));
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'leader': 'primary',
      'treasurer': 'success',
      'secretary': 'tertiary',
      'member': 'medium'
    };
    return colors[role] || 'medium';
  }

  getTotalBalance(): number {
    return this.members.reduce((sum, m) => sum + m.balance, 0);
  }

  viewMember(member: Member) {
    this.showMemberDetails(member);
  }

  async showMemberDetails(member: Member) {
    const alert = await this.alertController.create({
      header: member.name,
      message: `
        <strong>Wòl:</strong> ${this.getRoleLabel(member.role)}<br>
        <strong>Total Kotizasyon:</strong> ${member.totalContributions.toLocaleString()} HTG<br>
        <strong>Total Prè:</strong> ${member.totalLoans.toLocaleString()} HTG<br>
        <strong>Balans:</strong> ${member.balance.toLocaleString()} HTG<br>
        ${member.phone ? `<strong>Telefòn:</strong> ${member.phone}` : ''}
      `,
      buttons: ['Fèmen']
    });
    await alert.present();
  }

  async addMember() {
    const alert = await this.alertController.create({
      header: 'Ajoute Manm Nouvo',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Non konplè'
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Nimewo telefòn (opsyonèl)'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (data) => {
            if (!data.name) {
              await this.showToast('Tanpri antre non manm nan', 'warning');
              return false;
            }
            await this.selectRole(data.name, data.phone);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async selectRole(name: string, phone: string) {
    const alert = await this.alertController.create({
      header: 'Chwazi Wòl',
      inputs: [
        { type: 'radio', label: 'Manm', value: 'member', checked: true },
        { type: 'radio', label: 'Lidè', value: 'leader' },
        { type: 'radio', label: 'Trezorye', value: 'treasurer' },
        { type: 'radio', label: 'Sekretè', value: 'secretary' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Ajoute',
          handler: async (role) => {
            await this.createMember(name, phone, role);
          }
        }
      ]
    });
    await alert.present();
  }

  async createMember(name: string, phone: string, role: string) {
    try {
      await this.dataService.createMember({
        groupId: this.groupId,
        name,
        phone: phone || undefined,
        role: role as Member['role'],
        totalContributions: 0,
        totalLoans: 0,
        balance: 0,
        joinedAt: new Date(),
        isActive: true
      });

      // Update group member count
      if (this.group) {
        this.group.memberCount += 1;
        await this.dataService.updateGroup(this.group);
      }

      await this.showToast('Manm ajoute!', 'success');
      await this.loadData();
    } catch (error) {
      await this.showToast('Te gen yon erè', 'danger');
    }
  }

  async editMember(member: Member) {
    const alert = await this.alertController.create({
      header: 'Modifye Manm',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: member.name,
          placeholder: 'Non'
        },
        {
          name: 'phone',
          type: 'tel',
          value: member.phone || '',
          placeholder: 'Telefòn'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Anrejistre',
          handler: async (data) => {
            if (data.name) {
              member.name = data.name;
              member.phone = data.phone || undefined;
              await this.dataService.updateMember(member);
              await this.showToast('Manm modifye!', 'success');
              await this.loadData();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteMember(member: Member) {
    const alert = await this.alertController.create({
      header: 'Efase Manm',
      message: `Ou sèten ou vle retire ${member.name} nan gwoup la?`,
      buttons: [
        { text: 'Non', role: 'cancel' },
        {
          text: 'Wi, efase',
          role: 'destructive',
          handler: async () => {
            await this.dataService.deleteMember(member.id);

            if (this.group) {
              this.group.memberCount -= 1;
              await this.dataService.updateGroup(this.group);
            }

            await this.showToast('Manm efase', 'success');
            await this.loadData();
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
