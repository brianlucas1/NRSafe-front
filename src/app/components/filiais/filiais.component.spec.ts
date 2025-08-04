import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiliaisComponent } from './filiais.component';

describe('FiliaisComponent', () => {
  let component: FiliaisComponent;
  let fixture: ComponentFixture<FiliaisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiliaisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiliaisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
