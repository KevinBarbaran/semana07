import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Se remueve validate para permitir guardar el hash de bcrypt
    phoneNumber: { type: String, required: true },
    birthdate: { type: Date, required: true },
    url_profile: { type: String, default: '' },
    address: { type: String, default: '' },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Campo virtual para calcular la edad automáticamente
userSchema.virtual('age').get(function() {
    if (!this.birthdate) return null;
    const today = new Date();
    const birth = new Date(this.birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

export default model('User', userSchema);