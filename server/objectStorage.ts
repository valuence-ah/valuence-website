import { Response } from "express";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private s3Client: S3Client;
  private bucketName: string = "uploads";

  constructor() {
    this.s3Client = new S3Client({
      forcePathStyle: true,
      region: process.env.S3_REGION || "us-east-2",
      endpoint: process.env.S3_ENDPOINT || "https://rrmzkluqymfittbuzrpd.supabase.co/storage/v1/s3",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectId,
    });
    
    // Valid for 1 hour
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getObjectEntityFile(objectPath: string): Promise<any> {
    // Logic to handle both full URLs and simple IDs
    const key = objectPath.split('/').pop() || objectPath;
    return { name: key, bucket: this.bucketName, key };
  }

  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: file.bucket,
      Key: file.key,
    });
    
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: cacheTtlSec });
    res.redirect(url);
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: any): Promise<string> {
    return rawPath;
  }

  async canAccessObjectEntity(): Promise<boolean> {
    return true;
  }
}
