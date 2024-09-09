// Importing module
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer } from './createServer';

dotenv.config();

const app = createServer();
const PORT:Number=Number(process.env.PORT);

// Handling GET / Request
app.get('/', (req:Request, res:Response) => {
    res.send('Welcome to typescript backend!');
})

// Server setup
app.listen(PORT,() => {
    console.log('The application is listening '
          + 'on port http://localhost:'+PORT);
})