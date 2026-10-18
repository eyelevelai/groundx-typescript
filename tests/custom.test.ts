import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GroundXClient } from "../src/Wrapper";
import { ConflictError, ForbiddenError, NotFoundError, ServiceUnavailableError, type FileUploadResponse } from "../src/api";

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
    let issuanceStatus: number;
    let uploadResponse: typeof reservation;
    let calls: { url: string; init: RequestInit }[];
    let client: GroundXClient;
    let nativeUploadMs: number;
    let timedGrants: number;

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), "groundx-upload-test-"));
        filePath = path.join(directory, "invoice.pdf");
        fs.writeFileSync(filePath, "private source bytes");
        bucketMode = "protected";
        issuanceStatus = 201;
        uploadResponse = structuredClone(reservation);
        calls = [];
        nativeUploadMs = 0;
        timedGrants = 0;
        const mockFetch = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
            const url = String(input);
            calls.push({ url, init });
            if (url === "https://api.test/v1/bucket/7") {
                return Response.json({ bucket: { bucketId: 7, effectiveFileAccess: { mode: bucketMode, urlTtlSeconds: 300 } } });
            }
            if (url === "https://api.test/v1/bucket/7/file-upload") {
                if (nativeUploadMs) {
                    const id = ++timedGrants;
                    uploadResponse = { ...uploadResponse, uploadUrl: `https://storage.test/${id}?X-Amz-Signature=exact`, hostedUrl: `https://files.test/${id}.pdf`, expiresAt: new Date(Date.now() + 900000).toISOString() };
                }
                return Response.json(issuanceStatus === 201 ? uploadResponse : { error: "unavailable" }, { status: issuanceStatus });
            }
            if (url.startsWith("https://legacy.test/upload?")) {
                return Response.json({ URL: "https://storage.test/public.pdf?signature=public", Method: "PUT", Header: {
                    "Content-Type": ["application/pdf"], "Gx-Hosted-Url": ["https://files.test/public.pdf"],
                } });
            }
            if (url.startsWith("https://storage.test/")) {
                if (nativeUploadMs) vi.setSystemTime(Date.now() + nativeUploadMs);
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
        vi.useRealTimers();
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
            "https://api.test/v1/bucket/7/file-upload",
            reservation.uploadUrl, "https://api.test/v1/ingest/documents/remote",
        ]);
        const native = calls[1];
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

    it("fails before sending bytes when upload issuance fails", async () => {
        issuanceStatus = 503;
        await expect(client.ingest([{ bucketId: 7, filePath }])).rejects.toThrow();
        expect(calls.map((call) => call.url)).toEqual(["https://api.test/v1/bucket/7/file-upload"]);
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

    it("requests each upload from the configured API without reading policy", async () => {
        bucketMode = "public";
        await client.ingest([{ bucketId: 7, filePath }, { bucketId: 7, filePath }]);
        expect(calls.filter((call) => call.url === "https://api.test/v1/bucket/7")).toHaveLength(0);
        expect(calls.filter((call) => call.url.endsWith("/file-upload"))).toHaveLength(2);
    });

    it("keeps delegated selection on API calls and excludes it from native PUT", async () => {
        await client.ingest([{ bucketId: 7, filePath }], "https://callback.test", "callback-data", {
            headers: { "X-Customer-Key": "selected-customer" },
        });
        const packageVersion = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8")).version;
        for (const call of calls.filter((call) => call.url.startsWith("https://api.test/"))) {
            const headers = new Headers(call.init.headers);
            expect(headers.get("X-Customer-Key")).toBe("selected-customer");
            expect(headers.get("X-API-Key")).toBe("test-key");
            expect(headers.get("X-Fern-SDK-Name")).toBe("groundx");
            expect(headers.get("X-Fern-SDK-Version")).toBe(packageVersion);
            expect(headers.get("User-Agent")).toBe(`groundx/${packageVersion}`);
        }
        const native = calls.find((call) => call.url.startsWith("https://storage.test/"));
        expect(native?.init.headers).toEqual(reservation.headers);
        const submitted = calls.find((call) => call.url.endsWith("/ingest/documents/remote"));
        expect(JSON.parse(String(submitted?.init.body))).toMatchObject({ callbackUrl: "https://callback.test", callbackData: "callback-data" });
    });

    it("uses the local signer for ordinary public uploads and preserves null inheritance", async () => {
        bucketMode = "public";
        await client.ingest([{ bucketId: 7, filePath, fileAccess: null }]);
        expect(calls.some((call) => call.url.includes("api.eyelevel.ai"))).toBe(false);
        expect(calls.some((call) => call.url.endsWith("/file-upload"))).toBe(true);
        expect(submittedDocuments()[0].fileAccess).toBeNull();
    });

    it("preserves an explicit public legacy endpoint without forwarding hosted metadata", async () => {
        bucketMode = "public";
        await client.ingest([{ bucketId: 7, filePath, fileName: "renamed.txt" }], undefined, undefined, undefined, "https://legacy.test/upload");
        const legacy = calls.find(call => call.url.startsWith("https://legacy.test/upload?"));
        expect(new URL(legacy?.url ?? "https://missing.test").searchParams.get("name")).toBe("invoice.pdf");
        expect(new URL(legacy?.url ?? "https://missing.test").searchParams.get("type")).toBe("pdf");
        expect(submittedDocuments()[0].fileName).toBe("renamed.txt");
        expect(calls.some(call => call.url.endsWith("/file-upload"))).toBe(false);
        expect(submittedDocuments()[0].sourceUrl).toBe("https://files.test/public.pdf");
        expect(new Headers(calls.find(call => call.url.startsWith("https://storage.test/"))?.init.headers).has("gx-hosted-url")).toBe(false);
    });

    it.each(["inherited", "initial"])("rejects explicit legacy staging for %s protection", async (mode) => {
        bucketMode = mode === "inherited" ? "protected" : "public";
        await expect(client.ingest([{ bucketId: 7, filePath, fileAccess: mode === "initial" ? { mode: "protected" } : undefined }], undefined, undefined, undefined, "https://legacy.test/upload")).rejects.toThrow(/without an uploadApi override/);
        expect(calls.map(call => call.url)).toEqual(["https://api.test/v1/bucket/7"]);
    });

    it("accepts local HTTP S3-compatible storage without sending API credentials", async () => {
        uploadResponse.uploadUrl = "http://storage.test/local.pdf?signature=exact";
        const nativeFetch = vi.fn(async () => new Response(null, { status: 200 }));
        client = new GroundXClient({ apiKey: "test-key", baseUrl: "https://api.test", fetch: async (input, init) => String(input).startsWith("http://storage.test/") ? nativeFetch() : fetch(input, init), maxRetries: 0 });
        await client.ingest([{ bucketId: 7, filePath }]);
        expect(nativeFetch).toHaveBeenCalledOnce();
        expect(submittedDocuments()[0].sourceUrl).toBe(reservation.hostedUrl);
    });

    it.each([
        { mode: "protected", count: 29, reject: false },
        { mode: "protected", count: 30, reject: true },
        { mode: "public", count: 30, reject: true },
        { mode: "mixed", count: 29, reject: false },
        { mode: "mixed", count: 30, reject: true },
    ])("checks $mode batch expiry immediately before ingest ($count files)", async ({ mode, count, reject }) => {
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime("2026-10-16T00:00:00Z");
        nativeUploadMs = 31000;
        bucketMode = mode === "protected" ? "protected" : "public";
        const documents = Array.from({ length: count }, (_, index) => ({
            bucketId: 7,
            filePath,
            fileAccess: mode === "protected" ? { urlTtlSeconds: 120 }
                : mode === "mixed" && index < 16 ? { mode: "protected" as const, urlTtlSeconds: 120 } : null,
        }));
        const result = client.ingest(documents, "https://callback.test", "callback-data");
        if (reject) {
            await expect(result).rejects.toThrow(/expired before submission.*smaller batch/i);
            expect(calls.filter(call => call.url.endsWith("/ingest/documents/remote"))).toHaveLength(0);
        } else {
            await expect(result).resolves.toMatchObject({ ingest: { processId: "process" } });
            expect(calls.filter(call => call.url.endsWith("/ingest/documents/remote"))).toHaveLength(1);
            expect(submittedDocuments().map(doc => doc.fileAccess)).toEqual(documents.map(doc => doc.fileAccess));
            const submitted = calls.find(call => call.url.endsWith("/ingest/documents/remote"));
            expect(JSON.parse(String(submitted?.init.body))).toMatchObject({ callbackUrl: "https://callback.test", callbackData: "callback-data" });
        }
        expect(calls.filter(call => call.url.startsWith("https://storage.test/"))).toHaveLength(count);
        expect(timedGrants).toBe(count);
    });
});

const policyOperations = [
    {
        name: "customer.update",
        statuses: [403, 404, 409, 503],
        call: (client: GroundXClient) =>
            client.customer.update({ fileAccess: null, fileAccessRevision: 7 }, { maxRetries: 0 }),
    },
    {
        name: "buckets.update",
        statuses: [403, 404, 409, 503],
        call: (client: GroundXClient) =>
            client.buckets.update(7, { fileAccess: null, fileAccessRevision: 7 }, { maxRetries: 0 }),
    },
    {
        name: "documents.update",
        statuses: [403, 404, 409, 503],
        call: (client: GroundXClient) =>
            client.documents.update(
                { documents: [{ documentId: "document", fileAccess: null, fileAccessRevision: 7 }] },
                { maxRetries: 0 },
            ),
    },
    {
        name: "buckets.create",
        statuses: [403, 404, 503],
        call: (client: GroundXClient) =>
            client.buckets.create({ name: "private", fileAccess: { mode: "protected" } }, { maxRetries: 0 }),
    },
    {
        name: "documents.ingestRemote",
        statuses: [403, 503],
        call: (client: GroundXClient) =>
            client.documents.ingestRemote(
                {
                    documents: [
                        { bucketId: 7, sourceUrl: "https://source.test/a.pdf", fileAccess: { mode: "protected" } },
                    ],
                },
                { maxRetries: 0 },
            ),
    },
    {
        name: "documents.ingestLocal",
        statuses: [403, 404, 409, 503],
        call: (client: GroundXClient) =>
            client.documents.ingestLocal(
                [{ blob: "test", metadata: { bucketId: 7, fileName: "a.pdf", fileAccess: { mode: "protected" } } }],
                { maxRetries: 0 },
            ),
    },
    {
        name: "documents.crawlWebsite",
        statuses: [403, 503],
        call: (client: GroundXClient) =>
            client.documents.crawlWebsite(
                { websites: [{ bucketId: 7, sourceUrl: "https://source.test", fileAccess: { mode: "protected" } }] },
                { maxRetries: 0 },
            ),
    },
];

describe("policy error dispatch", () => {
    for (const { name, call, statuses } of policyOperations) {
        it.each(statuses)(`${name} raises the typed %i error`, async (status) => {
            const errors = {
                403: ForbiddenError,
                404: NotFoundError,
                409: ConflictError,
                503: ServiceUnavailableError,
            };
            const requests: RequestInit[] = [];
            const body = { message: "policy request rejected" };
            const client = new GroundXClient({
                apiKey: "test",
                environment: "https://api.test",
                fetch: async (_url, init = {}) => {
                    requests.push(init);
                    return Response.json(body, { status, headers: { "Retry-After": "1" } });
                },
            });
            const error: unknown = await call(client).catch((error: unknown) => error);
            expect(error).toBeInstanceOf(errors[status as keyof typeof errors]);
            if (
                !(
                    error instanceof ForbiddenError ||
                    error instanceof NotFoundError ||
                    error instanceof ConflictError ||
                    error instanceof ServiceUnavailableError
                )
            )
                throw error;
            expect(error.statusCode).toBe(status);
            expect(error.body).toEqual(body);
            expect(error.rawResponse?.headers.get("Retry-After")).toBe("1");
            expect(requests).toHaveLength(1);
            if (name.endsWith("update")) {
                const sent = JSON.parse(String(requests[0].body));
                expect(name.startsWith("documents") ? sent.documents[0] : sent).toMatchObject({
                    fileAccess: null,
                    fileAccessRevision: 7,
                });
            }
        });
    }
});
