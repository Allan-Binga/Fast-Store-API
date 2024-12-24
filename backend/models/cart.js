import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  totalItems: { type: Number, required: true },
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;