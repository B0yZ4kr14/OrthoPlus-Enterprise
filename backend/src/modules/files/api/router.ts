import { clinicGuard } from "@/middleware/clinicGuard";
import { Router } from "express";
import multer from "multer";

// Configure multer storage (for local testing/uploads)
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

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
