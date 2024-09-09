import axios, { AxiosInstance } from 'axios';

/**
 * The overall structure of a API call service
 */
export class ExternalAPICall {
    private axiosInstance: AxiosInstance;
    baseUrl: string;
    
    /**
     * Construct the database with the base URL
     * @param baseURL the given base URL
     */
    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL: baseURL,
        })
        this.baseUrl = baseURL;
    }

    /**
     * Commit a GET request to the given endpoint
     * @param endpoint the given endpoint
     * @returns the response get from the given enpoint
     */
    public async getRequest(endpoint: string): Promise<any> {
        try {
            const reponse = await this.axiosInstance.get(endpoint);
            return reponse.data;
        } catch (error) {
            console.error('Error making GET request:', error);
            throw error;
        }
    }

    /**
     * Commit a POST request to the given endpoint with given data
     * @param endpoint the given enpoint
     * @param data the given data
     * @returns the response from the given enpoint
     */
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