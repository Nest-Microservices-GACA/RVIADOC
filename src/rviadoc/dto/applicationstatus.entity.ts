import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Application } from './application.entity';
import { forwardRef } from "@nestjs/common";


@Entity('tcl_estatusaplicaciones')
export class Applicationstatus {

    @ApiProperty({ 
        example: 1,
        description: "Estatus ID",
        uniqueItems:true
    })
    @PrimaryGeneratedColumn('identity')
    idu_estatus_aplicacion: number;

    @ApiProperty({ 
        example: "En proceso",
        description: "Nombre del estatus"
    })
    @Column({type: 'varchar', length:20})
    des_estatus_aplicacion  : string;

    @OneToMany(() => Application, application => application.applicationstatus)
    applications: Application[];  
      
}
