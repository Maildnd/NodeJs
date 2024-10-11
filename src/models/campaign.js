class Campaign {
  constructor(id, name, description, startDate, endDate, budget, status) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.budget = budget;
    this.status = status;
  }

  // Method to check if the campaign is active
  isActive() {
    const now = new Date();
    return now >= new Date(this.startDate) && now <= new Date(this.endDate);
  }

  // Method to extend the campaign end date
  extendEndDate(newEndDate) {
    if (new Date(newEndDate) > new Date(this.endDate)) {
      this.endDate = newEndDate;
    } else {
      throw new Error("New end date must be after the current end date");
    }
  }

  // Method to update the campaign status
  updateStatus(newStatus) {
    const validStatuses = ["pending", "active", "completed", "cancelled"];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
    } else {
      throw new Error("Invalid status");
    }
  }
}

module.exports = Campaign;
