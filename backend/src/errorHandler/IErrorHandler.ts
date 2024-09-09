import { EmailSendingErrorHandler } from "./EmailSendingErrorHandler";

export interface IErrorHandler {
    /**
     * Handle the given error
     * @param error the given error
     */
    handle(error: any) : Promise<void>;
}

export const errorHandler : IErrorHandler = new EmailSendingErrorHandler();