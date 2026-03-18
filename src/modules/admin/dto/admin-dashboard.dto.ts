import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: string;

  @Field()
  username: string;

  @Field()
  email: string;
}

@ObjectType()
export class CompanyType {
  @Field(() => ID)
  _id: string;

  @Field()
  companyName: string;
}

@ObjectType()
export class AdminDashboardResponse {
  @Field(() => [UserType])
  users: UserType[];

  @Field(() => [CompanyType])
  companies: CompanyType[];
}
