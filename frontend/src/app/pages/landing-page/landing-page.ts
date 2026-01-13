import { Component } from '@angular/core';
import { HeroComponent } from '../../components/heros/hero';
import { FeaturesComponent } from '../../components/features/features';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  imports:[HeroComponent, FeaturesComponent]

})
export class LandingPage {

}
