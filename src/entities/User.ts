import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { AppRole } from "../types";
import { Question } from "./Question";
import { Course } from "./Course";
import { Tag } from "./Tag";
import { Contest } from "./Contest";

@Entity()
export class User extends BaseEntity {
  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: AppRole,
    default: AppRole.USER,
  })
  role!: AppRole;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  access_token?: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @OneToMany(() => Course, (course) => course.creator)
  courses?: Course[];

  @OneToMany(() => Contest, (contest) => contest.creator)
  contests?: Contest[];

  @OneToMany(() => Question, (question) => question.creator)
  questions?: Question[];

  @OneToMany(() => Tag, (tag) => tag.creator)
  tags?: Tag[];

  toApiResponse() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      avatar_url: this.avatar_url,
    };
  }
}