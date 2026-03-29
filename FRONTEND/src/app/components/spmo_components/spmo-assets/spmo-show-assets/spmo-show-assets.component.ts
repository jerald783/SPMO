import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdmAssetsService } from '../../../../../services/adminServices/adm-assets.service';
import { ToastrService } from 'ngx-toastr';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectionModel } from '@angular/cdk/collections';
@Component({
  selector: 'app-spmo-show-assets',
  standalone: false,
  templateUrl: './spmo-show-assets.component.html',
  styleUrl: './spmo-show-assets.component.scss',
})
export class SpmoShowAssetsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'select',
    'PPE',
    'Fund_Cluster',
    'CollCode',
    'Provider_Name',
    'Name',
    'Desc1',
    'SerialNumber',
    'AnDate',
    'PAR',
    'PN',
    'Qty',
    'UM',
    'UCost',
    'TCost',
    'Location',
    'UserName',
    'EqStatus',
    'Options',
  ];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ModalTitle: string | undefined;
  ActivateAddEditAssetsComp: boolean = false;
  events: any;
  selection = new SelectionModel<any>(true, []);
  constructor(
    private service: AdmAssetsService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.refreshAssetsList();
  }

  ngAfterViewInit(): void {
    // Apply paginator and sort to dataSource once the view is initialized
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addClick(): void {
    this.events = {
      Id: 0,
      PPE: '',
      Fund_Cluster: '',
      CollCode: '',
      Name: '',
      Desc1: '',
      SerialNumber: '',
      AnDate: '',
      PN: '',
      PAR: '',
      Qty: '',
      UM: '',
      UCost: '',
      TCost: '',
      Locatio: '',
      EqStatus: '',
    };
    this.ModalTitle = 'Add Assets';
    this.ActivateAddEditAssetsComp = true;
  }

  editClick(item: any): void {
    console.log(item);
    this.events = item;
    this.ModalTitle = 'Edit Assets';
    this.ActivateAddEditAssetsComp = true;
    console.log(item);
  }

  deleteSelected(): void {
    if (this.selection.selected.length === 0) {
      this.toastr.warning('No tickets selected for deletion.');
      return;
    }

    if (
      confirm(
        `Delete ${this.selection.selected.length} tickets (and their messages)?`,
      )
    ) {
      const idsToDelete = this.selection.selected.map((item) => item.Id);

      idsToDelete.forEach((Id) => {
        this.service.deleteAssets(Id).subscribe({});
      });

      // Refresh after all deletions
      setTimeout(() => {
        this.refreshAssetsList();
        this.selection.clear();
      }, 500);
    }
  }
  closeClick(): void {
    this.ActivateAddEditAssetsComp = false;
    this.refreshAssetsList();
  }

  refreshAssetsList(): void {
    this.service.getAssets().subscribe((data) => {
      this.dataSource.data = data.sort((a, b) => b.Id - a.Id); // Sort descending by ID
      // Ensure paginator and sort are updated after data is assigned to dataSource
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  filterUserName: string = '';

  applyFilter() {
    const search = this.filterUserName.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return (
        data.UserName?.toLowerCase().includes(filter) ||
        data.Fund_Cluster?.toLowerCase().includes(filter) ||
        data.PPE?.toLowerCase().includes(filter) ||
        data.Location?.toLowerCase().includes(filter) ||
        data.PAR?.toLowerCase().includes(filter) ||
        data.PN?.toLowerCase().includes(filter)
      );
    };
    this.dataSource.filter = search;
  }

  getFilteredData(): any[] {
    const search = this.filterUserName.trim().toLowerCase();
    if (!search) return this.dataSource.data;

    return this.dataSource.data.filter(
      (item) =>
        item.UserName?.toLowerCase().includes(search) ||
        item.Fund_Cluster?.toLowerCase().includes(search) ||
        item.PPE?.toLowerCase().includes(search) ||
        item.Location?.toLowerCase().includes(search) ||
        item.PAR?.toLowerCase().includes(search) ||
        item.PN?.toLowerCase().includes(search),
    );
  }
  exportType: 'pdf' | 'excel' | '' = '';
  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    // ============================
    // HEADER (LIKE PDF)
    // ============================
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value = 'UNIVERSITY OF THE PHILIPPINES MINDANAO';
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { size: 14, bold: true };

    worksheet.mergeCells('A2:J2');
    worksheet.getCell('A2').value = 'Inventory Count Form';
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    worksheet.getCell('A2').font = { size: 12 };

    worksheet.addRow([]);

    const today = new Date().toLocaleDateString();
    worksheet.getCell('A4').value =
      `PPE Account Group: ${this.filterUserName || 'ALL'}`;
    worksheet.getCell('J4').value = `Generated on: ${today}`;
    worksheet.getCell('J4').alignment = { horizontal: 'right' };

    worksheet.addRow([]);

    // ============================
    // FILTER DATA
    // ============================
    const filteredData = this.dataSource.data.filter((item) => {
      if (!this.filterUserName) return true;
      const search = this.filterUserName.toLowerCase();
      return (
        item.UserName?.toLowerCase().includes(search) ||
        item.Fund_Cluster?.toLowerCase().includes(search) ||
        item.PPE?.toLowerCase().includes(search) ||
        item.Location?.toLowerCase().includes(search)
      );
    });

    if (filteredData.length === 0) {
      this.toastr.warning('No assets found.', 'Filter Result');
      return;
    }

    // ============================
    // TABLE HEADER (MATCH PDF)
    // ============================
    const headers = [
      'ARTICLE / ITEM',
      'DESCRIPTION',
      'OLD PROPERTY NO.',
      'NEW PROPERTY NO.',
      'UNIT MEASURE',
      'UNIT VALUE',
      'QTY (CARD)',
      'QTY (PHYSICAL)',
      'LOCATION',
      'CONDITION',
    ];

    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Set column widths
    worksheet.columns = [
      { width: 25 },
      { width: 30 },
      { width: 25 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 25 },
      { width: 30 },
    ];

    // ============================
    // DATA (MATCH PDF FORMAT)
    // ============================
    let grandTotal = 0;

    filteredData.forEach((item) => {
      const unitCost = Number(item.UCost || 0);
      const totalCost = Number(item.TCost || 0);
      grandTotal += totalCost;

      const row = worksheet.addRow([
        `${item.Name}\n${item.PPE}\n${item.UserName}`,
        item.Desc1 || '',
        `PAR# ${item.PAR}\nPN# ${item.PN}\n${item.AnDate}\n${item.Provider_Name}`,
        '',
        item.UM || '',
        unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        item.Qty || '',
        `${item.Qty}\n${totalCost.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}`,
        item.Location || '',
        item.EqStatus || '',
      ]);

      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // ============================
    // GRAND TOTAL
    // ============================
    worksheet.addRow([]);

    const totalRow = worksheet.addRow([
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'GRAND TOTAL:',
      grandTotal.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      }),
    ]);

    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    // ============================
    // SIGNATURE SECTION
    // ============================
    worksheet.addRow([]);
    worksheet.addRow([]);

    worksheet.getCell('A' + (worksheet.rowCount + 1)).value = 'Prepared by:';
    worksheet.getCell('F' + worksheet.rowCount).value = 'Reviewed by:';

    worksheet.addRow([]);
    worksheet.addRow([
      '_________________________',
      '',
      '',
      '',
      '',
      '_________________________',
    ]);
    worksheet.addRow([
      'Signature over Printed Name',
      '',
      '',
      '',
      '',
      'Signature over Printed Name',
    ]);

    worksheet.addRow([]);
    worksheet.addRow(['Date: __________________']);

    // ============================
    // FOOTER NOTE
    // ============================
    worksheet.addRow([]);
    worksheet.mergeCells(
      `A${worksheet.rowCount + 1}:J${worksheet.rowCount + 1}`,
    );
    const noteCell = worksheet.getCell(`A${worksheet.rowCount}`);
    noteCell.value =
      'Note: For PPE items without Property No., provide Serial No./Model No./Description.';
    noteCell.alignment = { horizontal: 'center', wrapText: true };
    noteCell.font = { size: 9, italic: true };

    // ============================
    // SAVE FILE
    // ============================
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(
        blob,
        this.filterUserName
          ? `Inventory_${this.filterUserName}.xlsx`
          : `Inventory_Report.xlsx`,
      );
    });
  }
  exportToPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'legal',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const imgSize = 60;

    const leftLogo = 'assets/img/UPM_LOGO.png';
    const rightLogo = 'assets/img/SPMO.png';

    // ================================
    // LOAD LOGOS (SAFE VERSION)
    // ================================
    const loadImage = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d')?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = reject;
      });
    };

    // ================================
    // FILTER DATA (UserName OR Fund)
    // ================================
    const filteredData = this.dataSource.data.filter((item) => {
      if (!this.filterUserName) return true;
      const search = this.filterUserName.toLowerCase();
      return (
        item.UserName?.toLowerCase().includes(search) ||
        item.Fund_Cluster?.toLowerCase().includes(search) ||
        item.PPE?.toLowerCase().includes(search) ||
        item.Location?.toLowerCase().includes(search) ||
        item.PAR?.toLowerCase().includes(search) ||
        item.PN?.toLowerCase().includes(search)
      );
    });

    if (filteredData.length === 0) {
      this.toastr.warning('No assets found.', 'Filter Result');
      return;
    }

    // ================================
    // HELPER: ADD CIRCULAR IMAGE
    // ================================
    const addCircularImage = (
      doc: jsPDF,
      imgData: string,
      x: number,
      y: number,
      size: number,
    ): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imgData;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = size;
          canvas.height = size;

          if (ctx) {
            // Circular clipping
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();

            // Fit image inside circle
            const scale = Math.min(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

            doc.addImage(
              canvas.toDataURL('image/png'),
              'PNG',
              x,
              y,
              size,
              size,
            );
          }
          resolve();
        };
      });
    };

    // ================================
    // LOAD IMAGES AND BUILD PDF
    // ================================
    Promise.all([loadImage(leftLogo), loadImage(rightLogo)])
      .then(([leftImg, rightImg]) => {
        // Add logos as circles
        return Promise.all([
          addCircularImage(doc, leftImg, margin, 20, imgSize),
          addCircularImage(
            doc,
            rightImg,
            pageWidth - margin - imgSize,
            20,
            imgSize,
          ),
        ]);
      })
      .then(() => {
        // ================================
        // HEADER
        // ================================
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('UNIVERSITY OF THE PHILIPPINES MINDANAO', pageWidth / 2, 45, {
          align: 'center',
        });

        doc.setFontSize(13);
        doc.text('Inventory Count Form', pageWidth / 2, 65, {
          align: 'center',
        });

        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        // doc.text(`PPE Account Group: ${this.filterUserName || 'ALL'}`, margin, 100);
        const label = 'PPE Account Group: ';
        const value = this.filterUserName || 'ALL';
        const y = 100;

        // draw label (NO LINE)
        doc.text(label, margin, y);

        // get width of label
        const labelWidth = doc.getTextWidth(label);

        // draw value
        doc.text(value, margin + labelWidth, y);

        // draw underline ONLY under the value
        const minLineWidth = 120; // optional fixed width (looks better like a form)
        const valueWidth = Math.max(doc.getTextWidth(value), minLineWidth);

        doc.line(
          margin + labelWidth,
          y + 3,
          margin + labelWidth + valueWidth,
          y + 3,
        );

        const today = new Date().toLocaleDateString();

        //Annex A and date on the right
        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text('Annex A', pageWidth - margin, 15, {
          align: 'right',
        });
        doc.text(`Generated on: ${today}`, pageWidth - margin, 100, {
          align: 'right',
        });

        // ================================
        // TABLE
        // ================================
        const headers = [
          [
            'ARTICLE/ITEM',
            'DESCRIPTION',
            'OLD PROPERTY NO.',
            'NEW PROPERTY NO.\nASSIGNED TO BE FILLED\nUP DURING VALIDATION',
            'UNIT MEASURE',
            'UNIT VALUE',
            'QUANTITY\nPER\nPROPERTY CARD',
            'QUANTITY\nPER\nPHYSICAL COUNT',
            'LOCATION/\nWHEREABOUTS',
            'CONDITION\n(GOOD/NEED REPAIR/UNSERVICEABLE\nOBSOLETE/NO LONGER NEEDED\nNOT USED SINCE PURCHASE)',
          ],
        ];

        let grandTotal = 0;

        const body = filteredData.map((item) => {
          const unitCost = Number(item.UCost || 0);
          const totalCost = Number(item.TCost || 0);
          grandTotal += totalCost;

          return [
            item.Name && item.PPE && item.UserName
              ? `${item.Name}\n${item.PPE}\n${item.UserName}`
              : '',
            item.Desc1 || '',
            item.PAR && item.PN && item.AnDate && item.Provider_Name
              ? `${'PAR# ' + item.PAR}\n${'PN# ' + item.PN}\n${item.AnDate}\n${item.Provider_Name}`
              : '',
            (item.PN = ''),
            item.UM || '',
            unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 }),
            item.Qty || '',
            item.Qty &&
            totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })
              ? `${item.Qty}\n${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : '',
            item.Location || '',
            item.EqStatus || '',
          ];
        });

        autoTable(doc, {
          head: headers,
          body: body,
          startY: 120,
          theme: 'grid',
          styles: {
            font: 'times',
            fontSize: 8,
            cellPadding: 4,
            valign: 'middle',
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            halign: 'center',
            fontStyle: 'bold',
            lineWidth: 0.5,
          },
          didDrawPage: (data) => {
            // Footer
            doc.setFontSize(9);
            doc.text(
              `Page ${doc.getNumberOfPages()}`,
              pageWidth - margin,
              pageHeight - 20,
              { align: 'right' },
            );

            doc.text(
              'Note: For PPE items withoutProperty No, provided in the "remarks" column other information such as Serial No./Model No./brief description that can be useful during the reconciliation process.',
              pageWidth / 2,
              pageHeight - 20,
              { align: 'center' },
            );
          },
        });

        // ================================
        // GRAND TOTAL
        // ================================
        const finalY = (doc as any).lastAutoTable.finalY + 20;

        doc.setFont('times', 'bold');
        doc.setFontSize(11);
        doc.text(
          `GRAND TOTAL: ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          pageWidth - margin,
          finalY,
          { align: 'right' },
        );

        // ================================
        // SIGNATURE SECTION
        // ================================
        const signatureStartY = finalY + 40;
        doc.setFont('times', 'normal');
        doc.setFontSize(10);

        // Prepared by
        doc.text('Prepared by:', margin, signatureStartY);
        doc.line(
          margin,
          signatureStartY + 25,
          margin + 250,
          signatureStartY + 25,
        );
        doc.setFontSize(8);
        doc.text(
          'Signature over Printed Name of Concerned Inventory Committee Member',
          margin,
          signatureStartY + 38,
        );
        doc.setFontSize(10);
        doc.text('Date:', margin, signatureStartY + 60);
        doc.line(
          margin + 40,
          signatureStartY + 60,
          margin + 200,
          signatureStartY + 60,
        );

        // Reviewed by
        doc.text('Reviewed by:', pageWidth - margin - 300, signatureStartY);
        doc.line(
          pageWidth - margin - 300,
          signatureStartY + 25,
          pageWidth - margin,
          signatureStartY + 25,
        );

        // ================================
        // SAVE PDF
        // ================================
        const fileName = this.filterUserName
          ? `Asset_List_${this.filterUserName}.pdf`
          : 'Asset_List_Report.pdf';
        doc.save(fileName);
      })
      .catch(() => {
        this.toastr.error('Error loading logos.');
      });
  }
  // exportToPDF(): void {

  //   const doc = new jsPDF({
  //     orientation: 'landscape',
  //     unit: 'pt',
  //     format: 'legal' // cleaner than custom [936,612]
  //   });

  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const pageHeight = doc.internal.pageSize.getHeight();
  //   const margin = 40;
  //   const imgSize = 60;

  //   const leftLogo = 'assets/img/UPM_LOGO.png';
  //   const rightLogo = 'assets/img/SPMO.png';

  //   // ================================
  //   // LOAD LOGOS (SAFE VERSION)
  //   // ================================
  //   const loadImage = (url: string): Promise<string> => {
  //     return new Promise((resolve, reject) => {
  //       const img = new Image();
  //       img.crossOrigin = 'Anonymous';
  //       img.src = url;

  //       img.onload = () => {
  //         const canvas = document.createElement('canvas');
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         canvas.getContext('2d')?.drawImage(img, 0, 0);
  //         resolve(canvas.toDataURL('image/png'));
  //       };

  //       img.onerror = reject;
  //     });
  //   };

  //   // ================================
  //   // FILTER DATA (UserName OR Fund)
  //   // ================================
  //   const filteredData = this.dataSource.data.filter(item => {
  //     if (!this.filterUserName) return true;
  //     const search = this.filterUserName.toLowerCase();
  //     return (
  //       item.UserName?.toLowerCase().includes(search) ||
  //       item.Fund_Cluster?.toLowerCase().includes(search)
  //     );
  //   });

  //   if (filteredData.length === 0) {
  //     this.toastr.warning('No assets found.', 'Filter Result');
  //     return;
  //   }

  //   // ================================
  //   // LOAD IMAGES THEN BUILD PDF
  //   // ================================
  //   Promise.all([loadImage(leftLogo), loadImage(rightLogo)])
  //   .then(([leftImg, rightImg]) => {

  //     // ================================
  //     // HEADER
  //     // ================================
  //     doc.addImage(leftImg, 'PNG', margin, 20, imgSize, imgSize);
  //     doc.addImage(rightImg, 'PNG', pageWidth - margin - imgSize, 20, imgSize, imgSize);

  //     doc.setFont('times', 'bold');
  //     doc.setFontSize(16);
  //     doc.text(
  //       'UNIVERSITY OF THE PHILIPPINES MINDANAO',
  //       pageWidth / 2,
  //       45,
  //       { align: 'center' }
  //     );

  //     doc.setFontSize(13);
  //     doc.text(
  //       'PROPERTY, PLANT AND EQUIPMENT INVENTORY REPORT',
  //       pageWidth / 2,
  //       65,
  //       { align: 'center' }
  //     );

  //     doc.setFont('times', 'normal');
  //     doc.setFontSize(11);

  //     doc.text(
  //       `Fund Cluster: ${this.filterUserName || 'ALL'}`,
  //       margin,
  //       100
  //     );

  //     const today = new Date().toLocaleDateString();
  //     doc.text(
  //       `Generated on: ${today}`,
  //       pageWidth - margin,
  //       100,
  //       { align: 'right' }
  //     );

  //     // ================================
  //     // TABLE HEADERS
  //     // ================================
  //     const headers = [[
  //       'Article/Item',
  //        'Description',
  //         'Old Property No.',
  //        'New Property No.',
  //        'Unit Measure',
  //         'Unit Value',
  //        'QUANTITY\nper\nPROPERTY CARD',
  //       'QUANTITY\nper\nPhysical Count',
  //       'Location/\nWhereabouts',
  //       'Condition\n(Good/Need Repair/Unserviceable\nObsolete/No longer needed\nNot Used since purchase)'

  //     ]];

  //     let grandTotal = 0;

  //     const body = filteredData.map(item => {

  //       const unitCost = Number(item.UCost || 0);
  //       const totalCost = Number(item.TCost || 0);
  //       grandTotal += totalCost;

  //       return [
  //         // item.PPE || '',
  //         item.Name && item.PPE && item.UserName ? `${item.Name}\n${item.PPE}\n${item.UserName}` : '',
  //         //Property Description
  //         item.Desc1 || '',
  //         //Old Property Number
  //         item.PropNo || '',
  //         //New Property Number
  //         item.PN || '',
  //         //Unit Measure
  //           item.UM || '',
  //         //Unit Value
  //          unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  //         //quantity per property card
  //         item.Qty || '',
  //         //quantity per physical count
  //         item.Qty && totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?`${item.Qty}\n${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '',
  //         //location
  //         item.Location || '',
  //         //Condition
  //         item.EqStatus || '',

  //         item.UserName || '',

  //       ];
  //     });

  //     // ================================
  //     // TABLE
  //     // ================================
  //     autoTable(doc, {
  //       head: headers,
  //       body: body,
  //       startY: 120,
  //       theme: 'grid',
  //       styles: {
  //         font: 'times',
  //         fontSize: 8,
  //         cellPadding: 4,
  //         valign: 'middle'
  //       },
  //       headStyles: {
  //         fillColor: [255, 255, 255],
  //         textColor: 0,
  //         halign: 'center',
  //         fontStyle: 'bold',
  //         lineWidth: 0.5
  //       },
  //       columnStyles: {
  //         9: { halign: 'center' },
  //         11: { halign: 'right' },
  //         12: { halign: 'right' }
  //       },
  //       didDrawPage: (data) => {

  //         // Footer
  //         doc.setFontSize(9);
  //         doc.text(
  //           `Page ${doc.getNumberOfPages()}`,
  //           pageWidth - margin,
  //           pageHeight - 20,
  //           { align: 'right' }
  //         );

  //         doc.text(
  //           'Confidential Document - Supply Procurement Management Office',
  //           pageWidth / 2,
  //           pageHeight - 20,
  //           { align: 'center' }
  //         );
  //       }
  //     });

  //     // ================================
  //     // GRAND TOTAL
  //     // ================================
  //     const finalY = (doc as any).lastAutoTable.finalY + 20;

  //     doc.setFont('times', 'bold');
  //     doc.setFontSize(11);
  //     doc.text(
  //       `GRAND TOTAL: ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  //       pageWidth - margin,
  //       finalY,
  //       { align: 'right' }
  //     );
  // // ================================
  // // SIGNATURE SECTION
  // // ================================
  // const signatureStartY = finalY + 40;

  // doc.setFont('times', 'normal');
  // doc.setFontSize(10);

  // // Prepared by (Left side)
  // doc.text('Prepared by:', margin, signatureStartY);

  // // Line for signature
  // doc.line(
  //   margin,
  //   signatureStartY + 25,
  //   margin + 250,
  //   signatureStartY + 25
  // );

  // doc.setFontSize(8);
  // doc.text(
  //   'Signature over Printed Name of Concerned Inventory Committee Member',
  //   margin,
  //   signatureStartY + 38
  // );

  // // // Date (Left bottom)
  // // doc.setFontSize(10);
  // // doc.text('Date:', margin, signatureStartY + 60);
  // doc.text('Date:', margin, signatureStartY + 60);
  // doc.line(
  //   margin + 40,
  //   signatureStartY + 60,
  //   margin + 200,
  //   signatureStartY + 60
  // );

  // // Reviewed by (Right side)
  // doc.setFontSize(10);
  // doc.text(
  //   'Reviewed by:',
  //   pageWidth - margin - 300,
  //   signatureStartY
  // );

  // // Line for reviewed by
  // doc.line(
  //   pageWidth - margin - 300,
  //   signatureStartY + 25,
  //   pageWidth - margin,
  //   signatureStartY + 25
  // );
  //     // ================================
  //     // SAVE FILE
  //     // ================================
  //     const fileName = this.filterUserName
  //       ? `Asset_List_${this.filterUserName}.pdf`
  //       : 'Asset_List_Report.pdf';

  //     doc.save(fileName);

  //   })
  //   .catch(() => {
  //     this.toastr.error('Error loading logos.');
  //   });
  // }
  exportToPDFPAR(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'A4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const leftLogo = 'assets/img/UPM_LOGO.png';

    // =========================
    // IMAGE LOADER
    // =========================
    const loadImage = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => reject('Image load error');
      });
    };

    // =========================
    // FILTER DATA
    // =========================
    const filteredData = this.dataSource.data.filter((item: any) => {
      if (!this.filterUserName) return true;

      const search = this.filterUserName.toLowerCase();

      return (
        item.UserName?.toLowerCase().includes(search) ||
        item.Fund_Cluster?.toLowerCase().includes(search) ||
        item.PPE?.toLowerCase().includes(search)||
        item.Location?.toLowerCase().includes(search) ||
        item.PAR?.toLowerCase().includes(search) ||
        item.PN?.toLowerCase().includes(search)
      );
    });

    if (filteredData.length === 0) {
      this.toastr.warning('No assets found.');
      return;
    }

    // =========================
    // BUILD PDF
    // =========================
    loadImage(leftLogo)
      .then((leftImg) => {
        filteredData.forEach((item: any, index: number) => {
          if (index > 0) doc.addPage();

          // BORDER
          doc.rect(20, 20, pageWidth - 40, pageHeight - 320);
          // ✅ ADD TEXT HERE
          doc.setFontSize(8);
          doc.setFont('times', 'bold');

          doc.text('INSTRUCTIONS', pageWidth / 2, 555, {
            align: 'center',
          });
          doc.setFontSize(12);
          doc.setFont('times', 'bold');
          doc.text(
            Number(item.TCost || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }),
            550,
            555,
            { align: 'right' },
          );
          doc.setFont('times', 'normal');
          doc.setFontSize(8);

          const footerText = `
\tFOR PROPERTY UNIT USE
A. This form shall be accomplished as follows:
\t\t1. Agency – Name of agency
\t\t2. No. – Assigned control number
\t\t3. Quantity – Number of units issued to the concerned employee or user of the property
\t\t4. Unit – Unit of measurement
\t\t5. Description – Brief description/details of the items issued, including serial number
\t\t6. Property Number – Property number assigned by the property unit
\t\t7. Date Acquired – Date when the property was acquired
\t\t8. Unit Value – Value per unit
\t\t9. Total Value – Total value (quantity × unit value)
\t\t10. PO No. – Purchase order number
\t\t11. Rev. No. – Revision number (if applicable)
\t\t12. Fund Cluster – Fund cluster used for acquisition
\t\t13. Supplier – Name of supplier/provider
\t\t14. Remarks – Additional relevant information
B. The PAR shall be prepared in two copies distributed as Follows:
\t\t1. Original-Supply and Property Unit
\t\t2. Duplicate Copy- Recipient or user of the property
C. This form shall be signed and dated by the designated Property Officer under"Recieved from" portion and the recipient or user
  of the property acknowledging rrecipet by signing under "Received by" portion
D. The PAR shall be renewed every three (3) years there is a change in accountability.
`;

          // control width para hindi sumobra
          const maxWidths = pageWidth - 60;

          // auto wrap
          const wrappedText = doc.splitTextToSize(footerText, maxWidths);

          // print
          doc.text(wrappedText, 30, 555);
          // LOGO
          doc.addImage(leftImg, 'PNG', 30, 30, 60, 60);

          // HEADER
          doc.setFont('times', 'normal');
          doc.setFontSize(9);
          doc.text('Appendix 71', 30, 25);

          doc.setFont('times', 'bold');
          doc.setFontSize(14);
          doc.text('PROPERTY ACKNOWLEDGMENT RECEIPT', pageWidth / 2, 50, {
            align: 'center',
          });

          doc.setFontSize(12);
          doc.text('(PAR)', pageWidth / 2, 65, { align: 'center' });

          // PAR BOX
          doc.rect(pageWidth - 180, 70, 140, 40);

          doc.setFontSize(11);
          doc.setFont('times', 'normal');
          doc.text('No:', pageWidth - 170, 90);

          doc.setFont('times', 'bold');
          doc.setFontSize(14);
          doc.text(item.PAR || '----', pageWidth - 80, 95);

          // OFFICE DETAILS
          const dateNow = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          });

          doc.setFont('times', 'normal');
          doc.setFontSize(10);

          doc.text('Office/Entity:', 30, 120);
          doc.setFont('times', 'bold');
          doc.text('UNIVERSITY OF THE PHILIPPINES MINDANAO', 140, 120);

          doc.setFont('times', 'normal');
          doc.line(20, 128, pageWidth - 20, 128);
          doc.text('Office/Agency Address:', 30, 140);
          doc.text('Mintal, Tugbok District, Davao City', 180, 140);

          doc.text('Date:', pageWidth - 200, 140);
          doc.text(dateNow, pageWidth - 120, 140);

          // TABLE HEADER
          const startY = 150;

          doc.line(20, startY, pageWidth - 20, startY);

          doc.setFont('times', 'bold');
          doc.setFontSize(8);

          doc.text('QTY', 30, startY + 12);
          doc.text('UNIT', 60, startY + 12);
          doc.text('NAME AND DESCRIPTION', 110, startY + 12);
          doc.text('PROPERTY\nNumber', 250, startY + 12);
          doc.text('DATE\nACQUIRED', 330, startY + 12);
          doc.text('UNIT\nVALUE', 430, startY + 12);
          doc.text('TOTAL\nVALUE', 500, startY + 12);

          doc.line(20, startY + 25, pageWidth - 20, startY + 25);

          // DATA ROW
          const rowY = startY + 40;

          doc.setFont('times', 'normal');
          doc.setFontSize(9);

          doc.text('1', 30, rowY);
          doc.text(item.UM || '', 60, rowY);

          const desc = `${item.Name || ''}\n${item.Desc1 || ''}`;
          const maxWidth = 140; // adjust width to fit your column
          const descLines = doc.splitTextToSize(desc, maxWidth);
          doc.text(descLines, 110, rowY);

          doc.text(item.PN || '', 250, rowY);
          doc.text(item.AnDate || '', 330, rowY);

          doc.text(
            Number(item.UCost || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }),
            430,
            rowY,
          );

          doc.text(
            Number(item.TCost || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }),
            500,
            rowY,
          );

          // =========================
          // PO / PROVIDER / REV (FIXED LAYOUT)
          // =========================
          const poY = rowY + 150;

          doc.setFont('times', 'bold');
          doc.setFontSize(10);

          const provider = (item.Provider_Name || '')
            .replace(/\s+/g, ' ')
            .trim();

          const xLabel = 30;
          const xValue = 120;

          doc.text('PO No:', xLabel, poY);
          doc.text(item.Provider_Name || '', xValue, poY);
          doc.text('Rev No:', xLabel, poY + 15);
          doc.text(item.Rev_No || '', xValue, poY + 15);

          doc.text('Fund:', xLabel, poY + 30);
          doc.text(item.Fund_Cluster || '', xValue, poY + 30);

          doc.text('Supplier:', xLabel, poY + 45);
          doc.text(provider, xValue, poY + 45);

          // REMARKS
          const remarksY = poY + 60;

          doc.line(20, remarksY, pageWidth - 20, remarksY);

          doc.setFont('times', 'bold');
          doc.text('REMARKS:', 30, remarksY + 15);

          doc.setFont('times', 'normal');
          // doc.text(
          //   `This PAR number ${item.PAR || ''} issued to ${item.UserName || ''} `,
          //   120,
          //   remarksY + 15
          // );
          doc.text(
            `This PAR number ${item.PAR || ''} was issued to ${item.UserName || ''} on ${dateNow}.`,
            120,
            remarksY + 15,
          );
          doc.line(20, 420, pageWidth - 20, 420);

          // SIGNATURES
          const sigY = remarksY + 70;

          // Get current date in readable format
          const now = new Date();
          const today = now.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          // Line widths (adjust as needed)
          const signatureLineWidth = 0.5;
          const positionLineWidth = 0.3;
          const dateLineWidth = 0.4;

          // =====================
          // RECEIVED BY
          // =====================
          doc.setFontSize(10);
          doc.text('Received by:', 30, sigY);

          // Signature line
          doc.setLineWidth(signatureLineWidth);
          doc.line(30, sigY + 25, 280, sigY + 25);

          // Name label centered under the signature line
          doc.setFontSize(8);
          const nameLabel = 'Signature over Printed Name of Accountable Person';
          const nameWidth = doc.getTextWidth(nameLabel);
          doc.text(nameLabel, 30 + (280 - 30) / 2 - nameWidth / 2, sigY + 32);

          // Position/Office line above label
          doc.setLineWidth(positionLineWidth);
          doc.line(30, sigY + 45, 280, sigY + 45);

          // Position/Office label centered under the line
          const posLabel = 'Position/Office:';
          const posWidth = doc.getTextWidth(posLabel);
          doc.text(posLabel, 30 + (280 - 30) / 2 - posWidth / 2, sigY + 50);

          // Date line
          doc.setLineWidth(dateLineWidth);
          const dateLineStart = 70;
          const dateLineEnd = 200;
          const dateLineWidthTotal = dateLineEnd - dateLineStart;

          // Current date centered above the line
          const dateTextWidth = doc.getTextWidth(today);
          doc.text(
            today,
            dateLineStart + (dateLineWidthTotal - dateTextWidth) / 2,
            sigY + 60,
          );

          // Date label and line
          doc.setFontSize(10);
          doc.text('Date:', 30, sigY + 65);
          doc.line(dateLineStart, sigY + 65, dateLineEnd, sigY + 65);

          // =====================
          // ISSUED BY
          // =====================
          const issuedX = pageWidth - 300;

          doc.setFontSize(10);
          doc.text('Issued by:', issuedX, sigY);

          // Signature line
          doc.setLineWidth(signatureLineWidth);
          doc.line(issuedX, sigY + 25, pageWidth - 30, sigY + 25);

          // Name label centered under the signature line
          doc.setFontSize(8);
          const issuedNameLabel =
            'Signature over Printed Name of Supply Officer and/or Property Custodian';
          const issuedNameWidth = doc.getTextWidth(issuedNameLabel);
          doc.text(
            issuedNameLabel,
            issuedX + (pageWidth - 30 - issuedX) / 2 - issuedNameWidth / 2,
            sigY + 32,
          );

          // Position/Office line above label
          doc.setLineWidth(positionLineWidth);
          doc.line(issuedX, sigY + 45, pageWidth - 30, sigY + 45);

          // Position/Office label centered under the line
          const issuedPosLabel = 'Position/Office:';
          const issuedPosWidth = doc.getTextWidth(issuedPosLabel);
          doc.text(
            issuedPosLabel,
            issuedX + (pageWidth - 30 - issuedX) / 2 - issuedPosWidth / 2,
            sigY + 50,
          );

          // Date line
          doc.setLineWidth(dateLineWidth);
          const issuedDateLineStart = issuedX + 40;
          const issuedDateLineEnd = issuedX + 160;
          const issuedDateLineWidthTotal =
            issuedDateLineEnd - issuedDateLineStart;

          // Current date centered above the line
          doc.setFontSize(10);
          doc.text(
            today,
            issuedDateLineStart +
              (issuedDateLineWidthTotal - dateTextWidth) / 2,
            sigY + 60,
          );

          // Date label and line
          doc.text('Date:', issuedX, sigY + 65);
          doc.line(
            issuedDateLineStart,
            sigY + 65,
            issuedDateLineEnd,
            sigY + 65,
          );

          // Reset line width to default
          doc.setLineWidth(0.2);
        });

        doc.save('PAR_Form.pdf');
      })
      .catch(() => {
        this.toastr.error('Error loading logo.');
      });
  }
}
