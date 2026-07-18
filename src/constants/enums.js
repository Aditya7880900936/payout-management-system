const SALE_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

const PAYOUT_TYPE = {
    ADVANCE: "advance",
    FINAL: "final",
    RECOVERY: "recovery",
};

const PAYOUT_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
    CANCELLED: "cancelled",
    REJECTED: "rejected",
};

module.exports = {
    SALE_STATUS,
    PAYOUT_TYPE,
    PAYOUT_STATUS,
};