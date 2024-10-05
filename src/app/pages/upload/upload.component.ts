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
        `<input type="date" id="fechaNacimiento" class="swal2-input" placeholder="Fecha de nacimiento">` +
        `<input id="tlfEmergencia" class="swal2-input" placeholder="Teléfono de emergencia" maxlength="10">` +
        `<input id="cedula" class="swal2-input" placeholder="Cédula" maxlength="10">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const nombreImagen = (document.getElementById('nombreImagen') as HTMLInputElement).value;
        const fechaNacimiento = (document.getElementById('fechaNacimiento') as HTMLInputElement).value;
        const tlfEmergencia = (document.getElementById('tlfEmergencia') as HTMLInputElement).value;
        const cedula = (document.getElementById('cedula') as HTMLInputElement).value;

        // Validaciones
        if (!nombreImagen || !fechaNacimiento || !tlfEmergencia || !cedula) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        // Validación del teléfono y cédula
        if (tlfEmergencia.length !== 10 || isNaN(Number(tlfEmergencia))) {
          Swal.showValidationMessage('El teléfono debe tener 10 dígitos numéricos.');
          return false;
        }

        if (cedula.length !== 10 || isNaN(Number(cedula))) {
          Swal.showValidationMessage('La cédula debe tener 10 dígitos numéricos.');
          return false;
        }

        return {
          nombreImagen,
          fechaNacimiento,
          tlfEmergencia,
          cedula
        };
      },
      willOpen: () => {
        // Agregar eventos para restringir la entrada
        const tlfInput = document.getElementById('tlfEmergencia') as HTMLInputElement;
        const cedulaInput = document.getElementById('cedula') as HTMLInputElement;

        tlfInput.addEventListener('input', () => {
          tlfInput.value = tlfInput.value.replace(/[^0-9]/g, '');
        });

        cedulaInput.addEventListener('input', () => {
          cedulaInput.value = cedulaInput.value.replace(/[^0-9]/g, '');
        });
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
        }).then(() => {
          this.imgURL = '../../../assets/img/noimage.png';
          this.imagenesForm.reset();
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

  //ELIMINAR

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

  //VALIDACIONES
  private validateEditInputs() {
    const nuevoNombreImagen = (document.getElementById('nombreImagen') as HTMLInputElement).value;
    const nuevaFechaNacimiento = (document.getElementById('fechaNacimiento') as HTMLInputElement).value;
    const nuevoTlfEmergencia = (document.getElementById('tlfEmergencia') as HTMLInputElement).value;
    const nuevaCedula = (document.getElementById('cedula') as HTMLInputElement).value;

    // Validaciones
    if (!nuevoNombreImagen || !nuevaFechaNacimiento || !nuevoTlfEmergencia || !nuevaCedula) {
      Swal.showValidationMessage('Todos los campos son obligatorios');
      return false;
    }

    // Validación del teléfono y cédula
    if (nuevoTlfEmergencia.length !== 10 || isNaN(Number(nuevoTlfEmergencia))) {
      Swal.showValidationMessage('El teléfono debe tener 10 dígitos numéricos.');
      return false;
    }

    if (nuevaCedula.length !== 10 || isNaN(Number(nuevaCedula))) {
      Swal.showValidationMessage('La cédula debe tener 10 dígitos numéricos.');
      return false;
    }

    return {
      nuevoNombreImagen,
      nuevaFechaNacimiento,
      nuevoTlfEmergencia,
      nuevaCedula,
    };
  }

  private addInputValidation() {
    const tlfInput = document.getElementById('tlfEmergencia') as HTMLInputElement;
    const cedulaInput = document.getElementById('cedula') as HTMLInputElement;

    tlfInput.addEventListener('input', () => {
      tlfInput.value = tlfInput.value.replace(/[^0-9]/g, '');
    });

    cedulaInput.addEventListener('input', () => {
      cedulaInput.value = cedulaInput.value.replace(/[^0-9]/g, '');
    });
  }


  // EDITAR
  editar(id: string | undefined, nombreImagen: string, fechaNacimiento: string, tlfEmergencia: string, cedula: string, fotoUrl: string) {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El ID no puede estar vacío.',
      });
      return;
    }

    // Lógica para editar los datos
    Swal.fire({
      title: 'Editar datos',
      html:
        `<img id="originalImage" src="${fotoUrl}" alt="Imagen original" style="max-width: 100%; max-height: 150px; object-fit: contain; margin-bottom: 10px; display: block; margin: 0 auto;">` + // Mostrar la foto original
        `<input id="nombreImagen" class="swal2-input" value="${nombreImagen}" placeholder="Nombre de la imagen">` +
        `<input type="date" id="fechaNacimiento" class="swal2-input" value="${fechaNacimiento}" placeholder="Fecha de nacimiento">` +
        `<input id="tlfEmergencia" class="swal2-input" value="${tlfEmergencia}" placeholder="Teléfono de emergencia" maxlength="10">` +
        `<input id="cedula" class="swal2-input" value="${cedula}" placeholder="Cédula" maxlength="10">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        return this.validateEditInputs();
      },
      willOpen: () => {
        // Agregar eventos para restringir la entrada
        this.addInputValidation();

        // Evento para mostrar la imagen seleccionada AQUI
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        let cargarImagenDatos: any = {
          nombreImagen: result.value.nuevoNombreImagen,
          fechaNacimiento: result.value.nuevaFechaNacimiento,
          tlfEmergencia: result.value.nuevoTlfEmergencia,
          cedula: result.value.nuevaCedula
        };

        // Aquí llamas al servicio para actualizar la imagen
        this.imagenesSvc.actualizarImagen(id, cargarImagenDatos);

        Swal.fire({
          icon: 'success',
          title: 'Datos actualizados',
          text: 'Los datos fueron actualizados correctamente.'
        });
      }
    });
  }
}
