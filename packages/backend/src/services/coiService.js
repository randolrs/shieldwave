import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env.js';

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const BUCKET = config.aws.s3Bucket;

/**
 * Downloads a COI PDF from the carrier URL and caches it in S3.
 *
 * @param {string} policyId - Internal policy UUID
 * @param {string} coiUrl - The carrier-provided URL for the COI PDF
 * @returns {string} The S3 URL for the cached COI
 */
export async function cacheCOI(policyId, coiUrl) {
  // Download the PDF from the carrier
  const response = await fetch(coiUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download COI from carrier: ${response.status} ${response.statusText}`,
    );
  }

  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  const s3Key = `cois/${policyId}/certificate.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: `inline; filename="COI-${policyId}.pdf"`,
      Metadata: {
        policyId,
        cachedAt: new Date().toISOString(),
        sourceUrl: coiUrl,
      },
    }),
  );

  // Return a stable S3 URL (access controlled via bucket policy or presigned URLs)
  return `https://${BUCKET}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;
}

/**
 * Creates a certificate holder request for a policy.
 *
 * In production, this calls the carrier's COI amendment endpoint
 * (e.g. Coterie's certificate holder API). For now, we store the
 * request data and return a placeholder URL.
 *
 * @param {string} policyId - Internal policy UUID
 * @param {string} holderName - Name of the certificate holder
 * @param {string} holderAddress - Address of the certificate holder
 * @returns {{ coiUrl: string, status: string }}
 */
export async function generateCertificateHolder(policyId, holderName, holderAddress) {
  // TODO: In production, call the carrier's certificate holder API.
  // For Coterie: POST /v1/policies/{policyId}/certificate-holders
  // with { holderName, holderAddress } and receive back a new COI PDF URL.

  const s3Key = `cois/${policyId}/holders/${encodeURIComponent(holderName.replace(/\s+/g, '-'))}-${Date.now()}.pdf`;

  // Placeholder: in production, the carrier returns a new PDF which we cache.
  // For now, return the expected S3 location where the PDF would be stored.
  const coiUrl = `https://${BUCKET}.s3.${config.aws.region}.amazonaws.com/${s3Key}`;

  return {
    coiUrl,
    status: 'pending', // Will be 'ready' once carrier generates the amended COI
  };
}

/**
 * Returns the cached S3 URL for a policy's COI.
 *
 * Generates a presigned URL that expires in 1 hour for secure access.
 *
 * @param {string} policyId - Internal policy UUID
 * @returns {string} Presigned S3 URL for the COI PDF
 */
export async function getCOIUrl(policyId) {
  const s3Key = `cois/${policyId}/certificate.pdf`;

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return presignedUrl;
}
