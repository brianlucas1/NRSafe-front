import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCadastroFilialComponent } from './dialog-cadastro-filial.component';

describe('DialogCadastroFilialComponent', () => {
  let component: DialogCadastroFilialComponent;
  let fixture: ComponentFixture<DialogCadastroFilialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCadastroFilialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCadastroFilialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
