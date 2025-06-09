import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

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
