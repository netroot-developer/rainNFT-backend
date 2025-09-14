const fs = require('fs');
const { v4: uuid } = require('uuid');
const { BannerModel } = require("../models/banner.model");
const { generateCustomId } = require('../utils/generator.uniqueid');
const { uploadToImageKit } = require('../utils/upload.imagekit');

// ------------------------------------------------ BANNER START ------------------------------------

exports.BannerCreateUpdate = async (req, res) => {
    try {
        const { title,banner, status } = req.body;
        let bannerName = await uploadToImageKit(banner,'Banners');
        const bannerFind = await BannerModel.findOne();
        if (!bannerFind) {
            const id = generateCustomId({prefix:"XIO-BN",max:15})
            const newBanner = new BannerModel({ id, title: title, banner: bannerName || null, status });
            await newBanner.save();
            return res.status(201).json({ success: true, message: 'Banner created successfully', data: newBanner});
        }
        if (title) bannerFind.title = title;
        if (banner) bannerFind.banner = bannerName;
        if(status) bannerFind.status = status;
        await bannerFind.save();
        return res.status(200).json({ success: true, message: 'Banner updated successfully', data: bannerFind});
    } catch (error) {
        console.error("Error in BannerCreateUpdate:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.BannerUpdate = async (req, res) => {
    try {
        const { title,banner, status } = req.body;
        const bannerFind = await BannerModel.findOne();
        if (!bannerFind) {
            return res.status(500).json({ success: false, message: 'Banner not found.' });
        }
        if (title) bannerFind.title = title;
        if (banner != bannerFind.banner) bannerFind.banner = await uploadToImageKit(banner,'Banners');
        bannerFind.status = status;
        await bannerFind.save();
        return res.status(200).json({ success: true, message: 'Banner updated successfully', data: bannerFind });

    } catch (error) {
        console.error("Error in BannerCreateUpdate:", error);
        return res.status(500).json({ success: false,message: "Internal Server Error" });
    }
};

exports.getBanner = async (req, res) => {
    try {
        const bannerFind = await BannerModel.findOne();
        return res.status(200).json({ success: true, message: 'Banner Find successfully', data: bannerFind });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.AllBanners = async (req, res) => {
    try {
        const bannerFind = await BannerModel.findOne();
        return res.status(200).json({ success: true, message: 'Banner Find successfully', data: bannerFind });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
