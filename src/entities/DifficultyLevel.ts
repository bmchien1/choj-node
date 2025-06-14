import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class DifficultyLevel extends BaseEntity {
  @Column()
  name!: string;
}