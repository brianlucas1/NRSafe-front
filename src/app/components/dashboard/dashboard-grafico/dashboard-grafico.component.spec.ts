import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGraficoComponent } from './dashboard-grafico.component';

describe('DashboardGraficoComponent', () => {
  let component: DashboardGraficoComponent;
  let fixture: ComponentFixture<DashboardGraficoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGraficoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
