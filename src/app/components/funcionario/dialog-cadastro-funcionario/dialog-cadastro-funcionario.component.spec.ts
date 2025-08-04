import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCadastroFuncionarioComponent } from './dialog-cadastro-funcionario.component';

describe('DialogCadastroFuncionarioComponent', () => {
  let component: DialogCadastroFuncionarioComponent;
  let fixture: ComponentFixture<DialogCadastroFuncionarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCadastroFuncionarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCadastroFuncionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
