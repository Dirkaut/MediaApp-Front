import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { SignalService } from '../../../services/signal.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Signal } from '../../../model/signal';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-signal-edit',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signal-edit.component.html',
  styleUrl: './signal-edit.component.css'
})
export class SignalEditComponent implements OnInit {

  form: FormGroup;
  id: number;
  isEdit: boolean;
  patientName: string;

  constructor(

    private signalService: SignalService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      idSignal: new FormControl(0),
      patient: new FormControl(''),
      date: new FormControl(''),
      temperature: new FormControl(''),
      pulse: new FormControl(''),
      breathingRhythm: new FormControl('')
    });

    this.patientName = sessionStorage.getItem('patientName');
    this.route.params.subscribe(data => {
      this.id = data['id'];
      this.isEdit = data['id'] != null;
      this.initForm();
    });
  }

  initForm() {
    if (this.isEdit) {
      this.signalService.findById(this.id).subscribe(data => {
        this.form = new FormGroup({
          idSignal: new FormControl(data.idSignal),
          patient: new FormControl(this.patientName),
          date: new FormControl(data.date),
          temperature: new FormControl(data.temperature),
          pulse: new FormControl(data.pulse),
          breathingRhythm: new FormControl(data.breathingRhythm)
        });
      });
    }
  }

  operate() {
    const signal: Signal = new Signal();
    signal.idSignal = this.form.value['idSignal'];
    //const x = this.form.controls['idPatient'].value;
    //const y = this.form.get('idPatient').value;
    // signal.firstName = this.form.value['firstName'];
    signal.date = this.form.value['date'];
    signal.temperature = this.form.value['temperature'];
    signal.pulse = this.form.value['pulse'];
    signal.breathingRhythm = this.form.value['breathingRhythm'];


    if (this.isEdit) {
      //UPDATE
      //PRACTICA COMUN - NO IDEAL
      this.signalService.update(this.id, signal).subscribe(() => {
        this.signalService.findAll().subscribe(data => {
          this.signalService.setSignalChange(data);
          this.signalService.setMessageChange('UPDATED!');
        });
      });
    } else {
      //INSERT
      //PRACTICA IDEAL
      this.signalService.save(signal)
        .pipe(switchMap(() => this.signalService.findAll()))
        .subscribe(data => {
          this.signalService.setSignalChange(data);
          this.signalService.setMessageChange('CREATED!');
        });
    }

    this.router.navigate(['/pages/signal']);
  }

  

}


