import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = createR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${publicUrl}/${key}`;
}

// Deletes files given by their public URLs (used when a customer's data is
// erased). URLs from anywhere else are ignored.
export async function deleteFromR2(urls: string[]): Promise<void> {
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  const keys = urls.filter((u) => base && u.startsWith(`${base}/leads/`)).map((u) => u.slice(base.length + 1));
  if (keys.length === 0) return;
  await createR2Client().send(
    new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    })
  );
}
