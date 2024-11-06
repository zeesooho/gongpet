import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AwsService {
  s3Client: S3Client;

  constructor() {
    // AWS S3 클라이언트 초기화. 환경 설정 정보를 사용하여 AWS 리전, Access Key, Secret Key를 설정.
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string, // 파일 확장자
  ) {
    // AWS S3에 이미지 업로드 명령을 생성합니다. 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정합니다.
    const fileKey = `profile-images/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET, // S3 버킷 이름
      Key: fileKey, // 업로드될 파일의 이름
      Body: file.buffer, // 업로드할 파일
      ContentType: `image/${ext}`, // 파일 타입
    });

    // 생성된 명령을 S3 클라이언트에 전달하여 이미지 업로드를 수행합니다.
    await this.s3Client.send(command);

    // 업로드된 이미지의 URL을 반환합니다.
    return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${fileKey}`;
  }

  async deleteFromS3(fileName: string) {
    try {
      // AWS S3에서 파일을 삭제하는 명령을 생성합니다.
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET, // S3 버킷 이름
        Key: `profile-images/${fileName}`, // 삭제할 파일의 경로
      });

      // 생성된 명령을 S3 클라이언트에 전달하여 파일 삭제를 수행합니다.
      await this.s3Client.send(command);

      return true;
    } catch (error) {
      // S3 삭제 중 에러가 발생한 경우 에러를 throw합니다.
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  extractFileNameFromUrl(url: string): string {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch (error) {
      throw new Error(`Invalid S3 URL format: ${error.message}`);
    }
  }
}
