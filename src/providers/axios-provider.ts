import axios, { Axios, AxiosInstance, AxiosRequestHeaders, AxiosResponse, Method } from "axios";

export default class AxiosProvider {
    private static __axios: AxiosInstance;

    private static getInstance() {
        if (!this.__axios) {
            this.__axios = axios.create({baseURL: "http://localhost:" + Globals.SERVER_PORT});
        }

        return this.__axios;
    }

    static async triggerRequest(method: Method, path: string, headers: AxiosRequestHeaders, body?: any): Promise<null> {
        try {
            const instance = this.getInstance();
            switch (method) {
                case "GET":
                    instance.get(path, { headers }).catch(err => {
                        ddLogger.error("Errored in triggerRequest:", err);
                    });
                    break;
                case "POST":
                    instance.post(path, { headers, data: body }).catch(err => {
                        ddLogger.error("Errored in triggerRequest:", err);
                    });
                    break;
                default:
                    ddLogger.error(`Unrecognized method '${method}'`);
                    throw `Unrecognized method '${method}'`;
            }

            return null;
        } catch (err) {
            ddLogger.error("Could not complete request. Error=", err);
            throw err;
        }
    }

    static async makeRequest(method: Method, path: string, headers: AxiosRequestHeaders, body?: any): Promise<AxiosResponse["data"]> {
        try {
            const instance = this.getInstance();
            let response: AxiosResponse;
            switch (method) {
                case "GET":
                    response = await instance.get(path, { headers });
                    break;
                case "POST":
                    response = await instance.post(path, { data: body }, { headers });
                    break;
                default:
                    ddLogger.error(`Unrecognized method '${method}'`);
                    throw `Unrecognized method '${method}'`;
            }

            if (response) {
                return response.data;
            } else {
                return null;
            }
        } catch (err) {
            ddLogger.error("Could not complete request. Error=", err);
            throw err;
        }
    }
}
