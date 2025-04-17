import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

// Initialize S3 client with credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.S3_BUCKET || 'mondrian-riley-test';

// GET handler for listing objects or getting a specific object
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    // If key is provided, get a specific object
    if (key) {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      });
      
      const response = await s3Client.send(command);
      
      // Convert stream to text if it's JSON
      if (response.Body) {
        const bodyContents = await response.Body.transformToString();
        return NextResponse.json(JSON.parse(bodyContents));
      }
      
      return NextResponse.json({ error: 'No body in response' }, { status: 404 });
    } 
    // Otherwise list all objects
    else {
      const command = new ListObjectsCommand({
        Bucket: BUCKET_NAME,
        Delimiter: '/'
      });
      
      const response = await s3Client.send(command);
      return NextResponse.json({ files: response.Contents || [] });
    }
  } catch (error) {
    console.error('S3 error:', error);
    return NextResponse.json({ error: 'Failed to retrieve from S3' }, { status: 500 });
  }
}

// POST handler for saving a new painting
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.painting || !data.details) {
      return NextResponse.json({ error: 'Invalid painting data' }, { status: 400 });
    }
    
    const key = `${data.details.artist}${data.details.date}.json`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('S3 error:', error);
    return NextResponse.json({ error: 'Failed to save to S3' }, { status: 500 });
  }
} 