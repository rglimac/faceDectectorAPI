import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as faceapi from 'face-api.js';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { ProcessFaceService } from 'src/app/services/process-face.service';

@Component({
  selector: 'app-identificar',
  templateUrl: './identificar.component.html',
  styleUrls: ['./identificar.component.css']
})
export class IdentificarComponent implements OnInit, OnDestroy {
  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef;
  @ViewChild('myCanvas', { static: true }) myCanvas!: ElementRef;

  imagenes: any[] = [];
  public context!: CanvasRenderingContext2D;
  labeledDescriptors: any[] = [];
  detectedName: string = '';
  detectedBirthdate: string = ''; // Nueva propiedad
  detectedEmergencyContact: string = ''; // Nueva propiedad
  detectedId: string = ''; // Nueva propiedad
  private videoStream: MediaStream | null = null;

  constructor(private imagenesSvc: ImagenesService, private processSvc: ProcessFaceService) { }

  ngOnInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  startCamera = async () => {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const stream = this.videoContainer.nativeElement;
    stream.srcObject = this.videoStream;

    const reDraw = async () => {
      this.context.drawImage(stream, 0, 0, 640, 480);
      requestAnimationFrame(reDraw);
    }

    requestAnimationFrame(reDraw);
  }

  stopCamera = () => {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.videoContainer.nativeElement.srcObject = null;
  }

  deteccion() {
    this.loadModelsAndDetect();
  }

  loadModelsAndDetect = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');

    this.imagesLista();

    const processFace = async () => {
      const detection = await faceapi.detectSingleFace(this.videoContainer.nativeElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return;

      const bestMatch = this.processSvc.matchDescriptor(detection.descriptor);
      if (bestMatch) {
        this.detectedName = bestMatch.label;
        // Asignar los datos adicionales
        this.detectedBirthdate = bestMatch.fechaNacimiento || 'No disponible';
        this.detectedEmergencyContact = bestMatch.tlfEmergencia || 'No disponible';
        this.detectedId = bestMatch.cedula || 'No disponible';

        this.context.font = "20px Arial";
        this.context.fillStyle = "red";
        this.context.fillText(this.detectedName, detection.detection.box.x, detection.detection.box.y - 10);
      }
    }

    setInterval(processFace, 2000);
  }

  imagesLista() {
    this.imagenesSvc.getImagenes().subscribe((res: any) => {
      this.imagenes = res;
      this.labeledDescriptors = this.imagenes.map((imagen: any) => {
        const imageElement = document.createElement('img');
        imageElement.src = imagen.imgUrl;
        imageElement.crossOrigin = 'anonymous';
        return this.processSvc.processFace(imageElement, imagen.nombreImagen, imagen.fechaNacimiento, imagen.tlfEmergencia, imagen.cedula);  // Pasar solo el nombre de la imagen
      });
    });
  }
}
