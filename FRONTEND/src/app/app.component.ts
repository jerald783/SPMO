import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  title = 'frontend';
aiRequest?: Subscription;
  chatHistory: ChatMessage[] = [];

  issueDesc = '';
  loading = false;

  aiOpen = false;
  showAiAssistant = false;

  @ViewChild('chatBox') chatBox!: ElementRef;

  constructor(
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {

    // =========================
    // SPINNER (UNCHANGED)
    // =========================
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

}

