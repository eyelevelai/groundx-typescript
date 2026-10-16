import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GroundXClient } from "../src/Wrapper";
import type { FileUploadResponse } from "../src/api";

const reservation: FileUploadResponse = {
    uploadId: "reservation",
    uploadUrl: "https://storage.test/private.pdf?signature=exact",
    hostedUrl: "https://files.test/private.pdf",
    expiresAt: "2099-01-01T00:00:00Z",
    method: "PUT",
    headers: { "Content-Type": "application/pdf", "x-amz-meta-reservation": "reservation" },
};

describe("ingest file policies", () => {
    let directory: string;
    let filePath: string;
    let bucketMode: "public" | "protected";
    let lookupStatus: number;
    let protectAfterPublicUpload: boolean;
    let uploadResponse: typeof reservation;
    let calls: { url: string; init: RequestInit }[];
    let client: GroundXClient;

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), "groundx-upload-test-"));
        filePath = path.join(directory, "invoice.pdf");
        fs.writeFileSync(filePath, "private source bytes");
        bucketMode = "protected";
        lookupStatus = 200;
        protectAfterPublicUpload = false;
        uploadResponse = structuredClone(reservation);
        calls = [];
        const mockFetch = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
            const url = String(input);
            calls.push({ url, init });
            if (url === "https://api.test/v1/bucket/7") {
                return Response.json(lookupStatus === 200
                    ? { bucket: { bucketId: 7, effectiveFileAccess: { mode: bucketMode, urlTtlSeconds: 300 } } }
                    : { error: "unavailable" }, { status: lookupStatus });
            }
            if (url === "https://api.test/v1/bucket/7/file-upload") {
                return Response.json(uploadResponse, { status: 201 });
            }
            if (url.startsWith("https://api.eyelevel.ai/upload/file?")) {
                return Response.json({ URL: "https://storage.test/public.pdf?signature=public", Method: "PUT", Header: {
                    "Content-Type": ["application/pdf"], "Gx-Hosted-Url": ["https://files.test/public.pdf"],
                } });
            }
            if (url.startsWith("https://storage.test/")) {
                if (protectAfterPublicUpload) bucketMode = "protected";
                return new Response(null, { status: 200 });
            }
            if (url === "https://api.test/v1/ingest/documents/remote") {
                return Response.json({ ingest: { processId: "process", status: "queued" } });
            }
            throw new Error(`Unexpected request: ${url}`);
        });
        vi.stubGlobal("fetch", mockFetch);
        client = new GroundXClient({ apiKey: "test-key", baseUrl: "https://api.test", fetch: mockFetch, maxRetries: 0 });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fs.rmSync(directory, { recursive: true });
    });

    function submittedDocuments(): Record<string, unknown>[] {
        const submitted = calls.find((call) => call.url.endsWith("/ingest/documents/remote"));
        expect(submitted).toBeDefined();
        return JSON.parse(String(submitted?.init.body)).documents;
    }

    it("uses a bucket-owned private grant before uploading inherited protected bytes", async () => {
        await client.ingest([{ bucketId: 7, filePath, fileType: "pdf" }]);
        expect(calls.map((call) => call.url)).toEqual([
            "https://api.test/v1/bucket/7", "https://api.test/v1/bucket/7/file-upload",
            reservation.uploadUrl, "https://api.test/v1/ingest/documents/remote",
        ]);
        const native = calls[2];
        expect(native.init.method).toBe("PUT");
        expect(native.init.headers).toEqual(reservation.headers);
        expect(native.init.redirect).toBe("error");
        expect(Buffer.from(native.init.body as Uint8Array).toString()).toBe("private source bytes");
        expect(submittedDocuments()[0].sourceUrl).toBe(reservation.hostedUrl);
    });

    it("preserves distinct initial policies for local and remote inputs in a public bucket", async () => {
        bucketMode = "public";
        await client.ingest([
            { bucketId: 7, filePath, fileType: "pdf", fileAccess: { mode: "protected", urlTtlSeconds: 120 } },
            { bucketId: 7, filePath: "https://files.test/other.pdf", fileAccess: { urlTtlSeconds: 300 } },
        ]);
        expect(calls.some((call) => call.url.includes("api.eyelevel.ai"))).toBe(false);
        const documents = submittedDocuments();
        expect(documents.find((doc) => doc.sourceUrl === reservation.hostedUrl)?.fileAccess).toEqual({ mode: "protected", urlTtlSeconds: 120 });
        expect(documents.find((doc) => doc.sourceUrl === "https://files.test/other.pdf")?.fileAccess).toEqual({ urlTtlSeconds: 300 });
    });

    it("fails before sending bytes when destination policy cannot be read", async () => {
        lookupStatus = 503;
        await expect(client.ingest([{ bucketId: 7, filePath }])).rejects.toThrow();
        expect(calls.map((call) => call.url)).toEqual(["https://api.test/v1/bucket/7"]);
    });

    it("rejects an expired private reservation without public fallback", async () => {
        uploadResponse.expiresAt = "2000-01-01T00:00:00Z";
        await expect(client.ingest([{ bucketId: 7, filePath }])).rejects.toThrow(/expired/i);
        expect(calls.some((call) => call.url.startsWith("https://storage.test"))).toBe(false);
        expect(calls.some((call) => call.url.includes("api.eyelevel.ai"))).toBe(false);
    });

    it("does not forward an unexpected GroundX header to native storage", async () => {
        uploadResponse.headers = { ...uploadResponse.headers, "X-API-Key": "must-not-leave" };
        await expect(client.ingest([{ bucketId: 7, filePath }])).rejects.toThrow(/header/i);
        expect(calls.some((call) => call.url.startsWith("https://storage.test"))).toBe(false);
    });

    it("checks destination policy again before uploading the next local file", async () => {
        bucketMode = "public";
        protectAfterPublicUpload = true;
        await client.ingest([{ bucketId: 7, filePath }, { bucketId: 7, filePath }]);
        expect(calls.filter((call) => call.url === "https://api.test/v1/bucket/7")).toHaveLength(2);
        expect(calls.filter((call) => call.url.includes("api.eyelevel.ai/upload/file?"))).toHaveLength(1);
        expect(calls.filter((call) => call.url.endsWith("/file-upload"))).toHaveLength(1);
    });

    it("keeps delegated selection on API calls and excludes it from native PUT", async () => {
        await client.ingest([{ bucketId: 7, filePath }], "https://callback.test", "callback-data", {
            headers: { "X-Customer-Key": "selected-customer" },
        });
        for (const call of calls.filter((call) => call.url.startsWith("https://api.test/"))) {
            expect(new Headers(call.init.headers).get("X-Customer-Key")).toBe("selected-customer");
            expect(new Headers(call.init.headers).get("X-API-Key")).toBe("test-key");
        }
        const native = calls.find((call) => call.url.startsWith("https://storage.test/"));
        expect(native?.init.headers).toEqual(reservation.headers);
        const submitted = calls.find((call) => call.url.endsWith("/ingest/documents/remote"));
        expect(JSON.parse(String(submitted?.init.body))).toMatchObject({ callbackUrl: "https://callback.test", callbackData: "callback-data" });
    });

    it("keeps the ordinary public broker path and explicit null inheritance", async () => {
        bucketMode = "public";
        await client.ingest([{ bucketId: 7, filePath, fileAccess: null }]);
        expect(calls.some((call) => call.url.includes("api.eyelevel.ai/upload/file?"))).toBe(true);
        expect(calls.some((call) => call.url.endsWith("/file-upload"))).toBe(false);
        expect(submittedDocuments()[0].fileAccess).toBeNull();
    });
});
