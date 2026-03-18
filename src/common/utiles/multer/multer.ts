import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function multerImageConfig(customPath: string) {
  return {
    storage: diskStorage({
      destination: `./src/uploads/${customPath}`,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

        callback(null, filename);
      },
    }),

    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },

    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(
          new BadRequestException('Only Images Are Allowed!'),
          false,
        );
      }
      callback(null, true);
    },
  };
}
