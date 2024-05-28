import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { JwtUtilService } from '../../services/jwt-util.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  username: string;
  roles: string[] = [];

constructor(private jwtUtil: JwtUtilService){}

  ngOnInit(): void {
    
    this.username = this.jwtUtil.getDecodedToken().sub;
    this.roles = this.jwtUtil.getDecodedToken().role.split(',');

    console.log(this.roles);

  }


  
}
