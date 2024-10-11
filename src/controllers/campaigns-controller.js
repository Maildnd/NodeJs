const { supabaseUrl } = require("../../config-global");
const { supabase } = require("../util/supabase");
const getCoordsForAddress = require("../util/location");
const campaignMailControllers = require("./campaign-mail-controllers");

const getCampaigns = async (req, res, next) => {
  const { business_id } = req.body;
  const { data, error } = await supabase
    .from("campaign")
    .select("*, business(name, street, city, state, postal_code, country)")
    .eq("business", business_id)
    .order("created_at", { ascending: false });
  if (error) {
    return res.status(500).json({
      message: "Error fetching campaigns",
      details: error.message,
      code: error.code,
    });
  } else {
    console.log("Campaigns fetched successfully: ", data);
    res.json({ campaigns: data });
  }
};

const createCampaign = async (req, res, next) => {
  console.log("req body", req.body);
  const { finalData } = req.body;
  const {
    title,
    caption,
    description,
    start_date,
    tags,
    content_type,
    target_type,
    publish_type,
    lat,
    lng,
    radius,
    address,
    zip_codes,
    business_id,
    save_as_draft,
    address_string,
    residents_count,
  } = JSON.parse(finalData);

  const values = {
    title,
    caption,
    description,
    tags,
    content_type,
    target_type,
    lat,
    lng,
    radius: radius * 1609.34,
    zip_codes,
    business: business_id,
    address: address_string,
    residents_count,
  };

  if (save_as_draft) {
    values["status"] = "draft";
  } else {
    if (publish_type === "schedule") {
      values["start_date"] = start_date;
      values["status"] = "scheduled";
    } else if (publish_type === "now") {
      values["start_date"] = new Date();
      values["status"] = "in progress";
    }
  }

  const { data, error } = await supabase
    .from("campaign")
    .insert(values)
    .select("id, title");

  if (error) {
    return res.status(500).json({
      message: "Error creating campaign",
      details: error.message,
      code: error.code,
    });
  } else {
    const campaignId = data[0].id;
    const updateValues = {};
    if (req.files["images_files"]) {
      updateValues["images"] = await uploadFiles(
        `campaigns/${campaignId}/content/images`,
        req.files["images_files"]
      );
    }

    if (req.files["pdf_files"]) {
      const pdf_files = await uploadFiles(
        `campaigns/${campaignId}/content/files`,
        req.files["pdf_files"]
      );
      updateValues["file"] = pdf_files[0];
    }

    if (req.files["coupon_files"]) {
      updateValues["coupons"] = await uploadFiles(
        `campaigns/${campaignId}/coupons`,
        req.files["coupon_files"]
      );
    }
    if (req.files["promotion_files"]) {
      updateValues["promotions"] = await uploadFiles(
        `campaigns/${campaignId}/promotions`,
        req.files["promotion_files"]
      );
    }

    if (Object.keys(updateValues).length > 0) {
      await updateCampaign(campaignId, updateValues);
    }

    if (!save_as_draft) {
      if (publish_type === "now") {
        campaignMailControllers.createCampaignMail(campaignId);
      }
    }
    res.json({ data: data[0].id });
  }
};

const publishCampaign = async (req, res, next) => {
  const { campaign_id, publish_type } = req.body;
  const values = {
    id: campaign_id,
  };

  if (publish_type === "schedule") {
    values["start_date"] = start_date;
    values["status"] = "scheduled";
  } else if (publish_type === "now") {
    values["start_date"] = new Date();
    values["status"] = "in progress";
  }

  const { data, error } = await supabase
    .from("campaign")
    .update(values)
    .eq("id", campaign_id);
  if (error) {
    return res.status(500).json({
      message: "Error publishing campaign",
      details: error.message,
      code: error.code,
    });
  } else {
    console.log("Campaign published successfully: ", data);
    res.json({ data: data });
  }
};

const updateCampaign = async (campaignId, updateValues) => {
  const { data, error } = await supabase
    .from("campaign")
    .update(updateValues)
    .eq("id", campaignId);
  if (error) {
    return res.status(500).json({
      message: "Error updating campaign",
      details: error.message,
      code: error.code,
    });
  } else {
    console.log("Campaign updated successfully: ", data);
  }
};

const uploadFiles = async (bucketPath, files) => {
  let files_url = [];
  let i = 0;
  for (const file of files) {
    i++;
    const { data, error } = await supabase.storage
      .from(bucketPath)
      .upload(i.toString(), file.buffer, {
        contentType: file.mimetype,
      });
    if (error) {
      console.log(`Error uploading ${i}:`, error.message);
    } else {
      const fileUrl =
        supabaseUrl +
        "/storage/v1/object/public/" +
        bucketPath +
        "/" +
        i.toString();
      files_url.push(fileUrl);
      console.log(`Uploaded ${i}:`, data);
    }
  }
  return files_url;
};

const createCampaignMails = async (req, res, next) => {
  const { campaign_id } = req.body;
  const campaignMail = await campaignMailControllers.createCampaignMail(
    campaign_id
  );
  res.json({ message: "Campaign mails created successfully" });
};

const getTargetCoordinates = async (req, res, next) => {
  const { address } = req.body;
  try {
    coordinates = await getCoordsForAddress(address);
    res.json({ coordinates: coordinates });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching coordinates",
      details: error.message,
      code: error.code,
    });
  }
};

exports.createCampaign = createCampaign;
exports.getCampaigns = getCampaigns;
exports.publishCampaign = publishCampaign;
exports.createCampaignMails = createCampaignMails;
exports.getTargetCoordinates = getTargetCoordinates;
