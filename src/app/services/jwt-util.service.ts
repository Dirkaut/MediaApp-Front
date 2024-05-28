import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class JwtUtilService {

  constructor() { }

  getDecodedToken(): any {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    return helper.decodeToken(token);
  }
}
