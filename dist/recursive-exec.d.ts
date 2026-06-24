//! recursive-exec v1.1.7 ~~ https://github.com/center-key/recursive-exec ~~ MIT License

export type Settings = {
    echo: boolean;
    excludes: string[] | null;
    extensions: string[] | null;
    quiet: boolean;
};
export type Result = {
    folder: string;
    file: string;
    path: string;
    filename: string;
    basename: string;
    name: string;
    command: string;
};
declare const recursiveExec: {
    version: string;
    assertOk(ok: unknown, message: string | null): void;
    find(folder: string, command: string, options?: Partial<Settings>): Result[];
    cli(): void;
};
export { recursiveExec };
