import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {

  @Input() image: string;
  @Input() type: string;
  @Input() childMessage: string;
  @Output()
  upload: EventEmitter<File> = new EventEmitter<File>();

  @Output()
  uploadType: EventEmitter<boolean> = new EventEmitter<boolean>();

  fileData: File = null;
  previewUrl: any = null;
  constructor() {
  }

  ngOnInit() {
  }

  onFileSelect(fileInput: any) {
    this.fileData = fileInput.target.files[0] as File;
    if (this.fileData) {
      this.preview();
    }
  }

  removeImage(e) {
    e.stopPropagation();
    this.uploadType.emit(false);
    this.clearImage();
  }


  removeLogo(e) {
    e.stopPropagation();
    this.uploadType.emit(true);
    this.clearImage();
  }

  private clearImage() {
    this.image = this.previewUrl = null;
  }

  preview() {
    // Show preview
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (event) => {
      this.previewUrl = reader.result;
    };
  }

  onSubmit() {
    if (this.fileData) {
      this.upload.emit(this.fileData);
    }
  }
}
