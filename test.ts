import { Document, GroundXClient } from "./src";

const docs: Document[] = [
    {
        bucketId: 1234,
        filePath:"/Users/benjaminfletcher/Desktop/test-os/t-short.pdf",
    },
    {
        bucketId: 1234,
        fileName: "my_file2.txt",
        filePath: "~/Desktop/test-os/t-short.txt",
        fileType: "pdf",
        searchData: {
            key: "value",
        },
    }
]

if (true) {
    const client = new GroundXClient({ apiKey: "YOUR_API_KEY" });

    try {
        const response = await client.ingest(
            docs,
        );
        console.log(response);
    } catch (err) {
        console.error(err);
    }
}