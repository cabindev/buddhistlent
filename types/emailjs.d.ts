// types/emailjs.d.ts

declare module 'emailjs' {
    export interface MessageAttachment {
      data: string;
      alternative: boolean;
    }
  
    export interface Message {
      from: string;
      to: string;
      subject: string;
      text?: string;
      attachment?: MessageAttachment[];
    }
  
    export class SMTPClient {
      constructor(options: { user: string; password: string; host: string; ssl: boolean });
      send(message: Message, callback: (err: Error | null, message: string) => void): void;
    }
  }
  