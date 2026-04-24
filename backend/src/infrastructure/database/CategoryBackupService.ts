import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface BackupResult {
  filePath: string;
  sizeBytes: number;
  durationMs: number;
  schemas: string[];
}

export interface BackupInfo {
  filePath: string;
  createdAt: Date;
  sizeBytes: number;
}

export interface LastBackupInfo {
  lastBackup: string | null;
  lastBackupSize: number | null;
}

export class CategoryBackupService {
  private readonly backupDir: string;

  constructor(
    protected readonly schemas: string[],
    protected readonly categoryName: string,
    protected readonly databaseUrl: string = process.env.DATABASE_URL ?? ""
  ) {
    this.backupDir = path.join(
      process.env.BACKUP_DIR ?? path.join(process.cwd(), "backups"),
      categoryName.toLowerCase()
    );
    fs.mkdirSync(this.backupDir, { recursive: true });
  }

  /** Strip query params (e.g. ?search_path=...) from DATABASE_URL — pg_dump rejects them */
  private get cleanDatabaseUrl(): string {
    try {
      const url = new URL(this.databaseUrl);
      url.search = "";
      return url.toString();
    } catch {
      // Not a valid URL (e.g. already a DSN string) — return as-is
      return this.databaseUrl;
    }
  }

  async runBackup(options: { compress?: boolean } = {}): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = options.compress ? ".sql.gz" : ".sql";
    const fileName = `backup-${timestamp}${ext}`;
    const filePath = path.join(this.backupDir, fileName);
    const start = Date.now();

    await new Promise<void>((resolve, reject) => {
      const schemaArgs = this.schemas.flatMap((s) => ["--schema", s]);
      const pgDumpArgs = [
        "--dbname",
        this.cleanDatabaseUrl,
        "--format",
        "plain",
        "--no-owner",
        "--no-acl",
        ...schemaArgs,
      ];

      if (options.compress) {
        // pg_dump stdout → gzip → file
        const pgDump = spawn("pg_dump", pgDumpArgs);
        const gzip = spawn("gzip", ["-c"]);
        const out = fs.createWriteStream(filePath);

        pgDump.stdout.pipe(gzip.stdin);
        gzip.stdout.pipe(out);

        pgDump.on("error", reject);
        gzip.on("error", reject);
        out.on("error", reject);

        let pgDumpCode: number | null = null;
        let gzipCode: number | null = null;

        const checkDone = () => {
          if (pgDumpCode !== null && gzipCode !== null) {
            if (pgDumpCode === 0 && gzipCode === 0) resolve();
            else reject(new Error(`pg_dump exited ${pgDumpCode}, gzip exited ${gzipCode}`));
          }
        };

        pgDump.on("close", (code) => { pgDumpCode = code ?? 1; checkDone(); });
        gzip.on("close", (code) => { gzipCode = code ?? 1; checkDone(); });
      } else {
        const args = [...pgDumpArgs, "--file", filePath];
        const proc = spawn("pg_dump", args);
        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`pg_dump exited with code ${code}`));
        });
        proc.on("error", reject);
      }
    });

    const stat = fs.statSync(filePath);
    return {
      filePath,
      sizeBytes: stat.size,
      durationMs: Date.now() - start,
      schemas: this.schemas,
    };
  }

  async listBackups(): Promise<BackupInfo[]> {
    try {
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter((f) => f.startsWith("backup-") && (f.endsWith(".sql") || f.endsWith(".sql.gz")))
        .map((f) => {
          const fullPath = path.join(this.backupDir, f);
          const stat = fs.statSync(fullPath);
          return {
            filePath: fullPath,
            createdAt: stat.birthtime,
            sizeBytes: stat.size,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch {
      return [];
    }
  }

  async getLastBackupInfo(): Promise<LastBackupInfo> {
    const backups = await this.listBackups();
    if (backups.length === 0) {
      return { lastBackup: null, lastBackupSize: null };
    }
    const latest = backups[0];
    return {
      lastBackup: latest.createdAt.toISOString(),
      lastBackupSize: latest.sizeBytes,
    };
  }
}
