import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'ngx-quote',
  standalone: true,
  imports: [NgClass, NgStyle, NgIf],
  templateUrl: './ngx-quote.component.html',
  styleUrl: './ngx-quote.component.css'
})
export class NgxQuoteComponent {
  @Input() content: string = '';  // Entrada para el valor
  @Input() className: string = '';
  @Input() id: string = 'flexi-quote';
  @Input() bgColor: string = 'transparent';
  @Input() textColor: string = '#fff';
  @Input() borderWidth: string = '3px';
  @Input() borderRadius: string = '0';
  @Input() editable: boolean = false;

  @Output() focusEvent = new EventEmitter<any>();
  @Output() keydownEvent = new EventEmitter<any>();
  @Output() contentChange = new EventEmitter<string>();  // Emite cambios del valor

  @ViewChild('quoteContent', { static: false }) quoteContent!: ElementRef;  // Referencia al contenido editable

  constructor(private renderer: Renderer2) {}

  handleFocus(event: FocusEvent) {
    this.focusEvent.emit({ innerHTML: (event.target as HTMLElement).innerHTML, event });
  }

  handleKeydown(event: KeyboardEvent) {
    this.keydownEvent.emit({ innerHTML: (event.target as HTMLElement).innerHTML, event });
  }

  handleChange(event: Event) {
    const target = event.target as HTMLElement;
    const newValue = target.innerHTML;
    
    // Emitimos el cambio solo si es necesario, sin actualizar el valor directamente en el input
    if (this.content !== newValue) {
      this.contentChange.emit(newValue);
    }
  }
}
