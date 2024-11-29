import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

@Entity('tbl_checkmarx')
export class Checkmarx {


    @PrimaryGeneratedColumn('identity')
    idu_checkmarx: number;


    @Column({ type: 'varchar', length: 255 })
    nom_checkmarx: string;


    @Column({ type: 'varchar', length: 255 })
    nom_directorio: string;

    @Column({
        type: 'int',
        name: 'idu_aplicacion',
    })
    idu_aplicacion: number;

    // @ApiProperty()
    // @ManyToOne(() => Application, application => application.scans, { nullable: false })
    // @ApiHideProperty()
    // @JoinColumn({ name: 'idu_aplicacion' })
    // application: Application;

}
