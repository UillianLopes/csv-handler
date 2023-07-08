import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-first-page',
  templateUrl: './first-page.component.html',
  styleUrls: ['./first-page.component.scss']
})
export class FirstPageComponent {
  private readonly router = inject(Router);
  constructor (private readonly activatedRoute: ActivatedRoute) {
  }
  tryNavigate() {
    console.log(this.router.config);
    // this.router.navigateByUrl('(first-page//aux2:second-page)', { relativeTo: this.activatedRoute })
    this.router.navigate([
      {
        outlets: {
          primary: ['first-tab'],
          aux2: ['second-tab']
        }
      }
    ], { relativeTo: this.activatedRoute })
  }
}
