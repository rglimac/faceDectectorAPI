import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { ImagenesService } from 'src/app/services/imagenes.service';
import { ProcessFaceService } from 'src/app/services/process-face.service';

@Component({
  selector: 'app-identificar',
  templateUrl: './identificar.component.html',
  styleUrls: ['./identificar.component.css']
})
export class IdentificarComponent implements OnInit {
  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef;
  @ViewChild('myCanvas', { static: true }) myCanvas!: ElementRef;

  imagenes: any[] = [];
  public context!: CanvasRenderingContext2D;
  labeledDescriptors: any[] = [];
  detectedName: string = '';

  constructor(private imagenesSvc: ImagenesService, private processSvc: ProcessFaceService) { }

  ngOnInit(): void {
    this.startCamera();
  }


  //Inicia la camara
  startCamera = async () => {
    this.context = this.myCanvas.nativeElement.getContext('2d');
    const video = await navigator.mediaDevices.getUserMedia({ video: true });
    const stream = this.videoContainer.nativeElement;
    stream.srcObject = video;

    const reDraw = async () => {
      this.context.drawImage(stream, 0, 0, 640, 480);
      requestAnimationFrame(reDraw);
    }

    requestAnimationFrame(reDraw);
  }

//Aqui me llama al metodo de abajo
  deteccion() {
    this.loadModelsAndDetect();
  }

//Aqui cargo los modelos del face-api y me realiza la deteccion e identificacion con el video en tiempo real
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
        this.context.font = "20px Arial";
        this.context.fillStyle = "red";
        this.context.fillText(this.detectedName, detection.detection.box.x, detection.detection.box.y - 10);
      }
    }

    setInterval(processFace, 2000);
  }


//Aqui me pasa el nombre de la imagen que ha identificado dentro del video de la camara en tiempo real.
  imagesLista() {
    this.imagenesSvc.getImagenes().subscribe((res: any) => {
      this.imagenes = res;
      this.labeledDescriptors = this.imagenes.map((imagen: any) => {
        const imageElement = document.createElement('img');
        imageElement.src = imagen.imgUrl;
        imageElement.crossOrigin = 'anonymous';
        return this.processSvc.processFace(imageElement, imagen.nombreImagen);  // Pasar el nombre de la imagen en lugar del ID
      });
    });
  }
}
