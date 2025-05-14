import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestDocument = Test & Document;

@Schema({ _id: false })
class Step {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })
  commands: string[];
}

@Schema({ timestamps: true })
export class Test {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startUrl: string;

  @Prop({ type: [Step], required: true })
  steps: Step[];
}

export const TestSchema = SchemaFactory.createForClass(Test);
