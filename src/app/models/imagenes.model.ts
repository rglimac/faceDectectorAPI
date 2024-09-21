export class ImagenesModel{

    id?: string;
    nombreImagen: string;
    imgUrl:string;
    fechaNacimiento:string;
    tlfEmergencia:string;
    cedula:string;

    constructor(nombreImagen:string, imgUrl:string, fechaNacimiento:string, tlfEmergencia:string,cedula:string ){
        this.nombreImagen = nombreImagen;
        this.imgUrl = imgUrl;
        this.fechaNacimiento = fechaNacimiento;
        this.tlfEmergencia = tlfEmergencia;
        this.cedula = cedula;
    }

}