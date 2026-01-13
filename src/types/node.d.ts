declare global {
  namespace NodeJS {
    interface Process {
      cwd(): string;
    }
  }
}
export {};
