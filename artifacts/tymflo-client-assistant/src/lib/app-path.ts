/** Public document links must stay inside the artifact/repository base path. */
export const appPath = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
