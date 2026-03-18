import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { resolve } from 'path';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { JobModule } from './modules/job/job.module';
import { ChatModule } from './modules/chat/chat.module';
import { AdminModule } from './modules/admin/admin.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/dev.env'),
      isGlobal: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/linked-in', {
      serverSelectionTimeoutMS: 3000,
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected'));
      },
    }),
    AuthModule,
    UserModule,
    CompanyModule,
    JobModule,
    ChatModule,
    AdminModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
       driver: ApolloDriver,
       autoSchemaFile: true, // بيعمل schema لوحده
     }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
