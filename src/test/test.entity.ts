import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Test {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = Date.now() + '-' + Math.round(Math.random() * 1e9).toString();
    }
  }
} 