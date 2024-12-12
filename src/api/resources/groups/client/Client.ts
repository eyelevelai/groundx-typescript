/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as environments from "../../../../environments";
import * as core from "../../../../core";
import * as GroundX from "../../../index";
import urlJoin from "url-join";
import * as errors from "../../../../errors/index";

export declare namespace Groups {
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

export class Groups {
    constructor(protected readonly _options: Groups.Options) {}

    /**
     * list all groups within your GroundX account.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {GroundX.GroupsListRequest} request
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.groups.list()
     */
    public list(
        request: GroundX.GroupsListRequest = {},
        requestOptions?: Groups.RequestOptions
    ): core.APIPromise<GroundX.GroupListResponse> {
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
                        "v1/group"
                    ),
                    method: "GET",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                        body: _response.body as GroundX.GroupListResponse,
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
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/group.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * create a new group, a group being a collection of buckets which can be searched.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {GroundX.GroupCreateRequest} request
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     *
     * @example
     *     await client.groups.create({
     *         name: "your_group_name"
     *     })
     */
    public create(
        request: GroundX.GroupCreateRequest,
        requestOptions?: Groups.RequestOptions
    ): core.APIPromise<GroundX.GroupResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        "v1/group"
                    ),
                    method: "POST",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                        body: _response.body as GroundX.GroupResponse,
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
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling POST /v1/group.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * look up a specific group by its groupId.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} groupId - The groupId of the group to look up.
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.groups.get(1)
     */
    public get(groupId: number, requestOptions?: Groups.RequestOptions): core.APIPromise<GroundX.GroupResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/group/${encodeURIComponent(groupId)}`
                    ),
                    method: "GET",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                        body: _response.body as GroundX.GroupResponse,
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
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling GET /v1/group/{groupId}.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Rename a group
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} groupId - The groupId of the group to update.
     * @param {GroundX.GroupUpdateRequest} request
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.groups.update(1, {
     *         newName: "your_group_name"
     *     })
     */
    public update(
        groupId: number,
        request: GroundX.GroupUpdateRequest,
        requestOptions?: Groups.RequestOptions
    ): core.APIPromise<GroundX.GroupResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/group/${encodeURIComponent(groupId)}`
                    ),
                    method: "PUT",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                        body: _response.body as GroundX.GroupResponse,
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
                        throw new errors.GroundXTimeoutError("Timeout exceeded when calling PUT /v1/group/{groupId}.");
                    case "unknown":
                        throw new errors.GroundXError({
                            message: _response.error.errorMessage,
                        });
                }
            })()
        );
    }

    /**
     * Delete a group.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} groupId - The groupId of the group to be deleted.
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.groups.delete(1)
     */
    public delete(groupId: number, requestOptions?: Groups.RequestOptions): core.APIPromise<GroundX.MessageResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/group/${encodeURIComponent(groupId)}`
                    ),
                    method: "DELETE",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                            "Timeout exceeded when calling DELETE /v1/group/{groupId}."
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
     * Add an existing bucket to an existing group. Buckets and groups can be associated many to many.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} groupId - The groupId of the group which the bucket will be added to.
     * @param {number} bucketId - The bucketId of the bucket being added to the group.
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.groups.addBucket(1, 1)
     */
    public addBucket(
        groupId: number,
        bucketId: number,
        requestOptions?: Groups.RequestOptions
    ): core.APIPromise<GroundX.MessageResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/group/${encodeURIComponent(groupId)}/bucket/${encodeURIComponent(bucketId)}`
                    ),
                    method: "POST",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                            "Timeout exceeded when calling POST /v1/group/{groupId}/bucket/{bucketId}."
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
     * remove a bucket from a group. Buckets and groups can be associated many to many, this removes one bucket to group association without disturbing others.
     *
     * Interact with the "Request Body" below to explore the arguments of this function. Enter your GroundX API key to send a request directly from this web page. Select your language of choice to structure a code snippet based on your specified arguments.
     *
     * @param {number} groupId - The groupId of the group which the bucket will be removed from.
     * @param {number} bucketId - The bucketId of the bucket which will be removed from the group.
     * @param {Groups.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link GroundX.BadRequestError}
     * @throws {@link GroundX.UnauthorizedError}
     *
     * @example
     *     await client.groups.removeBucket(1, 1)
     */
    public removeBucket(
        groupId: number,
        bucketId: number,
        requestOptions?: Groups.RequestOptions
    ): core.APIPromise<GroundX.MessageResponse> {
        return core.APIPromise.from(
            (async () => {
                const _response = await (this._options.fetcher ?? core.fetcher)({
                    url: urlJoin(
                        (await core.Supplier.get(this._options.environment)) ?? environments.GroundXEnvironment.Default,
                        `v1/group/${encodeURIComponent(groupId)}/bucket/${encodeURIComponent(bucketId)}`
                    ),
                    method: "DELETE",
                    headers: {
                        "X-Fern-Language": "JavaScript",
                        "X-Fern-SDK-Name": "groundx",
                        "X-Fern-SDK-Version": "2.0.10",
                        "User-Agent": "groundx/2.0.10",
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
                            "Timeout exceeded when calling DELETE /v1/group/{groupId}/bucket/{bucketId}."
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
