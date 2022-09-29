import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ck-editor-five';
  myForm: FormGroup;

  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'alignment', // <--- ADDED
        'bold',
        'italic',
        'link',
        'bulletedList',
        'blockQuote',
        'undo',
        'redo',
        'imageUpload',
      ],
    },
    link: {
      decorators: {
        toggleDownloadable: {
          mode: 'manual',
          label: 'Downloadable',
          attributes: {
            download: 'file',
          },
        },
        openInNewTab: {
          mode: 'manual',
          label: 'Open in a new tab',
          defaultValue: true, // This option will be selected by default.
          attributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
      },
    },
  };
  htmlValue: any;

  constructor(private formBuilder: FormBuilder) {}
  onReady(editor: ClassicEditor): void {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }
  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      sport_description: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.htmlValue = this.myForm.value.sport_description;
    console.log(this.myForm.value.sport_description);
  }
}
export class MyUploadAdapter {
  loader: any;
  xhr: any;
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        })
    );
  }
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());
    xhr.open(
      'POST',
      'https://staging-portal.ignitorlearning.com/assessment/apis/k12/upload_image?token=Bearer%20eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Im1zMXQxIiwiZW1haWwiOiJzYWdhcm5hbmkwNzEwQGdtYWlsLmNvbSIsInJvbGxfbm8iOm51bGwsInBob25lX251bWJlciI6bnVsbCwidXNlcl9pZCI6ODAzMCwicm9sZXMiOlsidGVhY2hlciJdLCJzdWIiOiI4MDMwIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNjY0NDI0NDc1LCJleHAiOjE2OTU5NjA0NzUsImp0aSI6ImFjZWE5YmI5LThiNmYtNDIxOC1iZjUwLTc1ZmY3ZWJjY2MxOSJ9._EsSAMimtZpii22F2RdB4Quz-v91t_yY6Yh1SN6uYmQ&question_id=63351a2714ba786245efab7e',
      true
    ); // TODO change the URL
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
  }
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;
    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;
      if (!response || response.error) {
        return reject(
          response && response.error ? response.error.message : genericErrorText
        );
      }
      resolve({
        default: response.url,
      });
    });
    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }
  _sendRequest(file) {
    const data = new FormData();
    data.append('upload', file);
    this.xhr.send(data);
  }
}
