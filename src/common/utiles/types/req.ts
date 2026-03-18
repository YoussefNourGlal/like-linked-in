import { HUserDocument } from "src/DB/models/user";



declare module "express-serve-static-core"{
interface Request{
    user?:HUserDocument
    
}

}