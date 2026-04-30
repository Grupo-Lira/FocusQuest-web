const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/";

type Callback = (data?: any) => void;
type Url = string;
type Headers = Record<string, string>;
type DataObject = object | null;
type Method = "POST" | "PUT" | "PATCH" | "GET" | "DELETE";

type RequestWithoutBody = (
  url: Url,
  callback?: Callback,
  headers?: Headers
) => Promise<any>;
type RequestWithBody = (
  url: Url,
  dataObject?: DataObject,
  callback?: Callback,
  headers?: Headers
) => Promise<any>;
type Call = (
  url: Url,
  method: Method,
  dataObject?: DataObject,
  headers?: Headers
) => Promise<any>;

type BackendRequest = {
  get: RequestWithoutBody;
  post: RequestWithBody;
  put: RequestWithBody;
  patch: RequestWithBody;
  delete: RequestWithBody;
  sync: Call;
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("focusquest.authToken");
};

const JSONHeaders: Headers = {
  "Content-Type": "application/json",
};

const AuthHeaders = (): Headers => {
  const token = getAuthToken();
  if (!token) return JSONHeaders;
  return {
    ...JSONHeaders,
    Authorization: `Bearer ${token}`,
  };
};

const backendRequest: BackendRequest = {
  get(url, callback = () => {}, headers = AuthHeaders()) {
    return this.sync(url, "GET", null, headers);
  },

  post(url, dataObject = null, callback = () => {}, headers = AuthHeaders()) {
    return this.sync(url, "POST", dataObject, headers);
  },

  put(url, dataObject = null, callback = () => {}, headers = AuthHeaders()) {
    return this.sync(url, "PUT", dataObject, headers);
  },

  patch(url, dataObject = null, callback = () => {}, headers = AuthHeaders()) {
    return this.sync(url, "PATCH", dataObject, headers);
  },

  delete(url, dataObject = null, callback = () => {}, headers = AuthHeaders()) {
    return this.sync(url, "DELETE", dataObject, headers);
  },

  async sync(url, method, dataObject = null, headers = AuthHeaders()) {
    const fullUrl = `${API_URL}/api${url}`;

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: dataObject ? JSON.stringify(dataObject) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro na requisição" }));
      throw new Error(errorData.error || "Erro na requisição");
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  },
};

export default backendRequest;
