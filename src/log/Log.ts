export enum Level {
    All,
    Info,
    Warning,
    Error,
    None
}

export class Log {

    // public static Level = Level.All;
    public static Level = Level.Error;

    public static info(...msg: any[]) {
        if (Number(this.Level) > Number(Level.Info)) return;
        print("Info", ...msg);
    }
}
