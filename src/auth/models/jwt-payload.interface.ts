import * as mongoose from 'mongoose';


export interface IJwtPayload {
    id: mongoose.Schema.Types.ObjectId,
    email: string,
}