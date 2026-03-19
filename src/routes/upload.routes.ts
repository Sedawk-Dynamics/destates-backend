import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.use(authMiddleware, adminMiddleware);

const getBaseUrl = (req: Request) => `${req.protocol}://${req.get("host")}`;

// Upload single image
router.post("/image", upload.single("image"), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No image file provided" });
    return;
  }
  const url = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url, filename: req.file.filename } });
});

// Upload multiple images
router.post("/images", upload.array("images", 10), (req: Request, res: Response): void => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: "No image files provided" });
    return;
  }
  const base = getBaseUrl(req);
  const urls = files.map((f) => `${base}/uploads/${f.filename}`);
  res.json({ success: true, data: { urls } });
});

export default router;
