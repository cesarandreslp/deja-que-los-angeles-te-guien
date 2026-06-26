import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Uploader de imágenes del blog
  blogImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      if (!session?.user || !['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
        throw new Error("No autorizado");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo para userId:", metadata.userId);
      console.log("URL del archivo:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Uploader de imágenes de portada
  coverImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);

      if (!session?.user || !['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
        throw new Error("No autorizado");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Imagen de portada subida por:", metadata.userId);
      console.log("URL:", file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
