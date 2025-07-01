import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Question } from "./Question";

@Entity()
export class Matrix extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  name!: string;

  @Column({ type: "json" })
  criteria!: {
    questionType: string;
    difficulty_level: string;
    tagIds: number[];
    percentage: number;
    quantity: number;
  }[];

  @Column({ nullable: true })
  total_points?: number;

  @Column({ type: "text", nullable: true })
  description?: string;
}