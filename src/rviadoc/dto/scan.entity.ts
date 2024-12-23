import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { Application } from './application.entity';

@Entity('tbl_escaneos')
export class Scan {
    @PrimaryGeneratedColumn('identity')
    idu_escaneo: number;

    @Column({type: 'varchar', length:255})
    nom_escaneo: string;

    @Column({type: 'varchar', length:20})
    nom_directorio: string;

    @Column({
        type: 'int',
        name: 'idu_aplicacion',
    })
    idu_aplicacion: number;


}
