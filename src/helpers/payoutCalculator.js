function calculateAdvance(earning) {
    return Number((earning * 0.10).toFixed(2));
}

function calculateRemaining(earning, advance) {
    return Number((earning - advance).toFixed(2));
}

module.exports = {
    calculateAdvance,
    calculateRemaining,
};