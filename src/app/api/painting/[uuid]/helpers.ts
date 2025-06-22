import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  GetObjectCommand,
  _Object as S3Object,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || "mondrian-riley-test";

export async function fetchAllObjects(): Promise<S3Object[]> {
  let allObjects: S3Object[] = [];
  let continuationToken: string | undefined = undefined;
  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    });
    const response: ListObjectsV2CommandOutput = await s3Client.send(command);
    if (response.Contents) {
      allObjects = allObjects.concat(response.Contents);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  return allObjects;
}

export async function fetchFullPaintingData(
  s3Object: S3Object,
  number: number
) {
  if (!s3Object.Key) return null;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Object.Key,
  });
  const response = await s3Client.send(command);
  if (response.Body) {
    const bodyContents = await response.Body.transformToString();
    try {
      const parsed = JSON.parse(bodyContents);
      return {
        ...parsed,
        number,
        etag: s3Object.ETag?.replace(/"/g, ""),
      };
    } catch {
      return null;
    }
  }
  return null;
}
