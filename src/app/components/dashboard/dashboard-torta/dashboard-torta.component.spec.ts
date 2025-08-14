import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTortaComponent } from './dashboard-torta.component';

describe('DashboardTortaComponent', () => {
  let component: DashboardTortaComponent;
  let fixture: ComponentFixture<DashboardTortaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTortaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTortaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
