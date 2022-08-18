import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";


export const MedivetStorageProfilePhotoInterceptor = FileInterceptor("file", {
    storage: diskStorage({
        destination: "./storage/profile-photos",
        filename: (_req, file, callback) => {
            const fileExtensionName = extname(file.originalname);
            const fileName = uuidv4();
            callback(null, `${fileName}-profile-photo${fileExtensionName}`);
        }
    })
})