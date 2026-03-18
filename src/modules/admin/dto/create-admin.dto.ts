import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum ActionEnum{
    ban="ban",
    unban="unban"
}



export class AdminActionDto {
    @IsEnum(ActionEnum)
    @IsNotEmpty()
    action:ActionEnum
}
