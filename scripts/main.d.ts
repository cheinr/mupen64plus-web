
declare module 'mupen64plus-web' {

  export interface FileEntry {
    fileKey: string,
    contents: Int8Array
  }

  export interface EmulatorControls {
    start: () => Promise<void>,
    stop: () => void,
    pause: (netplayPauseTargetCounts?: number[]) => Promise<(number[]) | null>,
    resume: () => void,
    forceDumpSaveFiles: () => Promise<void>
  }

  export default function createMupen64PlusWeb({ }: any): Promise<EmulatorControls>;
  export function putSaveFile(fileName: string, fileData: ArrayBuffer): Promise<void>;
  export function getAllSaveFiles(): Promise<FileEntry[]>;
  export function preloadAutoInputConfig(publicPath: string, shouldForce: boolean): Promise<void>;
  export function findAutoInputConfig(gamepadName: string): Promise<any>;
  export function writeAutoInputConfig(gamepadName: string, config: any): Promise<void>;
  export const mainMupen64PlusWebJsFileName: string;

}


