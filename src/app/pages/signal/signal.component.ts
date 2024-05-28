import { Component, ViewChild} from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SignalService } from '../../services/signal.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Signal } from '../../model/signal';
import { MatSort } from '@angular/material/sort';
import { switchMap } from 'rxjs';
import { Patient } from '../../model/patient';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-signal',
  standalone: true,
  imports: [MaterialModule, MaterialModule, RouterLink, RouterOutlet],
  templateUrl: './signal.component.html',
  styleUrl: './signal.component.css'
})
export class SignalComponent {

  dataSource: MatTableDataSource<Signal>;
  patient: Patient = new Patient();
  columnDefinitions = [
    { def: 'idSignal', label: 'idSingal', hide: true },
    { def: 'patientName', label: 'patientName', hide: false },
    { def: 'date', label: 'date', hide: false },
    { def: 'temperature', label: 'temperature', hide: false },
    { def: 'pulse', label: 'pulse', hide: false },
    { def: 'breathingRhythm', label: 'breathingRhythm', hide: false },
    { def: 'actions', label: 'actions', hide: false }
  ]

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private signalService: SignalService,
    private patientService: PatientService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signalService.findAll().subscribe((data) => {
      this.chargePatientName(data);
      this.createTable(data);
    });

    this.signalService.getSignalChange().subscribe((data) => {
      this.createTable(data);
    });

    this.signalService.getMessageChange().subscribe(data => {
      this._snackBar.open(data, 'INFO', { duration: 2000, verticalPosition: 'top', horizontalPosition: 'right' });
    })
  }

  private chargePatientName(data: Signal[]) {
    data.forEach(signal => {
      this.patientService.findById(signal.idPatient).subscribe(data => {
        signal.patientName = data.firstName + ' ' + data.lastName;
      });
    });
  }

  delete(idSignal: number) {
    this.signalService.delete(idSignal)
      .pipe(switchMap(() => this.signalService.findAll()))
      .subscribe(data => {
        this.chargePatientName(data);
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

  navigate(idSignal: number, patientName: string) {
    sessionStorage.setItem('patientName', patientName);
      this.router.navigate([`pages/signal/edit/${idSignal}`]);
  }
  

}
