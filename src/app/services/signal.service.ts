import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { Signal } from '../model/signal';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalService extends GenericService<Signal> {


  private signalChange: Subject<Signal[]> = new Subject<Signal[]>();
  private messageChange: Subject<string> = new Subject<string>();

  constructor(protected override http: HttpClient) {
    super(http, `${environment.HOST}/signals`);
  }

  setSignalChange(data: Signal[]){
    this.signalChange.next(data);
  }

  getSignalChange(){
    return this.signalChange.asObservable();
  }

  setMessageChange(data: string){
    this.messageChange.next(data);
  }

  getMessageChange(){
    return this.messageChange.asObservable();
  }
}
