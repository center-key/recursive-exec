//! recursive-exec v1.1.4 ~~ https://github.com/center-key/recursive-exec ~~ MIT License

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
    assert(ok: unknown, message: string | null): void;
    cli(): void;
    find(folder: string, command: string, options?: Partial<Settings>): Result[];
};
export { recursiveExec };
