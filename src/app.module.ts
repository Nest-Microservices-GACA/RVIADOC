import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionsModule } from './positions/positions.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { SourcecodeModule } from './sourcecode/sourcecode.module';
import { ScansModule } from './scans/scans.module';
import { ApplicationstatusModule } from './applicationstatus/applicationstatus.module';
import { CommonModule } from './common/common.module';
import { UsersApplicationsModule } from './users-applications/users-applications.module';
import { CheckmarxModule } from './checkmarx/checkmarx.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:false
    }),

    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname,'..','public'), 
    // }),


    PositionsModule,
    ApplicationsModule,
    AuthModule,
    SourcecodeModule,
    ScansModule,
    ApplicationstatusModule,
    CommonModule,
    UsersApplicationsModule,

    // ConfigurationModule,

    CheckmarxModule    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
