import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Signal } from '../../../model/signal';
import { Patient } from '../../../model/patient';
import { MatSort } from '@angular/material/sort';
import { SignalService } from '../../../services/signal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';
import { MaterialModule } from '../../../material/material.module';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-signal-search',
  standalone: true,
  imports: [MaterialModule, RouterLink, RouterOutlet],
  templateUrl: './signal-search.component.html',
  styleUrl: './signal-search.component.css'
})
export class SignalSearchComponent {
  dataSource: MatTableDataSource<Signal>;
  patient: Patient = new Patient();
  columnDefinitions = [
    { def: 'idSignal', label: 'idSingal', hide: false },
    { def: 'patientName', label: 'patientName', hide: false },
    { def: 'date', label: 'date', hide: false },
    { def: 'temperature', label: 'temperature', hide: false },
    { def: 'pulse', label: 'pulse', hide: false },
    { def: 'breathingRhythm', label: 'breathingRhythm', hide: false },
    { def: 'actions', label: 'actions', hide: false }
  ]

  @ViewChild(MatSort) sort: MatSort;
  id: number;
  constructor(
    private signalService: SignalService,
    private patientService: PatientService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(data => {
      console.log(data['idPatient']);
      this.id = data['idPatient'];});
      this.patientService.getSignals(this.id).subscribe((data) => {
      this.createTable(data);
    });

    this.signalService.getSignalChange().subscribe((data) => {
      this.createTable(data);
    });

    this.signalService.getMessageChange().subscribe(data => {
      this._snackBar.open(data, 'INFO', { duration: 2000, verticalPosition: 'top', horizontalPosition: 'right' });
    })
  }

  delete(idSignal: number) {

    this.signalService.delete(idSignal)
      .pipe(switchMap(() => this.signalService.findAll()))
      .subscribe(data => {
        this.signalService.setSignalChange(data);
        this.signalService.setMessageChange('DELETED!');
      })
  }

  createTable(data: Signal[]) {
    this.dataSource = new MatTableDataSource(data);
    //this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => !cd.hide).map(cd => cd.def);
  }

  applyFilter(e: any) {
    this.dataSource.filter = e.target.value.trim();
    //this.dataSource.filterPredicate = () => { };
  }

 }