const User = require("../models/users");
const Address = require("../models/address");
const { asyncHandler, fail, requireId, emailValue } = require("../utils/http");

// Address ownership and explicit IDs prevent cross-account reads and ambiguous edits.
const fields = ["firstName", "lastName", "street", "email", "city", "state", "postalCode", "phone"];
function addressData(body) {
  const data = {};
  for (const field of fields) { if (typeof body[field] !== "string" || !body[field].trim()) throw fail(400, `Valid ${field} is required.`); data[field] = body[field].trim(); }
  data.email = emailValue(data.email);
  if (body.isDefault !== undefined && typeof body.isDefault !== "boolean") throw fail(400, "isDefault must be a boolean.");
  data.isDefault = body.isDefault ?? false;
  return data;
}

// Fetch Address
const getAddress = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.userId });
  const selected = req.user?.defaultAddressId || addresses.find(address => address.isDefault)?._id;
  res.json(addresses.map(address => ({ ...address.toObject(), isDefault: Boolean(selected && String(address._id) === String(selected)) })));
});

//Add Address
const addAddress = asyncHandler(async (req, res) => {
  const address = await Address.create({ ...addressData(req.body), user: req.userId });
  // One atomic owner field selects the default, even with concurrent requests.
  if (address.isDefault) await User.updateOne({ _id: req.userId }, { $set: { defaultAddressId: address._id } });
  res.status(201).json({ message: "Address added.", address });
});

//Update Address
const updateAddress = asyncHandler(async (req, res) => {
  const id = requireId(req.params.id || req.body.addressId);
  const address = await Address.findOneAndUpdate({ _id: id, user: req.userId }, { $set: addressData(req.body) }, { new: true, runValidators: true });
  if (!address) throw fail(404, "Address not found.");
  if (address.isDefault) await User.updateOne({ _id: req.userId }, { $set: { defaultAddressId: address._id } });
  else await User.updateOne({ _id: req.userId, defaultAddressId: address._id }, { $unset: { defaultAddressId: 1 } });
  res.json({ message: "Address updated.", address });
});

//Delete Address
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: requireId(req.params.id || req.body.addressId), user: req.userId });
  if (!address) throw fail(404, "Address not found.");
  await User.updateOne({ _id: req.userId, defaultAddressId: address._id }, { $unset: { defaultAddressId: 1 } });
  res.json({ message: "Address deleted." });
});

module.exports = { getAddress, addAddress, updateAddress, deleteAddress };
