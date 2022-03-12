export default class ApplicationErrorHandler {
    static async wrapError(err: any, req: any, res: any, next: any) {
        if (res.headersSent) {
            return next(err);
        }
        let convertedError = new Error(err);
        console.log('Generic error:', convertedError);
        res.status(500);
        res.send({ err: convertedError.toString() });
    }
}
