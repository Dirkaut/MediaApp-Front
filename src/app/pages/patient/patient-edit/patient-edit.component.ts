import { Component, OnInit, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../model/patient';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-edit.component.html',
  styleUrl: './patient-edit.component.css'
})
export class PatientEditComponent implements OnInit{

  form: FormGroup;
  id: number;
  isEdit: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ){}

  //private route = inject(ActivatedRoute);

  ngOnInit(): void {
      this.form = new FormGroup({
        idPatient: new FormControl(0),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        dni: new FormControl(''),
        address: new FormControl(''),
        phone: new FormControl(''),
        email: new FormControl(''),
      });

      this.route.params.subscribe(data => {
        this.id = data['id'];
        this.isEdit = data['id'] != null;
        this.initForm();
      });
  }

  initForm(){
    if(this.isEdit){
      this.patientService.findById(this.id).subscribe(data => {
        this.form = new FormGroup({
          idPatient: new FormControl(data.idPatient),
          firstName: new FormControl(data.firstName),
          lastName: new FormControl(data.lastName),
          dni: new FormControl(data.dni),
          address: new FormControl(data.address),
          phone: new FormControl(data.phone),
          email: new FormControl(data.email),
        });
      });
    }
  }

  operate(){
    const patient: Patient = new Patient();
    patient.idPatient = this.form.value['idPatient'];
    //const x = this.form.controls['idPatient'].value;
    //const y = this.form.get('idPatient').value;
    patient.firstName = this.form.value['firstName'];
    patient.lastName = this.form.value['lastName'];
    patient.dni = this.form.value['dni'];
    patient.address = this.form.value['address'];
    patient.phone = this.form.value['phone'];
    patient.email = this.form.value['email'];
    
    
    if(this.isEdit){
      //UPDATE
      //PRACTICA COMUN - NO IDEAL
      this.patientService.update(this.id, patient).subscribe( ()=> {
        this.patientService.findAll().subscribe(data => {
          this.patientService.setPatientChange(data);
          this.patientService.setMessageChange('UPDATED!');
        });
      });
    }else{
      //INSERT
      //PRACTICA IDEAL
      this.patientService.save(patient)
      .pipe(switchMap( () => this.patientService.findAll() ))
      .subscribe(data => {
        this.patientService.setPatientChange(data);
        this.patientService.setMessageChange('CREATED!');
      });
    }

    this.router.navigate(['/pages/patient']);
  }
}
