import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config';
import { RviadocModule } from './rviadoc/rviadoc.module';
import { Applicationstatus } from './rviadoc/dto/applicationstatus.entity';
import { CreateRviadocDto } from './rviadoc/dto';
import { Checkmarx } from './rviadoc/dto/checkmarx.entity';
import { Cost } from './rviadoc/dto/cost.entity';
import { Position } from './rviadoc/dto/position.entity';
import { Scan } from './rviadoc/dto/scan.entity';
import { Sourcecode } from './rviadoc/dto/sourcecode.entity';
import { User } from './rviadoc/dto/user.entity';
import { UsersApplication } from './rviadoc/dto/users-application.entity';

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
        Applicationstatus,
        Checkmarx,
        Cost,
        CreateRviadocDto,
        Position,
        Scan,
        Sourcecode,
        User,
        UsersApplication,
      ]
    }),
    RviadocModule,    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
