import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AdmAssetsService } from '../../../../../services/adminServices/adm-assets.service';
import { ToastrService } from 'ngx-toastr';
import { SpmoShowAssetsComponent } from '../spmo-show-assets/spmo-show-assets.component';
@Component({
  selector: 'app-spmo-add-edit-assets',
  standalone: false,
  templateUrl: './spmo-add-edit-assets.component.html',
  styleUrl: './spmo-add-edit-assets.component.scss',
})
export class SpmoAddEditAssetsComponent implements OnInit {
  @ViewChild('addEditAssetsModal') ShowAssetsComponent!: SpmoShowAssetsComponent;

  callChildCloseClick() {
    this.ShowAssetsComponent.closeClick();
  }
  usersemail: { id: number; Emails: string }[] = [];
  equipmentTypes = [
    'Desktop',
    'All in One Desktop',
    'Laptop',
    'Printer',
    'Scanner',
    'Server',
  ];
  StatusTypes = ['Good', 'Need Repair','Unserviceable','Obsolete','No longer Needed','Not Used since purchase','For Waste', 'Disposal'];

  constructor(
    private service: AdmAssetsService,
    private toastr: ToastrService
  ) {}
  @Input() events: any;
  Id: string | undefined;
  PPE: string | undefined;
  Fund_Cluster: string | undefined;
  CollCode: string | undefined;
  Name: string | undefined;
  Desc1: string | undefined;
  Provider_Name: string | undefined;
  Andate: string | undefined;
  PN: string | undefined;
  PAR: string | undefined;
  UM: string | undefined;
  UserName: string | undefined;
  Email: string | undefined;
  CurrentUser: string | undefined;
  EqStatus: string | undefined;
  SerialNumber: string | undefined;
  Location: string | undefined;
  AssetssList: any = [];
  Qty: number = 0;
  UCost: number = 0;
  TCost: number = 0;
  UserId: number | undefined;

  updateTotalCost(): void {
    const qty = Number(this.Qty);
    const unitCost = Number(this.UCost);
    this.TCost = isNaN(qty) || isNaN(unitCost) ? 0 : qty * unitCost;
  }
  ngOnInit(): void {
    this.loadAssetList();

    this.service.getUserId().subscribe((usersemail) => {
      this.usersemail = usersemail;

      //  set selected user here after usersemail is ready
      if (this.events?.UserId) {
        this.selectedUser =
          this.usersemail.find((u) => u.id === this.events.UserId) || null;
      }
    });
  }

  loadAssetList() {
    this.service.getAssets().subscribe((data: any) => {
      this.AssetssList = data;
      this.Id = this.events.Id;
      this.PPE = this.events.PPE;
      this.Fund_Cluster = this.events.Fund_Cluster;
      this.CollCode = this.events.CollCode;
      this.Name = this.events.Name;
      this.Desc1 = this.events.Desc1;
      this.Provider_Name = this.events.Provider_Name;
      this.Andate = this.events.AnDate;
      this.PN = this.events.PN;
      this.PAR = this.events.PAR;
      this.Qty = this.events.Qty;
      this.UM = this.events.UM;
      this.UCost = this.events.UCost;
      this.TCost = this.events.TCost;
      this.UserName = this.events.UserName;
      this.Email = this.events.Email;
      this.CurrentUser = this.events.CurrentUser;
      this.EqStatus = this.events.EqStatus;
      this.SerialNumber = this.events.SerialNumber;
      this.Location = this.events.Location;
      this.UserId = this.events.UserId;
    });
  }

  // addEvents() {
  //   const val = {
  //     Id: this.Id,
  //     PPE : this.PPE,
  //     Fund_Cluster:this.Fund_Cluster,
  //     CollCode: this.CollCode,
  //     Name: this.Name,
  //     Desc1: this.Desc1,
  //     Andate: this.Andate,
  //     MrNum: this.MrNum,
  //     PropNo: this.PropNo,
  //     Qty: this.Qty,
  //     UM: this.UM,
  //     UCost: this.UCost,
  //     TCost: this.TCost,
  //     UserName: this.UserName,
  //     Email: this.Email,
  //     CurrentUser: this.CurrentUser,
  //     EqStatus: this.EqStatus,
  //     SerialNumber: this.SerialNumber,
  //     Location: this.Location,
  //     UserId: this.UserId
  //   };

  //   this.service.addAssets(val).subscribe(() => {
  //     this.toastr.success('Added Successfully', 'Added');
  //   });
  // }
  selectedUser: { id: number; Emails: string } | null = null;

  addEvents() {
    const val = {
      Id: this.Id,
      PPE: this.PPE,
      Fund_Cluster: this.Fund_Cluster,
      CollCode: this.CollCode,
      Name: this.Name,
      Desc1: this.Desc1,
      Provider_Name: this.Provider_Name,
      Andate: this.Andate,
      PN: this.PN,
      PAR: this.PAR,
      Qty: this.Qty,
      UM: this.UM,
      UCost: this.UCost,
      TCost: this.TCost,
      UserName: this.UserName,
      Email: this.selectedUser ? this.selectedUser.Emails : '', //  save email
      CurrentUser: this.CurrentUser,
      EqStatus: this.EqStatus,
      SerialNumber: this.SerialNumber,
      Location: this.Location,
      UserId: this.selectedUser ? this.selectedUser.id : null, //  save userid
    };

 this.service.addAssets(val).subscribe({
    next: () => {
      this.toastr.success('Added Successfully', 'Success');
      this.clearform();
    },
    error: (err) => {
      console.error('Error adding asset:', err);
      this.toastr.error('Failed to add. Please try again.', 'Error');
    }
  });
  }

  updateEvents() {
    const val = {
      Id: this.Id,
      PPE: this.PPE,
      Fund_Cluster: this.Fund_Cluster,
      CollCode: this.CollCode,
      Name: this.Name,
      Desc1: this.Desc1,
      Provider_Name:this.Provider_Name,
      Andate: this.Andate,
      PN: this.PN,
      PAR: this.PAR,
      Qty: this.Qty,
      UM: this.UM,
      UCost: this.UCost,  
      TCost: this.TCost,
      UserName: this.UserName,
      Email: this.selectedUser ? this.selectedUser.Emails : '', 
      CurrentUser: this.CurrentUser,
      EqStatus: this.EqStatus,
      SerialNumber: this.SerialNumber,
      Location: this.Location,
      UserId: this.selectedUser ? this.selectedUser.id : null, 
    };

    // this.service.updateAssets(val).subscribe(() => {
    //   this.toastr.warning('Updated Successfully', 'Updated');
    // });
    
  this.service.updateAssets(val).subscribe({
    next: () => {
      this.toastr.warning('Updated Successfully', 'Updated');
    },
    error: (err) => {
      console.error('Error updating asset:', err);
      this.toastr.error('Failed to update. Please try again.', 'Error');
    }
  });
  }
  clearform() {
     this.PPE ="";
      this.Fund_Cluster = "";
      this.CollCode = "";
      this.Name = "";
      this.Desc1 ="";
      this.Provider_Name = "";
      this.Andate = "";
      this.PN = "";
      this.PAR = "";
      this.Qty = 0;
      this.UM = "";
      this.UCost = 0;
      this.TCost = 0;
      this.UserName = "";
      this.Email ="";
      this.CurrentUser ="";
      this.EqStatus = "";
      this.SerialNumber = "";
      this.Location ="";
      
  }
}
