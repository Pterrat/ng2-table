import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ng-table',
  template: `
    <table class="table dataTable" ngClass="{{config.className || ''}}"
           role="grid" style="width: 100%;">
      <thead>
        <tr role="row">
          <th class="select" (click)="selectAll()" *ngIf="_config.selecting">
            <i class="fa fa-check"></i>
          </th>
          <th *ngFor="let column of columns" [ngTableSorting]="config" [column]="column" 
              (sortChanged)="onChangeTable($event)" ngClass="{{column.className || ''}}">
            {{column.title}}
            <i *ngIf="config && column.sort" class="pull-right fa"
              [ngClass]="{'fa-chevron-down': column.sort === 'desc', 'fa-chevron-up': column.sort === 'asc'}"></i>
          </th>
        </tr>
      </thead>
      <tbody>
      <tr *ngIf="showFilterRow">
        <th *ngIf="_config.selecting">
        </th>
        <td *ngFor="let column of columns">
          <input *ngIf="column.filtering" placeholder="{{column.filtering.placeholder}}"
                 [ngTableFiltering]="column.filtering"
                 class="form-control"
                 style="width: auto;"
                 (tableChanged)="onChangeTable(config)"/>
        </td>
      </tr>
        <tr [ngClass]="{'active': _rowSelected.indexOf(row) != -1 }" *ngFor="let row of rows" (click)="selectedRowEvent(row)">
          <td *ngIf="_config.selecting">
            <i *ngIf="_rowSelected.indexOf(row) != -1" class="fa fa-check"></i>
          </td>
          <td (click)="cellClick(row, column.name)" *ngFor="let column of columns" [innerHtml]="sanitize(getData(row, column.name))"></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: ['th.select { padding: 10px; }']
})
export class NgTableComponent {
  // Table values
  @Input() public rows:Array<any> = [];

  @Input()
  public set config(conf:any) {
    if (!conf.className) {
      conf.className = 'table-striped table-bordered';
    }
    if (conf.className instanceof Array) {
      conf.className = conf.className.join(' ');
    }
    this._config = conf;
  }

  // Outputs (Events)
  @Output() public tableChanged:EventEmitter<any> = new EventEmitter();
  @Output() public cellClicked:EventEmitter<any> = new EventEmitter();
  @Output() public rowSelected:EventEmitter<any> = new EventEmitter();

  public showFilterRow:Boolean = false;

  @Input()
  public set columns(values:Array<any>) {
    values.forEach((value:any) => {
      if (value.filtering) {
        this.showFilterRow = true;
      }
      if (value.className && value.className instanceof Array) {
        value.className = value.className.join(' ');
      }
      let column = this._columns.find((col:any) => col.name === value.name);
      if (column) {
        Object.assign(column, value);
      }
      if (!column) {
        this._columns.push(value);
      }
    });
  }

  private _columns:Array<any> = [];
  private _config:any = {};
  private _rowSelected:Array<any> = [];

  public constructor(private sanitizer:DomSanitizer) {
  }

  public sanitize(html:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public get columns():Array<any> {
    return this._columns;
  }

  public get config():any {
    return this._config;
  }

  public get configColumns():any {
    let sortColumns:Array<any> = [];

    this.columns.forEach((column:any) => {
      if (column.sort) {
        sortColumns.push(column);
      }
    });

    return {columns: sortColumns};
  }

  public onChangeTable(column:any):void {
    this._columns.forEach((col:any) => {
      if (col.name !== column.name && col.sort !== false) {
        col.sort = '';
      }
    });
    this.tableChanged.emit({sorting: this.configColumns});
  }

  public getData(row:any, propertyName:string):string {
    return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
  }

  public cellClick(row:any, column:any):void {
    this.cellClicked.emit({row, column});
  }


  public selectedRow(row:any):void{
    let indexRow = this._rowSelected.indexOf(row);
    if(indexRow == -1){
      this._rowSelected.push(row);
    }
    else{
      this._rowSelected.splice(indexRow,1);
    }
  }


  public selectAll():void {
    if(this._rowSelected.length == this.rows.length){
              this._rowSelected = [];
    }
    else{
        this._rowSelected = [];
        this.rows.forEach((row: any) => {
            this._rowSelected.push(row);
        });
    }
    let rowSelected = this._rowSelected;
    this.rowSelected.emit({rowSelected});
  }

  public selectedRowEvent(row:any):void {
    this.selectedRow(row);
    let rowSelected = this._rowSelected;
    this.rowSelected.emit({rowSelected});
  }
  
}
