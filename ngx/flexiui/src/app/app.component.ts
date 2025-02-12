import { Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { NgxQuoteComponent } from '../../projects/ngx-quote/src/public-api';

interface Technology {
  label: string;
  value: string; 
  allowed: boolean;
  brandColor: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxQuoteComponent, NgClass, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'flexiui';
  initialCount = 0;
  quoteValue = 'This is a simple and flexible "Quote" component designed to highlight phrases or important content. It allows easy customization of styles, icons, colors, and more. Additionally, it includes an editable mode for use in forms, block editors, etc.';
  technologies:Technology[] = [
    { 
      label: 'VanillaJS',
      value: 'vanillajs',
      allowed: true,
      brandColor: '#f0db4f',
    },
    { 
      label: 'Svelte',
      value: 'svelte',
      allowed: true,
      brandColor: '#FF3E00',
    },
    {
      label: 'Angular',
      value: 'angular',
      allowed: true,
      brandColor: 'linear-gradient(225deg, #E40035, #F60A48 20%, #F20755 40%, #DC087D 50%, #9717E7 70%, #6C00F5), linear-gradient(47deg, #FF31D9, rgba(255, 91, 225, 0) 100%)',
    },
    { 
      label: 'Vue',
      value: 'vue', 
      allowed: true,
      brandColor: '#41B883',
    },
    { 
      label: 'React',
      value: 'react', 
      allowed: true,
      brandColor: '#00D8FF',
    }
  ]

  selectedTechnology: Technology = this.technologies[2];

  selectTechnology(technology: Technology) {
    this.selectedTechnology = technology;
  }

  get isGradient(): boolean {
    return this.selectedTechnology.brandColor.startsWith('linear-gradient');
  }

  handleFocus(event: any) {
    console.log('Focus event:', event);
  }

  handleKeyDown(event: any) {
    console.log('Keydown event:', event);
  }

  handleChange(event: any) {
    console.log('Change event:', event);
    // Actualizar el contenido si es necesario
    // this.content = event.innerHTML;
  }
}
