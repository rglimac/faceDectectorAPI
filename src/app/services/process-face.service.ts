import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class ProcessFaceService {
  idImage: any;
  imageDescriptors: any = [];
  faceMatcher: any;

  constructor() { }

  async processFace(image: any, nombreImagen: string, fechaNacimiento: string, tlfEmergencia: string, cedula: string) {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models');

    const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (typeof detection === 'undefined') return;

    this.imageDescriptors.push({
      id: nombreImagen,  // Usar el nombre de la imagen en lugar del ID
      fechaNacimiento,
      tlfEmergencia,
      cedula,
      detection
    });

    this.faceMatcher = new faceapi.FaceMatcher(this.imageDescriptors.map(
      (faceDescriptor: any) => (
        new faceapi.LabeledFaceDescriptors(
          faceDescriptor.id, [faceDescriptor.detection.descriptor]
        )
      )
    ));
  }

  matchDescriptor(descriptor: Float32Array) {
    if (this.faceMatcher) {
      const bestMatch = this.faceMatcher.findBestMatch(descriptor);
      const matchDescriptor = this.imageDescriptors.find((d: { id: string }) => d.id === bestMatch.label);
      
      return { 
        label: bestMatch.label,
        fechaNacimiento: matchDescriptor?.fechaNacimiento, 
        tlfEmergencia: matchDescriptor?.tlfEmergencia,
        cedula: matchDescriptor?.cedula 
      };
    }
    return null;
  }
  
}
