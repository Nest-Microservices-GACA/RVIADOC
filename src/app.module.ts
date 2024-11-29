import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { RviadocModule } from './rviadoc/rviadoc.module';
import { CreateRviadocDto } from './rviadoc/dto';
import { Scan } from './rviadoc/dto/scan.entity';
import { Checkmarx } from './rviadoc/entities/checkmarx.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUsername,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize:false,
      entities: 
      [
        Checkmarx,
        CreateRviadocDto,
        Scan,
      ]
    }),
    RviadocModule,    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
