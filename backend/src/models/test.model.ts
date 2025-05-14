import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestDocument = Test & Document;

interface Step {
  name: string;
  command: string;
}

@Schema({ timestamps: true })
export class Test {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startUrl: string;

  @Prop({ type: [{ name: String, command: String }], required: true })
  steps: Step[];
}

export const TestSchema = SchemaFactory.createForClass(Test);
