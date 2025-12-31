import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false
})
export class OnboardingPage {
  currentSlide = 0;

  slides: OnboardingSlide[] = [
    {
      icon: 'people-circle-outline',
      title: 'Byenveni nan Rasin Gonav',
      description: 'Platfòm kominotè pou La Gonâve ki konbine jesyon gwoup epay ak fòmasyon lidèchip.',
      color: '#00209F'
    },
    {
      icon: 'cash-outline',
      title: 'Sol Lakay - Gwoup Epay',
      description: 'Jere gwoup epay ou yo, swiv kotizasyon manm yo, bay prè, epi wè balans gwoup la.',
      color: '#4A7C94'
    },
    {
      icon: 'school-outline',
      title: 'Rasin Lidèchip - Fòmasyon',
      description: 'Swiv fòmasyon lidèchip VPC, wè pwogrè manm yo, epi jere plan aksyon.',
      color: '#D21034'
    },
    {
      icon: 'cloud-offline-outline',
      title: 'Travay San Entènèt',
      description: 'Tout done ou yo estoke sou telefòn ou. Ou ka itilize aplikasyon an menm san entènèt.',
      color: '#2E7D32'
    },
    {
      icon: 'rocket-outline',
      title: 'Ann Kòmanse!',
      description: 'Klike sou bouton anba a pou kòmanse itilize Rasin Gonav.',
      color: '#00209F'
    }
  ];

  constructor(private router: Router) {}

  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  finish() {
    localStorage.setItem('onboardingComplete', 'true');
    this.router.navigate(['/login']);
  }

  skip() {
    localStorage.setItem('onboardingComplete', 'true');
    this.router.navigate(['/login']);
  }
}
