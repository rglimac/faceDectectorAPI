import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { ImagenesModel } from '../models/imagenes.model';
import { FileItems } from '../models/file.items';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ImagenesService {

private CARPETA_IMAGENES = 'img';

private imagenesCollection : AngularFirestoreCollection<ImagenesModel>

progress:any;

  constructor(private db:AngularFirestore) { 

    this.imagenesCollection = db.collection<ImagenesModel>('imagenes');

  }


  getImagenes():Observable<ImagenesModel[]> {

    return this.imagenesCollection.snapshotChanges().pipe(

      map( actions => actions.map(a => {

        const data = a.payload.doc.data() as ImagenesModel;
        const id = a.payload.doc.id;

        return {id, ...data}

      })


      )

    )

  }


  getImagen(id:any){

    return this.imagenesCollection.doc(id).valueChanges();

  }


  cargarImagenesFirebase(imagen:FileItems, imagesData:ImagenesModel){

    const storage = getStorage();

    let item = imagen;

    let imagenTrim = imagesData.nombreImagen;

    const storageRef = ref(storage, `${this.CARPETA_IMAGENES}/${imagenTrim.replace(/ /g, '')}`);

    const uploadTask = uploadBytesResumable(storageRef,item.archivo);

    uploadTask.on('state_changed', (snapshot) =>{

      this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      console.log(this.progress);


    },(err)=>{
      console.log('Error al subir archivo', err);
    },()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{

        item.url = downloadURL;
        this.guardarImagen({

          nombreImagen:imagesData.nombreImagen,
          imgUrl:item.url

        });

      });
    }
    
    )


  }


  async guardarImagen(imagen:{nombreImagen:string, imgUrl:string}):Promise<any>{


    try {

      return await this.db.collection('imagenes').add(imagen);
      
    } catch (err) {

      console.log(err);
      
    }


  }


  public eliminarImagen(id:string, imagenNombre:string){

    const storage = getStorage();

    const deleteImg = ref(storage, `${this.CARPETA_IMAGENES}/${imagenNombre.replace(/ /g, '')}`);


    deleteObject(deleteImg).then(()=>{

      Swal.fire('EXITO', 'El registro se elimino correctamente', 'success');

    }).catch((err)=>{

      console.error(err);

    });

    return this.imagenesCollection.doc(id).delete();
    
  }


}
