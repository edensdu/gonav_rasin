import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Loan, Member } from '../../models';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.page.html',
  styleUrls: ['./loans.page.scss'],
  standalone: false
})
export class LoansPage implements OnInit {
  groupId: string = '';
  loans: Loan[] = [];
  activeLoans: Loan[] = [];
  paidLoans: Loan[] = [];
  members: Member[] = [];
  totalLoaned = 0;

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
    this.loans = await this.dataService.getLoansByGroup(this.groupId);

    this.activeLoans = this.loans.filter(l => l.status === 'active' || l.status === 'overdue');
    this.paidLoans = this.loans.filter(l => l.status === 'paid');

    this.totalLoaned = this.loans.reduce((sum, l) => sum + l.amount, 0);

    // Check for overdue loans
    const today = new Date();
    this.activeLoans.forEach(loan => {
      if (new Date(loan.dueDate) < today && loan.status !== 'overdue') {
        loan.status = 'overdue';
      }
    });
  }

  async viewLoan(loan: Loan) {
    const remaining = loan.totalDue - loan.amountPaid;

    const alert = await this.alertController.create({
      header: `Prè ${loan.memberName}`,
      message: `
        <strong>Montan prete:</strong> ${loan.amount.toLocaleString()} HTG<br>
        <strong>Enterè:</strong> ${loan.interestRate}%<br>
        <strong>Total dwe:</strong> ${loan.totalDue.toLocaleString()} HTG<br>
        <strong>Deja peye:</strong> ${loan.amountPaid.toLocaleString()} HTG<br>
        <strong>Rès:</strong> ${remaining.toLocaleString()} HTG<br>
        <strong>Dat limit:</strong> ${new Date(loan.dueDate).toLocaleDateString()}
      `,
      buttons: [
        { text: 'Fèmen', role: 'cancel' },
        {
          text: 'Ajoute Peman',
          handler: () => this.addPayment(loan)
        }
      ]
    });
    await alert.present();
  }

  async addLoan() {
    if (this.members.length === 0) {
      await this.showToast('Ajoute manm yo anvan', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Chwazi Moun Ki Ap Prete',
      inputs: this.members.map(m => ({
        type: 'radio',
        label: `${m.name} (Balans: ${m.balance.toLocaleString()} HTG)`,
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
                this.enterLoanDetails(member);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async enterLoanDetails(member: Member) {
    const alert = await this.alertController.create({
      header: `Prè pou ${member.name}`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Montan (HTG)',
          min: 1
        },
        {
          name: 'interestRate',
          type: 'number',
          placeholder: 'Enterè (%) - pa egzanp: 10',
          value: '10'
        },
        {
          name: 'weeks',
          type: 'number',
          placeholder: 'Semèn pou peye',
          value: '4'
        }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kreye Prè',
          handler: async (data) => {
            const amount = parseFloat(data.amount);
            const rate = parseFloat(data.interestRate) || 10;
            const weeks = parseInt(data.weeks) || 4;

            if (!amount || amount <= 0) {
              await this.showToast('Tanpri antre yon montan valid', 'warning');
              return false;
            }

            await this.createLoan(member, amount, rate, weeks);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async createLoan(member: Member, amount: number, interestRate: number, weeks: number) {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (weeks * 7));

      await this.dataService.createLoan({
        groupId: this.groupId,
        memberId: member.id,
        memberName: member.name,
        amount,
        interestRate,
        status: 'active',
        disbursedAt: new Date(),
        dueDate,
        approvedBy: 'current_user'
      });

      await this.showToast(`Prè ${amount.toLocaleString()} HTG kreye pou ${member.name}!`, 'success');
      await this.loadData();
    } catch (error) {
      await this.showToast('Te gen yon erè', 'danger');
    }
  }

  async addPayment(loan: Loan) {
    const remaining = loan.totalDue - loan.amountPaid;

    const alert = await this.alertController.create({
      header: 'Ajoute Peman',
      message: `Rès: ${remaining.toLocaleString()} HTG`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Montan peman (HTG)',
          value: remaining.toString()
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

            await this.dataService.addLoanPayment(loan.id, {
              amount,
              date: new Date(),
              recordedBy: 'current_user'
            });

            await this.showToast('Peman anrejistre!', 'success');
            await this.loadData();
            return true;
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
