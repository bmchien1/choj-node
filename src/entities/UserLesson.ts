import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique } from "typeorm";
import { User } from "./User";
import { Lesson } from "./Lesson";

@Entity()
@Unique(["user", "lesson"])
export class UserLesson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @ManyToOne(() => Lesson, { eager: true })
  lesson!: Lesson;

  @Column({ default: false })
  completed!: boolean;
} 