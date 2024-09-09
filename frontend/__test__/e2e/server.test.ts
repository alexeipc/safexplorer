import request from 'supertest';
import { type Express } from 'express';
import { createServer } from '../../createServer';

describe('test /home', () => {
    let app: Express;

    beforeAll(async () => {
        app = await createServer();
    });

    it('should return a string "HELLO HOME"', async () => {
        const response = await request(app).get('/home');
        expect(response.text).toBe("HELLO HOME");
    });

    it('should ', async () => {
        const response = await request(app).post('/safety-score').send({
            point: [37.801692, -122.261993]
        });
        console.log(response);
    });
});
