function getDailyProfitPercentage(activeDate) {
  if (!activeDate) return 0;

  const startDate = new Date(activeDate);
  const today = new Date();
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1; 
  //  console.log({ diffDays });
  if (diffDays < 10) return 25;   // Instant withdrawal (within 10 days)
  if (diffDays < 20) return 20;   // After 10 days but before 20
  if (diffDays < 30) return 15;   // After 20 days but before 30
  if (diffDays < 40) return 10;   // After 30 days but before 40
  return 5;                       // After 40 days (fixed)
}
module.exports = {getDailyProfitPercentage};