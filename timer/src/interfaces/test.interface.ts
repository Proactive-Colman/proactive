export interface Test {
  _id: string;
  startUrl: string;
  steps: {
    name: string;
    commands: string[];
  }[];
  status?: string;
  executionTime?: number;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
