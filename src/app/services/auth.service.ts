import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataService } from './data.service';
import { User } from '../models';

const AUTH_KEY = 'fanm_gonav_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private dataService: DataService) {
    this.checkStoredAuth();
  }

  private async checkStoredAuth(): Promise<void> {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const { userId } = JSON.parse(stored);
        const user = await this.dataService.getUser(userId);
        if (user) {
          this.currentUser.next(user);
          this.isAuthenticated.next(true);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }

  private hashPin(pin: string): string {
    // Simple hash for demo - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  async register(name: string, phone: string, pin: string, groupId?: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if phone already exists
      const existing = await this.dataService.getUserByPhone(phone);
      if (existing) {
        return { success: false, message: 'Nimewo telefòn sa a deja anrejistre' };
      }

      const user = await this.dataService.createUser({
        name,
        phone,
        pin: this.hashPin(pin),
        role: 'leader',
        groupIds: groupId ? [groupId] : []
      });

      localStorage.setItem(AUTH_KEY, JSON.stringify({ userId: user.id }));
      this.currentUser.next(user);
      this.isAuthenticated.next(true);

      return { success: true, message: 'Kont kreye avèk siksè!', user };
    } catch (error) {
      return { success: false, message: 'Te gen yon erè. Tanpri eseye ankò.' };
    }
  }

  async login(phone: string, pin: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await this.dataService.getUserByPhone(phone);

      if (!user) {
        return { success: false, message: 'Nimewo telefòn pa jwenn' };
      }

      if (user.pin !== this.hashPin(pin)) {
        return { success: false, message: 'PIN pa kòrèk' };
      }

      localStorage.setItem(AUTH_KEY, JSON.stringify({ userId: user.id }));
      this.currentUser.next(user);
      this.isAuthenticated.next(true);

      return { success: true, message: 'Koneksyon reyisi!', user };
    } catch (error) {
      return { success: false, message: 'Te gen yon erè. Tanpri eseye ankò.' };
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this.currentUser.next(null);
    this.isAuthenticated.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  async updatePin(oldPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
    const user = this.currentUser.value;
    if (!user) {
      return { success: false, message: 'Ou pa konekte' };
    }

    if (user.pin !== this.hashPin(oldPin)) {
      return { success: false, message: 'Ansyen PIN pa kòrèk' };
    }

    user.pin = this.hashPin(newPin);
    await this.dataService.updateUser(user);
    this.currentUser.next(user);

    return { success: true, message: 'PIN chanje avèk siksè!' };
  }
}
