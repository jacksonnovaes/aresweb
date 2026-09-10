import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest, customerApiRequest, errorMessage } from "./api";

describe("API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends JSON requests through the authenticated backend proxy", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "customer-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/customers", { method: "POST", body: { name: "Maria" } }))
      .resolves.toEqual({ id: "customer-1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/backend/customers", expect.objectContaining({
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name: "Maria" }),
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
    }));
  });

  it("uses the customer proxy and supports responses without content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(customerApiRequest("/auth/logout", { method: "POST" })).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/customer/auth/logout", expect.any(Object));
  });

  it("prioritizes field validation messages returned by the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        title: "Dados inválidos",
        detail: "Revise os campos.",
        fields: { email: "Informe um e-mail válido." },
      }), { status: 400, headers: { "Content-Type": "application/json" } }),
    ));

    const request = apiRequest("/customers");
    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Informe um e-mail válido.",
    });
  });

  it("normalizes errors displayed to the user", () => {
    expect(errorMessage(new ApiError("Falha conhecida", 409))).toBe("Falha conhecida");
    expect(errorMessage("falha")).toBe("Ocorreu um erro inesperado. Tente novamente.");
  });
});
