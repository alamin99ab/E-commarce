
const SellerApplication = require('../models/sellerApplication.model');
const User = require('../models/user.model');

exports.applyForSeller = async (req, res, next) => {
    try {
        const { businessName, address, phoneNo } = req.body;
        const userId = req.user._id;

        const existingApplication = await SellerApplication.findOne({ user: userId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'আপনি ইতিমধ্যেই আবেদন করেছেন।' });
        }

        const application = new SellerApplication({
            user: userId,
            businessName,
            address,
            phoneNo,
        });

        await application.save();
        res.status(201).json({ success: true, message: 'আপনার আবেদন সফলভাবে জমা হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।' });
    } catch (error) {
        next(error);
    }
};

exports.getAllApplications = async (req, res, next) => {
    try {
        const applications = await SellerApplication.find({}).populate('user', 'name email');
        res.status(200).json({ success: true, applications });
    } catch (error) {
        next(error);
    }
};

exports.updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body; 
        const application = await SellerApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'আবেদন খুঁজে পাওয়া যায়নি।' });
        }

        application.status = status;
        await application.save();

        if (status === 'approved') {
            await User.findByIdAndUpdate(application.user, { role: 'seller' });
        }

        res.status(200).json({ success: true, message: `আবেদনটি সফলভাবে ${status} করা হয়েছে।` });
    } catch (error) {
        next(error);
    }
};