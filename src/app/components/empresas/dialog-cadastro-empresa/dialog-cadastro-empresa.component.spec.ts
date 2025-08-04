import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCadastroEmpresaComponent } from './dialog-cadastro-empresa.component';

describe('DialogCadastroEmpresaComponent', () => {
  let component: DialogCadastroEmpresaComponent;
  let fixture: ComponentFixture<DialogCadastroEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCadastroEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCadastroEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
