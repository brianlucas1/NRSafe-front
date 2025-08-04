import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCadastroSitesComponent } from './dialog-cadastro-sites.component';

describe('DialogCadastroSitesComponent', () => {
  let component: DialogCadastroSitesComponent;
  let fixture: ComponentFixture<DialogCadastroSitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCadastroSitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCadastroSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
