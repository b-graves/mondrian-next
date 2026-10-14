import { _Object as S3Object } from "@aws-sdk/client-s3";

// S3 LastModified changes when an object is copied. The original time is the
// timestamp baked into the object key, matching details.date in the JSON.
export function createdTime(object: S3Object): number {
  const key = object.Key || "";
  const marked = key.match(/ts:(\d{12,})/);
  const suffix = key.match(/-(\d{12,})\.json$/);
  const anywhere = key.match(/(\d{13})/);
  const raw = marked?.[1] || suffix?.[1] || anywhere?.[1];
  const parsed = raw ? Number(raw) : NaN;
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  return object.LastModified ? new Date(object.LastModified).getTime() : 0;
}
