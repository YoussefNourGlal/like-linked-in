import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logger';
import { ResponseInterceptor } from './common/interceptors/response';
import path from 'path';
import helmet from "helmet";
import * as express from "express";
import  rateLimit from 'express-rate-limit';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // تفعيل CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://myfrontend.com'], // المواقع المسموح بيها
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // لو هتستعمل الكوكيز
  });

  app.use(helmet({ contentSecurityPolicy: false })); // لو عندك مشاكل مع GraphQL Playground

 const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    status: 429,                  
    message: "Too many requests, please try again later", // لازم تكون message
  },
});


  app.use(limiter);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
