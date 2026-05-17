import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import multer from "multer";

// Security: Allowed MIME types whitelist
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/dicom",
  "application/dicom",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Security: Sanitize filename to prevent path traversal
function sanitizeFilename(name: string): string {
  return name
    .replace(/\\/g, "_")
    .replace(/\//g, "_")
    .replace(/\.\./g, "_")
    .replace(/[:*?"<>|]/g, "_");
}

// Configure multer storage (for local testing/uploads)
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, process.env.UPLOAD_DIR ?? "uploads/");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = sanitizeFilename(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Tipo de arquivo não permitido: ${file.mimetype}. Permitidos: PDF, JPG, PNG, DOCX, XLSX, DICOM`
        )
      );
    }
  },
});

import { FilesController } from "./filesController";
import { ReportController } from "./reportController";

const router: Router = Router();
router.use(clinicGuard);
const filesController = new FilesController();
const reportController = new ReportController();

// ----------------------------------------
// File Management routes
// ----------------------------------------
router.get("/", filesController.listFiles.bind(filesController));
router.post(
  "/upload",
  upload.single("file"),
  filesController.uploadFile.bind(filesController),
);
router.get("/:id", filesController.getFile.bind(filesController));
router.get("/:id/download", filesController.downloadFile.bind(filesController));
router.delete("/:id", filesController.deleteFile.bind(filesController));

// ----------------------------------------
// Cloud Backup routes
// ----------------------------------------
router.post(
  "/upload-cloud",
  filesController.uploadBackupToCloud.bind(filesController),
);

// ----------------------------------------
// Report & Document routes
// ----------------------------------------
router.post(
  "/report/export",
  reportController.exportClinicData.bind(reportController),
);
router.post(
  "/report/import",
  reportController.importClinicData.bind(reportController),
);
router.post(
  "/report/pdf",
  reportController.createDocumentPdf.bind(reportController),
);

export default router;
