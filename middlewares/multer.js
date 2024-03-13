import multer from "multer";

const storage = multer.memoryStorage();//we can send file using this memory storage is temporary storage

export const singleUpload = multer({
  storage,
}).single("file");