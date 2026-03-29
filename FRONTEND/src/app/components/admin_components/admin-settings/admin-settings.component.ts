import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService } from '../../../../services/UserServices/settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: false,
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss'
})
export class AdminSettingsComponent implements OnInit {

  smtpForm!: FormGroup;
  googleForm!: FormGroup;
  fieldForm!: FormGroup;
  fields:any[] = [];
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
     
  ) {}

  ngOnInit(): void {

    this.fieldForm = this.fb.group({
      FieldName:[''],
      FieldLabel:[''],
      FieldType:['text'],
      Options:['']
    });

    this.smtpForm = this.fb.group({
      server: [''],
      port: [''],
      senderName: [''],
      senderEmail: [''],
      username: [''],
      password: [''],
      enableSsl: ['']
    });

    this.googleForm = this.fb.group({
      clientId: ['']
    });

    this.loadSmtpSettings();
    this.loadGoogleSettings();
  
  }




loadSmtpSettings(){
  this.settingsService.getSmtpSettings().subscribe(res => {

    console.log("SMTP API Response:", res);

    this.smtpForm.patchValue({
      server: res.server,
      port: res.port,
      senderName: res.senderName,
      senderEmail: res.senderEmail,
      username: res.username,
      password: res.password,
      enableSsl: res.enableSsl
    });

  });
}

loadGoogleSettings(){
  this.settingsService.getGoogleClientId().subscribe(res => {

    console.log("Google API Response:", res);

    this.googleForm.patchValue({
      clientId: res.clientId
    });

  });
}
updateSmtp(){
  const data = this.smtpForm.value;

  this.settingsService.updateSmtp(data).subscribe(res=>{
    alert("SMTP settings updated successfully");
  });
}

updateGoogle(){
  const data = this.googleForm.value;

  this.settingsService.updateGoogle(data).subscribe(res=>{
    alert("Google settings updated successfully");
  });
}

}