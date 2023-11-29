import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { ImageUploadComponent } from './image-upload.component';
import { Store } from '@ngrx/store';
describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  const storeMock = {
    pipe() {
      return of({});
    },
    dispatch() {
      return of({});
    }
  };


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImageUploadComponent],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
