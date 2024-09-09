import axios, { AxiosInstance } from "axios";
export class APICall {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: process.env.REACT_APP_BACKEND_URL,
            timeout: 30000,
        })
    }

    public async getRequest(endpoint: string): Promise<any> {
        try {
            const reponse = await this.axiosInstance.get(endpoint);
            return reponse.data;
        } catch (error) {
            console.error('Error making GET request:', error);
            throw error;
        }
    }

    public async postRequest(endpoint: string, data: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('Error making POST request:', error);
            throw error;
        }
    }
}