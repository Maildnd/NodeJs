const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const campaignMailSchema = new Schema({
  campaignId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  residentId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("CampaignMail", campaignMailSchema);
