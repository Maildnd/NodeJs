const { supabase } = require("../util/supabase");

const getCampaignMail = async (req, res, next) => {
  console.log("getCampaignMail");
  const { account_id, user_id } = req.body;
  const { data, error } = await supabase
    .from("mail")
    .select("*, campaign(*, business(email, phone, website, cover_image_url))")
    .eq("resident_account", account_id)
    .eq("campaign.status", "in progress")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching campaign mails:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error fetching campaign mails",
      details: error.message,
      code: error.code,
    });
  } else {
    let mails = [];
    data.forEach((mail) => {
      if (mail.campaign) {
        mails.push({
          id: mail.id,
          saved: mail.saved,
          saved_list: mail.saved_list,
          title: mail.campaign.title,
          caption: mail.campaign.caption,
          description: mail.campaign.description,
          content_type: mail.campaign.content_type,
          images: mail.campaign.images,
          file: mail.campaign.file,
          has_coupons: mail.campaign.coupons ? true : false,
          website: mail.campaign.business.website,
          phone: mail.campaign.business.phone,
          email: mail.campaign.business.email,
          cover_image: mail.campaign.business
            ? mail.campaign.business.cover_image_url
            : "",
          coupons: mail.campaign.coupons,
          promotions: mail.campaign.promotions,
          tags: mail.campaign.tags,
          mailType:
            mail.campaign.content_type === "images" ? "flyer" : "envelope",
        });
      }
    });

    const savedListsRes = await supabase
      .from("saved_list")
      .select("*, mail (id)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: true });
    res.json({
      mails: mails,
      savedLists: savedListsRes.data,
    });
  }
};

const createCampaignMail = async (campaign_id) => {
  const { data, error } = await supabase
    .from("campaign")
    .select("*")
    .eq("id", campaign_id);
  if (error) {
    console.error("Error fetching campaign:", JSON.stringify(error));
    return null;
  } else {
    let residents = [];
    if (data[0].target_type === "map") {
      residents = await getResidentsListByCoordinates(
        data[0].lat,
        data[0].lng,
        data[0].radius
      );
    } else if (data[0].target_type === "zip_codes") {
      const { data: resData, error: resError } = await supabase
        .from("resident_account")
        .select("id")
        .in("postal_code", data[0].zip_codes);
      residents = resData;
    }

    if (residents) {
      let mailData = [];
      residents.forEach((resident) => {
        const mail = {
          campaign: campaign_id,
          resident_account: resident.id,
        };
        mailData.push(mail);
      });

      const { data, error } = await supabase.from("mail").insert(mailData);
      if (error) {
        console.error(
          "Error creating campaign mail",
          JSON.stringify(error.message)
        );
        return null;
      } else {
        console.log("Campaign mail created successfully: ", data);
        return data;
      }
    } else {
      return null;
    }
  }
};

const getResidentsListByCoordinates = async (
  selectedlat,
  selectedlng,
  radius
) => {
  const { data, error } = await supabase.rpc("get_nearby_residents", {
    selectedlat,
    selectedlng,
    radius,
  });
  if (error) {
    console.error("Error fetching residents:", JSON.stringify(error));
  } else {
    console.log("Residents fetched successfully: ", data);
    return data;
  }
};

const updateMailView = async (req, res, next) => {
  const { mail_id } = req.body;
  const { data, error } = await supabase
    .from("mail")
    .update({ viewed: true })
    .eq("id", mail_id);
  if (error) {
    console.error("Error updating mail view:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error updating mail view",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Mail view updated successfully" });
  }
};

const getSavedList = async (req, res, next) => {
  const { user_id } = req.body;
  const { data, error } = await supabase
    .from("saved_list")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching saved mails:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error fetching saved mails",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      lists: data,
    });
  }
};

const createSavedList = async (req, res, next) => {
  const { user_id, name } = req.body;
  const { data, error } = await supabase
    .from("saved_list")
    .insert({ user_id, name })
    .select("*");
  if (error) {
    console.error("Error creating saved list:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error creating saved list",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      lists: data,
    });
  }
};

const deleteSavedList = async (req, res, next) => {
  const { list_id } = req.body;
  const { data: mailData, error: mailError } = await supabase
    .from("mail")
    .update({ saved: false, saved_list: null })
    .eq("saved_list", list_id);
  if (mailError) {
    console.error(
      "Error deleting saved list mails:",
      JSON.stringify(mailError)
    );
    return res.status(500).json({
      message: "Error deleting saved list mails",
      details: mailError.message,
      code: mailError.code,
    });
  }

  const { data, error } = await supabase
    .from("saved_list")
    .delete()
    .eq("id", list_id);
  if (error) {
    console.error("Error deleting saved list:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error deleting saved list",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      message: "Saved list deleted successfully",
    });
  }
};

const updateSavedList = async (req, res, next) => {
  const { list_id, name } = req.body;
  const { data, error } = await supabase
    .from("saved_list")
    .update({ name })
    .eq("id", list_id);
  if (error) {
    console.error("Error updating saved list:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error updating saved list",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Saved list updated successfully" });
  }
};

const updateSavedMail = async (req, res, next) => {
  const { mail_id, saved } = req.body;
  const { data, error } = await supabase
    .from("mail")
    .update({ saved: false, saved_list: null })
    .eq("id", mail_id);
  if (error) {
    console.error("Error updating saved mail:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error updating saved mail",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Mail saved successfully" });
  }
};

const addMailToSavedList = async (req, res, next) => {
  const { mail_id, saved_list_id } = req.body;
  const { data, error } = await supabase
    .from("mail")
    .update({ saved: true, saved_list: saved_list_id })
    .eq("id", mail_id);
  if (error) {
    console.error("Error adding mail to saved list:", JSON.stringify(error));
    return res.status(500).json({
      message: "Error adding mail to saved list",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Mail added to saved list successfully" });
  }
};

exports.createCampaignMail = createCampaignMail;
exports.getCampaignMail = getCampaignMail;
exports.updateMailView = updateMailView;
exports.getSavedList = getSavedList;
exports.createSavedList = createSavedList;
exports.deleteSavedList = deleteSavedList;
exports.updateSavedList = updateSavedList;
exports.updateSavedMail = updateSavedMail;
exports.addMailToSavedList = addMailToSavedList;
