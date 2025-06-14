import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Permission extends BaseEntity {
  @Column()
  permission!: string;
}