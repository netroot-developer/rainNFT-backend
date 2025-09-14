const monoogse = require('mongoose');

const bannerSchema = new monoogse.Schema({
    id:{
        type:String,
        default:null
    },
    title: { type: String, default: 'Banner' },
    banner: { type: String, default: null },
    status: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

exports.BannerModel = monoogse.model('Banner', bannerSchema);
