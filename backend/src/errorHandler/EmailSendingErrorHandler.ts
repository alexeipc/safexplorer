import { IErrorHandler } from "./IErrorHandler";

export class EmailSendingErrorHandler implements IErrorHandler {
    /**
     * The method that handle the given error
     * @param error the given error with the unknown type
     */
    async handle(error: any): Promise<void> {
        console.log("Hello, this is email handler, and the error message is: ",error.message);
    }
}
