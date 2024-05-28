import { Component, Inject, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment.development';
import { MenuService } from '../../services/menu.service';
import { JwtUtilService } from '../../services/jwt-util.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{

  username: string;
  decodedToken: any;
  constructor(private menuService: MenuService,
    private jwtUtilitario: JwtUtilService
  ){

  }

  ngOnInit(): void {
     
    this.decodedToken = this.jwtUtilitario.getDecodedToken();

      this.username = this.decodedToken.sub;

      console.log(this.decodedToken);
      this.menuService.getMenusByUser(this.username).subscribe(data => this.menuService.setMenuChange(data));
  }

}
