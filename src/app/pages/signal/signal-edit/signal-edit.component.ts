import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { SignalService } from '../../../services/signal.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Signal } from '../../../model/signal';
import { switchMap } from 'rxjs';
import { Patient } from '../../../model/patient';
import { PatientService } from '../../../services/patient.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-signal-edit',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, RouterLink,RouterOutlet],
  templateUrl: './signal-edit.component.html',
  styleUrl: './signal-edit.component.css'
})
export class SignalEditComponent implements OnInit {

  form: FormGroup;
  id: number;
  isEdit: boolean;
  patientName: string;
  idPatient: number;
  minDate: Date = new Date();
  constructor(

    private signalService: SignalService,
    private patientService: PatientService,
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

    
    this.route.params.subscribe(data => {
      console.log(data['id']);
      this.id = data['id'];
      this.isEdit = data['id'] != null;
      this.idPatient = data['idPatient'];
      
      this.initForm();
    });
  }

  initForm() {
    if (this.isEdit) {
      this.signalService.findById(this.id).subscribe(data => {
        this.idPatient = data.idPatient;
        this.form = new FormGroup({
          idSignal: new FormControl(data.idSignal),
          patient: new FormControl(data.fullName),
          date: new FormControl(data.date),
          temperature: new FormControl(data.temperature),
          pulse: new FormControl(data.pulse),
          breathingRhythm: new FormControl(data.breathingRhythm)
        });
      });
    }
    else if (this.idPatient != null) {
      this.patientService.findById(this.idPatient).subscribe(data => {
        this.form = new FormGroup({
          idSignal: new FormControl(0),
          patient: new FormControl(data.firstName + ' ' + data.lastName),
          date: new FormControl(''),
          temperature: new FormControl(''),
          pulse: new FormControl(''),
          breathingRhythm: new FormControl('')
        });
      });
    }
  }

  operate() {
    const signal: Signal = new Signal();
    const patient: Patient = new Patient();
    patient.idPatient = this.idPatient;
    signal.idSignal = this.form.value['idSignal'];
    signal.date = format(this.form.value['date'], "yyyy-MM-dd'T'HH:mm:ss'");
    signal.temperature = this.form.value['temperature'];
    signal.pulse = this.form.value['pulse'];
    signal.breathingRhythm = this.form.value['breathingRhythm'];
    signal.patient = patient;

    if (this.isEdit) {
      //UPDATE
      //PRACTICA COMUN - NO IDEAL
      console.log(signal);
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
  getDate(e: any){
    console.log(e.value);
  }

}


