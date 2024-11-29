import { Module } from '@nestjs/common';
import { RviadocService } from './rviadoc.service';
import { RviadocController } from './rviadoc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';
import { Checkmarx } from './dto/checkmarx.entity';
import { Application } from './dto/application.entity';
import { Scan } from './entities/scan.entity';

@Module({
  controllers: [RviadocController],
  providers: [RviadocService],
  imports:[
    TypeOrmModule.forFeature([ Checkmarx, Application, Scan ]),
    CommonModule,
    ClientsModule.register([
      { 
        name: NATS_SERVICE, 
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers
        }
      },
    ]),
  ],

})
export class RviadocModule {}
