import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  isRegistering = false;
  isLoading = false;

  name = '';
  phone = '';
  pin = '';
  confirmPin = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private dataService: DataService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.clearForm();
  }

  clearForm() {
    this.name = '';
    this.phone = '';
    this.pin = '';
    this.confirmPin = '';
  }

  async onSubmit() {
    if (this.isRegistering) {
      await this.register();
    } else {
      await this.login();
    }
  }

  async login() {
    if (!this.phone || !this.pin) {
      await this.showToast('Tanpri ranpli tout chan yo', 'warning');
      return;
    }

    if (this.pin.length !== 4) {
      await this.showToast('PIN dwe gen 4 chif', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.login(this.phone, this.pin);

      if (result.success) {
        await this.showToast(result.message, 'success');
        this.router.navigate(['/dashboard']);
      } else {
        await this.showToast(result.message, 'danger');
      }
    } catch (error) {
      await this.showToast('Te gen yon erè. Tanpri eseye ankò.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async register() {
    if (!this.name || !this.phone || !this.pin || !this.confirmPin) {
      await this.showToast('Tanpri ranpli tout chan yo', 'warning');
      return;
    }

    if (this.pin.length !== 4) {
      await this.showToast('PIN dwe gen 4 chif', 'warning');
      return;
    }

    if (this.pin !== this.confirmPin) {
      await this.showToast('PIN yo pa menm', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.register(this.name, this.phone, this.pin);

      if (result.success) {
        await this.showToast(result.message, 'success');
        this.router.navigate(['/dashboard']);
      } else {
        await this.showToast(result.message, 'danger');
      }
    } catch (error) {
      await this.showToast('Te gen yon erè. Tanpri eseye ankò.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async enterDemoMode() {
    // Seed demo data and enter as guest
    await this.dataService.seedDemoData();
    localStorage.setItem('demo_mode', 'true');
    await this.showToast('Mòd demo aktive!', 'success');
    this.router.navigate(['/dashboard']);
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
