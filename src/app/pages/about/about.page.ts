import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface HowToStep {
  icon: string;
  title: string;
  description: string;
}

interface Feature {
  icon: string;
  title: string;
  items: string[];
}

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: false
})
export class AboutPage {

  howToSteps: HowToStep[] = [
    {
      icon: 'log-in-outline',
      title: '1. Antre nan Aplikasyon',
      description: 'Itilize nenpòt non itilizatè ak modpas pou antre (demo mode).'
    },
    {
      icon: 'grid-outline',
      title: '2. Eksplore Tablo Bò',
      description: 'Wè estatistik, gwoup epay, fòmasyon, epi tout aktivite yo.'
    },
    {
      icon: 'add-circle-outline',
      title: '3. Kreye Nouvo Eleman',
      description: 'Klike sou bouton + pou kreye nouvo gwoup, manm, kotizasyon, oswa prè.'
    },
    {
      icon: 'eye-outline',
      title: '4. Wè Detay',
      description: 'Klike sou nenpòt kat pou wè detay ak jere manm, kontribisyon, ak prè.'
    }
  ];

  features: Feature[] = [
    {
      icon: 'people-outline',
      title: 'Jesyon Gwoup Epay',
      items: [
        'Kreye ak jere plizyè gwoup',
        'Ajoute manm ak wòl (prezidan, trezorye, sekretè)',
        'Swiv kotizasyon chak semèn/mwa',
        'Jere prè ak enterè',
        'Wè balans ak istwa gwoup'
      ]
    },
    {
      icon: 'school-outline',
      title: 'Fòmasyon Lidèchip',
      items: [
        'Swiv manm VPC (Komite Planifikasyon Vilaj)',
        'Anrejistre sesyon fòmasyon',
        'Wè èdtan fòmasyon chak manm',
        'Jere plan aksyon',
        'Swiv pwogrè devlopman'
      ]
    },
    {
      icon: 'cloud-offline-outline',
      title: 'Fonksyonalite Offline',
      items: [
        'Tout done estoke sou telefòn ou',
        'Travay san entènèt',
        'Done yo rete menm apre ou fèmen aplikasyon an',
        'Pa bezwen sèvè oswa kont'
      ]
    }
  ];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  restartOnboarding() {
    localStorage.removeItem('onboardingComplete');
    this.router.navigate(['/onboarding']);
  }
}
