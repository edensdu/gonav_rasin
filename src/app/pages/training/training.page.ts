import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Training } from '../../models';

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
  standalone: false
})
export class TrainingPage implements OnInit {
  trainings: Training[] = [];
  filteredTrainings: Training[] = [];
  selectedCategory = 'all';

  constructor(
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
    this.trainings = await this.dataService.getAllTrainings();
    this.filterByCategory(this.selectedCategory);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredTrainings = this.trainings;
    } else {
      this.filteredTrainings = this.trainings.filter(t => t.category === category);
    }
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

  async addTraining() {
    const alert = await this.alertController.create({
      header: 'Nouvo Fòmasyon',
      inputs: [
        { name: 'nameCreole', type: 'text', placeholder: 'Non an Kreyòl' },
        { name: 'name', type: 'text', placeholder: 'Non an Angle (opsyonèl)' },
        { name: 'hours', type: 'number', placeholder: 'Kantite èdtan' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kontinye',
          handler: async (data) => {
            if (!data.nameCreole) {
              await this.showToast('Tanpri antre non fòmasyon an', 'warning');
              return false;
            }
            await this.selectCategory(data.nameCreole, data.name || data.nameCreole, parseInt(data.hours) || 4);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async selectCategory(nameCreole: string, name: string, hours: number) {
    const alert = await this.alertController.create({
      header: 'Chwazi Kategori',
      inputs: [
        { type: 'radio', label: 'Lidèchip', value: 'leadership', checked: true },
        { type: 'radio', label: 'Jesyon Pwojè', value: 'project_management' },
        { type: 'radio', label: 'Angajman Sivik', value: 'civic' },
        { type: 'radio', label: 'Teknik', value: 'technical' },
        { type: 'radio', label: 'Antreprenarya', value: 'entrepreneurship' }
      ],
      buttons: [
        { text: 'Anile', role: 'cancel' },
        {
          text: 'Kreye',
          handler: async (category) => {
            await this.dataService.createTraining({
              name,
              nameCreole,
              description: '',
              category: category as Training['category'],
              hours,
              isActive: true
            });
            await this.showToast('Fòmasyon kreye!', 'success');
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
