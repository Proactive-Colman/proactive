import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TestResultDocument = TestResult & Document;

@Schema({ _id: false })
export class StepResult {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  duration: number;

  @Prop()
  error: string | null;
}

export const StepResultSchema = SchemaFactory.createForClass(StepResult);

@Schema({ timestamps: true })
export class TestResult {
  @Prop({ type: Types.ObjectId, ref: "Test", required: true })
  testId: Types.ObjectId;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  executionTime: number;

  @Prop({ required: true })
  totalRuntime: number;

  @Prop({ type: [StepResultSchema], required: true })
  steps: StepResult[];

  @Prop()
  error: string | null;

  environment: any;
}

export const TestResultSchema = SchemaFactory.createForClass(TestResult);
