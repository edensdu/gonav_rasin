import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Contribution, Member } from '../../models';

interface ContributionGroup {
  date: Date;
  items: Contribution[];
}

@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.page.html',
  styleUrls: ['./contributions.page.scss'],
  standalone: false
})
export class ContributionsPage implements OnInit {
  groupId: string = '';
  contributions: Contribution[] = [];
  groupedContributions: ContributionGroup[] = [];
  members: Member[] = [];
  totalContributions = 0;

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

    this.members = await this.dataService.getMembersByGroup(this.groupId);
    this.contributions = await this.dataService.getContributionsByGroup(this.groupId);

    // Sort by date descending
    this.contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate total
    this.totalContributions = this.contributions.reduce((sum, c) => sum + c.amount, 0);

    // Group by date
    this.groupContributions();
  }

  groupContributions() {
    const groups: { [key: string]: Contribution[] } = {};

    this.contributions.forEach(contrib => {
      const dateKey = new Date(contrib.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(contrib);
    });

    this.groupedContributions = Object.keys(groups).map(key => ({
      date: new Date(key),
      items: groups[key]
    }));
  }

  async addContribution() {
    if (this.members.length === 0) {
      await this.showToast('Ajoute manm yo anvan', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Chwazi Manm',
      inputs: this.members.map(m => ({
        type: 'radio',
        label: m.name,
        value: m.id
      })),
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: (memberId) => {
            if (memberId) {
              const member = this.members.find(m => m.id === memberId);
              if (member) {
                this.enterAmount(member);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async enterAmount(member: Member) {
    const alert = await this.alertController.create({
      header: `Kotizasyon ${member.name}`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Montan (HTG)',
          min: 1
        },
        {
          name: 'notes',
          type: 'text',
          placeholder: 'Nòt (opsyonèl)'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Anrejistre',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            if (!amount || amount <= 0) {
              await this.showToast('Tanpri antre yon montan valid', 'warning');
              return false;
            }
            await this.saveContribution(member, amount, data.notes);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async saveContribution(member: Member, amount: number, notes?: string) {
    try {
      await this.dataService.createContribution({
        groupId: this.groupId,
        memberId: member.id,
        memberName: member.name,
        amount,
        date: new Date(),
        meetingNumber: this.contributions.length + 1,
        notes,
        recordedBy: 'current_user'
      });

      await this.showToast(`${amount.toLocaleString()} HTG anrejistre pou ${member.name}!`, 'success');
      await this.loadData();
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
