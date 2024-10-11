const { supabase } = require("../util/supabase");

const getDashboardDetails = async (req, res, next) => {
  const { business_id } = req.body;
  console.log("Business ID: ", business_id);
  if (business_id) {
    const { data, error } = await supabase
      .from("campaign")
      .select(
        "id, created_at, campaign_mail: mail(id, viewed, resident_account, created_at) "
      )
      .eq("business", business_id);
    if (error) {
      console.error("Error fetching dashborad details:", JSON.stringify(error));
      return next(
        new HttpError("Error fetching dashborad details: " + error.code, 500)
      );
    } else {
      console.log("Campaigns fetched successfully: ", data);
      const number_of_campaigns = data.length;
      let campaigns_percent_increase = 0;

      let total_mail_sent = 0;
      let mails_sent_percent_increase = 0;

      let total_mail_opened = 0;
      let mails_opened_percent_increase = 0;

      const unique_targets = new Set();
      let unique_targets_percent_increase = 0;

      let number_of_campaigns_30_days = 0;
      let mails_sent_30_days = 0;
      let mails_opened_30_days = 0;
      const unique_targets_30_days = new Set();
      data.forEach((campaign) => {
        if (
          new Date(campaign.created_at).getTime() >
          new Date().getTime() - 30 * 24 * 60 * 60 * 1000
        ) {
          number_of_campaigns_30_days++;
        }
        total_mail_sent += campaign.campaign_mail.length;
        if (campaign.campaign_mail.length > 0) {
          campaign.campaign_mail.forEach((mail) => {
            if (
              new Date(mail.created_at).getTime() >
              new Date().getTime() - 30 * 24 * 60 * 60 * 1000
            ) {
              mails_sent_30_days++;
              if (mail.viewed) {
                mails_opened_30_days++;
              }

              if (!unique_targets_30_days.has(mail.resident_account)) {
                unique_targets_30_days.add(mail.resident_account);
              }
            }

            if (!unique_targets.has(mail.resident_account)) {
              unique_targets.add(mail.resident_account);
            }

            if (mail.viewed) {
              total_mail_opened++;
            }
          });
        }

        if (data.length > 0) {
          campaigns_percent_increase = (
            (number_of_campaigns_30_days / data.length) *
            100
          ).toFixed(2);
        }

        if (total_mail_sent > 0) {
          mails_sent_percent_increase = (
            (mails_sent_30_days / total_mail_sent) *
            100
          ).toFixed(2);
        }

        if (total_mail_opened > 0) {
          mails_opened_percent_increase = (
            (mails_opened_30_days / total_mail_opened) *
            100
          ).toFixed(2);
        }

        if (unique_targets.size > 0) {
          unique_targets_percent_increase = (
            (unique_targets_30_days.size / unique_targets.size) *
            100
          ).toFixed(2);
        }
      });

      res.json({
        number_of_campaigns,
        total_mail_sent,
        total_mail_opened,
        unique_targets: unique_targets.size,
        campaigns_percent_increase,
        mails_sent_percent_increase,
        mails_opened_percent_increase,
        unique_targets_percent_increase,
      });
    }
  }
};

exports.getDashboardDetails = getDashboardDetails;
