import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../model/patient';
import { SpecialtyService } from '../../services/specialty.service';
import { Specialty } from '../../model/specialty';
import { Observable, map } from 'rxjs';
import { AsyncPipe, NgClass } from '@angular/common';
import { ConsultDetail } from '../../model/consultDetail';
import { Exam } from '../../model/exam';
import { ExamService } from '../../services/exam.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Medic } from '../../model/medic';
import { MedicService } from '../../services/medic.service';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import { MatStepper } from '@angular/material/stepper';
import { Consult } from '../../model/consult';
import { format, formatISO } from 'date-fns';
import { ConsultListExamDTOI } from '../../model/consultListExamDTOI';
import { ConsultService } from '../../services/consult.service';

@Component({
  selector: 'app-consult-wizard',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, AsyncPipe, FlexLayoutModule, NgClass],
  templateUrl: './consult-wizard.component.html',
  styleUrl: './consult-wizard.component.css'
})
export class ConsultWizardComponent implements OnInit{

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  patients: Patient[];
  exams: Exam[];
  medics: Medic[];
  specialties$: Observable<Specialty[]>;
  examsFiltered$: Observable<Exam[]>

  minDate: Date = new Date();
  details: ConsultDetail[] = [];
  examsSelected: Exam[] = [];

  examControl: FormControl = new FormControl();
  consultArray: number[] = [];

  medicSelected: Medic;
  consultSelected: number;

  @ViewChild('stepper') stepper: MatStepper;
  
  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private specialtyService: SpecialtyService,
    private examService: ExamService,
    private medicService: MedicService,
    private consultService: ConsultService,
    private _snackBar: MatSnackBar
  ){}

  ngOnInit(): void {
      this.firstFormGroup = this.formBuilder.group({
        patient: [new FormControl(), Validators.required],
        specialty: [new FormControl(), Validators.required],
        consultDate: [new FormControl(new Date()), Validators.required],
        exam: [this.examControl, Validators.required],
        diagnosis: new FormControl('', Validators.required),
        treatment: new FormControl('', Validators.required),
      });

      this.secondFormGroup = this.formBuilder.group({});

      this.loadInitialData();

      this.examsFiltered$ = this.examControl.valueChanges.pipe(map(val => this.filterExams(val)));

      for(let i = 1; i <= 100; i++){
        this.consultArray.push(i);
      }
  }

  loadInitialData(){
    this.patientService.findAll().subscribe(data => this.patients = data);
    this.specialties$ = this.specialtyService.findAll();
    this.examService.findAll().subscribe(data => this.exams = data);
    this.medicService.findAll().subscribe(data => this.medics = data);
  }

  filterExams(val: any){
    if(val?.idExam > 0){
      return this.exams.filter(el => 
        el.nameExam.toLowerCase().includes(val.nameExam.toLowerCase()) || el.descriptionExam.toLowerCase().includes(val.descriptionExam.toLowerCase())
      )
    }else{
      return this.exams.filter(el => 
        el.nameExam.toLowerCase().includes(val?.toLowerCase()) || el.descriptionExam.toLowerCase().includes(val?.toLowerCase())
      )
    }    
  }

  showExam(val: any){
    return val ? `${val.nameExam}` : val;
  }

  getDate(e: any){
    console.log(e.value);
  }

  addDetail(){
    const det = new ConsultDetail();
    det.diagnosis = this.firstFormGroup.value['diagnosis'];
    det.treatment = this.firstFormGroup.value['treatment'];

    this.details.push(det);
  }

  removeDetail(index: number){
    this.details.splice(index, 1);
  }

  addExam(){
    const tmpExam = this.firstFormGroup.value['exam'].value;

    if(tmpExam != null){
      this.examsSelected.push(tmpExam);
    }else{
      this._snackBar.open('Please select an exam', 'INFO', {duration: 2000});
    }
  }

  selectMedic(m: Medic){
    this.medicSelected = m;
  }

  selectConsult(n: number){
    this.consultSelected = n;
  }

  nextManuelStep(){
    if(this.consultSelected > 0){
      //sgte paso
      this.stepper.next();
    }else{
      this._snackBar.open('Please select a consult number', 'INFO', {duration: 2000});
    }
  }

  get f(){
    return this.firstFormGroup.controls;
  }

  save(){
    const consult = new Consult();
    consult.patient = this.firstFormGroup.value['patient'];
    consult.specialty = this.firstFormGroup.value['specialty'];
    consult.medic = this.medicSelected;
    consult.details = this.details;
    consult.numConsult = `C${this.consultSelected}`;        
    consult.consultDate = format(this.firstFormGroup.value['consultDate'], "yyyy-MM-dd'T'HH:mm:ss");    
    const dto: ConsultListExamDTOI = {
      consult: consult,
      lstExam: this.examsSelected
    };

    this.consultService.saveTransactional(dto).subscribe( ()=> {
      this._snackBar.open("CREATED!", 'INFO', { duration: 2000});

      setTimeout( ()=> {
        this.cleanControls();
      }, 2000);
    });   
  }

  cleanControls(){
   this.firstFormGroup.reset();
   this.secondFormGroup.reset();
   this.stepper.reset();
   this.details = [];
   this.examsSelected = [];
   this.consultSelected = 0;
   this.medicSelected = null;
  }
}
