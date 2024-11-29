import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRviadocDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    idu_proyecto: number;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    idu_aplicacion: number;

    @IsString()
    nom_aplicacion: string;

    @IsString()
    pdfFile: string;

    @IsOptional()
    @IsNumber()
    optionUpload: number = 0; //0 = subir con aplicacion 1 = subir solo escaneo
}
