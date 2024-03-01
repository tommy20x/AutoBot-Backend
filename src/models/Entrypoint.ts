import { Document, Schema, model } from 'mongoose'

export interface Entrypoint extends Document {
    contract: string,
    method: string,
    amount: number,
    running: boolean
}
  
const EntrypointSchema = new Schema<Entrypoint>({
    contract: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    running: {
        type: Boolean,
        required: true,
    }
},
{
    toJSON: {
        transform: function (doc, ret) {
          ret.id = ret._id
          delete ret.createdAt
          delete ret.updatedAt
          delete ret._id
          delete ret.__v
        },
    },
    timestamps: true 
})

export default model<Entrypoint>('Entrypoint', EntrypointSchema);
