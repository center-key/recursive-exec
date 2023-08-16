//! recursive-exec v0.0.4 ~~ https://github.com/center-key/recursive-exec ~~ MIT License

export type Settings = {
    extensions: string[] | null;
    quiet: boolean;
};
export type Result = {
    folder: string;
    file: string;
    path: string;
    filename: string;
    basename: string;
    command: string;
};
declare const recursiveExec: {
    find(folder: string, command: string, options?: Partial<Settings>): Result[];
};
export { recursiveExec };
