const { RoyaltyModel, RoyaltyInvestment } = require("../models/royalty.model");
const { UserModel } = require("../models/user.model");
const { generateCustomId } = require("./generator.uniqueid");
const { NumberFixed } = require("./NumberFixed");

exports.royaltyDistributeCalculate = async ({userId=null, packageId = null,royaltyPercentage=0, amount = 0, type = 'Royalty' }) => {
    try {
        const user = await UserModel.findById(userId, {username:1,royaltyInvestment:1});
        if(user){
            const percentage = Number(royaltyPercentage/100);
            const income = Number(amount * percentage);
            user.royaltyInvestment = NumberFixed(user.royaltyInvestment, income);
            const idTx = generateCustomId({ prefix: 'RLT', max: 10, min: 10 });
            const newRoyalty = new RoyaltyInvestment({
                id: idTx,
                user: user._id,
                percentage:royaltyPercentage,investment:amount, amount:income, package:packageId,
                type
            });
            await Promise.all([newRoyalty.save()]);
            // console.log(`Royalty investment ${user.username}`)
        }
    } catch (error) {
        console.error("Error in Direct Income Calculation:", error);
        console.error("Error in Direct Income Calculation:", error.message);

    }

}