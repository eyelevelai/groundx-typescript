/**
 * This is a custom test file, if you wish to add more tests
 * to your SDK.
 * Be sure to mark this file in `.fernignore`.
 *
 * If you include example requests/responses in your fern definition,
 * you will have tests automatically generated for you.
 */

/*
import { GroundXClient } from "../src";
import * as types from "../src/api/types";

describe("test", () => {
    it("local", async () => {
        const client = new GroundXClient({ apiKey: "b772c275-7070-4be2-8cd1-8a84ec3539a4"});

        const response = await client.documents.ingestLocal([
            {
                blob: "blob",
                metadata: {
                    bucketId: 18687,
                    fileName: "my_file1.txt",
                    fileType: "pdf",
                    searchData: {"test":"data"},
                },
            },
        ]);

        console.log(response);
    });
    it("remote", async () => {
        const client = new GroundXClient({ apiKey: "b772c275-7070-4be2-8cd1-8a84ec3539a4"});

        const docs: types.IngestRemoteDocument[] = [
            {
                bucketId: 18687,
                sourceUrl: "https://upload.eyelevel.ai/test/t-short.pdf",
            },
        ] 

        const response = await client.documents.ingestRemote(
            {
                documents: docs,
                callbackData: "remote-test",
                callbackUrl: "https://1b5e3138f9b2.ngrok-free.app",
            },
        );

        console.log(response);
    });
    it("ingest", async () => {
        const client = new GroundXClient({ apiKey: "b772c275-7070-4be2-8cd1-8a84ec3539a4"});

        const docs: types.Document[] = [
            {
                bucketId: 18687,
                filePath: "https://upload.eyelevel.ai/test/t-short.pdf",
            },
        ] 

        const response = await client.ingest(
            docs,
            "https://1b5e3138f9b2.ngrok-free.app",
            "ingest-test",
        );

        console.log(response);
    });
});
*/
