import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemNormaComponent } from './item-norma.component';

describe('ItemNormaComponent', () => {
  let component: ItemNormaComponent;
  let fixture: ComponentFixture<ItemNormaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemNormaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemNormaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
