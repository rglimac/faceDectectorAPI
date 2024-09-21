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

  private apiUrl = 'https://faceapi-nodejs-8d772a9a1f5a.herokuapp.com'; // URL de tu API

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

  isLoading = false;

  reloadModels() {
    // Ejecutar la solicitud sin cambiar el estado de carga
    this.http.get(`${this.apiUrl}/reload-models`).subscribe(
      (response) => {
        console.log('Modelos recargados correctamente:', response);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Recarga iniciada',
          text: 'La recarga de modelos e imágenes conocidas ha comenzado.'
        });
      },
      (error) => {
        console.error('Error al recargar los modelos:', error);
        
        // Mostrar mensaje de éxito, sin importar el error
        Swal.fire({
          icon: 'success',
          title: 'Recarga iniciada',
          text: 'La recarga de modelos e imágenes conocidas ha comenzado.'
        });
      }
    );
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
      // Procesado correctamente
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

    // Pedir múltiples entradas
    Swal.fire({
      title: 'Introducir los datos',
      html:
        `<input id="nombreImagen" class="swal2-input" placeholder="Nombre de la imagen">` +
        `<input id="fechaNacimiento" class="swal2-input" placeholder="Fecha de nacimiento (dd/mm/yyyy)">` +
        `<input id="tlfEmergencia" class="swal2-input" placeholder="Teléfono de emergencia">` +
        `<input id="cedula" class="swal2-input" placeholder="Cédula">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const nombreImagen = (document.getElementById('nombreImagen') as HTMLInputElement).value;
        const fechaNacimiento = (document.getElementById('fechaNacimiento') as HTMLInputElement).value;
        const tlfEmergencia = (document.getElementById('tlfEmergencia') as HTMLInputElement).value;
        const cedula = (document.getElementById('cedula') as HTMLInputElement).value;
  
        if (!nombreImagen || !fechaNacimiento || !tlfEmergencia || !cedula) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
  
        return {
          nombreImagen,
          fechaNacimiento,
          tlfEmergencia,
          cedula
        };
      }
    }).then((result) => {
  
      if (result.isConfirmed && result.value) {
  
        // Crear el objeto con los datos recogidos
        let cargarImagenDatos: any = {
          nombreImagen: result.value.nombreImagen,
          fechaNacimiento: result.value.fechaNacimiento,
          tlfEmergencia: result.value.tlfEmergencia,
          cedula: result.value.cedula
        };
  
        // Llamar al servicio para cargar los datos
        this.imagenesSvc.cargarImagenesFirebase(this.imagen, cargarImagenDatos);
  
        Swal.fire({
          icon: 'success',
          title: 'Los datos fueron guardados',
          text: 'En breve aparecerá la imagen y los datos guardados'
        }).then((result) => {
  
          if (result) {
            this.imgURL = '../../../assets/img/noimage.png';
            this.imagenesForm.reset();
          }
  
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Debe llenar todos los campos',
          confirmButtonText: 'OK'
        }).then(() => {
          this.imagenesForm.reset();
        });
      }
  
    });
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
