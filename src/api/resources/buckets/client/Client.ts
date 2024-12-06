/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as GroundX from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Buckets {
    interface Options {
        environment?: core.Supplier<environments.GroundXEnvironment | string>;
        apiKey: core.Supplier<string>;
        fetcher?: core.FetchFunction;
    }

    interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Additional headers to include in the request. */
        headers?: Record<string, string>;
    }
}

export class Buckets {
    constructor(protected readonly _options: Buckets.Options) {}

    /**
     * List all buckets within your GroundX account
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {GroundX.BucketsListRequest} request
     * @param {Buckets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.buckets.list()
     */
    public list(
        request: GroundX.BucketsListRequest = {},
        requestOptions?: Buckets.RequestOptions
    ): core.APIPromise<GroundX.BucketListResponse> {
        return core.APIPromise.from(
            (async () => {
                const { n, nextToken } = request;
                const _queryParams: Record<string, string | string[] | object | object[]> = {};
                if (n != null) {
                    _queryParams["n"] = n.toString();
                }
                if (nextToken != null) {
                    _queryParams["nextToken"] = nextToken;
                }
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        "v1/bucket"
                    ),
                    method: "GET",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx-typescript-sdk",
                        "X-Fern-SDK-Version": "2.0.2",
                        "User-Agent": "groundx-typescript-sdk/2.0.2",
                        "X-Fern-Runtime": core.RUNTIME.type,
                        "X-Fern-Runtime-Version": core.RUNTIME.version,
                        ...(await this._getCustomAuthorizationHeaders()),
                        ...requestOptions?.headers,
                    },
                    contentType: "application/json",
                    queryParameters: _queryParams,
                    requestType: "json",
                    timeoutMs:
                        requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                    maxRetries: requestOptions?.maxRetries,
                    abortSignal: requestOptions?.abortSignal,
                });
                if (_response.ok) {
                    return {
                        ok: _response.ok,
                        body: _response.body as GroundX.BucketListResponse,
                        headers: _response.headers,
                    };
                }
                if (_response.error.reason === "status-code") {
                    throw new errors.GroundXError({
                        statusCode: _response.error.statusCode,
                        body: _response.error.body,
                    });
                }
                switch (_response.error.reason) {
                    case "non-json":
                        throw new errors.GroundXError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.rawBody,
                        });
                    case "timeout":
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/bucket.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Create a new bucket.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {GroundX.BucketCreateRequest} request
     * @param {Buckets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     *
     * @example
     *     await client.buckets.create({
     *         name: "your_bucket_name"
     *     })
     */
    public create(
        request: GroundX.BucketCreateRequest,
        requestOptions?: Buckets.RequestOptions
    ): core.APIPromise<GroundX.BucketResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        "v1/bucket"
                    ),
                    method: "POST",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx-typescript-sdk",
                        "X-Fern-SDK-Version": "2.0.2",
                        "User-Agent": "groundx-typescript-sdk/2.0.2",
                        "X-Fern-Runtime": core.RUNTIME.type,
                        "X-Fern-Runtime-Version": core.RUNTIME.version,
                        ...(await this._getCustomAuthorizationHeaders()),
                        ...requestOptions?.headers,
                    },
                    contentType: "application/json",
                    requestType: "json",
                    body: request,
                    timeoutMs:
                        requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                    maxRetries: requestOptions?.maxRetries,
                    abortSignal: requestOptions?.abortSignal,
                });
                if (_response.ok) {
                    return {
                        ok: _response.ok,
                        body: _response.body as GroundX.BucketResponse,
                        headers: _response.headers,
                    };
                }
                if (_response.error.reason === "status-code") {
                    switch (_response.error.statusCode) {
                        case 400:
                            throw new GroundX.BadRequestError(_response.error.body as unknown);
                        default:
                            throw new errors.GroundXError({
                                statusCode: _response.error.statusCode,
                                body: _response.error.body,
                            });
                    }
                }
                switch (_response.error.reason) {
                    case "non-json":
                        throw new errors.GroundXError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.rawBody,
                        });
                    case "timeout":
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/bucket.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Look up a specific bucket by its bucketId.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} bucketId - The bucketId of the bucket to look up.
     * @param {Buckets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.buckets.get(1)
     */
    public get(bucketId: number, requestOptions?: Buckets.RequestOptions): core.APIPromise<GroundX.BucketResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/bucket/${encodeURIComponent(bucketId)}`
                    ),
                    method: "GET",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx-typescript-sdk",
                        "X-Fern-SDK-Version": "2.0.2",
                        "User-Agent": "groundx-typescript-sdk/2.0.2",
                        "X-Fern-Runtime": core.RUNTIME.type,
                        "X-Fern-Runtime-Version": core.RUNTIME.version,
                        ...(await this._getCustomAuthorizationHeaders()),
                        ...requestOptions?.headers,
                    },
                    contentType: "application/json",
                    requestType: "json",
                    timeoutMs:
                        requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                    maxRetries: requestOptions?.maxRetries,
                    abortSignal: requestOptions?.abortSignal,
                });
                if (_response.ok) {
                    return {
                        ok: _response.ok,
                        body: _response.body as GroundX.BucketResponse,
                        headers: _response.headers,
                    };
                }
                if (_response.error.reason === "status-code") {
                    switch (_response.error.statusCode) {
                        case 400:
                            throw new GroundX.BadRequestError(_response.error.body as unknown);
                        case 401:
                            throw new GroundX.UnauthorizedError(_response.error.body as unknown);
                        default:
                            throw new errors.GroundXError({
                                statusCode: _response.error.statusCode,
                                body: _response.error.body,
                            });
                    }
                }
                switch (_response.error.reason) {
                    case "non-json":
                        throw new errors.GroundXError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.rawBody,
                        });
                    case "timeout":
                        throw new errors.GroundXTimeoutError(
                            "Timeout exceeded when calling GET /v1/bucket/{bucketId}."
                        );
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Rename a bucket.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} bucketId - The bucketId of the bucket being updated.
     * @param {GroundX.BucketUpdateRequest} request
     * @param {Buckets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.buckets.update(1, {
     *         newName: "your_bucket_name"
     *     })
     */
    public update(
        bucketId: number,
        request: GroundX.BucketUpdateRequest,
        requestOptions?: Buckets.RequestOptions
    ): core.APIPromise<GroundX.BucketUpdateResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/bucket/${encodeURIComponent(bucketId)}`
                    ),
                    method: "PUT",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx-typescript-sdk",
                        "X-Fern-SDK-Version": "2.0.2",
                        "User-Agent": "groundx-typescript-sdk/2.0.2",
                        "X-Fern-Runtime": core.RUNTIME.type,
                        "X-Fern-Runtime-Version": core.RUNTIME.version,
                        ...(await this._getCustomAuthorizationHeaders()),
                        ...requestOptions?.headers,
                    },
                    contentType: "application/json",
                    requestType: "json",
                    body: request,
                    timeoutMs:
                        requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                    maxRetries: requestOptions?.maxRetries,
                    abortSignal: requestOptions?.abortSignal,
                });
                if (_response.ok) {
                    return {
                        ok: _response.ok,
                        body: _response.body as GroundX.BucketUpdateResponse,
                        headers: _response.headers,
                    };
                }
                if (_response.error.reason === "status-code") {
                    switch (_response.error.statusCode) {
                        case 400:
                            throw new GroundX.BadRequestError(_response.error.body as unknown);
                        case 401:
                            throw new GroundX.UnauthorizedError(_response.error.body as unknown);
                        default:
                            throw new errors.GroundXError({
                                statusCode: _response.error.statusCode,
                                body: _response.error.body,
                            });
                    }
                }
                switch (_response.error.reason) {
                    case "non-json":
                        throw new errors.GroundXError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.rawBody,
                        });
                    case "timeout":
                        throw new errors.GroundXTimeoutError(
                            "Timeout exceeded when calling PUT /v1/bucket/{bucketId}."
                        );
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Delete a bucket.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} bucketId - The bucketId of the bucket being deleted.
     * @param {Buckets.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.buckets.delete(1)
     */
    public delete(bucketId: number, requestOptions?: Buckets.RequestOptions): core.APIPromise<GroundX.MessageResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/bucket/${encodeURIComponent(bucketId)}`
                    ),
                    method: "DELETE",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx-typescript-sdk",
                        "X-Fern-SDK-Version": "2.0.2",
                        "User-Agent": "groundx-typescript-sdk/2.0.2",
                        "X-Fern-Runtime": core.RUNTIME.type,
                        "X-Fern-Runtime-Version": core.RUNTIME.version,
                        ...(await this._getCustomAuthorizationHeaders()),
                        ...requestOptions?.headers,
                    },
                    contentType: "application/json",
                    requestType: "json",
                    timeoutMs:
                        requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
                    maxRetries: requestOptions?.maxRetries,
                    abortSignal: requestOptions?.abortSignal,
                });
                if (_response.ok) {
                    return {
                        ok: _response.ok,
                        body: _response.body as GroundX.MessageResponse,
                        headers: _response.headers,
                    };
                }
                if (_response.error.reason === "status-code") {
                    switch (_response.error.statusCode) {
                        case 400:
                            throw new GroundX.BadRequestError(_response.error.body as unknown);
                        case 401:
                            throw new GroundX.UnauthorizedError(_response.error.body as unknown);
                        default:
                            throw new errors.GroundXError({
                                statusCode: _response.error.statusCode,
                                body: _response.error.body,
                            });
                    }
                }
                switch (_response.error.reason) {
                    case "non-json":
                        throw new errors.GroundXError({
                            statusCode: _response.error.statusCode,
                            body: _response.error.rawBody,
                        });
                    case "timeout":
                        throw new errors.GroundXTimeoutError(
                            "Timeout exceeded when calling DELETE /v1/bucket/{bucketId}."
                        );
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    protected async _getCustomAuthorizationHeaders() {
        const apiKeyValue = await core.Supplier.get(this._options.apiKey);
        return { "X-API-Key": apiKeyValue };
    }
}
