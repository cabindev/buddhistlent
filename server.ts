import express, { Request, Response } from 'express';
import next from 'next';
import path from 'path';

const dev: boolean = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port: number = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(() => {
    const server = express();

    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/images
    server.use('/images', express.static(path.join(__dirname, 'public/images')));
    
    // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/userImages
    server.use('/img', express.static(path.join(__dirname, 'public/img')));

    server.all('*', (req: Request, res: Response) => {
        return handle(req, res);
    });

    server.listen(port, (err?: Error) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
