import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCadastroComponent } from './dialog-cadastro.component';

describe('DialogCadastroComponent', () => {
  let component: DialogCadastroComponent;
  let fixture: ComponentFixture<DialogCadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCadastroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
