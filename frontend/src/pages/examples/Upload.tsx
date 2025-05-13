import { Card, Text, Stack, useMantineTheme, rem, Progress, Image, Group, Button, TextInput, Textarea } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { message } from 'antd';
import { useForm } from '@mantine/form';

interface UploadFile {
  file: File;
  preview?: string;
  progress: number;
}

interface FormValues {
  name: string;
  description: string;
  file: File | null;
}

export default function Upload() {
  const theme = useMantineTheme();
  const accent = theme.colors.green[4];
  const cardBg = theme.colors.dark[1];
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
      file: null,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      file: (value) => (!value ? 'File is required' : null),
    },
  });

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const fileList = event instanceof FileList ? event : event.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const newFile: UploadFile = {
        file,
        preview: file.type.startsWith('image') ? URL.createObjectURL(file) : undefined,
        progress: 0,
      };
      setFiles([newFile]);
      form.setFieldValue('file', file);
    }
  };

  const handleUpload = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      message.error('Please fill in all required fields');
      return;
    }

    try {
      await uploadFile({
        file: files[0].file,
        name: form.values.name,
        description: form.values.description,
      });
      setFiles([]);
      form.reset();
      message.success('File uploaded successfully');
    } catch (error) {
      message.error('Failed to upload file');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card
      p="md"
      radius={24}
      style={{ 
        background: cardBg, 
        minHeight: 'auto',
        width: '100%', 
        maxWidth: 800,
        margin: '1rem auto',
        borderRadius: 24,
      }}
    >
      <Stack gap="md">
        <Text size="lg" style={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
          Upload Test
        </Text>
        
        <div
          style={{
            width: '100%',
            minHeight: 120,
            background: dragActive ? theme.colors.green[1] : theme.colors.dark[0],
            border: `2px dashed ${accent}`,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            outline: dragActive ? `2px solid ${accent}` : 'none',
            padding: '1rem',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleDrop}
        >
          <IconUpload size={32} color={accent} style={{ marginBottom: rem(8) }} />
          <Text size="sm" style={{ color: '#fff', marginBottom: rem(4), textAlign: 'center' }}>
            Click or drag files here to upload
          </Text>
          <Text size="xs" style={{ color: theme.colors.dark[3], textAlign: 'center' }}>
            Max file size: 10MB
          </Text>
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
        </div>

        {files.length > 0 && (
          <Stack gap="sm">
            <Text size="sm" style={{ color: accent }}>Selected file:</Text>
            {files.map((fileObj, i) => (
              <Card key={fileObj.file.name} p="sm" radius={12} style={{ background: theme.colors.dark[0] }}>
                <Group align="center" gap="sm">
                  {fileObj.preview && (
                    <Image src={fileObj.preview} alt={fileObj.file.name} width={48} height={48} radius={8} fit="cover" />
                  )}
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text size="sm" style={{ color: '#fff' }}>{fileObj.file.name}</Text>
                    {isUploading && (
                      <Progress value={uploadProgress} color={accent} radius={8} size="sm" />
                    )}
                  </Stack>
                </Group>
              </Card>
            ))}

            <Stack gap="sm">
              <TextInput
                label="Name"
                placeholder="Enter test name"
                required
                size="sm"
                {...form.getInputProps('name')}
                styles={{
                  input: {
                    backgroundColor: theme.colors.dark[0],
                    color: '#fff',
                    '&::placeholder': {
                      color: theme.colors.dark[3],
                    },
                  },
                  label: {
                    color: '#fff',
                  },
                }}
              />
              <Textarea
                label="Description"
                placeholder="Enter test description"
                required
                minRows={2}
                size="sm"
                {...form.getInputProps('description')}
                styles={{
                  input: {
                    backgroundColor: theme.colors.dark[0],
                    color: '#fff',
                    '&::placeholder': {
                      color: theme.colors.dark[3],
                    },
                  },
                  label: {
                    color: '#fff',
                  },
                }}
              />
              <Button
                onClick={handleUpload}
                loading={isUploading}
                disabled={isUploading}
                fullWidth
                size="sm"
                style={{ marginTop: rem(4) }}
              >
                Upload File
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
} 