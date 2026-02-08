import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'https://api.safecast.org';

export class SafecastAPIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
            },
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response) {
                    throw new Error(
                        `Safecast API error (${error.response.status}): ${error.response.statusText}`
                    );
                } else if (error.request) {
                    throw new Error('No response from Safecast API');
                } else {
                    throw new Error(`Request error: ${error.message}`);
                }
            }
        );
    }

    /**
     * Query measurements near a geographic location
     */
    async getMeasurements(params: {
        latitude?: number;
        longitude?: number;
        distance?: number;
        limit?: number;
        captured_after?: string;
        captured_before?: string;
        bgeigie_import_id?: number;
        device_id?: number;
    }): Promise<any[]> {
        const response = await this.client.get('/measurements.json', { params });
        return response.data;
    }

    /**
     * Get bGeigie imports (tracks)
     */
    async getBGeigieImports(params?: {
        limit?: number;
    }): Promise<any[]> {
        const response = await this.client.get('/bgeigie_imports.json', { params });
        return response.data;
    }

    /**
     * Get a specific bGeigie import by ID
     */
    async getBGeigieImport(id: number): Promise<any> {
        const response = await this.client.get(`/bgeigie_imports/${id}.json`);
        return response.data;
    }

    /**
     * Get devices
     */
    async getDevices(params?: { limit?: number }): Promise<any[]> {
        const response = await this.client.get('/devices.json', { params });
        return response.data;
    }
}

export const apiClient = new SafecastAPIClient();
