import React, { useCallback, useState } from 'react';
import { Upload as AntUpload, Button, Progress, message } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';

const { Dragger } = AntUpload;

export const Upload: React.FC = () => {
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleUpload = useCallback(
    async (file: RcFile) => {
      try {
        await uploadFile({ file, name: file.name, description: '' });
        setFileList([]);
        setIsUploaded(true);
      } catch (error) {
        message.error('Upload failed');
        setIsUploaded(false);
      }
    },
    [uploadFile]
  );

  const handleNewUpload = () => {
    setIsUploaded(false);
    setFileList([]);
  };

  const props = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file: RcFile) => {
      const uploadFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'uploading',
        percent: 0,
        originFileObj: file,
      };
      setFileList([uploadFile]);
      handleUpload(file);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  if (isUploaded) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <Button type="primary" icon={<UploadOutlined />} onClick={handleNewUpload}>
          Upload New File
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">Support for single file upload</p>
      </Dragger>

      {isUploading && (
        <div style={{ marginTop: '16px' }}>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}
    </div>
  );
};
