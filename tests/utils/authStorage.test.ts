import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearAuthToken, getAuthToken, saveAuthToken } from "@/utils/authStorage";

describe("authStorage", () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalDocument = global.document;

    let cookieStore = "";
    (global as any).window = {};
    (global as any).document = {
      get cookie() {
        return cookieStore;
      },
      set cookie(val: string) {
        if (val.includes("max-age=0")) {
          cookieStore = "";
        } else {
          const cookiePart = val.split(";")[0];
          cookieStore = cookiePart;
        }
      },
    };
  });

  afterEach(() => {
    global.window = originalWindow;
    global.document = originalDocument;
  });

  it("deve salvar token no cookie", () => {
    saveAuthToken("token_jwt_teste_123");
    expect(document.cookie).toContain("focusquest.authToken=token_jwt_teste_123");
  });

  it("deve recuperar o token salvo do cookie", () => {
    saveAuthToken("token_jwt_recuperar");
    const token = getAuthToken();
    expect(token).toBe("token_jwt_recuperar");
  });

  it("deve limpar o token do cookie", () => {
    saveAuthToken("token_para_remover");
    clearAuthToken();
    const token = getAuthToken();
    expect(token).toBeNull();
  });
});
