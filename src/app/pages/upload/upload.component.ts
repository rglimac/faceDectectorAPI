import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { ImagenesModel } from 'src/app/models/imagenes.model';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  private apiUrl = 'https://apiface-qbjz.onrender.com'; // URL de tu API

  imgElement = '';
  imgURL = '../../../assets/img/noimage.png';
  imagen: any;
  imagenesData: ImagenesModel[] = [];
  imgProcess: any;
  btnActive = true;
  file: any;

  @ViewChild('imageFile', { static: true }) imageFile!: ElementRef;

  imagenesForm = this.fb.group({

    nombre: ['', [Validators.required]],
    imgFile: ['']

  })

  constructor(private fb: FormBuilder, private renderer: Renderer2, private imagenesSvc: ImagenesService, private http: HttpClient) { }

  ngOnInit(): void {
    this.mostrarImg()
  }

  selectImage(event: any) {

    if (event.target.files.length > 0) {

      this.file = event.target.files;
      const reader = new FileReader();
      reader.readAsDataURL(this.file[0]);
      reader.onloadend = (event: any) => {

        this.imgURL = event.target.result;
        this.imgElement = event.target.result;
        elementImage.src = `${this.imgElement}`;

        this.imagen = {
          archivo: this.file[0]
        }


      }

      this.btnActive = false;

      var containerImage = document.createElement('div');
      var status = document.createElement('p');
      var icon = document.createElement('i');
      var elementImage = document.createElement('img');


      containerImage.classList.add('containerImage');

      elementImage.crossOrigin = 'anonymous';

      icon.classList.add('fa');
      icon.classList.add('fa-3x');
      icon.classList.add('fa-spinner');
      icon.classList.add('fa-pulse');

      status.classList.add('status');

      status.appendChild(icon)

      containerImage.appendChild(status);

      this.imgProcess = elementImage;


      this.renderer.appendChild(this.imageFile.nativeElement, containerImage);

      this.processFace(this.imgProcess, containerImage);

    }

  }


  processFace = async (image: any, imageContainer: any) => {

    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');


    const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (typeof detection === 'undefined') {


      imageContainer.querySelector('.status').innerText = 'No se pudo procesar la imagen';
      imageContainer.querySelector('.status').style.color = 'red';

      setTimeout(() => {
        imageContainer.querySelector('.status').innerText = '';
        this.imgURL = '../../../assets/img/noimage.png';
        this.imagenesForm.reset();

      }, 2000);

      this.btnActive = false;

    } else {

      imageContainer.querySelector('.status').innerText = 'Procesado';
      imageContainer.querySelector('.status').style.color = 'blue';
      this.onSubmit();

      setTimeout(() => {
        imageContainer.querySelector('.status').innerText = '';


      }, 3000);

    }


  }


  mostrarImg() {

    this.imagenesSvc.getImagenes().subscribe(res => {

      this.imagenesData = [];

      res.forEach((element: ImagenesModel) => {

        this.imagenesData.push({
          ...element
        })

      })

    })

  }


  onSubmit() {

    Swal.fire({
      title: 'Introducir el nombre de la imagen',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      allowOutsideClick: false
    }).then((result) => {

      if (result.isConfirmed && result.value) {

        let cargarImagenDatos: any = {
          nombreImagen: result.value
        }

        this.imagenesSvc.cargarImagenesFirebase(this.imagen, cargarImagenDatos);

        Swal.fire({
          icon: 'success',
          title: 'La imagen se cargo',
          text: 'En breve aparecera la imagen cargada'
        }).then((result) => {

          if (result) {
            this.imgURL = '../../../assets/img/noimage.png';
            this.imagenesForm.reset();
          }

        })
      } else {

        if (!result.isConfirmed && !result.value) {
          location.reload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe llenar el nombre',
            confirmButtonText: 'OK'

          }).then((result) => {
            this.imagenesForm.reset();
          })
        }

      }

    })

    this.http.get<ImagenesModel[]>(`${this.apiUrl}/reload-models`)
      .subscribe(
        (response) => {
          console.log('Respuesta de la API:', response);
          // Aquí puedes procesar los datos como desees
        },
        (error) => {
          console.error('Error al consumir la API:', error);
        }
      );


  }


  eliminar(id: any, nombreImagen: string) {


    Swal.fire({
      icon: 'question',
      title: 'Desea eliminar el registro?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {

        this.imagenesSvc.eliminarImagen(id, nombreImagen);
      }
    })



  }




}
