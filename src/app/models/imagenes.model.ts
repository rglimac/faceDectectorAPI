export class ImagenesModel{

    id?: string;
    nombreImagen: string;
    imgUrl:string;


    constructor(nombreImagen:string, imgUrl:string){
        this.nombreImagen = nombreImagen;
        this.imgUrl = imgUrl;
    }

}