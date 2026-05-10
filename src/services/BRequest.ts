const FINAL_API_URL = "/api";

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

type RequestDownload = (url: Url, headers?: Headers) => Promise<Blob>;

type BackendRequest = {
  get: RequestWithoutBody;
  post: RequestWithBody;
  put: RequestWithBody;
  patch: RequestWithBody;
  delete: RequestWithBody;
  download: RequestDownload;
  sync: Call;
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("focusquest.authToken="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
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
  get(url, callback = () => { }, headers = AuthHeaders()) {
    return this.sync(url, "GET", null, headers);
  },

  post(url, dataObject = null, callback = () => { }, headers = AuthHeaders()) {
    return this.sync(url, "POST", dataObject, headers);
  },

  put(url, dataObject = null, callback = () => { }, headers = AuthHeaders()) {
    return this.sync(url, "PUT", dataObject, headers);
  },

  patch(url, dataObject = null, callback = () => { }, headers = AuthHeaders()) {
    return this.sync(url, "PATCH", dataObject, headers);
  },

  delete(url, dataObject = null, callback = () => { }, headers = AuthHeaders()) {
    return this.sync(url, "DELETE", dataObject, headers);
  },

  async download(url: Url, headers = AuthHeaders()) {
    // Remover barra inicial da URL para evitar barra dupla
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const fullUrl = `${FINAL_API_URL}${cleanUrl}`;

    console.log('🔍 Debug Download:');
    console.log('URL original:', url);
    console.log('Clean URL:', cleanUrl);
    console.log('API_URL original:', API_URL);
    console.log('FINAL_API_URL:', FINAL_API_URL);
    console.log('Full URL:', fullUrl);

    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro na requisição" }));
      console.log('Error data:', errorData);
      throw new Error(errorData.error || "Erro na requisição");
    }

    return response.blob();
  },

  async sync(url, method, dataObject = null, headers = AuthHeaders()) {
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = `${FINAL_API_URL}${cleanUrl}`;

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: dataObject ? JSON.stringify(dataObject) : undefined,
      credentials: "include",
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
