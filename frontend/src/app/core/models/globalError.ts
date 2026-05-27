export interface IErrorGlobal {
    status: number;
    message: string;
    timestamp: Date;
    path: string;
    error?: any;
}