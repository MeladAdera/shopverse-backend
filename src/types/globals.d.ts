// تعريف global types للمشروع
declare global {
  namespace NodeJS {
    interface Process {
      env: {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT: string;
        HOST: string;
        FRONTEND_URL: string;
        JWT_SECRET: string;
        JWT_REFRESH_SECRET: string;
        DATABASE_URL?: string;
        [key: string]: string | undefined;
      };
      cwd(): string;
      exit(code?: number): never;
    }
  }
  
  // تعريف path و fs
  const path: {
    join(...paths: string[]): string;
    extname(path: string): string;
    basename(path: string, ext?: string): string;
    isAbsolute(path: string): boolean;
  };
  
  const fs: {
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean }): void;
    unlink(path: string, callback: (err: NodeJS.ErrnoException | null) => void): void;
  };
}

export {};
