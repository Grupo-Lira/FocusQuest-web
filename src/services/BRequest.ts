const FINAL_API_URL = "/api";

type Url = string;
type Headers = Record<string, string>;
type DataObject = object | null;
type Method = "POST" | "PUT" | "PATCH" | "GET" | "DELETE";

type RequestWithoutBody = <T = unknown>(
  url: Url,
  headers?: Headers
) => Promise<T>;
type RequestWithBody = <T = unknown>(
  url: Url,
  dataObject?: DataObject,
  headers?: Headers
) => Promise<T>;
type Call = <T = unknown>(
  url: Url,
  method: Method,
  dataObject?: DataObject,
  headers?: Headers
) => Promise<T>;

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
  get<T = unknown>(url: Url, headers = AuthHeaders()): Promise<T> {
    return this.sync<T>(url, "GET", null, headers);
  },

  post<T = unknown>(url: Url, dataObject: DataObject = null, headers = AuthHeaders()): Promise<T> {
    return this.sync<T>(url, "POST", dataObject, headers);
  },

  put<T = unknown>(url: Url, dataObject: DataObject = null, headers = AuthHeaders()): Promise<T> {
    return this.sync<T>(url, "PUT", dataObject, headers);
  },

  patch<T = unknown>(url: Url, dataObject: DataObject = null, headers = AuthHeaders()): Promise<T> {
    return this.sync<T>(url, "PATCH", dataObject, headers);
  },

  delete<T = unknown>(url: Url, dataObject: DataObject = null, headers = AuthHeaders()): Promise<T> {
    return this.sync<T>(url, "DELETE", dataObject, headers);
  },

  async download(url: Url, headers = AuthHeaders()) {
    // Remover barra inicial da URL para evitar barra dupla
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    const fullUrl = `${FINAL_API_URL}/${cleanUrl}`;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro na requisição" }));
      throw new Error(errorData.error || "Erro na requisição");
    }

    return response.blob();
  },

  async sync<T = unknown>(url: Url, method: Method, dataObject: DataObject = null, headers = AuthHeaders()): Promise<T> {
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
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  },
};

export default backendRequest;
