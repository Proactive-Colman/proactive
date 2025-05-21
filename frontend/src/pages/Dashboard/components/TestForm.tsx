import { TextInput, Textarea, Button, Stack, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface TestFormProps {
  test?: any;
  onSubmit: (data: any) => void;
}

interface TestStep {
  name: string;
  commands: string[];
}

interface TestFormValues {
  name: string;
  description: string;
  startUrl: string;
  steps: TestStep[];
}

export function TestForm({ test, onSubmit }: TestFormProps) {
  const form = useForm<TestFormValues>({
    initialValues: {
      name: test?.name || '',
      description: test?.description || '',
      startUrl: test?.startUrl || '',
      steps: test?.steps || [{ name: '', commands: [''] }],
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      startUrl: (value) => (!value ? 'Start URL is required' : null),
    },
  });

  const handleSubmit = (values: TestFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Test Name"
          placeholder="Enter test name"
          {...form.getInputProps('name')}
        />

        <Textarea
          label="Description"
          placeholder="Enter test description"
          {...form.getInputProps('description')}
        />

        <TextInput
          label="Start URL"
          placeholder="Enter start URL"
          {...form.getInputProps('startUrl')}
        />

        {form.values.steps.map((_, index: number) => (
          <Stack key={index} gap="xs">
            <TextInput
              label={`Step ${index + 1} Name`}
              placeholder="Enter step name"
              {...form.getInputProps(`steps.${index}.name`)}
            />
            <Textarea
              label="Commands"
              placeholder="Enter commands (one per line)"
              {...form.getInputProps(`steps.${index}.commands`)}
            />
          </Stack>
        ))}

        <Button type="submit" fullWidth>
          {test ? 'Update Test' : 'Create Test'}
        </Button>
      </Stack>
    </form>
  );
}
