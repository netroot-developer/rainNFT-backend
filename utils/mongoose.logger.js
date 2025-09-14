const { default: mongoose } = require("mongoose");
const logger = require("../logger");

module.exports = () => {
  // Save operation
  mongoose.plugin((schema) => {
    schema.post("save", function (doc) {
      logger.info(`MONGOOSE: Document saved in ${this.constructor.modelName} -> ${JSON.stringify(doc)}`);
    });

    // Update operation
    schema.post("findOneAndUpdate", function (doc) {
      logger.info(`MONGOOSE: Document updated in ${this.model.modelName} -> ${JSON.stringify(doc)}`);
    });

    // Delete operation
    schema.post("findOneAndDelete", function (doc) {
      logger.info(`MONGOOSE: Document deleted from ${this.model.modelName} -> ${JSON.stringify(doc)}`);
    });
  });
};
