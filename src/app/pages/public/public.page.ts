import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public',
  templateUrl: './public.page.html',
  styleUrls: ['./public.page.scss'],
  standalone: false
})
export class PublicPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  openWhatsApp() {
    // Replace with actual WhatsApp number for Rasin Devlopman
    window.open('https://wa.me/50912345678?text=Bonjou!%20Mwen%20enterese%20nan%20Rasin%20Gonav', '_blank');
  }
}
